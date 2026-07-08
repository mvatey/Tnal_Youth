"use client";

import DataTable from "@/components/table/DataTable";
import { useMemo, useState } from "react";
import {
  Activity,
  CalendarDays,
  RefreshCcw,
  CheckCircle,
  PlusCircle,
  Search,
  ChevronDown,
  Download,
  Eye,
} from "lucide-react";

const activities = [
  {
    id: 1,
    title: "សិក្ខាសាលាអភិវឌ្ឍន៍យុវជន",
    type: "កម្មវិធីផ្ទៃក្នុង",
    category: "បណ្តុះបណ្តាល",
    branch: "ភ្នំពេញ",
    leader: "ផាន វិទ្ធី",
    date: "06 កក្កដា, 2026",
    duration: "4 ម៉ោង",
    participant: "0/100",
    status: "បានបញ្ចប់",
  },
  {
    id: 2,
    title: "ការប្រជុំក្រុមការងារ",
    type: "កម្មវិធីផ្ទៃក្នុង",
    category: "ប្រជុំ",
    branch: "កណ្ដាល",
    leader: "សុខ ដារ៉ា",
    date: "25 កក្កដា, 2026",
    duration: "4 ម៉ោង",
    participant: "0/60",
    status: "កំពុងដំណើរការ",
  },
  {
    id: 3,
    title: "កម្មវិធីស្ម័គ្រចិត្តសហគមន៍",
    type: "កម្មវិធីខាងក្រៅ",
    category: "សង្គម",
    branch: "ភ្នំពេញ",
    leader: "ចាន់ សុភា",
    date: "25 កក្កដា, 2026",
    duration: "4 ម៉ោង",
    participant: "0/60",
    status: "បានបញ្ចប់",
  },
];

const stats = [
  {
    title: "កម្មវិធីសកម្ម",
    value: 28,
    icon: Activity,
    accent: "bg-primary",
    iconBg: "bg-primary-light",
    iconColor: "text-primary",
  },
  {
    title: "កម្មវិធីខាងមុខ",
    value: 9,
    icon: CalendarDays,
    accent: "bg-secondary-hover",
    iconBg: "bg-secondary-light",
    iconColor: "text-secondary-hover",
  },
  {
    title: "កំពុងដំណើរការ",
    value: 3,
    icon: RefreshCcw,
    accent: "bg-warning",
    iconBg: "bg-warning-bg",
    iconColor: "text-warning",
  },
  {
    title: "បានបញ្ចប់",
    value: 16,
    icon: CheckCircle,
    accent: "bg-success",
    iconBg: "bg-success-bg",
    iconColor: "text-success",
  },
];

const columns = [
  {
    key: "index",
    header: "ល.រ",
    width: "64px",
    render: (_row, rowIndex) => rowIndex + 1,
  },
  {
    key: "title",
    header: "ឈ្មោះកម្មវិធី",
    cellClassName: "text-text-primary font-medium",
  },
  {
    key: "type",
    header: "ប្រភេទ",
    render: (row) => <TypeBadge type={row.type} />,
  },
  {
    key: "category",
    header: "វិស័យ",
  },
  {
    key: "branch",
    header: "សាខា",
  },
  {
    key: "leader",
    header: "អ្នកទទួលបន្ទុក",
  },
  {
    key: "date",
    header: "កាលបរិច្ឆេទ",
  },
  {
    key: "duration",
    header: "រយៈពេល",
  },
  {
    key: "participant",
    header: "អ្នកចូលរួម",
  },
  {
    key: "status",
    header: "ស្ថានភាព",
    render: (row) => <StatusBadge status={row.status} />,
  },
  {
    key: "actions",
    header: "សកម្មភាព",
    width: "140px",
    render: (row) => (
      <button
        onClick={() => console.log(row)}
        className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-white"
      >
        ព័ត៌មានលម្អិត
      </button>
    ),
  },
];

function StatCard({ title, value, icon: Icon, accent, iconBg, iconColor }) {
  return (
    <div className="relative bg-bg-page-white border border-border rounded-xl overflow-hidden">
      <div className={`h-[3px] w-full ${accent}`} />

      <div className="flex items-center gap-3 p-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        <div>
          <div className="text-lg font-bold text-text-primary">{value}</div>
          <div className="text-sm text-text-secondary">{title}</div>
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const style =
    status === "បានបញ្ចប់"
      ? "bg-primary-light text-primary"
      : status === "កំពុងដំណើរការ"
      ? "bg-success-bg text-success"
      : "bg-warning-bg text-warning";

  return (
    <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${style}`}>
      {status}
    </span>
  );
}

function TypeBadge({ type }) {
  const style =
    type === "កម្មវិធីខាងក្រៅ"
      ? "bg-success-bg text-success"
      : "bg-secondary-light text-secondary-hover";

  return (
    <span className={`px-3 py-1 rounded-full text-xs whitespace-nowrap ${style}`}>
      {type}
    </span>
  );
}

export default function ActivityPage() {
  const [query, setQuery] = useState("");

  const filteredActivities = useMemo(() => {
    return activities.filter((item) =>
      item.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((item) => (
          <StatCard key={item.title} {...item} />
        ))}
      </div>

      <div className="bg-white border border-border rounded-xl p-4">
        {/* Filter area — easy to replace with Filter component later */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 flex-1">
            <div className="relative md:col-span-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ស្វែងរកសកម្មភាព..."
                className="w-full rounded-lg border border-border bg-white px-4 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <select className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none">
              <option>វិស័យ</option>
            </select>

            <select className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none">
              <option>ប្រភេទ</option>
            </select>

            <input
              type="date"
              className="rounded-lg border border-border bg-white px-4 py-2.5 text-sm focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-white">
              <Download size={16} />
              ទាញយក
            </button>

            <button className="inline-flex items-center gap-2 rounded-lg bg-success px-4 py-2.5 text-sm font-medium text-white">
              <PlusCircle size={16} />
              បង្កើតកម្មវិធីថ្មី
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <DataTable
            columns={columns}
            data={filteredActivities}
            rowKey={(row) => row.id}
            emptyMessage="មិនមានទិន្នន័យសកម្មភាពទេ"
            />
        </div>

        <div className="flex items-center justify-between pt-4">
          <button className="rounded-lg border border-border px-4 py-2 text-sm text-text-primary">
            Previous
          </button>

          <div className="flex items-center gap-1">
            {[1, 2, 3, "...", 8, 9, 10].map((page, index) => (
              <button
                key={index}
                className={`h-8 min-w-8 rounded-md px-2 text-sm ${
                  page === 1
                    ? "bg-primary-light text-primary"
                    : "text-text-secondary hover:bg-bg-page-gray"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button className="rounded-lg border border-border px-4 py-2 text-sm text-text-primary">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}