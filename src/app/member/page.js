// app/dashboard/members/page.jsx
"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";
import Pagination from "@/components/forms/download.js";

// 1. Import your newly provided CreateMemberModal component
import CreateMemberModal from "@/components/popup/CreateMemberModal.js";

import { Users, UserCheck, Plus, Search, Trash2, EyeIcon } from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import users from "@/data/members.json";

import { AiOutlineWoman } from "react-icons/ai";

const KHMER_MONTHS = {
  មករា: 0,
  កុម្ភៈ: 1,
  កុម្ភះ: 1,
  មីនា: 2,
  មេសា: 3,
  ឧសភា: 4,
  មិថុនា: 5,
  កក្កដា: 6,
  សីហា: 7,
  កញ្ញា: 8,
  តុលា: 9,
  វិច្ឆិកា: 10,
  ធ្នូ: 11,
};

function parseKhmerDate(str) {
  if (typeof str !== "string") {
    console.error("Expected a string for date parsing, got:", str);
    return null;
  }
  const match = str.match(/(\d+)\s+([^\s,]+),?\s*(\d+)/);
  if (!match) {
    console.error("Date string did not match expected format:", str);
    return null;
  }
  const [, day, monthName, year] = match;
  const month = KHMER_MONTHS[monthName];
  if (month === undefined) {
    console.error("Invalid month name:", monthName);
    return null;
  }
  return new Date(Number(year), month, Number(day));
}

function calcGrowth(members, filterFn) {
  const today = new Date();
  const oneMonthAgo = new Date(today);
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const countUpTo = (cutoff) =>
    members.filter((m) => {
      if (!m.joinedAt) {
        console.error("Member joinedAt is undefined for member:", m);
        return false;
      }
      const joined = parseKhmerDate(m.joinedAt);
      return joined && joined <= cutoff && filterFn(m);
    }).length;

  const currentCount = countUpTo(today);
  const previousCount = countUpTo(oneMonthAgo);

  if (previousCount === 0) return currentCount > 0 ? 100 : 0;
  return Math.round(((currentCount - previousCount) / previousCount) * 100);
}

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

// Map status styles dynamically
const STATUS_BADGE_STYLES = {
  "សកម្ម": "bg-success-bg text-success",
  "អសកម្ម": "bg-error-bg text-error",
};

export default function MembersPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  // Delete confirmation modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  // Track ids removed locally so the table updates immediately.
  const [deletedIds, setDeletedIds] = useState([]);

  // 2. Add state to control the visibility of the Create Modal pop-up
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // 1. First setup the raw filtered list by removing deleted ids and hidden fields
  const members = useMemo(
    () =>
      users
        .filter((u) => !deletedIds.includes(u.id))
        .map(({ password, ...rest }) => rest),
    [deletedIds],
  );

  const branches = useMemo(
    () => [...new Set(members.map((m) => m.branch))],
    [members],
  );

  const stats = useMemo(() => {
    const total = members.length;
    const active = members.filter((m) => m.status === "សកម្ម").length;
    const female = members.filter((m) => m.gender === "ស្រី").length;

    const totalGrowth = calcGrowth(members, () => true);
    const activeGrowth = calcGrowth(members, (m) => m.status === "សកម្ម");
    const femaleGrowth = calcGrowth(members, (m) => m.gender === "ស្រី");

    return { total, active, female, totalGrowth, activeGrowth, femaleGrowth };
  }, [members]);

  // 2. Second, apply search/filters to the active member list
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

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, branchFilter, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  // 3. Slice data down to page items
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setDeletedIds((prev) => [...prev, deleteTarget.id]);
    setDeleteTarget(null);
  };

  // 3. Handle data saving when the form inside the modal is submitted
  const handleSaveMember = (formData) => {
    console.log("New member submission data:", formData);
    // Add your API request logic here to save the data permanently
    
    // Close modal on completion
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Stat cards */}
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

      {/* Members table wrapper */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-semibold text-text-primary mb-4 text-lg">
          បញ្ជីសមាជិក
        </h3>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ស្វែងរកតាមរយៈឈ្មោះ ឬលេខទូរស័ព្ទ..."
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">សាខា</option>
            {branches.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            <option value="">ស្ថានភាព</option>
            <option value="សកម្ម">សកម្ម</option>
            <option value="អសកម្ម">អសកម្ម</option>
          </select>

          {/* 4. Attached onClick handler to toggle the modal open */}
          <button 
            onClick={() => setIsCreateOpen(true)}
            className="ml-auto flex items-center gap-2 bg-success text-white text-sm font-medium px-4 py-2 rounded-lg hover:opacity-90 transition"
          >
            <Plus className="w-4 h-4" />
            បន្ថែមសមាជិកថ្មី
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm table-fixed">
            <colgroup>
              <col className="w-[60px]" />
              <col className="w-[220px]" />
              <col className="w-[80px]" />
              <col className="w-[140px]" />
              <col className="w-[130px]" />
              <col className="w-[100px]" />
              <col className="w-[150px]" />
              <col className="w-[160px]" />
            </colgroup>
            <thead>
              <tr className="text-text-secondary border-b border-gray-100">
                <th className="py-3 px-2 font-medium text-center">ល.រ</th>
                <th className="py-3 px-2 font-medium text-left">សមាជិក</th>
                <th className="py-3 px-2 font-medium text-center">ភេទ</th>
                <th className="py-3 px-2 font-medium text-left">សាខា</th>
                <th className="py-3 px-2 font-medium text-center">តួនាទី</th>
                <th className="py-3 px-2 font-medium text-center">ស្ថានភាព</th>
                <th className="py-3 px-2 font-medium text-left">ថ្ងៃចូលរួម</th>
                <th className="py-3 px-2 font-medium text-center">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {paginatedMembers.map((m, i) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-50 hover:bg-bg-page-gray/50"
                >
                  <td className="py-3 px-2 text-text-secondary text-center">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="py-3 px-2 text-text-primary font-medium text-left truncate">
                    {m.name}
                  </td>
                  <td className="py-3 px-2 text-text-secondary text-center">
                    {m.gender}
                  </td>
                  <td className="py-3 px-2 text-text-secondary text-left truncate">
                    {m.branch}
                  </td>
                  <td className="py-3 px-2 text-center">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs ${ROLE_BADGE_STYLES[m.role] || "bg-gray-100 text-text-secondary"}`}
                    >
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-center">
                    {/* Updated Status Badge Styling */}
                    <span className={`inline-block px-3 py-1 rounded-full text-xs ${STATUS_BADGE_STYLES[m.status] || "bg-gray-100 text-text-secondary"}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-text-secondary text-left truncate">
                    {m.joinedAt}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() =>
                          router.push(`/member/memberInfo/${m.id}`)
                        }
                        className="flex items-center gap-1 bg-secondary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition"
                      >
                        <EyeIcon className="w-3.5 h-3.5" />
                        មើលលម្អិត
                      </button>
                      <button
                        onClick={() => setDeleteTarget(m)}
                        className="text-red-500 hover:text-red-600 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-text-secondary"
                  >
                    មិនមានទិន្នន័យត្រូវនឹងលក្ខខណ្ឌស្វែងរកទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => setCurrentPage(page)}
          />
        )}
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        description={
          deleteTarget
            ? `តើអ្នកប្រាកដថានឹងលុប "${deleteTarget.name}" ចេញពីបញ្ជីសមាជិកទេ?`
            : undefined
        }
      />

      {/* 5. Render the CreateMemberModal markup at the root layer */}
      <CreateMemberModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleSaveMember}
        branches={branches}
      />
    </div>
  );
}