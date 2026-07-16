// app/dashboard/members/page.jsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";
import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js"; // Shared Component
import StatCard from "@/components/dashboard/statCard"; // StatCard Component

import { Users, UserCheck, Plus, Trash2, EyeIcon } from "lucide-react";
import users from "@/data/members.json";
import { AiOutlineWoman } from "react-icons/ai";

const KHMER_MONTHS = {
  មករា: 0, កុម្ភៈ: 1, កុម្ភះ: 1, មីនា: 2, មេសា: 3, ឧសភា: 4, 
  មិថុនា: 5, កក្កដា: 6, សីហា: 7, កញ្ញា: 8, តុលា: 9, វិច្ឆិកា: 10, ធ្នូ: 11
};

// Helper utilities for calculating stat growth trends
function parseKhmerDate(str) {
  if (typeof str !== "string") return null;
  const match = str.match(/(\d+)\s+([^\s,]+),?\s*(\d+)/);
  if (!match) return null;
  const [, day, monthName, year] = match;
  const month = KHMER_MONTHS[monthName];
  if (month === undefined) return null;
  return new Date(Number(year), month, Number(day));
}

function calcGrowth(members, filterFn) {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const countUpTo = (cutoff) =>
    members.filter((m) => {
      if (!m.joinedAt) return false;
      const joined = parseKhmerDate(m.joinedAt);
      return joined && joined <= cutoff && filterFn(m);
    }).length;

  const currentCount = countUpTo(today);
  const previousCount = countUpTo(oneMonthAgo);

  if (previousCount === 0) return currentCount > 0 ? 100 : 0;
  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}

const ROLE_LABELS = { admin: "អ្នកគ្រប់គ្រង", donation_admin: "អ្នកគ្រប់គ្រងការបរិច្ចាគ", branch_leader: "ប្រធានសាខា", secretary: "លេខាធិការ", member: "សមាជិក" };
const ROLE_BADGE_STYLES = { admin: "bg-primary-light text-primary", donation_admin: "bg-secondary/10 text-secondary", branch_leader: "bg-warning-bg text-warning", secretary: "bg-success-bg text-success", member: "bg-gray-100 text-text-secondary" };
const STATUS_BADGE_STYLES = { "សកម្ម": "bg-success-bg text-success", "អសកម្ម": "bg-red-50 text-red-600" };

export default function MembersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 1. Raw base array excluding locally deleted profiles
  const activeMembersList = useMemo(
    () => users.filter((u) => !deletedIds.includes(u.id)),
    [deletedIds]
  );

  // 2. Generate Real-time Card Statistics
  const stats = useMemo(() => {
    const total = activeMembersList.length;
    const active = activeMembersList.filter((m) => m.status === "សកម្ម").length;
    const female = activeMembersList.filter((m) => m.gender === "ស្រី").length;

    const totalGrowth = calcGrowth(activeMembersList, () => true);
    const activeGrowth = calcGrowth(activeMembersList, (m) => m.status === "សកម្ម");
    const femaleGrowth = calcGrowth(activeMembersList, (m) => m.gender === "ស្រី");

    return { total, active, female, totalGrowth, activeGrowth, femaleGrowth };
  }, [activeMembersList]);

  // 3. Apply search query inputs and selection dropdowns to pass down to DataTable
  const filteredMembers = useMemo(() => {
    return activeMembersList.filter((m) => {
      const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.phone.includes(query);
      const matchesBranch = !branchFilter || m.branch === branchFilter;
      const matchesStatus = !statusFilter || m.status === statusFilter;
      return matchesQuery && matchesBranch && matchesStatus;
    });
  }, [activeMembersList, query, branchFilter, statusFilter]);

  const branches = useMemo(() => [...new Set(users.map((m) => m.branch))], []);

  // Columns definition configuration layer 
  const tableColumns = [
    { header: "ល.រ", width: "w-[60px]", align: "center", render: (_, index) => index },
    { header: "សមាជិក", width: "w-[220px]", align: "left", render: (m) => <span className="text-text-primary font-medium">{m.name}</span> },
    { header: "ភេទ", width: "w-[80px]", align: "center", accessor: "gender" },
    { header: "សាខា", width: "w-[140px]", align: "left", accessor: "branch" },
    {
      header: "តួនាទី",
      width: "w-[130px]",
      align: "center",
      render: (m) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs ${ROLE_BADGE_STYLES[m.role] || "bg-gray-100 text-text-secondary"}`}>
          {ROLE_LABELS[m.role] || m.role}
        </span>
      ),
    },
    {
      header: "ស្ថានភាព",
      width: "w-[100px]",
      align: "center",
      render: (m) => (
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${STATUS_BADGE_STYLES[m.status] || "bg-gray-100 text-text-secondary"}`}>
          {m.status}
        </span>
      ),
    },
    { header: "ថ្ងៃចូលរួម", width: "w-[150px]", align: "left", accessor: "joinedAt" },
    {
      header: "សកម្មភាព",
      width: "w-[160px]",
      align: "center",
      render: (m) => (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => router.push(`/member/memberInfo/${m.id}`)} className="flex items-center gap-1 bg-secondary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition">
            <EyeIcon className="w-3.5 h-3.5" /> មើលលម្អិត
          </button>
          <button onClick={() => setDeleteTarget(m)} className="text-red-500 hover:text-red-600 p-1.5">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  // Filters configurations mapping array
  const filterConfig = [
    { value: branchFilter, onChange: setBranchFilter, options: branches, placeholder: "សាខា" },
    { value: statusFilter, onChange: setStatusFilter, options: ["សកម្ម", "អសកម្ម"], placeholder: "ស្ថានភាព" },
  ];

  return (
    <div className="space-y-6">
      {/* Stat cards section */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="ចំនួនសមាជិកសរុប"
          value={String(stats.total)}
          growth={String(stats.totalGrowth)}
          iconColor="text-primary"
          iconBg="bg-primary-light"
        />
        <StatCard
          icon={UserCheck}
          label="ចំនួនសមាជិកសកម្ម"
          value={String(stats.active)}
          growth={String(stats.activeGrowth)}
          iconColor="text-success"
          iconBg="bg-success-bg"
        />
        <StatCard
          icon={AiOutlineWoman}
          label="ចំនួនភេទស្រី"
          value={String(stats.female)}
          growth={String(stats.femaleGrowth)}
          iconColor="text-warning"
          iconBg="bg-warning-bg"
        />
      </div>

      {/* Rendered shared DataTable component layout structure */}
      <DataTable
        title="បញ្ជីសមាជិក"
        data={filteredMembers}
        columns={tableColumns}
        filters={filterConfig}
        searchQuery={query}
        onSearchChange={setQuery}
        searchPlaceholder="ស្វែងរកតាមរយៈឈ្មោះ ឬលេខទូរស័ព្ទ..."
        actionButton={
          <button onClick={() => setIsCreateOpen(true)} className="flex items-center gap-2 bg-success text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition">
            <Plus className="w-4 h-4" /> បន្ថែមសមាជិកថ្មី
          </button>
        }
      />

      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={() => { setDeletedIds(p => [...p, deleteTarget.id]); setDeleteTarget(null); }} description={deleteTarget ? `តើអ្នកប្រាកដថានឹងលុប "${deleteTarget.name}" ចេញពីបញ្ជីសមាជិកទេ?` : undefined} />
      <CreateMemberModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={() => setIsCreateOpen(false)} branches={branches} />
    </div>
  );
}
