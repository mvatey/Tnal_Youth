"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "@/components/navigation/Pagination";
import NotificationItem from "./NotificationItem";
import { getNotificationHeading } from "./notificationData";
import { useBranch } from "@/context/BranchContext";

const rowsPerPage = 10;

export default function NotificationPanel({ type = "all" }) {
  const heading = type === "all" ? "សេចក្ដីជូនដំណឹង" : getNotificationHeading(type);

  // A notification with no branch (personal — "your document was issued",
  // account activation, etc.) always shows regardless of branch. One WITH a
  // branch (e.g. an activity invite sent to a specific branch) only shows
  // while that branch is the one active in the sidebar — see the backend's
  // NotificationRepo.listForUser. "all branches" (or a role that never
  // narrows to one branch) omits the filter entirely, same as before.
  const { selectedBranch } = useBranch();
  const branchId = selectedBranch && selectedBranch !== "all" ? selectedBranch : null;

  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(notifications.length / rowsPerPage),
  );

  const safePage = Math.min(currentPage, totalPages);

  const pagedNotifications = useMemo(
    () =>
      notifications.slice(
        (safePage - 1) * rowsPerPage,
        safePage * rowsPerPage,
      ),
    [notifications, safePage],
  );

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const query = new URLSearchParams({ page: "0", size: "100" });
      if (branchId) query.set("branchId", String(branchId));

      const response = await fetch(
        `/api/backend/notifications/me?${query}`,
        {
          cache: "no-store",
        },
      );

      const body = await response.json().catch(() => null);

      if (!response.ok || body?.success === false) {
        throw new Error(
          body?.message || "មិនអាចទាញយកការជូនដំណឹងបានទេ។",
        );
      }

      const page = body?.data ?? body;

      const rows = Array.isArray(page?.items)
        ? page.items
        : [];

      const matchesTab = (row) => {
        const code = String(
          row.typeCode || "SYSTEM",
        ).toUpperCase();

        if (type === "all") {
          return true;
        }

        if (type === "event") {
          return code.startsWith("ACTIVITY_");
        }

        if (type === "report") {
          return code.includes("REPORT");
        }

        return (
          !code.startsWith("ACTIVITY_") &&
          !code.includes("REPORT")
        );
      };

      setNotifications(
        rows
          .filter(matchesTab)
          .map((row) => ({
            id: row.id,

            title:
              row.title ||
              row.typeLabelKm ||
              row.typeLabelEn ||
              heading,

            description: row.body || "",

            badge:
              row.typeLabelKm ||
              row.typeLabelEn ||
              heading,

            variant:
              type === "all"
                ? codeToVariant(row.typeCode)
                : type,

            date: formatNotificationDate(
              row.createdAt,
            ),

            read: Boolean(row.isRead),

            // Keep navigation information from backend.
            // Activity notifications use this to open
            // the related activity detail page.
            actionUrl: withBranchContext(
              row.actionUrl || null,
              row.branchId,
            ),

            activityId:
              row.activityId ?? null,

            branchId:
              row.branchId ?? null,

            typeCode:
              row.typeCode || null,
          })),
      );
    } catch (loadError) {
      setNotifications([]);

      setError(
        loadError instanceof Error
          ? loadError.message
          : "មិនអាចទាញយកការជូនដំណឹងបានទេ។",
      );
    } finally {
      setIsLoading(false);
    }
  }, [heading, type, branchId]);

  useEffect(() => {
    setCurrentPage(1);
    loadNotifications();
  }, [loadNotifications]);

  const markRead = useCallback(
    async (id) => {
      // Update UI immediately.
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id
            ? {
                ...notification,
                read: true,
              }
            : notification,
        ),
      );

      try {
        const response = await fetch(
          `/api/backend/notifications/me/${id}/read`,
          {
            method: "POST",
          },
        );

        if (!response.ok) {
          await loadNotifications();
          return false;
        }

        // Tell NotificationBell that unread count
        // should be refreshed immediately.
        window.dispatchEvent(
          new Event("notification-read"),
        );

        return true;
      } catch {
        await loadNotifications();
        return false;
      }
    },
    [loadNotifications],
  );

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-md border border-border bg-bg-page-white shadow-sm">
        <div className="min-h-[48px] overflow-visible px-8 pb-1 pt-[10px]">
          <h2 className="overflow-visible text-[16px] font-bold leading-[2] text-secondary">
            {heading}
          </h2>
        </div>

        {error ? (
          <div className="mx-8 my-4 flex items-center justify-between rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
            <span>{error}</span>

            <button
              type="button"
              className="font-semibold underline"
              onClick={loadNotifications}
            >
              Retry
            </button>
          </div>
        ) : null}

        <ul className="mt-[10px]">
          {isLoading ? (
            <li className="px-8 py-10 text-center text-sm text-text-secondary">
              Loading...
            </li>
          ) : pagedNotifications.length === 0 ? (
            <li className="px-8 py-10 text-center text-sm text-text-secondary">
              No notifications
            </li>
          ) : (
            pagedNotifications.map(
              (notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onMarkRead={markRead}
                />
              ),
            )
          )}
        </ul>

        <div className="border-t border-border px-6 py-3">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="space-y-0"
          />
        </div>
      </section>
    </div>
  );
}

function withBranchContext(actionUrl, branchId) {
  if (!actionUrl || branchId == null) return actionUrl || null;

  if (!String(actionUrl).startsWith("/activity/")) {
    return actionUrl;
  }

  const separator = String(actionUrl).includes("?") ? "&" : "?";
  return `${actionUrl}${separator}branchId=${encodeURIComponent(branchId)}`;
}

function formatNotificationDate(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
function codeToVariant(value) {
  const code = String(value || "SYSTEM").toUpperCase();
  if (code.startsWith("ACTIVITY_")) return "event";
  if (code.includes("REPORT")) return "report";
  return "system";
}
