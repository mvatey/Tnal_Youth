"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import ConfirmDeleteModal from "@/components/popup/Confirmdeletemodal.js";
import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js";
import StatCard from "@/components/dashboard/statCard";
import { FaMosque } from "react-icons/fa6";

import { Users, Landmark, Moon, Sparkles, Trash2 } from "lucide-react";
import users from "@/data/members.json";
import { AiOutlineWoman } from "react-icons/ai";
import { RiAddCircleLine } from "react-icons/ri";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail";
import { FaDharmachakra } from "react-icons/fa";

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
  admin: "bg-secondary-light text-secondary",
  branch_leader: "bg-warning-bg text-warning",
  secretary: "bg-success-bg text-success",
  member: "bg-gray-100 text-text-secondary",
};

const STATUS_BADGE_STYLES = {
  សកម្ម: "bg-success-bg text-success",
  អសកម្ម: "bg-red-50 text-red-600",
};

// religion / gender constants — must match the exact strings used in members.json
const ISLAM_LABEL = "អ៊ីស្លាម";
const BUDDHIST_LABEL = "ព្រះពុទ្ធ";
const MONK_GENDER = "ព្រះសង្ឃ";

export default function MembersPage() {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [genderFilter, setGenderFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deletedIds, setDeletedIds] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const activeMembersList = useMemo(() => {
    return users.filter((u) => !deletedIds.includes(u.id));
  }, [deletedIds]);

  const stats = useMemo(() => {
    const total = activeMembersList.length;
    const female = activeMembersList.filter((m) => m.gender === "ស្រី").length;
    const monk = activeMembersList.filter(
      (m) => m.gender === MONK_GENDER,
    ).length;
    const buddhist = activeMembersList.filter(
      (m) => m.religion === BUDDHIST_LABEL,
    ).length;
    const islam = activeMembersList.filter(
      (m) => m.religion === ISLAM_LABEL,
    ).length;
    // "សាសនាផ្សេង" = has a religion value, but it's neither ព្រះពុទ្ធ nor អ៊ីស្លាម
    const otherReligion = activeMembersList.filter(
      (m) =>
        m.religion &&
        m.religion !== BUDDHIST_LABEL &&
        m.religion !== ISLAM_LABEL,
    ).length;

    return {
      total,
      female,
      monk,
      buddhist,
      islam,
      otherReligion,
      totalGrowth: calcGrowth(activeMembersList, () => true),
      femaleGrowth: calcGrowth(activeMembersList, (m) => m.gender === "ស្រី"),
      monkGrowth: calcGrowth(
        activeMembersList,
        (m) => m.gender === MONK_GENDER,
      ),
      buddhistGrowth: calcGrowth(
        activeMembersList,
        (m) => m.religion === BUDDHIST_LABEL,
      ),
      islamGrowth: calcGrowth(
        activeMembersList,
        (m) => m.religion === ISLAM_LABEL,
      ),
      otherReligionGrowth: calcGrowth(
        activeMembersList,
        (m) =>
          m.religion &&
          m.religion !== BUDDHIST_LABEL &&
          m.religion !== ISLAM_LABEL,
      ),
    };
  }, [activeMembersList]);

  const filteredMembers = useMemo(() => {
    return activeMembersList.filter((m) => {
      const search = query.toLowerCase();

      const matchesQuery =
        m.name_kh?.toLowerCase().includes(search) || m.phone?.includes(query);

      const matchesBranch = !branchFilter || m.branch === branchFilter;

      const matchesStatus = !statusFilter || m.status === statusFilter;

      const matchesGender = !genderFilter || m.gender === genderFilter;

      return matchesQuery && matchesBranch && matchesStatus && matchesGender;
    });
  }, [activeMembersList, query, branchFilter, statusFilter, genderFilter]);

  const branches = useMemo(() => {
    const uniqueBranches = [
      ...new Set(users.map((member) => member.branch).filter(Boolean)),
    ];

    return [
      {
        label: "សាខា",
        value: "",
      },
      ...uniqueBranches.map((branch) => ({
        label: branch,
        value: branch,
      })),
    ];
  }, []);

  const tableColumns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index,
    },
    {
      header: "សមាជិក",
      width: "w-[18%]",
      align: "left",
      render: (m) => (
        <span className="block w-full truncate font-medium text-text-secondary">
          {m.name_kh}
        </span>
      ),
    },
    {
      header: "ភេទ",
      width: "w-[8%]",
      align: "center",
      accessor: "gender",
    },
    {
      header: "សាខា",
      width: "w-[14%]",
      align: "left",
      render: (m) => <span className="block w-full truncate">{m.branch}</span>,
    },
    {
      header: "តួនាទី",
      width: "w-[14%]",
      align: "center",
      render: (m) => (
        <span
          className={`
            inline-flex max-w-full items-center justify-center
            rounded-full px-2 py-1 text-[11px]
            whitespace-nowrap truncate
            ${ROLE_BADGE_STYLES[m.role] || "bg-gray-100 text-text-secondary"}
          `}
        >
          {ROLE_LABELS[m.role] || m.role}
        </span>
      ),
    },
    {
      header: "ស្ថានភាព",
      width: "w-[12%]",
      align: "center",
      render: (m) => (
        <span
          className={`
            inline-flex max-w-full items-center justify-center
            rounded-full px-2 py-1 text-[11px] 
            whitespace-nowrap truncate
            ${STATUS_BADGE_STYLES[m.status] || "bg-gray-100 text-text-secondary"}
          `}
        >
          {m.status}
        </span>
      ),
    },
    {
      header: "ថ្ងៃចូលរួម",
      width: "w-[14%]",
      align: "left",
      render: (m) => (
        <span className="block w-full truncate">{m.joinedAt}</span>
      ),
    },
    {
      header: "សកម្មភាព",
      width: "w-[14%]",
      align: "center",
      render: (m) => (
        <div className="flex w-full min-w-0 items-center justify-center gap-1">
          <ButtonSeeDetail
            onClick={() => router.push(`/member/memberInfo/${m.id}`)}
          />

          <button
            onClick={() => setDeleteTarget(m)}
            className="shrink-0 p-1.5 text-red-500 hover:text-red-600"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  const filterConfig = [
  {
    name: "branch",
    value: branchFilter,
    onChange: setBranchFilter,
    options: branches,
    placeholder: "សាខា",
  },
  {
    name: "status",
    value: statusFilter,
    onChange: setStatusFilter,
    options: [
      {
        label: "ស្ថានភាព",
        value: "",
      },
      {
        label: "សកម្ម",
        value: "សកម្ម",
      },
      {
        label: "អសកម្ម",
        value: "អសកម្ម",
      },
    ],
    placeholder: "ស្ថានភាព",
  },
  {
    name: "gender",
    value: genderFilter,
    onChange: setGenderFilter,
    options: [
      {
        label: "ភេទ",
        value: "",
      },
      {
        label: "ស្រី",
        value: "ស្រី",
      },
      {
        label: "ប្រុស",
        value: "ប្រុស",
      },
      {
        label: "ព្រះសង្ឃ",
        value: "ព្រះសង្ឃ",
      },
    ],
    placeholder: "ភេទ",
  },
];

  return (
    <div className="min-h-full flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 shrink-0">
        <StatCard
          icon={Users}
          label="សមាជិកសរុប"
          value={String(stats.total)}
          growth={String(stats.totalGrowth)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={AiOutlineWoman}
          label="ភេទស្រី"
          value={String(stats.female)}
          growth={String(stats.femaleGrowth)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Landmark}
          label="ចំនួនព្រះសង្ឃ"
          value={String(stats.monk)}
          growth={String(stats.monkGrowth)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={FaDharmachakra}
          label="ព្រះពុទ្ធ"
          value={String(stats.buddhist)}
          growth={String(stats.buddhistGrowth)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Moon}
          label="អ៊ីស្លាម"
          value={String(stats.islam)}
          growth={String(stats.islamGrowth)}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />
      </div>

      <div className="w-full">
        <DataTable
          title="បញ្ជីសមាជិក"
          data={filteredMembers}
          columns={tableColumns}
          filters={filterConfig}
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder="ស្វែងរកតាមរយៈឈ្មោះ ឬលេខទូរស័ព្ទ..."
          pageSize={20}
          actionButton={
            <button
              onClick={() => setIsCreateOpen(true)}
              className="inline-flex items-center gap-2 rounded-lg bg-success px-3 py-2 text-sm font-medium text-white hover:opacity-90 transition whitespace-nowrap"
            >
              <RiAddCircleLine className="h-4 w-4 shrink-0" />
              <span>បន្ថែមសមាជិកថ្មី</span>
            </button>
          }
        />
      </div>

      <ConfirmDeleteModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => {
          setDeletedIds((prev) => [...prev, deleteTarget.id]);
          setDeleteTarget(null);
        }}
        description={
          deleteTarget
            ? `តើអ្នកប្រាកដថានឹងលុប "${deleteTarget.name_kh}" ចេញពីបញ្ជីសមាជិកទេ?`
            : undefined
        }
      />

      <CreateMemberModal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSave={() => setIsCreateOpen(false)}
        branches={branches}
      />
    </div>
  );
}