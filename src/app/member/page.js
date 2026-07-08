"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Users, UserCheck, Search, ChevronDown, Trash2, Eye } from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import DataTable from "@/components/table/DataTable";
import Pagination from "@/components/forms/download";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal";
import CreateMemberModal from "@/components/popup/CreateMemberModal";
import users from "@/data/members.json";
import { AiOutlineWoman } from "react-icons/ai";
import { RiAddCircleLine } from "react-icons/ri";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const ROLE_BADGE_STYLES = {
  admin: "bg-primary-light text-primary",
  branch_leader: "bg-warning-bg text-warning",
  secretary: "bg-success-bg text-success",
  member: "bg-gray-100 text-text-secondary",
};

const STATUS_BADGE_STYLES = {
  សកម្ម: "bg-success-bg text-success",
  អសកម្ម: "bg-error-bg text-error",
};

const PAGE_SIZE = 10;

export default function MembersPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const [members, setMembers] = useState(() =>
    users.map(({ password, ...rest }) => rest),
  );

  const branches = useMemo(
    () => [...new Set(members.map((m) => m.branch))],
    [members],
  );

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "សកម្ម").length;
    const female = members.filter((m) => m.gender === "ស្រី").length;
    return { total, active, female };
  }, [members]);

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const matchesQuery =
        m.name.toLowerCase().includes(query.toLowerCase()) ||
        m.phone.includes(query);
      const matchesBranch = !branchFilter || m.branch === branchFilter;
      const matchesStatus = !statusFilter || m.status === statusFilter;
      return matchesQuery && matchesBranch && matchesStatus;
    });
  }, [members, query, branchFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  useEffect(() => {
    setCurrentPage(1);
  }, [query, branchFilter, statusFilter]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleCreateMember = (form) => {
    const newMember = {
      id: String(Date.now()),
      name: form.nameKh,
      nameEn: form.nameEn,
      gender: form.gender,
      status: form.status,
      phone: form.phone,
      email: form.email,
      branch: form.branch,
      role: form.role,
      dob: form.dob,
      joinedAt: form.joinedAt,
    };
    setMembers((prev) => [newMember, ...prev]);
    setIsCreateOpen(false);
  };

  // Column definitions — this is what makes DataTable reusable per page
  const columns = useMemo(
    () => [
      {
        key: "index",
        header: "ល.រ",
        width: "5rem",
        render: (_row, i) => (currentPage - 1) * PAGE_SIZE + i + 1,
      },
      {
        key: "name",
        header: "សមាជិក",
        render: (m) => (
          <span className="text-text-primary font-medium">{m.name}</span>
        ),
      },
      { key: "gender", header: "ភេទ" },
      { key: "branch", header: "សាខា" },
      {
        key: "role",
        header: "តួនាទី",
        render: (m) => (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs ${
              ROLE_BADGE_STYLES[m.role] || "bg-gray-100 text-text-secondary"
            }`}
          >
            {ROLE_LABELS[m.role] || m.role}
          </span>
        ),
      },
      {
        key: "status",
        header: "ស្ថានភាព",
        render: (m) => (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs ${
              STATUS_BADGE_STYLES[m.status] || "bg-gray-100 text-text-secondary"
            }`}
          >
            {m.status}
          </span>
        ),
      },
      { key: "joinedAt", header: "ថ្ងៃចូលរួម" },
      {
        key: "actions",
        header: "សកម្មភាព",
        render: (m) => (
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/member/memberInfo/${m.id}`)}
              className="flex items-center gap-1 bg-secondary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition"
            >
              <Eye className="w-3.5 h-3.5" />
              មើលលម្អិត
            </button>
            <button
              onClick={() => setDeleteTarget(m)}
              className="text-red-500 hover:text-red-600 p-1.5"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ),
      },
    ],
    [currentPage, router],
  );

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Users} label="ចំនួនសមាជិកសរុប" value={stats.total} iconColor="text-primary" iconBg="bg-primary-light" />
        <StatCard icon={UserCheck} label="ចំនួនសមាជិកសកម្ម" value={stats.active} iconColor="text-success" iconBg="bg-success-bg" />
        <StatCard icon={AiOutlineWoman} label="ចំនួនភេទស្រី" value={stats.female} iconColor="text-warning" iconBg="bg-warning-bg" />
      </div>

      {/* Members table card */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-text-primary mb-3 text-lg">
          បញ្ជីសមាជិក
        </h3>

        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="ស្វែងរកតាមរយៈឈ្មោះ ឬលេខទូរស័ព្ទ..."
                className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>

            <div className="relative w-48">
              <select
                value={branchFilter}
                onChange={(e) => setBranchFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">សាខា</option>
                {branches.map((b) => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>

            <div className="relative w-32">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none rounded-lg border border-gray-200 bg-white py-2.5 pl-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">ស្ថានភាព</option>
                <option value="សកម្ម">សកម្ម</option>
                <option value="អសកម្ម">អសកម្ម</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            </div>
          </div>

          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <RiAddCircleLine className="w-4 h-4" />
            បន្ថែមសមាជិកថ្មី
          </button>
        </div>

        {/* Generic table, driven by columns config */}
        <DataTable columns={columns} data={paginated} rowKey="id" />

        {/* Pagination */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          data={filtered}
          filename="members.csv"
        />
      </div>

      <ConfirmDeleteModal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleConfirmDelete} />
      <CreateMemberModal open={isCreateOpen} onClose={() => setIsCreateOpen(false)} onSave={handleCreateMember} branches={branches} />
    </div>
  );
}