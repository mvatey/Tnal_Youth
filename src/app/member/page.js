// app/dashboard/members/page.jsx
"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";
import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js"; // Path to our new shared component

import { Users, UserCheck, Plus, Trash2, EyeIcon } from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import users from "@/data/members.json";
import { AiOutlineWoman } from "react-icons/ai";

const ROLE_LABELS = { admin: "អ្នកគ្រប់គ្រង", branch_leader: "ប្រធានសាខា", secretary: "លេខាធិការ", member: "សមាជិក" };
const ROLE_BADGE_STYLES = { admin: "bg-primary-light text-primary", branch_leader: "bg-warning-bg text-warning", secretary: "bg-success-bg text-success", member: "bg-gray-100 text-text-secondary" };
const STATUS_BADGE_STYLES = { "សកម្ម": "bg-success-bg text-success", "អសកម្ម": "bg-red-50 text-red-600" };

export default function MembersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Clean data array mutations
  const filteredMembers = useMemo(() => {
    return users
      .filter((u) => !deletedIds.includes(u.id))
      .filter((m) => {
        const matchesQuery = m.name.toLowerCase().includes(query.toLowerCase()) || m.phone.includes(query);
        const matchesBranch = !branchFilter || m.branch === branchFilter;
        const matchesStatus = !statusFilter || m.status === statusFilter;
        return matchesQuery && matchesBranch && matchesStatus;
      });
  }, [deletedIds, query, branchFilter, statusFilter]);

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
      {/* Stat Cards can go here... */}

      {/* Render the unified DataTable component cleanly */}
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