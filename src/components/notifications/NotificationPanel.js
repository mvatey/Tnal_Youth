"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Pagination from "@/components/navigation/Pagination";
import NotificationItem from "./NotificationItem";
import NotificationTabs from "./NotificationTabs";
import { getNotificationHeading } from "./notificationData";

const rowsPerPage = 10;

export default function NotificationPanel({ type = "system" }) {
  const heading = getNotificationHeading(type);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(notifications.length / rowsPerPage));
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
      const response = await fetch(
        "/api/backend/notifications/me?page=0&size=100",
        { cache: "no-store" },
      );
      const body = await response.json().catch(() => null);

      if (!response.ok || body?.success === false) {
        throw new Error(body?.message || "Unable to load notifications.");
      }

      const page = body?.data ?? body;
      const rows = Array.isArray(page?.items) ? page.items : [];
      const matchesTab = (row) => {
        const code = String(row.typeCode || "SYSTEM").toUpperCase();
        if (type === "event") return code.startsWith("ACTIVITY_");
        if (type === "report") return code.includes("REPORT");
        return !code.startsWith("ACTIVITY_") && !code.includes("REPORT");
      };

      setNotifications(
        rows
          .filter(matchesTab)
          .map((row) => ({
            id: row.id,
            title: row.title || row.typeLabelKm || row.typeLabelEn || heading,
            description: row.body || "",
            badge: row.typeLabelKm || row.typeLabelEn || heading,
            variant: type,
            date: formatNotificationDate(row.createdAt),
            read: Boolean(row.isRead),
          })),
      );
    } catch (loadError) {
      setNotifications([]);
      setError(loadError.message || "Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, [heading, type]);

  useEffect(() => {
    setCurrentPage(1);
    loadNotifications();
  }, [loadNotifications]);

  const markRead = useCallback(async (id) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );

    const response = await fetch(`/api/backend/notifications/me/${id}/read`, {
      method: "POST",
    });

    if (!response.ok) {
      loadNotifications();
    }
  }, [loadNotifications]);

  return (
    <div className="space-y-4">
      <NotificationTabs />

      <section className="overflow-hidden rounded-md border border-border bg-[#fbfcfe] shadow-sm">
        <div className="min-h-[48px] overflow-visible px-8 pb-1 pt-[10px]">
          <h2 className="overflow-visible text-[16px] font-bold leading-[2] text-secondary">{heading}</h2>
        </div>

        {error ? (
          <div className="mx-8 my-4 flex items-center justify-between rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <span>{error}</span>
            <button type="button" className="font-semibold underline" onClick={loadNotifications}>
              Retry
            </button>
          </div>
        ) : null}

        <ul className="mt-[10px]">
          {isLoading ? (
            <li className="px-8 py-10 text-center text-sm text-text-secondary">Loading...</li>
          ) : pagedNotifications.length === 0 ? (
            <li className="px-8 py-10 text-center text-sm text-text-secondary">No notifications</li>
          ) : pagedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkRead={markRead}
            />
          ))}
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

function formatNotificationDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(date);
}
