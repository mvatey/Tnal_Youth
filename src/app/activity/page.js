"use client";

import { useMemo, useState } from "react";
import { CloudDownload, List, PlusCircle } from "lucide-react";
import SearchBar from "@/components/table-items/SearchBar";
import Button from "@/components/table-items/Button";
import FilterBar from "@/components/table-items/FilterBar";
import Table from "@/components/table-items/Table";
import ActivityStats from "@/components/activity/ActivityStats";
import { RiDownloadCloud2Line } from "react-icons/ri";
import { useBranch } from "@/context/BranchContext";
import Link from "next/link";
import activities from "@/data/activity.json";

const branches = ["ភ្នំពេញ", "កណ្ដាល"];
const sectors = ["បច្ចេកវិទ្យា", "រដ្ឋបាល", "សង្គម", "អប់រំ", "បរិស្ថាន"];
const types = ["កម្មវិធីផ្ទៃក្នុង", "កម្មវិធីខាងក្រៅ"];

function TypeBadge({ type }) {
  const style =
    type === "កម្មវិធីខាងក្រៅ"
      ? "bg-success-bg text-success"
      : "bg-secondary-light text-secondary";

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-normal ${style}`}>
      {type}
    </span>
  );
}

function StatusBadge({ status }) {
  const label = status === "upcoming" ? "ឆាប់ៗនេះ" : "បានបញ្ចប់";

  const style =
    status === "upcoming"
      ? "bg-secondary-light text-secondary"
      : "bg-success-bg text-success";

  return (
    <span className={`rounded-full px-3 py-1 text-[11px] font-normal ${style}`}>
      {label}
    </span>
  );
}

export default function ActivityPage() {
  const { selectedBranch, setSelectedBranch } = useBranch();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSector, setSelectedSector] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate,setSelectedDate] = useState(null);
  

  const filteredActivities = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return activities.filter((item) => {
      const matchesSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.branch.toLowerCase().includes(q) ||
        item.sector.toLowerCase().includes(q);

      const matchesSector =
        selectedSector === "all" || item.sector === selectedSector;

      const matchesType = selectedType === "all" || item.type === selectedType;

      const matchesBranch = selectedBranch === "all" || item.branch === selectedBranch;

      const matchesDate =
        !selectedDate ||
        item.dateValue === selectedDate.toISOString().split("T")[0];

      return matchesSearch && matchesSector && matchesType && matchesBranch && matchesDate;
    });
  }, [searchQuery, selectedSector, selectedType, selectedBranch, selectedDate]);

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
    align: "center",
    truncate: true,
    cellClassName: "font-medium text-text-primary",
  },

  {
    key: "type",
    label: "ប្រភេទ",
    width: "10%",
    align: "center",
    render: (row) => <TypeBadge type={row.type} />,
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
    render: (row) => <StatusBadge status={row.status} />,
  },

  {
      key: "actions",
      label: "សកម្មភាព",
      width: "12%",
      align: "center",
      render: (row) => (
        <Link href={`/activity/${row.id}`} className="mx-auto flex h-8 w-fit items-center justify-center gap-1.5 rounded-lg bg-primary px-3 text-[11px] font-semibold text-white hover:bg-primary-hover">
          <List size={14} />
          ព័ត៌មានលម្អិត
        </Link>
      ),
  }
];

  return (
    <div className="space-y-5">
      <ActivityStats />

      <div className="rounded-xl border border-border bg-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="ស្វែងរកសកម្មភាព..."
            width="w-[270px]"
          />

          <FilterBar
            filters={[
              {
                key: "sector",
                value: selectedSector,
                onChange: setSelectedSector,
                placeholder: "វិស័យ",
                options: sectors,
              },
              {
                key: "type",
                value: selectedType,
                onChange: setSelectedType,
                placeholder: "ប្រភេទ",
                options: types,
              },
              {
                key: "branch",
                value: selectedBranch,
                onChange: setSelectedBranch,
                placeholder: "សាខា",
                options: branches,
              },
              {
                key: "date",
                value: selectedDate,
                onChange: setSelectedDate,
                placeholder: "ថ្ងៃ/ខែ/ឆ្នាំ",
                type: "date",
              },
            ]}
          />

          <div className="ml-auto flex items-center gap-3">
            <Button
              icon={RiDownloadCloud2Line}
              variant="primary"
            >
              ទាញយក
            </Button>

            <Link href="/activity/create" className="flex h-10 items-center gap-2 rounded-lg bg-success px-4 text-sm font-semibold text-white">
              <PlusCircle size={16} />
              បង្កើតកម្មវិធីថ្មី
            </Link>
          </div>
        </div>

       <Table columns={columns} data={filteredActivities} rowsPerPage={10} emptyMessage="មិនមានទិន្នន័យកម្មវិធីទេ" />
      </div>
    </div>
  );
}