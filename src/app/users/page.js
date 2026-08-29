"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import { SquarePen, UserCheck, UserX, Users as UsersIcon } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable.js";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import { isWithinDateRange } from "@/utils/dateRangeFilter";
import StatCard from "@/components/dashboard/statCard";
import CreateUserModal from "@/components/popup/CreateUserModal.js";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeRole } from "@/lib/navigation";

const USERS_BASE = "/api/backend/admin/users";

/*
 * Intl.DateTimeFormat("km-KH", ...) silently falls back to English
 * formatting in this environment instead of throwing, so it can't be
 * trusted for the Khmer locale -- hand-roll it instead, matching the
 * month names already used elsewhere in the app (e.g. member/page.js).
 */
const MONTHS_KM = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const EMPTY_SUMMARY = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
};

/*
 * Users means every login account. Accounts may be standalone
 * (memberId == null) or linked to a Member (memberId != null).
 */
const STATUS_BADGE_STYLES = {
  ACTIVE: "bg-success-bg text-success",
  INACTIVE: "bg-error-bg text-error",
  SUSPENDED: "bg-warning-bg text-warning",
  RESIGNED: "bg-bg-page-gray text-text-secondary",
  LOCKED: "bg-warning-bg text-warning",
  PENDING_ACTIVATION: "bg-bg-page-gray text-text-secondary",
};

async function fetchJson(path, params, signal) {
  const query = params ? `?${new URLSearchParams(params).toString()}` : "";

  const response = await fetch(`${USERS_BASE}${path}${query}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: {
      Accept: "application/json",
    },
    signal,
  });

  const text = await response.text();
  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object"
        ? body?.message || body?.detail || body?.error
        : body;

    throw new Error(
      message || `Request failed with status ${response.status}`,
    );
  }

  return body;
}

function formatDateTime(value, locale = "km") {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  if (locale === "en") {
    return new Intl.DateTimeFormat("en-US", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  }

  const monthName = MONTHS_KM[date.getMonth()];

  return `${date.getDate()} ${monthName}, ${date.getFullYear()}`;
}

function mapUser(user, labels, locale) {
  const roleCode = String(user?.role || "").toUpperCase();
  const viewerScope = String(user?.viewerScope || "").toUpperCase();
  const statusCode = String(
    user?.memberId != null && user?.memberStatusCode
      ? user.memberStatusCode
      : user?.status || "",
  ).toUpperCase();

  return {
    id: user?.id,
    nameKh:
      (locale === "en"
        ? user?.fullNameEn || user?.fullNameKm
        : user?.fullNameKm || user?.fullNameEn) || "-",
    phone: user?.phone || "-",
    email: user?.email || "-",
    // Raw fields (unformatted) kept alongside the display-formatted ones
    // above so the Edit modal can pre-fill its form directly from a row
    // instead of needing a separate GET-by-id call.
    fullNameKmRaw: user?.fullNameKm || "",
    fullNameEnRaw: user?.fullNameEn || "",
    phoneRaw: user?.phone || "",
    emailRaw: user?.email || "",
    viewerScopeRaw: user?.viewerScope || "",
    roleCode,
    roleLabel:
      (roleCode === "VIEWER" && user?.viewerScope
        ? `${labels.roles.VIEWER || "Viewer"} (${labels.roles[viewerScope] || user.viewerScope})`
        : labels.roles[roleCode]) ||
      user?.role ||
      "-",
    accountType:
      user?.memberId != null
        ? "MEMBER_LINKED"
        : ["SECRETARY", "BRANCH_LEADER"].includes(
              String(user?.role || "").toUpperCase(),
          )
          ? "BRANCH_STAFF"
          : "STANDALONE",
    memberId: user?.memberId ?? null,
    branchId: user?.branchId ?? null,
    statusCode,
    statusLabel:
      user?.memberId != null
        ? (locale === "en"
            ? user?.memberStatusLabelEn || user?.memberStatusLabelKm
            : user?.memberStatusLabelKm || user?.memberStatusLabelEn) ||
          labels.statuses[statusCode] ||
          user?.memberStatusCode ||
          "-"
        : labels.statuses[statusCode] ||
          user?.status ||
          "-",
    createdAt: formatDateTime(user?.createdAt, locale),
    createdAtRaw: user?.createdAt || "",
  };
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const { t, locale } = useLanguage();
  const isViewer = normalizeRole(currentUser?.role) === "viewer";
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [createdDateFilter, setCreatedDateFilter] = useState("");
  const roleLabels = useMemo(() => ({
    ADMIN: t("usersPage.admin"),
    VIEWER: t("usersPage.viewer"),
    BRANCH_LEADER: t("usersPage.branchLeader"),
    SECRETARY: t("usersPage.secretary"),
    MEMBER: t("usersPage.member"),
  }), [t]);

  const statusLabels = useMemo(() => ({
    ACTIVE: t("usersPage.active"),
    INACTIVE: t("usersPage.inactive"),
    SUSPENDED: t("usersPage.suspended"),
    RESIGNED: t("usersPage.resigned"),
    LOCKED: t("usersPage.locked"),
    PENDING_ACTIVATION: t("usersPage.pendingActivation"),
  }), [t]);

  const statusOptions = useMemo(() => [
    { label: t("usersPage.allStatuses"), value: "" },
    { label: t("usersPage.active"), value: "ACTIVE" },
    { label: t("usersPage.inactive"), value: "INACTIVE" },
  ], [t]);

  const roleOptions = useMemo(() => [
    { label: t("usersPage.allRoles"), value: "" },
    { label: t("usersPage.admin"), value: "ADMIN" },
    { label: t("usersPage.branchLeader"), value: "BRANCH_LEADER" },
    { label: t("usersPage.secretary"), value: "SECRETARY" },
    { label: t("usersPage.member"), value: "MEMBER" },
    { label: t("usersPage.viewer"), value: "VIEWER" },
  ], [t]);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  /*
   * =========================================
   * SEARCH DEBOUNCE
   * =========================================
   */

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, 350);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  /*
   * =========================================
   * SUMMARY
   * =========================================
   */

  const loadSummary = useCallback(async (signal) => {
    const data = await fetchJson("/summary", null, signal);

    setSummary({
      totalUsers: Number(data?.totalUsers) || 0,
      activeUsers: Number(data?.activeUsers) || 0,
      inactiveUsers: Number(data?.inactiveUsers) || 0,
    });
  }, []);

  /*
   * =========================================
   * USERS
   * =========================================
   */

  const loadUsers = useCallback(
    async (signal) => {
      const params = {};

      if (debouncedQuery) {
        params.search = debouncedQuery;
      }

      if (roleFilter) {
        params.role = roleFilter;
      }

      if (statusFilter) {
        params.status = statusFilter;
      }

      const data = await fetchJson("", params, signal);

      const list = Array.isArray(data) ? data : [];

      setUsers(list.map((user) => mapUser(user, { roles: roleLabels, statuses: statusLabels }, locale)));
    },
    [debouncedQuery, locale, roleFilter, roleLabels, statusFilter, statusLabels],
  );

  useEffect(() => {
    const controller = new AbortController();

    loadSummary(controller.signal).catch((error) => {
      if (error.name !== "AbortError") {
        console.warn("Failed to load user summary:", error.message);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadSummary]);

  useEffect(() => {
    const controller = new AbortController();

    loadUsers(controller.signal).catch((error) => {
      if (error.name !== "AbortError") {
        console.warn("Failed to load users:", error.message);
        setUsers([]);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadUsers]);

  /*
   * =========================================
   * CREATE USER CALLBACK
   * =========================================
   */

  const handleCreateUser = async () => {
    const controller = new AbortController();

    try {
      await Promise.all([
        loadSummary(controller.signal),
        loadUsers(controller.signal),
      ]);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("Failed to refresh users:", error.message);
      }
    }
  };

  const handleUpdateUser = async () => {
    const controller = new AbortController();

    try {
      await Promise.all([
        loadSummary(controller.signal),
        loadUsers(controller.signal),
      ]);
    } catch (error) {
      if (error.name !== "AbortError") {
        console.warn("Failed to refresh users:", error.message);
      }
    }
  };

  /*
   * =========================================
   * TABLE
   * =========================================
   */

  const tableColumns = useMemo(
    () => [
      {
        header: t("usersPage.no"),
        width: "w-[6%]",
        align: "center",
        render: (_, index) => index,
      },
      {
        header: t("usersPage.name"),
        width: "w-[18%]",
        align: "left",
        render: (user) => (
          <span className="block w-full truncate font-medium text-text-secondary">
            {user.nameKh}
          </span>
        ),
      },
      {
        header: t("usersPage.email"),
        width: "w-[19%]",
        align: "left",
        render: (user) => (
          <span className="block w-full truncate">{user.email}</span>
        ),
      },
      {
        header: t("usersPage.role"),
        width: "w-[13%]",
        align: "center",
        render: (user) => <span>{user.roleLabel}</span>,
      },
      {
        header: t("usersPage.accountType"),
        width: "w-[14%]",
        align: "center",
        render: (user) => (
          <span>{user.accountType === "MEMBER_LINKED"
            ? t("usersPage.memberLinked")
            : user.accountType === "BRANCH_STAFF"
              ? t("usersPage.branchStaff")
              : t("usersPage.standalone")}</span>
        ),
      },
      {
        header: t("usersPage.status"),
        width: "w-[12%]",
        align: "center",
        render: (user) => (
          <span
            className={`
              inline-flex
              max-w-full
              items-center
              justify-center
              truncate
              whitespace-nowrap
              rounded-full
              px-2
              py-1
              text-[11px]
              ${
                STATUS_BADGE_STYLES[user.statusCode] ||
                "bg-bg-page-gray text-text-secondary"
              }
            `}
          >
            {user.statusLabel}
          </span>
        ),
      },
      {
        header: t("usersPage.createdAt"),
        width: "w-[12%]",
        align: "left",
        render: (user) => (
          <span className="block w-full whitespace-nowrap">{user.createdAt}</span>
        ),
      },
      {
        header: t("usersPage.actions"),
        width: "w-[6%]",
        align: "center",
        // A member-linked account is edited through that member's own
        // personal-info page instead of here — see CreateUserModal's
        // editingUser note and UserManagementServiceImpl#updateUser,
        // which rejects one anyway. Link straight there instead of
        // leaving the row with no action at all.
        render: (user) =>
          isViewer ? null : user.memberId == null ? (
            <button
              type="button"
              onClick={() => setEditingUser(user)}
              aria-label={t("usersPage.edit")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-warning transition hover:bg-warning-bg"
            >
              <SquarePen size={16} strokeWidth={1.8} />
            </button>
          ) : (
            <Link
              href={`/member/memberInfo/${user.memberId}/details/personal`}
              aria-label={t("usersPage.editViaMemberPage")}
              title={t("usersPage.editViaMemberPage")}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-warning transition hover:bg-warning-bg"
            >
              <SquarePen size={16} strokeWidth={1.8} />
            </Link>
          ),
      },
    ],
    [isViewer, t],
  );

  // Role/status are server-filtered (loadUsers above); the created-date
  // filter narrows the already-fetched list client-side to accounts
  // created on that exact day.
  const displayedUsers = useMemo(
    () =>
      users.filter((user) =>
        isWithinDateRange(user.createdAtRaw, {
          from: createdDateFilter,
          to: createdDateFilter,
        }),
      ),
    [users, createdDateFilter],
  );

  const filterConfig = [
    {
      name: "role",
      value: roleFilter,
      onChange: setRoleFilter,
      options: roleOptions,
      placeholder: t("usersPage.role"),
    },
    {
      name: "status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
      placeholder: t("usersPage.status"),
    },
    {
      name: "createdDate",
      value: createdDateFilter,
      onChange: setCreatedDateFilter,
      type: "date",
    },
  ];

  return (
    <div className="flex min-h-full min-w-0 flex-col gap-4 overflow-hidden">
      {/* SUMMARY */}

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={UsersIcon}
          label={t("usersPage.totalUsers")}
          value={String(summary.totalUsers)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={UserCheck}
          label={t("usersPage.active")}
          value={String(summary.activeUsers)}
          iconColor="text-success"
          iconBg="bg-success-bg"
        />

        <StatCard
          icon={UserX}
          label={t("usersPage.inactive")}
          value={String(summary.inactiveUsers)}
          iconColor="text-error"
          iconBg="bg-error-bg"
        />
      </div>

      {/* TABLE */}

      <div className="min-w-0 w-full">
        <DataTable
          title={t("usersPage.listTitle")}
          data={displayedUsers}
          columns={tableColumns}
          filters={filterConfig}
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder={t("usersPage.searchPlaceholder")}
          pageSize={20}
          onDownload={() =>
            downloadTableAsExcel({
              data: users,
              columns: tableColumns,
              fileName: t("usersPage.usersFileName"),
            })
          }
          actionButton={
            isViewer ? null : (
              <button
                type="button"
                onClick={() => setIsCreateOpen(true)}
                className="
                  inline-flex
                  h-[34px]
                  w-full
                  items-center
                  justify-center
                  gap-2
                  whitespace-nowrap
                  rounded-lg
                  bg-success
                  px-4
                  text-sm
                  font-medium
                  text-white
                  transition
                  hover:opacity-90
                "
              >
                <RiAddCircleLine className="h-4 w-4 shrink-0" />
                <span>{t("usersPage.createUser")}</span>
              </button>
            )
          }
        />
      </div>

      {/* CREATE MODAL */}

      {!isViewer && (
        <CreateUserModal
          open={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          onSave={handleCreateUser}
        />
      )}

      {/* EDIT MODAL */}

      {!isViewer && (
        <CreateUserModal
          open={Boolean(editingUser)}
          editingUser={editingUser}
          onClose={() => setEditingUser(null)}
          onSave={handleUpdateUser}
        />
      )}
    </div>
  );
}
