// app/dashboard/members/page.jsx
"use client";

import { useState, useMemo, useEffect } from "react";
import {
  Users,
  UserCheck,
  HeartHandshake,
  Plus,
  Search,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
} from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal";
import CreateMemberModal from "@/components/popup/CreateMemberModal";
import users from "@/data/users.json";
import { AiOutlineWoman } from "react-icons/ai";

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

const PAGE_SIZE = 10;

// Builds a compact page list like: 1 2 3 ... 8 9 10
function getPageNumbers(current, total) {
  const pages = [];
  const siblings = 1;

  const left = Math.max(2, current - siblings);
  const right = Math.min(total - 1, current + siblings);

  pages.push(1);

  if (left > 2) {
    pages.push("...");
  }

  for (let i = left; i <= right; i++) {
    pages.push(i);
  }

  if (right < total - 1) {
    pages.push("...");
  }

  if (total > 1) {
    pages.push(total);
  }

  return pages;
}

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState(null); // member being considered for deletion
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Never expose password in the UI — strip it right away.
  // Kept in real state (not useMemo) so we can actually add/remove items from it.
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

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [query, branchFilter, statusFilter]);

  // Clamp current page if filtered results shrink
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [totalPages, currentPage]);

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const pageNumbers = useMemo(
    () => getPageNumbers(currentPage, totalPages),
    [currentPage, totalPages],
  );

  const handleDownload = () => {
    const headers = [
      "ល.រ",
      "ឈ្មោះ",
      "ភេទ",
      "សាខា",
      "តួនាទី",
      "ស្ថានភាព",
      "ថ្ងៃចូលរួម",
      "លេខទូរស័ព្ទ",
    ];

    const rows = filtered.map((m, i) => [
      i + 1,
      m.name,
      m.gender,
      m.branch,
      ROLE_LABELS[m.role] || m.role,
      m.status,
      m.joinedAt,
      m.phone,
    ]);

    const csvContent = [headers, ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");

    // Add BOM so Khmer characters render correctly in Excel
    const blob = new Blob(["\uFEFF" + csvContent], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "members.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    // Actually remove the member from state.
    // Replace this with your real API call (e.g. await fetch(`/api/members/${deleteTarget.id}`, { method: "DELETE" }))
    // then update state once the request succeeds.
    setMembers((prev) => prev.filter((m) => m.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleCreateMember = (form) => {
    // Replace this with your real API call (e.g. POST /api/members) then
    // update state once the request succeeds — this is a local-only add.
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

  return (
    <div className="space-y-4">
      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard
          icon={Users}
          label="ចំនួនសមាជិកសរុប"
          value="250"
          growth="12"
          iconColor="text-primary"
          iconBg="bg-primary-light"
        />
        <StatCard
          icon={UserCheck}
          label="ចំនួនសមាជិកសកម្ម"
          value="250"
          growth="12"
          iconColor="text-success"
          iconBg="bg-success-bg"
        />
        <StatCard
          icon={AiOutlineWoman}
          label="ចំនួនភេទស្រី"
          value="250"
          growth="12"
          iconColor="text-warning"
          iconBg="bg-warning-bg"
        />
      </div>

      {/* Members table */}
      <div className="bg-white rounded-xl p-5 shadow-sm">
        <h3 className="font-semibold text-text-primary mb-3 text-lg">
          បញ្ជីសមាជិក
        </h3>

        {/* Toolbar */}
        <div className="mb-4 flex items-center justify-between gap-4">
          {/* Left */}
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

            <select
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="w-48 px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
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
              className="w-32 px-3 py-2.5 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">ស្ថានភាព</option>
              <option value="សកម្ម">សកម្ម</option>
              <option value="អសកម្ម">អសកម្ម</option>
            </select>
          </div>

          {/* Right */}
          <button
            onClick={() => setIsCreateOpen(true)}
            className="flex shrink-0 items-center gap-2 rounded-lg bg-success px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
          >
            <Plus className="w-4 h-4" />
            បន្ថែមសមាជិកថ្មី
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm ">
            <thead>
              <tr className="border-b border-gray-100 text-left text-text-secondary">
                <th className="w-20 py-3 px-2">ល.រ</th>
                <th className="w-50 py-3 px-2">សមាជិក</th>
                <th className="w-40 py-3 px-2">ភេទ</th>
                <th className="w-60 py-3 px-2">សាខា</th>
                <th className="w-56 py-3 px-2">តួនាទី</th>
                <th className="w-40 py-3 px-2">ស្ថានភាព</th>
                <th className="w-44 py-3 px-2">ថ្ងៃចូលរួម</th>
                <th className="w-40 py-3 px-2">សកម្មភាព</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((m, i) => (
                <tr
                  key={m.id}
                  className="border-b border-gray-50 hover:bg-bg-page-gray/50"
                >
                  <td className="py-3 px-2 text-text-secondary">
                    {(currentPage - 1) * PAGE_SIZE + i + 1}
                  </td>
                  <td className="py-3 px-2 text-text-primary font-medium">
                    {m.name}
                  </td>
                  <td className="py-3 px-2 text-text-secondary">{m.gender}</td>
                  <td className="py-3 px-2 text-text-secondary">{m.branch}</td>
                  <td className="py-3 px-2">
                    <span
                      className={`inline-block px-3 py-1 rounded-full text-xs ${ROLE_BADGE_STYLES[m.role] || "bg-gray-100 text-text-secondary"}`}
                    >
                      {ROLE_LABELS[m.role] || m.role}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-success-bg text-success">
                      {m.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-text-secondary">
                    {m.joinedAt}
                  </td>
                  <td className="py-3 px-2">
                    <div className="flex items-center gap-2">
                      <button className="flex items-center gap-1 bg-primary text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:opacity-90 transition">
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

        {/* Pagination + Export */}
        <div className="mt-4 flex items-center justify-between">
          {filtered.length > 0 ? (
            <>
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-page-gray"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              <div className="flex items-center gap-1">
                {pageNumbers.map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`ellipsis-${idx}`}
                      className="w-8 h-8 flex items-center justify-center text-sm text-text-secondary"
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`w-8 h-8 flex items-center justify-center rounded-full text-sm transition ${
                        p === currentPage
                          ? "bg-primary text-white font-medium"
                          : "text-text-secondary hover:bg-bg-page-gray"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-text-secondary disabled:opacity-40 disabled:cursor-not-allowed hover:bg-bg-page-gray"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <div />
          )}
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={handleDownload}
          className="flex shrink-0 items-center gap-2 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-white hover:opacity-90"
        >
          <Download className="w-4 h-4" />
          ទាញយក
        </button>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Create member modal */}
      <CreateMemberModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={handleCreateMember}
        branches={branches}
      />
    </div>
  );
}