"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { List, PlusCircle } from "lucide-react";

import SearchBar from "@/components/tables/SearchBar";
import FilterBar from "@/components/tables/FilterBar";
import Table from "@/components/tables/GenericTable";
import ActivityStats from "@/components/activity/ActivityStats";
import Button from "@/components/ui/Button";
import PrimaryActionButton from "@/components/ui/actions/PrimaryActionButton";

import { useBranch } from "@/context/BranchContext";
import { downloadCsv } from "@/utils/downloadCsv";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

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
    branch: branch?.label || `#${item.branchId}`,
    branchId: item.branchId,
    location: item.locationName || item.address || "-",
    date: formatDate(item.startsAt),
    dateValue: item.startsAt?.slice(0, 10) || "",
    duration: formatDuration(item.startsAt, item.endsAt),
    participants:
      item.participantCount != null
        ? `${item.participantCount}/${capacity || "-"}`
        : capacity > 0
          ? `-/${capacity}`
          : "-",
    status,
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
  const isUpcoming = status === "upcoming";
  const isOngoing = status === "ongoing";
  const isCancelled = status === "cancelled";

  const label = isCancelled
    ? "បានលុបចោល"
    : isOngoing
      ? "កំពុងដំណើរការ"
      : isUpcoming
        ? "ឆាប់ៗនេះ"
        : "បានបញ្ចប់";

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
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedSector, setSelectedSector] =
    useState("all");

  const [selectedType, setSelectedType] =
    useState("all");

  const [selectedDate, setSelectedDate] =
    useState(null);

  useEffect(() => {
    let active = true;

    async function loadActivities() {
      setLoading(true);
      setLoadError("");

      try {
        const [activityResponse, branchResponse] = await Promise.all([
          fetch("/api/backend/activities?page=0&size=1000", {
            cache: "no-store",
          }),
          fetch("/api/lookups/activity-invitable-branches", {
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

        if (!active) return;

        setActivityRecords(
          Array.isArray(activityBody?.content)
            ? activityBody.content
            : [],
        );
        setBranchOptions(
          (Array.isArray(branchBody) ? branchBody : []).map((branch) => ({
            value: branch.value ?? branch.id,
            label:
              branch.labelKm ||
              branch.labelEn ||
              branch.label ||
              branch.code ||
              `#${branch.value ?? branch.id}`,
          })),
        );
      } catch (error) {
        if (active) {
          setActivityRecords([]);
          setLoadError(error.message || "Cannot load activities");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadActivities();

    return () => {
      active = false;
    };
  }, []);

  const activities = useMemo(
    () =>
      activityRecords.map((item) =>
        normalizeActivity(item, branchOptions),
      ),
    [activityRecords, branchOptions],
  );

  const types = useMemo(
    () => [...new Set(activities.map((item) => item.type).filter(Boolean))],
    [activities],
  );

  const sectors = useMemo(
    () => [...new Set(activities.map((item) => item.sector).filter(Boolean))],
    [activities],
  );

  const filteredActivities = useMemo(() => {
    const query = searchQuery
      .trim()
      .toLowerCase();

    const selectedDateValue = selectedDate
      ? selectedDate.toISOString().split("T")[0]
      : "";

    return activities.filter((item) => {
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

      const matchesBranch =
        selectedBranch === "all" ||
        String(item.branchId) === String(selectedBranch) ||
        item.branch === selectedBranch ||
        contextBranches.some(
          (branch) =>
            String(branch) === String(selectedBranch) &&
            branch === item.branch,
        );

      const matchesDate =
        !selectedDateValue ||
        item.dateValue === selectedDateValue;

      return (
        matchesSearch &&
        matchesSector &&
        matchesType &&
        matchesBranch &&
        matchesDate
      );
    });
  }, [
    searchQuery,
    selectedSector,
    selectedType,
    selectedBranch,
    selectedDate,
    activities,
    contextBranches,
  ]);

  const columns = [
    {
      key: "no",
      label: "ល.រ",
      width: "4%",
      align: "center",
      render: (_row, index) => index + 1,
    },
    {
      key: "name",
      label: "ឈ្មោះកម្មវិធី",
      width: "13%",
      align: "left",
      truncate: true,
      cellClassName:
        "font-medium text-text-primary",
    },
    {
      key: "type",
      label: "ប្រភេទ",
      width: "10%",
      align: "center",
      render: (row) => (
        <TypeBadge type={row.type} />
      ),
    },
    {
      key: "sector",
      label: "វិស័យ",
      width: "7%",
      align: "center",
    },
    {
      key: "branch",
      label: "សាខា",
      width: "12%",
      align: "center",
      cellClassName: "whitespace-nowrap",
    },
    {
      key: "location",
      label: "ទីតាំង",
      width: "10%",
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
      label: "ថ្ងៃចាប់ផ្តើម",
      width: "12%",
      align: "center",
    },
    {
      key: "duration",
      label: "រយៈពេល",
      width: "7%",
      align: "center",
    },
    {
      key: "participants",
      label: "ចំនួនអ្នកចូលរួម",
      width: "9%",
      align: "center",
    },
    {
      key: "status",
      label: "ស្ថានភាព",
      width: "8%",
      align: "center",
      render: (row) => (
        <StatusBadge status={row.status} />
      ),
    },
    {
      key: "actions",
      label: "សកម្មភាព",
      width: "12%",
      align: "center",
      render: (row) => (
        <Link
          href={`/activity/${row.id}`}
          className="mx-auto flex h-[22px] w-fit items-center justify-center gap-1.5 whitespace-nowrap rounded-[8px] bg-primary px-3 text-[10px] font-Regular text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-sm active:translate-y-0"
        >
          <List size={14} />
          ព័ត៌មានលម្អិត
        </Link>
      ),
    },
  ];

  const filters = [
    {
      key: "type",
      value: selectedType,
      onChange: setSelectedType,
      placeholder: "ប្រភេទ",
      options: types,
    },
    {
      key: "sector",
      value: selectedSector,
      onChange: setSelectedSector,
      placeholder: "វិស័យ",
      options: sectors,
    },
    {
      key: "date",
      value: selectedDate,
      onChange: setSelectedDate,
      placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ",
      type: "date",
    },
  ];

  const handleDownload = () => {
    downloadCsv(filteredActivities, "activities.csv");
  };

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <ActivityStats activities={activities} />

      {loadError && (
        <div className="rounded-xl border border-error/30 bg-error/5 px-4 py-3 text-sm text-error">
          {loadError}
        </div>
      )}

      <section className="rounded-xl border border-border bg-white p-4 transition-shadow duration-200 hover:shadow-sm">
        <div className="mb-4 flex min-w-0 flex-nowrap items-center gap-3">
  <div className="w-[265px] shrink-0">
    <SearchBar
      value={searchQuery}
      onChange={setSearchQuery}
      placeholder="ស្វែងរកសកម្មភាព..."
      width="w-full"
    />
  </div>

  <div className="shrink-0">
    <FilterBar filters={filters} className="flex-nowrap" />
  </div>

  <div className="ml-auto flex shrink-0 items-center gap-3">
    <PrimaryActionButton onClick={handleDownload} />

    {canCreateActivity && (
        <Link href="/activity/create">
          <Button
            type="button"
            variant="success"
          >
            បង្កើតកម្មវិធី
          </Button>
        </Link>
      )}
  </div>
</div>

        <Table
          columns={columns}
          data={filteredActivities}
          rowsPerPage={10}
          scrollable={false}
          emptyMessage={
            loading
              ? "កំពុងទាញយកទិន្នន័យ..."
              : "មិនមានទិន្នន័យកម្មវិធីទេ"
          }
        />
      </section>
    </div>
  );
}
