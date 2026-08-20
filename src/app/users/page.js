"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { UserCheck, UserX, Users as UsersIcon } from "lucide-react";
import { RiAddCircleLine } from "react-icons/ri";

import DataTable from "@/components/table/DataTable.js";
import StatCard from "@/components/dashboard/statCard";
import CreateUserModal from "@/components/popup/CreateUserModal.js";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

const USERS_BASE = "/api/backend/admin/users";

const EMPTY_SUMMARY = {
  totalUsers: 0,
  activeUsers: 0,
  inactiveUsers: 0,
};

/*
 * Users means every login account. Accounts may be standalone
 * (memberId == null) or linked to a Member (memberId != null).
 */
const ROLE_LABELS_KM = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  VIEWER: "អ្នកមើល",
  BRANCH_LEADER: "ប្រធានសាខា",
  SECRETARY: "លេខាធិការ",
  MEMBER: "សមាជិក",
};

const STATUS_LABELS_KM = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  SUSPENDED: "បានផ្អាក",
  RESIGNED: "បានលាលែង",
  LOCKED: "ជាប់សោ",
  PENDING_ACTIVATION: "រង់ចាំដំណើរការ",
};

const STATUS_BADGE_STYLES = {
  ACTIVE: "bg-success-bg text-success",
  INACTIVE: "bg-error-bg text-error",
  SUSPENDED: "bg-warning-bg text-warning",
  RESIGNED: "bg-bg-page-gray text-text-secondary",
  LOCKED: "bg-warning-bg text-warning",
  PENDING_ACTIVATION: "bg-bg-page-gray text-text-secondary",
};

const ROLE_OPTIONS = [
  { label: "គ្រប់តួនាទី", value: "" },
  { label: "អ្នកគ្រប់គ្រង", value: "ADMIN" },
  { label: "ប្រធានសាខា", value: "BRANCH_LEADER" },
  { label: "លេខាធិការ", value: "SECRETARY" },
  { label: "សមាជិក", value: "MEMBER" },
  { label: "អ្នកមើល", value: "VIEWER" },
];

const FALLBACK_STATUS_OPTIONS = [
  { label: "គ្រប់ស្ថានភាព", value: "" },
  { label: "សកម្ម", value: "ACTIVE" },
  { label: "អសកម្ម", value: "INACTIVE" },
  { label: "បានផ្អាក", value: "SUSPENDED" },
  { label: "បានលាលែង", value: "RESIGNED" },
];


async function fetchLookupOptions(path, signal) {
  const response = await fetch(`/api/lookups/${path}`, {
    method: "GET",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json" },
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
    throw new Error(
      (typeof body === "object" &&
        (body?.message || body?.detail || body?.error)) ||
        `Request failed with status ${response.status}`,
    );
  }

  return Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];
}

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

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return new Intl.DateTimeFormat("km-KH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function mapUser(user) {
  return {
    id: user?.id,
    nameKh: user?.fullNameKm || user?.fullNameEn || "-",
    phone: user?.phone || "-",
    email: user?.email || "-",
    roleCode: String(user?.role || "").toUpperCase(),
    roleLabel:
      ROLE_LABELS_KM[String(user?.role || "").toUpperCase()] ||
      user?.role ||
      "-",
    accountType: user?.memberId == null ? "STANDALONE" : "MEMBER_LINKED",
    memberId: user?.memberId ?? null,
    branchId: user?.branchId ?? null,
    statusCode: String(
      user?.memberId != null && user?.memberStatusCode
        ? user.memberStatusCode
        : user?.status || "",
    ).toUpperCase(),
    statusLabel:
      user?.memberId != null
        ? user?.memberStatusLabelKm ||
          user?.memberStatusLabelEn ||
          STATUS_LABELS_KM[String(user?.memberStatusCode || "").toUpperCase()] ||
          user?.memberStatusCode ||
          "-"
        : STATUS_LABELS_KM[String(user?.status || "").toUpperCase()] ||
          user?.status ||
          "-",
    createdAt: formatDateTime(user?.createdAt),
  };
}

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isViewer = normalizeRole(currentUser?.role) === "viewer";
  const [users, setUsers] = useState([]);
  const [summary, setSummary] = useState(EMPTY_SUMMARY);

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [statusOptions, setStatusOptions] = useState(FALLBACK_STATUS_OPTIONS);

  const [isCreateOpen, setIsCreateOpen] = useState(false);

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

  useEffect(() => {
    const controller = new AbortController();

    fetchLookupOptions("member-statuses", controller.signal)
      .then((rows) => {
        const mapped = rows
          .map((status) => {
            const code = String(status?.code || status?.value || "").toUpperCase();
            return {
              value: code,
              label:
                status?.labelKm ||
                status?.label_km ||
                status?.labelEn ||
                status?.label_en ||
                STATUS_LABELS_KM[code] ||
                code,
            };
          })
          .filter((option) => option.value);

        setStatusOptions([
          { label: "គ្រប់ស្ថានភាព", value: "" },
          ...mapped,
        ]);
      })
      .catch((error) => {
        if (error.name !== "AbortError") {
          console.warn("Failed to load member statuses:", error.message);
          setStatusOptions(FALLBACK_STATUS_OPTIONS);
        }
      });

    return () => controller.abort();
  }, []);

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

      setUsers(list.map(mapUser));
    },
    [debouncedQuery, roleFilter, statusFilter],
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

  /*
   * =========================================
   * TABLE
   * =========================================
   */

  const tableColumns = useMemo(
    () => [
      {
        header: "ល.រ",
        width: "w-[6%]",
        align: "center",
        render: (_, index) => index + 1,
      },
      {
        header: "ឈ្មោះ",
        width: "w-[17%]",
        align: "left",
        render: (user) => (
          <span className="block w-full truncate font-medium text-text-secondary">
            {user.nameKh}
          </span>
        ),
      },
      {
        header: "លេខទូរស័ព្ទ",
        width: "w-[14%]",
        align: "left",
        render: (user) => (
          <span className="block w-full truncate">{user.phone}</span>
        ),
      },
      {
        header: "អ៊ីមែល",
        width: "w-[16%]",
        align: "left",
        render: (user) => (
          <span className="block w-full truncate">{user.email}</span>
        ),
      },
      {
        header: "តួនាទី",
        width: "w-[14%]",
        align: "center",
        render: (user) => <span>{user.roleLabel}</span>,
      },
      {
        header: "ប្រភេទគណនី",
        width: "w-[14%]",
        align: "center",
        render: (user) => (
          <span>{user.accountType === "MEMBER_LINKED" ? "ភ្ជាប់សមាជិក" : "គណនីឯករាជ្យ"}</span>
        ),
      },
      {
        header: "ស្ថានភាព",
        width: "w-[14%]",
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
        header: "ថ្ងៃបង្កើត",
        width: "w-[11%]",
        align: "left",
        render: (user) => (
          <span className="block w-full truncate">{user.createdAt}</span>
        ),
      },
    ],
    [],
  );

  const filterConfig = [
    {
      name: "role",
      value: roleFilter,
      onChange: setRoleFilter,
      options: ROLE_OPTIONS,
      placeholder: "តួនាទី",
    },
    {
      name: "status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: statusOptions,
      placeholder: "ស្ថានភាព",
    },
  ];

  return (
    <div className="flex min-h-full min-w-0 flex-col gap-4 overflow-hidden">
      {/* SUMMARY */}

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={UsersIcon}
          label="អ្នកប្រើប្រាស់សរុប"
          value={String(summary.totalUsers)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={UserCheck}
          label="សកម្ម"
          value={String(summary.activeUsers)}
          iconColor="text-success"
          iconBg="bg-success-bg"
        />

        <StatCard
          icon={UserX}
          label="អសកម្ម"
          value={String(summary.inactiveUsers)}
          iconColor="text-error"
          iconBg="bg-error-bg"
        />
      </div>

      {/* TABLE */}

      <div className="min-w-0 w-full">
        <DataTable
          title="បញ្ជីអ្នកប្រើប្រាស់"
          data={users}
          columns={tableColumns}
          filters={filterConfig}
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder="ស្វែងរកតាមរយៈឈ្មោះ ទូរស័ព្ទ ឬអ៊ីមែល..."
          pageSize={20}
          actionButton={!isViewer ? (
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
              <span>បង្កើតអ្នកប្រើប្រាស់ថ្មី</span>
            </button>
          ) : null}
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
    </div>
  );
}
