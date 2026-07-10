"use client";

import { use, useMemo, useState } from "react";
import { Eye, UserCheck, UserPlus, Users } from "lucide-react";
import activities from "@/data/activity.json";
import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Button from "@/components/table-items/Button";
import Table from "@/components/table-items/Table";
import { RiDownloadCloud2Line } from "react-icons/ri";
import { ChevronRight } from "lucide-react";
import Link from "next/link";

const participants = [
  { id: 1, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 2, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 3, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 4, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 5, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 6, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 7, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 8, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 9, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 10, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 11, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 12, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 13, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 14, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 15, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 16, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 17, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 18, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 19, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 20, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 21, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 22, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 23, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 24, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 25, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 26, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 27, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 28, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 29, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 30, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 31, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 32, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 33, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 34, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 35, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 36, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 37, name: "ឌី រីយ៉ា", email: "riya@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 38, name: "ចាន់ សុភា", email: "sophea@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 39, name: "ឡេង ដារ៉ា", email: "dara@example.com", gender: "ប្រុស", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 40, name: "ហេង ស្រីនា", email: "sreyna@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 41, name: "គឹម សុវណ្ណ", email: "sovann@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 42, name: "ណារី សុជាតា", email: "socheata@example.com", gender: "ស្រី", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 43, name: "ម៉ៅ រដ្ឋា", email: "ratha@example.com", gender: "ប្រុស", role: "ប្រធាន", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 44, name: "អ៊ុំ ស្រីពេជ្រ", email: "sreypich@example.com", gender: "ស្រី", role: "លេខាធិការ", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 45, name: "វង្ស វណ្ណៈ", email: "vannak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "មិនបានចូលរួម" },
  { id: 46, name: "សាន សុភ័ក្រ", email: "sopheak@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 47, name: "លីណា ស្រីមុំ", email: "sreymom@example.com", gender: "ស្រី", role: "សមាជិក", branch: "ភ្នំពេញ", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" },
  { id: 48, name: "ថន ចាន់រ៉ា", email: "chanra@example.com", gender: "ប្រុស", role: "សមាជិក", branch: "កណ្ដាល", joinedDate: "03 កក្កដា 2026", status: "បានចូលរួម" }
];

const roles = ["ប្រធាន", "លេខាធិការ", "សមាជិក"];
const branches = ["ភ្នំពេញ", "កណ្ដាល"];

function StatusBadge({ status }) {
  const style = status === "បានចូលរួម" ? "bg-success-bg text-success" : "bg-warning-bg text-warning";
  return <span className={`rounded-full px-3 py-1 text-[11px] font-normal ${style}`}>{status}</span>;
}

function ParticipantStats() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <StatCard icon={Users} label="ចំនួនសមាជិកសរុប" value="250 នាក់" accent="bg-secondary-hover" iconBg="bg-secondary-light" iconColor="text-secondary-hover" />
      <StatCard icon={UserCheck} label="ចំនួនអ្នកបានចូលរួម" value="200 នាក់" accent="bg-primary" iconBg="bg-primary-light" iconColor="text-primary" />
      <StatCard icon={UserPlus} label="ចំនួនអ្នកមិនបានចូលរួម" value="50 នាក់" accent="bg-warning" iconBg="bg-warning-bg" iconColor="text-warning" />
    </div>
  );
}

function StatCard({ label, value, icon: Icon, accent, iconBg, iconColor }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-bg-page-white">
      <div className={`h-[3px] w-full ${accent}`} />
      <div className="flex items-center gap-3 p-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon size={21} className={iconColor} />
        </div>
        <div>
          <p className="text-lg font-bold text-text-primary">{value}</p>
          <p className="text-sm text-text-secondary">{label}</p>
        </div>
      </div>
    </div>
  );
}

export default function ActivityParticipantsPage({ params }) {
  const { id } = use(params);

  const activity = activities.find((item) => String(item.id) === String(id));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [selectedDate, setSelectedDate] = useState(null);

  const filteredParticipants = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return participants.filter((item) => {
      const matchesSearch = !q || item.name.toLowerCase().includes(q) || item.email.toLowerCase().includes(q);
      const matchesRole = selectedRole === "all" || item.role === selectedRole;
      const matchesBranch = selectedBranch === "all" || item.branch === selectedBranch;
      return matchesSearch && matchesRole && matchesBranch;
    });
  }, [searchQuery, selectedRole, selectedBranch]);

  const columns = [
    { key: "no", label: "ល.រ", width: "5%", align: "center", render: (_row, index) => index + 1 },
    { key: "name", label: "ឈ្មោះអ្នកចូលរួម", width: "20%", truncate: true, cellClassName: "font-medium text-text-primary", render: (row) => <div><p className="font-semibold text-text-primary">{row.name}</p><p className="text-xs text-text-secondary">{row.email}</p></div> },
    { key: "gender", label: "ភេទ", width: "10%", align: "center" },
    { key: "role", label: "តួនាទី", width: "13%", align: "center" },
    { key: "branch", label: "សាខា", width: "14%", align: "center" },
    { key: "joinedDate", label: "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម", width: "17%", align: "center" },
    { key: "status", label: "ស្ថានភាពចូលរួម", width: "14%", align: "center", render: (row) => <StatusBadge status={row.status} /> },
    { key: "actions", label: "សកម្មភាព", width: "7%", align: "center", render: () => <Eye size={17} className="mx-auto cursor-pointer text-primary" /> }
  ];

  return (
  <div className="space-y-5">
    {/* Header */}
    <div className="mb-1">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-text-secondary">
        <Link href="/activity" className="hover:text-primary">
          កម្មវិធី
        </Link>

        <ChevronRight size={14} />

        <Link href={`/activity/${activity.id}`} className="hover:text-primary">
          ព័ត៌មានលម្អិត
        </Link>

        <ChevronRight size={14} />

        <span className="font-semibold text-primary">
          សមាសភាពចូលរួម
        </span>
      </div>

      {/* Title */}
      <h1 className="mt-3 text-2xl font-bold text-secondary">
        {activity?.name}
      </h1>
    </div>

    {/* Stat cards */}
    <ParticipantStats />

    {/* Table */}
    <div className="rounded-xl border border-border bg-white p-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="ស្វែងរកសមាជិក..."
          width="w-[300px]"
        />

        <FilterBar
          filters={[
            {
              key: "role",
              value: selectedRole,
              onChange: setSelectedRole,
              placeholder: "តួនាទី",
              options: roles,
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

        <div className="ml-auto">
          <button className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-hover">
            <RiDownloadCloud2Line size={18} />
            ទាញយករបាយការណ៍
          </button>
        </div>
      </div>

      <Table
        columns={columns}
        data={filteredParticipants}
        rowsPerPage={10}
        emptyMessage="មិនមានសមាជិកចូលរួមទេ"
      />
    </div>
  </div>
);
}