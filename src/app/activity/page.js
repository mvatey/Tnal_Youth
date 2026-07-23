"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { List, PlusCircle } from "lucide-react";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Table from "@/components/table-items/Table";
import ActivityStats from "@/components/activity/ActivityStats";
import SaveButton from "@/components/forms/save";
import SaveFile from "@/components/forms/savefile";

import { useBranch } from "@/context/BranchContext";
import activities from "@/data/activity.json";

const branches = ["ភ្នំពេញ", "កណ្ដាល"];

const sectors = [
  "បច្ចេកវិទ្យា",
  "រដ្ឋបាល",
  "សង្គម",
  "អប់រំ",
  "បរិស្ថាន",
];

const types = [
  "កម្មវិធីផ្ទៃក្នុង",
  "កម្មវិធីខាងក្រៅ",
];

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

  const label = isUpcoming
    ? "ឆាប់ៗនេះ"
    : "បានបញ្ចប់";

  const style = isUpcoming
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
  const {
    selectedBranch = "all",
    setSelectedBranch = () => {},
  } = useBranch();

  const [searchQuery, setSearchQuery] =
    useState("");

  const [selectedSector, setSelectedSector] =
    useState("all");

  const [selectedType, setSelectedType] =
    useState("all");

  const [selectedDate, setSelectedDate] =
    useState(null);

  const [showSaveFile, setShowSaveFile] =
    useState(false);

  useEffect(() => {
    if (!showSaveFile) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowSaveFile(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveFile]);

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
        item.branch === selectedBranch;

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
      width: "14%",
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
      width: "8%",
      align: "center",
    },
    {
      key: "branch",
      label: "សាខា",
      width: "8%",
      align: "center",
    },
    {
      key: "location",
      label: "ទីតាំង",
      width: "11%",
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
      width: "10%",
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
          className="mx-auto flex h-8 w-fit items-center justify-center gap-1.5 whitespace-nowrap rounded-lg bg-primary px-3 text-[11px] font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-primary-hover hover:shadow-sm active:translate-y-0"
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

  return (
    <div className="min-w-0 space-y-5 overflow-x-hidden">
      <ActivityStats activities={filteredActivities} />

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
    <div className="relative">
      <SaveButton
        onClick={() => setShowSaveFile((isOpen) => !isOpen)}
        aria-expanded={showSaveFile}
        aria-controls="activity-save-file"
      />

      {showSaveFile && (
        <div
          id="activity-save-file"
          role="alert"
          className="absolute right-0 top-full z-50 mt-3"
        >
          <SaveFile />
        </div>
      )}
    </div>

    <Link
      href="/activity/create"
              className="flex h-[34px] items-center justify-center gap-2 whitespace-nowrap rounded-lg bg-success px-4 text-sm font-semibold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700 hover:shadow-sm active:translate-y-0"    >
      <PlusCircle size={16} />
      បង្កើតកម្មវិធីថ្មី
    </Link>
  </div>
</div>

        <Table
          columns={columns}
          data={filteredActivities}
          rowsPerPage={10}
          scrollable={false}
          emptyMessage="មិនមានទិន្នន័យកម្មវិធីទេ"
        />
      </section>
    </div>
  );
}
