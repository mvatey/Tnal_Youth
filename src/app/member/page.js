"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Landmark, Moon, Users } from "lucide-react";
import { AiOutlineWoman } from "react-icons/ai";
import { FaDharmachakra } from "react-icons/fa";
import { RiAddCircleLine } from "react-icons/ri";

import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js";
import StatCard from "@/components/dashboard/statCard";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail";

import initialMembers from "@/data/members.json";

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

const KHMER_MONTH_NAMES = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

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

const ISLAM_LABEL = "អ៊ីស្លាម";
const BUDDHIST_LABEL = "ព្រះពុទ្ធ";
const MONK_GENDER = "ព្រះសង្ឃ";

/**
 * Convert a Khmer formatted date such as:
 * "25 មករា, 2026"
 *
 * into a JavaScript Date object.
 */
function parseKhmerDate(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return null;
  }

  /*
   * Also support an HTML date input value:
   * yyyy-mm-dd
   */
  const isoDateMatch = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (isoDateMatch) {
    const [, year, month, day] =
      isoDateMatch;

    return new Date(
      Number(year),
      Number(month) - 1,
      Number(day),
    );
  }

  const khmerDateMatch = value.match(
    /(\d+)\s+([^\s,]+),?\s*(\d+)/,
  );

  if (!khmerDateMatch) {
    return null;
  }

  const [, day, monthName, year] =
    khmerDateMatch;

  const month =
    KHMER_MONTHS[monthName];

  if (month === undefined) {
    return null;
  }

  return new Date(
    Number(year),
    month,
    Number(day),
  );
}

/**
 * Convert yyyy-mm-dd from the form to
 * the same display format used by members.json.
 */
function formatDateToKhmer(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "";
  }

  const match = value.match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return value;
  }

  const [, year, month, day] = match;

  const monthIndex =
    Number(month) - 1;

  const monthName =
    KHMER_MONTH_NAMES[monthIndex];

  if (!monthName) {
    return value;
  }

  return `${Number(day)} ${monthName}, ${year}`;
}

function calcGrowth(members, filterFn) {
  const today = new Date();

  const oneMonthAgo =
    new Date(today);

  oneMonthAgo.setMonth(
    oneMonthAgo.getMonth() - 1,
  );

  const countUpTo = (cutoff) =>
    members.filter((member) => {
      const joinedDate =
        parseKhmerDate(
          member.joinedAt,
        );

      return (
        joinedDate &&
        joinedDate <= cutoff &&
        filterFn(member)
      );
    }).length;

  const currentCount =
    countUpTo(today);

  const previousCount =
    countUpTo(oneMonthAgo);

  if (previousCount === 0) {
    return currentCount > 0
      ? 100
      : 0;
  }

  return Math.round(
    ((currentCount -
      previousCount) /
      previousCount) *
      100,
  );
}

export default function MembersPage() {
  const router = useRouter();

  /*
   * Keep imported members in state.
   * This allows newly created members
   * to appear immediately.
   */
  const [members, setMembers] =
    useState(initialMembers);

  const [query, setQuery] =
    useState("");

  const [
    branchFilter,
    setBranchFilter,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] = useState("");

  const [
    genderFilter,
    setGenderFilter,
  ] = useState("");

  const [
    isCreateOpen,
    setIsCreateOpen,
  ] = useState(false);

  /*
   * Statistic card values.
   */
  const stats = useMemo(() => {
    const total = members.length;

    const female = members.filter(
      (member) =>
        member.gender === "ស្រី",
    ).length;

    const monk = members.filter(
      (member) =>
        member.gender ===
        MONK_GENDER,
    ).length;

    const buddhist = members.filter(
      (member) =>
        member.religion ===
        BUDDHIST_LABEL,
    ).length;

    const islam = members.filter(
      (member) =>
        member.religion ===
        ISLAM_LABEL,
    ).length;

    return {
      total,
      female,
      monk,
      buddhist,
      islam,

      totalGrowth: calcGrowth(
        members,
        () => true,
      ),

      femaleGrowth: calcGrowth(
        members,
        (member) =>
          member.gender === "ស្រី",
      ),

      monkGrowth: calcGrowth(
        members,
        (member) =>
          member.gender ===
          MONK_GENDER,
      ),

      buddhistGrowth: calcGrowth(
        members,
        (member) =>
          member.religion ===
          BUDDHIST_LABEL,
      ),

      islamGrowth: calcGrowth(
        members,
        (member) =>
          member.religion ===
          ISLAM_LABEL,
      ),
    };
  }, [members]);

  /*
   * Search and filter table data.
   */
  const filteredMembers =
    useMemo(() => {
      const normalizedQuery =
        query
          .trim()
          .toLowerCase();

      return members.filter(
        (member) => {
          const memberNameKh =
            String(
              member.name_kh ??
                "",
            ).toLowerCase();

          const memberNameEn =
            String(
              member.name_en ??
                "",
            ).toLowerCase();

          const memberPhone =
            String(
              member.phone ?? "",
            ).toLowerCase();

          const memberEmail =
            String(
              member.email ?? "",
            ).toLowerCase();

          const matchesQuery =
            !normalizedQuery ||
            memberNameKh.includes(
              normalizedQuery,
            ) ||
            memberNameEn.includes(
              normalizedQuery,
            ) ||
            memberPhone.includes(
              normalizedQuery,
            ) ||
            memberEmail.includes(
              normalizedQuery,
            );

          const matchesBranch =
            !branchFilter ||
            member.branch ===
              branchFilter;

          const matchesStatus =
            !statusFilter ||
            member.status ===
              statusFilter;

          const matchesGender =
            !genderFilter ||
            member.gender ===
              genderFilter;

          return (
            matchesQuery &&
            matchesBranch &&
            matchesStatus &&
            matchesGender
          );
        },
      );
    }, [
      members,
      query,
      branchFilter,
      statusFilter,
      genderFilter,
    ]);

  /*
   * Create branch dropdown options
   * from the current member data.
   */
  const branches = useMemo(() => {
    const uniqueBranches = [
      ...new Set(
        members
          .map(
            (member) =>
              member.branch,
          )
          .filter(Boolean),
      ),
    ];

    return [
      {
        label: "សាខា",
        value: "",
      },

      ...uniqueBranches.map(
        (branch) => ({
          label: branch,
          value: branch,
        }),
      ),
    ];
  }, [members]);

  /*
   * Receive form data from
   * CreateMemberModal.
   */
  const handleCreateMember = (
    formData,
  ) => {
    if (!formData) {
      return;
    }

    const requiredFields = [
      "nameKh",
      "nameEn",
      "gender",
      "status",
      "phone",
      "branch",
      "role",
      "dob",
      "joinedAt",
      "level",
    ];

    const isValid =
      requiredFields.every(
        (field) => {
          return (
            String(
              formData[field] ??
                "",
            ).trim() !== ""
          );
        },
      );

    /*
     * Extra protection:
     * Do not save incomplete data.
     */
    if (!isValid) {
      return;
    }

    const newMember = {
      id: crypto.randomUUID(),

      name_kh:
        formData.nameKh.trim(),

      name_en:
        formData.nameEn.trim(),

      gender:
        formData.gender,

      status:
        formData.status,

      phone:
        formData.phone.trim(),

      email:
        formData.email?.trim() ||
        "",

      branch:
        formData.branch,

      role:
        formData.role,

      dob: formatDateToKhmer(
        formData.dob,
      ),

      joinedAt:
        formatDateToKhmer(
          formData.joinedAt,
        ),

      level:
        formData.level,

      /*
       * The modal currently does not
       * contain a religion field.
       */
      religion: "",
    };

    /*
     * Add the new member to
     * the first row of the table.
     */
    setMembers(
      (previousMembers) => [
        newMember,
        ...previousMembers,
      ],
    );

    setIsCreateOpen(false);
  };

  const tableColumns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",
      render: (_, index) =>
        index ,
    },
    {
      header: "សមាជិក",
      width: "w-[18%]",
      align: "left",
      render: (member) => (
        <span className="block w-full truncate font-medium text-text-secondary">
          {member.name_kh}
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
      render: (member) => (
        <span className="block w-full truncate">
          {member.branch}
        </span>
      ),
    },
    {
      header: "តួនាទី",
      width: "w-[14%]",
      align: "center",
      render: (member) => (
        <span
          className={`
            inline-flex
            max-w-full
            items-center
            justify-center
            truncate
            whitespace-nowrap
            rounded-full
            px-2
            py-1
            text-[11px]
            ${
              ROLE_BADGE_STYLES[
                member.role
              ] ||
              "bg-gray-100 text-text-secondary"
            }
          `}
        >
          {ROLE_LABELS[
            member.role
          ] || member.role}
        </span>
      ),
    },
    {
      header: "ស្ថានភាព",
      width: "w-[12%]",
      align: "center",
      render: (member) => (
        <span
          className={`
            inline-flex
            max-w-full
            items-center
            justify-center
            truncate
            whitespace-nowrap
            rounded-full
            px-2
            py-1
            text-[11px]
            ${
              STATUS_BADGE_STYLES[
                member.status
              ] ||
              "bg-gray-100 text-text-secondary"
            }
          `}
        >
          {member.status}
        </span>
      ),
    },
    {
      header: "ថ្ងៃចូលរួម",
      width: "w-[14%]",
      align: "left",
      render: (member) => (
        <span className="block w-full truncate">
          {member.joinedAt}
        </span>
      ),
    },
    {
      header: "សកម្មភាព",
      width: "w-[14%]",
      align: "center",
      render: (member) => (
        <div className="flex w-full items-center justify-center">
          <ButtonSeeDetail
            onClick={() =>
              router.push(
                `/member/memberInfo/${member.id}`,
              )
            }
          />
        </div>
      ),
    },
  ];

  const filterConfig = [
    {
      name: "branch",
      value: branchFilter,
      onChange:
        setBranchFilter,
      options: branches,
      placeholder: "សាខា",
    },
    {
      name: "status",
      value: statusFilter,
      onChange:
        setStatusFilter,
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
      onChange:
        setGenderFilter,
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
    <div className="flex min-h-full flex-col gap-4">
      {/* Statistic cards */}

      <div
        className="
          grid
          shrink-0
          grid-cols-2
          gap-4
          sm:grid-cols-3
          lg:grid-cols-5
        "
      >
        <StatCard
          icon={Users}
          label="សមាជិកសរុប"
          value={String(
            stats.total,
          )}
          growth={String(
            stats.totalGrowth,
          )}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={AiOutlineWoman}
          label="ភេទស្រី"
          value={String(
            stats.female,
          )}
          growth={String(
            stats.femaleGrowth,
          )}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Landmark}
          label="ចំនួនព្រះសង្ឃ"
          value={String(
            stats.monk,
          )}
          growth={String(
            stats.monkGrowth,
          )}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={FaDharmachakra}
          label="ព្រះពុទ្ធ"
          value={String(
            stats.buddhist,
          )}
          growth={String(
            stats.buddhistGrowth,
          )}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Moon}
          label="អ៊ីស្លាម"
          value={String(
            stats.islam,
          )}
          growth={String(
            stats.islamGrowth,
          )}
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />
      </div>

      {/* Member table */}

      <div className="w-full">
        <DataTable
          title="បញ្ជីសមាជិក"
          data={filteredMembers}
          columns={tableColumns}
          filters={filterConfig}
          searchQuery={query}
          onSearchChange={
            setQuery
          }
          searchPlaceholder="ស្វែងរកតាមរយៈឈ្មោះ ឬលេខទូរស័ព្ទ..."
          pageSize={20}
          actionButton={
            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(
                  true,
                )
              }
              className="
                inline-flex
                items-center
                gap-2
                whitespace-nowrap
                rounded-lg
                bg-success
                px-3
                py-2
                text-sm
                font-medium
                text-white
                transition
                hover:opacity-90
              "
            >
              <RiAddCircleLine className="h-4 w-4 shrink-0" />

              <span>
                បន្ថែមសមាជិកថ្មី
              </span>
            </button>
          }
        />
      </div>

      {/* Create member modal */}

      <CreateMemberModal
        open={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        onSave={
          handleCreateMember
        }
        branches={branches.filter(
          (branch) =>
            branch.value !== "",
        )}
      />
    </div>
  );
}