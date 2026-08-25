"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, List, PlusCircle, XCircle } from "lucide-react";

import SearchBar from "@/components/tables/SearchBar";
import FilterBar from "@/components/tables/FilterBar";
import Table from "@/components/tables/GenericTable";
import ActivityStats from "@/components/activity/ActivityStats";
import TelegramConnectBanner from "@/components/activity/TelegramConnectBanner";
import Button from "@/components/ui/Button";
import PrimaryActionButton from "@/components/ui/actions/PrimaryActionButton";

import { useBranch } from "@/context/BranchContext";
import { downloadTableAsExcel } from "@/utils/downloadExcel";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";
import { useLanguage } from "@/context/LanguageContext";

function getLookupLabel(lookup) {
  return (
    lookup?.labelKm ||
    lookup?.label_km ||
    lookup?.labelEn ||
    lookup?.label_en ||
    lookup?.code ||
    "-"
  );
}

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("km-KH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function formatDuration(startsAt, endsAt) {
  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end <= start
  ) {
    return "-";
  }

  const hours = Math.round((end - start) / 3_600_000);
  return `${hours} ម៉ោង`;
}

function getEffectiveActivityStatus(status, startsAt, endsAt) {
  const storedStatus = String(status?.code || status || "").toLowerCase();
  if (storedStatus === "cancelled" || storedStatus === "canceled") {
    return "cancelled";
  }

  const now = Date.now();
  const start = new Date(startsAt).getTime();
  const end = new Date(endsAt).getTime();

  if (Number.isFinite(end) && now >= end) return "completed";
  if (storedStatus === "completed") return "completed";
  if (Number.isFinite(start) && now >= start) return "ongoing";
  return storedStatus || "upcoming";
}

function normalizeActivity(item, branchOptions) {
  const branch = branchOptions.find(
    (option) => String(option.value) === String(item.branchId),
  );
  const status = getEffectiveActivityStatus(
    item.status,
    item.startsAt,
    item.endsAt,
  );
  const capacity = Number(item.capacity || 0);

  return {
    id: item.id,
    name: item.titleKm || item.titleEn || "-",
    type: getLookupLabel(item.type),
    typeId: item.type?.id,
    sector: getLookupLabel(item.sector),
    sectorId: item.sector?.id,
    branch:
      item.branchNameKm ||
      item.branchNameEn ||
      branch?.label ||
      "-",
    branchId: item.branchId,
    location:
      item.provinceNameKm ||
      item.provinceNameEn ||
      item.locationName ||
      item.address ||
      "-",
    date: formatDate(item.startsAt),
    dateValue: item.startsAt?.slice(0, 10) || "",
    duration: formatDuration(item.startsAt, item.endsAt),
    // Activity attendance = member_joined / invited for every role.
    // Capacity is a limit and must not be shown as the invitation count.
    participants: `${Number(item.joinedCount ?? 0)}/${Number(item.invitedCount ?? 0)}`,
    status,
    /*
     * true  -> hosted by the viewer's own branch (or one of their
     *          staff-assigned branches).
     * false -> reaches the viewer only through an ACCEPTED co-hosting
     *          invitation to another branch's activity.
     * null  -> the backend doesn't compute this for the viewer's role
     *          (e.g. admin, who sees every activity unscoped) — the
     *          own/invited tabs below only render when at least one row
     *          actually has a non-null value.
     */
    ownBranch: item.ownBranch ?? null,
    /*
     * Only meaningful when ownBranch === false. "PENDING" -> this branch
     * hasn't responded to the co-hosting invitation yet (the Action column
     * shows Accept/Decline). "ACCEPTED" -> already co-hosting (the Action
     * column falls back to the normal Detail link, which is where members
     * get invited from). Never DECLINED/CANCELLED — the backend excludes
     * those from the list entirely rather than showing them inert.
     */
    invitationId: item.invitationId ?? null,
    invitedBranchId: item.invitedBranchId ?? null,
    invitationStatus: item.invitationStatus ?? null,
  };
}

function TypeBadge({ type }) {
  const style =
    type === "កម្មវិធីខាងក្រៅ"
      ? "bg-success-bg text-success"
      : "bg-secondary-light text-secondary";

  return (
    <span
      className={`inline-flex w-[70px] items-center justify-center whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-normal ${style}`}
    >
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const { t } = useLanguage();
  const isUpcoming = status === "upcoming";
  const isOngoing = status === "ongoing";
  const isCancelled = status === "cancelled";

  const label = isCancelled
    ? t("activityPage.cancelled")
    : isOngoing
      ? t("activityPage.ongoing")
      : isUpcoming
        ? t("activityPage.upcoming")
        : t("activityPage.completed");

  const style = isCancelled
    ? "bg-danger-bg text-danger"
    : isOngoing
      ? "bg-warning-bg text-warning"
      : isUpcoming
        ? "bg-secondary-light text-secondary"
        : "bg-success-bg text-success";

  return (
    <span
      className={`inline-flex w-[70px] items-center justify-center whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-normal ${style}`}
    >
      {label}
    </span>
  );
}

export default function ActivityPage() {
  const { t, label } = useLanguage();
  const { user } = useAuth();
  const role = normalizeRole(user?.role);

  const canCreateActivity =
  role === "secretary" ||
  role === "branch_leader";

  const {
    branches: contextBranches = [],
    selectedBranch = "all",
    setSelectedBranch = () => {},
  } = useBranch();

  const [activityRecords, setActivityRecords] = useState([]);
  const [branchOptions, setBranchOptions] = useState([]);
  // From the backend's ActivityPageResponse.invitedActivityCount — the full
  // count of activities reached only via an accepted co-hosting invitation
  // (not capped by the page's size=1000 fetch). null for any role other
  // than secretary, since the backend only computes it there.
  const [invitedActivityCount, setInvitedActivityCount] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedSector, setSelectedSector] =
    useState("all");

  const [selectedType, setSelectedType] =
    useState("all");

  const [selectedDateRange, setSelectedDateRange] =
    useState([null, null]);

  // "all" | "own" | "invited" — only meaningful once at least one loaded
  // activity actually carries a non-null ownBranch (see normalizeActivity).
  const [selectedScope, setSelectedScope] =
    useState("all");

  // Also used to refresh the list right after Accept/Decline (see
  // handleRespond below), not just on mount.
  //
  // BUGFIX: this used to only ever set mountedRef.current = false (in the
  // cleanup), never explicitly back to true. Under React 18 Strict Mode
  // (dev), every mount is synthetically mounted -> cleaned up -> remounted;
  // the first pass's cleanup permanently left the ref stuck at false, so
  // the *second* (real) pass's loadActivities() call always hit the
  // `if (!mountedRef.current) return;` guards below and never applied its
  // result — the page stayed on "កំពុងទាញយកទិន្នន័យ..." forever with the
  // scope tabs never appearing, exactly until a full reload happened to
  // land the ref back on true. Setting it explicitly on every mount (not
  // just relying on the initial useRef(true)) fixes that for good.
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  // Guards against a stale response overwriting a fresher one. On mount (or
  // right after a full-page branch switch), BranchContext's selectedBranch
  // starts at "all" for one tick before its own effect resolves the real
  // persisted branch — so this effect fires once for "all" (unscoped, every
  // branch this secretary/branch-leader covers) and again right after for
  // the actual branch. If the unscoped request happens to resolve LATER
  // than the scoped one (nothing here cancels it), its broader result used
  // to clobber the correctly-scoped one — showing activities from every
  // branch the account covers, including one just added, instead of only
  // the branch currently selected. Only ever applying the response from
  // the most recently *fired* request fixes that.
  const requestIdRef = useRef(0);

  const loadActivities = useCallback(async () => {
    const requestId = ++requestIdRef.current;

    setLoading(true);
    setLoadError("");

    try {
      const activityParams = new URLSearchParams({
        page: "0",
        size: "1000",
      });

      if (selectedBranch !== "all") {
        activityParams.set("branchId", String(selectedBranch));
      }

      const [activityResponse, branchResponse] = await Promise.all([
        fetch(`/api/activities?${activityParams.toString()}`, {
          cache: "no-store",
        }),
        // Use the general branch lookup here. MEMBER can view activities but
        // cannot call the staff-only activity-invitable-branches lookup.
        // The general lookup gives us the branch labels needed by the list.
        fetch("/api/lookups/branches", {
          cache: "no-store",
        }),
      ]);

      if (!activityResponse.ok) {
        throw new Error(`Cannot load activities (${activityResponse.status})`);
      }

      const activityBody = await activityResponse.json();
      const branchBody = branchResponse.ok
        ? await branchResponse.json()
        : [];

      if (!mountedRef.current || requestId !== requestIdRef.current) return;

      setActivityRecords(
        Array.isArray(activityBody?.content)
          ? activityBody.content
          : [],
      );
      setInvitedActivityCount(
        typeof activityBody?.invitedActivityCount === "number"
          ? activityBody.invitedActivityCount
          : null,
      );
      setBranchOptions(
        (Array.isArray(branchBody) ? branchBody : []).map((branch) => ({
          value: branch.value ?? branch.id,
          label: label(branch, branch.code || "-"),
        })),
      );
    } catch (error) {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setActivityRecords([]);
          setLoadError(error.message || t("activityPage.loadFailed"));
      }
    } finally {
      if (mountedRef.current && requestId === requestIdRef.current) {
        setLoading(false);
      }
    }
  }, [label, selectedBranch, t]);

  useEffect(() => {
    setSelectedScope("all");
    setSelectedSector("all");
    setSelectedType("all");
    setSelectedDateRange([null, null]);
    setSearchQuery("");
    loadActivities();
  }, [loadActivities]);

  // Which activity's invitation is currently being accepted/declined —
  // disables that row's buttons and nothing else while the request is in
  // flight.
  const [respondingActivityId, setRespondingActivityId] = useState(null);
  const [respondError, setRespondError] = useState("");

  const handleRespond = useCallback(
    async (activityId, invitationId, status) => {
      setRespondingActivityId(activityId);
      setRespondError("");

      try {
        const response = await fetch(
          `/api/backend/activities/${encodeURIComponent(activityId)}/invited-branches/${encodeURIComponent(invitationId)}/respond`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ invitation_status: status }),
          },
        );
        const body = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(body?.message || `Request failed (${response.status})`);
        }

        // A declined invitation drops out of the backend's PENDING/ACCEPTED
        // scope entirely, so refetching is what actually removes the row —
        // there is nothing to patch locally.
        await loadActivities();
      } catch (error) {
        if (mountedRef.current) {
      setRespondError(error.message || t("activityPage.respondFailed"));
        }
      } finally {
        if (mountedRef.current) setRespondingActivityId(null);
      }
    },
    [loadActivities, t],
  );

  const activities = useMemo(
    () =>
      activityRecords.map((item) =>
        normalizeActivity(item, branchOptions),
      ),
    [activityRecords, branchOptions],
  );

  // Every page-level summary — the stat cards, the own/invited tabs, the
  // pending-invitation badge, and the type/sector filter option lists —
  // is scoped to just the sidebar's globally-selected branch, same as the
  // table rows below. activities itself can still carry more than this
  // one branch's rows (the backend's SECRETARY/BRANCH_LEADER scope is the
  // full combined set across every branch they're staff of — see
  // ActivityServiceImpl#getActivities — filtered down here on the
  // frontend instead of narrowing that backend query, since narrowing it
  // would also affect the donation module's own use of this endpoint).
  const branchScopedActivities = useMemo(
    () =>
      activities.filter(
        (item) =>
          selectedBranch === "all" ||
          String(item.branchId) === String(selectedBranch) ||
          String(item.invitedBranchId) === String(selectedBranch) ||
          item.branch === selectedBranch ||
          contextBranches.some(
            (branch) =>
              String(branch) === String(selectedBranch) &&
              branch === item.branch,
          ),
      ),
    [activities, selectedBranch, contextBranches],
  );

  const types = useMemo(
    () => [...new Set(branchScopedActivities.map((item) => item.type).filter(Boolean))],
    [branchScopedActivities],
  );

  const sectors = useMemo(
    () => [...new Set(branchScopedActivities.map((item) => item.sector).filter(Boolean))],
    [branchScopedActivities],
  );

  // Whether the own-branch/invited split is meaningful to show at all —
  // the backend currently only computes ownBranch for a SECRETARY viewer,
  // so admin/branch-leader activity lists never show these tabs.
  const hasOwnBranchData = useMemo(
    () =>
      branchScopedActivities.some(
        (item) => item.ownBranch === true || item.ownBranch === false,
      ),
    [branchScopedActivities],
  );

  // How many invited activities are still waiting on an Accept/Decline —
  // drives the badge on the "invited" tab below. Counts across the active
  // branch's invited activities regardless of which type/sector/search
  // filters are currently applied, so the badge reflects that branch's
  // true outstanding total, not just what's visible in the current
  // filtered view.
  const pendingInvitationCount = useMemo(
    () =>
      branchScopedActivities.filter(
        (item) =>
          item.ownBranch === false && item.invitationStatus === "PENDING",
      ).length,
    [branchScopedActivities],
  );

  const filteredActivities = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const [rangeStart, rangeEnd] = selectedDateRange;

    const rangeStartValue = rangeStart
      ? rangeStart.toISOString().split("T")[0]
      : "";

    const rangeEndValue = rangeEnd
      ? rangeEnd.toISOString().split("T")[0]
      : "";

    return branchScopedActivities.filter((item) => {
      const name = item.name?.toLowerCase() || "";
      const branch =
        item.branch?.toLowerCase() || "";
      const sector =
        item.sector?.toLowerCase() || "";

      const matchesSearch =
        !query ||
        name.includes(query) ||
        branch.includes(query) ||
        sector.includes(query);

      const matchesSector =
        selectedSector === "all" ||
        item.sector === selectedSector;

      const matchesType =
        selectedType === "all" ||
        item.type === selectedType;

      const matchesDate =
        (!rangeStartValue || item.dateValue >= rangeStartValue) &&
        (!rangeEndValue || item.dateValue <= rangeEndValue);

      const matchesScope =
        selectedScope === "all" ||
        (selectedScope === "own" && item.ownBranch === true) ||
        (selectedScope === "invited" && item.ownBranch === false);

      return (
        matchesSearch &&
        matchesSector &&
        matchesType &&
        matchesDate &&
        matchesScope
      );
    });
  }, [
    searchQuery,
    selectedSector,
    selectedType,
    selectedDateRange,
    selectedScope,
    branchScopedActivities,
  ]);

  const columns = [
    {
      key: "no",
      label: t("memberPage.no"),
      width: "4%",
      align: "center",
      render: (_row, index) => index + 1,
    },
    {
      key: "name",
      label: t("activityPage.activityName"),
      width: "13%",
      align: "left",
      truncate: true,
      cellClassName:
        "font-medium text-text-primary",
    },
    {
      key: "type",
      label: t("memberPage.type"),
      width: "10%",
      align: "center",
      render: (row) => (
        <TypeBadge type={row.type} />
      ),
    },
    {
      key: "sector",
      label: t("activityPage.sector"),
      width: "6%",
      align: "center",
    },
    {
      key: "branch",
      label: t("memberPage.branch"),
      width: "12%",
      align: "center",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "location",
      label: t("memberPage.location"),
      width: "8%",
      align: "center",
      truncate: true,
      render: (row) => {
        if (typeof row.location === "string") {
          return row.location;
        }

        return (
          row.location?.name ||
          row.location?.city ||
          "-"
        );
      },
    },
    {
      key: "date",
      label: t("activityPage.startDate"),
      width: "10%",
      align: "center",
    },
    {
      key: "duration",
      label: t("activityPage.duration"),
      width: "6%",
      align: "center",
    },
    {
      key: "participants",
      label: t("activityPage.participants"),
      width: "9%",
      align: "center",
    },
    {
      key: "status",
      label: t("memberPage.status"),
      width: "8%",
      align: "center",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "actions",
      label: t("activityPage.actions"),
      width: "14%",
      align: "center",
      render: (row) => {
        // Only an invited-and-not-yet-responded row gets Accept/Decline —
        // every other row (own-hosted, already-accepted invited, or a role
        // this backend doesn't compute ownBranch for at all) keeps the
        // normal Detail link, which is also where an accepted invited
        // branch goes to invite its own members.
        if (row.ownBranch === false && row.invitationStatus === "PENDING") {
          const isResponding = respondingActivityId === row.id;

          return (
            <div className="mx-auto flex w-fit items-center justify-center gap-1">
              <button
                type="button"
                disabled={isResponding}
                onClick={() =>
                  handleRespond(row.id, row.invitationId, "ACCEPTED")
                }
                className="inline-flex h-[22px] items-center justify-center gap-1 whitespace-nowrap rounded-[8px] bg-success px-2 text-[10px] font-Regular text-white transition hover:bg-emerald-700 disabled:opacity-60"
              >
                <CheckCircle2 size={12} />
                {t("activityPage.accept")}
              </button>
              <button
                type="button"
                disabled={isResponding}
                onClick={() =>
                  handleRespond(row.id, row.invitationId, "DECLINED")
                }
                className="inline-flex h-[22px] items-center justify-center gap-1 whitespace-nowrap rounded-[8px] border border-border px-2 text-[10px] font-Regular text-text-secondary transition hover:bg-bg-page-gray disabled:opacity-60"
              >
                <XCircle size={12} />
                {t("activityPage.decline")}
              </button>
            </div>
          );
        }

        // A declined invitation stays in the table as a historical row
        // (see ActivityServiceImpl#getActivities — DECLINED is included in
        // the query on purpose) instead of vanishing, so mark it in red
        // here rather than offering an action there's nothing left to take.
        if (row.ownBranch === false && row.invitationStatus === "DECLINED") {
          return (
            <span className="mx-auto inline-flex h-[22px] w-fit items-center justify-center gap-1 whitespace-nowrap rounded-[8px] bg-error-bg px-2.5 text-[10px] font-Regular text-error">
              <XCircle size={12} />
              {t("activityPage.declined")}
            </span>
          );
        }

        return (
          <Link
            href={`/activity/${row.id}${selectedBranch !== "all" ? `?branchId=${encodeURIComponent(selectedBranch)}` : ""}`}
            className="mx-auto flex h-[22px] w-fit items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] bg-primary px-3 text-[10px] font-Regular text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-sm active:translate-y-0"
          >
            <List size={14} />
            {t("activityPage.detail")}
          </Link>
        );
      },
    },
  ];

  const filters = [
    {
      key: "type",
      value: selectedType,
      onChange: setSelectedType,
      placeholder: t("memberPage.type"),
      options: types,
    },
    {
      key: "sector",
      value: selectedSector,
      onChange: setSelectedSector,
      placeholder: t("activityPage.sector"),
      options: sectors,
    },
    {
      key: "date",
      value: selectedDateRange,
      onChange: setSelectedDateRange,
      placeholder: t("activityPage.datePlaceholder"),
      type: "daterange",
    },
  ];

  const handleDownload = () => {
    const rows = filteredActivities.map((item, index) => ({
      [t("memberPage.no")]: index + 1,
      [t("activityPage.activityName")]: item.name,
      [t("memberPage.type")]: item.type,
      [t("activityPage.sector")]: item.sector,
      [t("memberPage.branch")]: item.branch,
      [t("memberPage.location")]: item.location,
      [t("memberPage.date")]: item.date,
      [t("activityPage.duration")]: item.duration,
      [t("activityPage.participants")]: item.participants,
      [t("memberPage.status")]: item.status,
    }));

    const branchLabel =
      selectedBranch !== "all"
        ? branchOptions.find((option) => String(option.value) === String(selectedBranch))?.label
        : null;

    downloadTableAsExcel({
      data: rows,
      fileName: branchLabel ? `${t("activityPage.fileName")}-${branchLabel}` : t("activityPage.fileName"),
    });
  };

  return (
    <div className="min-w-0 space-y-5 overflow-x-auto">
      <ActivityStats
        activities={branchScopedActivities}
        // The backend's invitedActivityCount is a total across every
        // branch the viewer is staff of, not just the one currently
        // selected — only trust it while genuinely viewing the combined
        // "all branches" scope; otherwise fall back to ActivityStats'
        // own count computed from branchScopedActivities so the card
        // matches whichever single branch is active.
        invitedActivityCount={selectedBranch === "all" ? invitedActivityCount : null}
      />

      <TelegramConnectBanner />

      {loadError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {loadError}
        </div>
      )}

      {respondError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {respondError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-bg-page-white p-4 transition-shadow duration-200 hover:shadow-sm">
        {hasOwnBranchData && (
          <div className="mb-4 inline-flex w-fit shrink-0 rounded-lg border border-border bg-bg-page-gray p-1 text-xs font-medium">
            {[
              { key: "all", label: t("activityPage.all") },
              { key: "own", label: t("activityPage.ownBranch") },
              { key: "invited", label: t("activityPage.invitedBranch") },
            ].map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setSelectedScope(tab.key)}
                className={`relative rounded-md px-3 py-1.5 transition ${
                  selectedScope === tab.key
                    ? "bg-secondary text-white"
                    : "text-text-secondary hover:text-text-primary"
                }`}
              >
                {tab.label}
                {tab.key === "invited" && pendingInvitationCount > 0 && (
                  <span className="absolute -right-2 -top-2 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-error px-1 text-[10px] font-semibold leading-none text-white">
                    {pendingInvitationCount > 99 ? "99+" : pendingInvitationCount}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        <div className="mb-4 flex min-w-0 flex-col gap-3 xl:flex-row xl:items-center">
  <div className="w-full xl:w-[265px] xl:shrink-0">
    <SearchBar
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder={t("activityPage.searchPlaceholder")}
      width="w-full"
    />
  </div>

  <div className="min-w-0">
    <FilterBar filters={filters} className="flex-wrap xl:flex-nowrap" />
  </div>

  <div className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center xl:ml-auto">
    <PrimaryActionButton onClick={handleDownload} />

    {canCreateActivity && (
        <Link href="/activity/create">
          <Button
            type="button"
            variant="success"
            icon={<PlusCircle size={16} />}
          >
            {t("activityPage.createActivity")}
          </Button>
        </Link>
      )}
  </div>
</div>

        <Table
          columns={columns}
          data={filteredActivities}
          rowsPerPage={10}
          scrollable
          tableClassName="min-w-[980px]"
          emptyMessage={
            loading
              ? t("activityPage.loadingData")
              : t("activityPage.noData")
          }
        />
      </section>
    </div>
  );
}
