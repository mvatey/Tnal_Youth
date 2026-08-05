"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import {
  Landmark,
  Moon,
  Users,
} from "lucide-react";
import { AiOutlineWoman } from "react-icons/ai";
import { FaDharmachakra } from "react-icons/fa";
import { RiAddCircleLine } from "react-icons/ri";

import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js";
import StatCard from "@/components/dashboard/statCard";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail";

const EMPTY_SUMMARY = {
  total_members: 0,
  female_members: 0,
  monk_members: 0,
  buddhist_members: 0,
  islam_members: 0,
};

const GENDER_LABELS_KM = {
  MALE: "ប្រុស",
  FEMALE: "ស្រី",
  MONK: "ព្រះសង្ឃ",
  OTHER: "ផ្សេងៗ",
};

const STATUS_LABELS_KM = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  SUSPENDED: "បានផ្អាក",
  RESIGNED: "បានលាលែង",
};

const STATUS_BADGE_STYLES = {
  ACTIVE: "bg-success-bg text-success",
  INACTIVE: "bg-red-50 text-red-600",
  SUSPENDED: "bg-warning-bg text-warning",
  RESIGNED: "bg-gray-100 text-text-secondary",
};

const KHMER_MONTHS = [
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

async function fetchJson(path, signal) {
  const response = await fetch(`/api${path}`, {
    method: "GET",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
    signal,
  });

  const text = await response.text();

  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object"
        ? body?.message || body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

function formatJoinedDate(value) {
  if (!value) {
    return "-";
  }

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})$/,
  );

  if (!match) {
    return String(value);
  }

  const [, year, month, day] = match;

  const monthName =
    KHMER_MONTHS[Number(month) - 1];

  if (!monthName) {
    return String(value);
  }

  return `${Number(day)} ${monthName}, ${year}`;
}

function getGenderLabel(gender) {
  const code = String(
    gender?.code || "",
  ).toUpperCase();

  return (
    gender?.label_km ||
    gender?.labelKm ||
    GENDER_LABELS_KM[code] ||
    "-"
  );
}

function getStatusLabel(status) {
  const code = String(
    status?.code || "",
  ).toUpperCase();

  return (
    status?.label_km ||
    status?.labelKm ||
    STATUS_LABELS_KM[code] ||
    "-"
  );
}

function getBranchLabel(branch) {
  return (
    branch?.label_km ||
    branch?.labelKm ||
    branch?.name_km ||
    branch?.nameKm ||
    branch?.name_en ||
    branch?.nameEn ||
    "-"
  );
}

function mapMember(member) {
  return {
    id: member?.id,

    nameKh:
      member?.full_name_km ||
      member?.full_name_en ||
      "-",

    genderLabel: getGenderLabel(
      member?.gender,
    ),

    genderCode: String(
      member?.gender?.code || "",
    ).toUpperCase(),

    branchLabel: getBranchLabel(
      member?.branch,
    ),

    branchId:
      member?.branch?.id ??
      member?.branch_id ??
      "",

    statusLabel: getStatusLabel(
      member?.status,
    ),

    statusCode: String(
      member?.status?.code || "",
    ).toUpperCase(),

    statusId:
      member?.status?.id ??
      member?.status_id ??
      "",

    joinedAt: formatJoinedDate(
      member?.joined_on,
    ),
  };
}

export default function MembersPage() {
  const router = useRouter();

  const [members, setMembers] = useState([]);

  const [summary, setSummary] =
    useState(EMPTY_SUMMARY);

  const [
    branchLookups,
    setBranchLookups,
  ] = useState([]);

  const [
    statusLookups,
    setStatusLookups,
  ] = useState([]);

  const [
    genderLookups,
    setGenderLookups,
  ] = useState([]);

  const [query, setQuery] = useState("");

  const [
    debouncedQuery,
    setDebouncedQuery,
  ] = useState("");

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

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => {
        setDebouncedQuery(query.trim());
      },
      350,
    );

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [query]);

  const loadSummary = useCallback(
    async (signal) => {
      const data = await fetchJson(
        "/members/summary",
        signal,
      );

      setSummary({
        total_members:
          Number(data?.total_members) || 0,

        female_members:
          Number(data?.female_members) || 0,

        monk_members:
          Number(data?.monk_members) || 0,

        buddhist_members:
          Number(data?.buddhist_members) || 0,

        islam_members:
          Number(data?.islam_members) || 0,
      });
    },
    [],
  );

  const loadLookups = useCallback(
    async (signal) => {
      const [
        branches,
        statuses,
        genders,
      ] = await Promise.all([
        fetchJson(
          "/lookups/branches",
          signal,
        ),

        fetchJson(
          "/lookups/member-statuses",
          signal,
        ),

        fetchJson(
          "/lookups/genders",
          signal,
        ),
      ]);

      const normalizedBranches =
        Array.isArray(branches)
          ? branches
          : Array.isArray(branches?.data)
            ? branches.data
            : Array.isArray(branches?.content)
              ? branches.content
              : [];

      setBranchLookups(normalizedBranches);

      setStatusLookups(
        Array.isArray(statuses)
          ? statuses
          : [],
      );

      setGenderLookups(
        Array.isArray(genders)
          ? genders
          : [],
      );
    },
    [],
  );

  const loadMembers = useCallback(
    async (signal) => {
      const baseParams =
        new URLSearchParams({
          page: "0",
          size: "20",
          search: debouncedQuery,
          branchId: branchFilter,
          statusId: statusFilter,
          gender: genderFilter,
        });

      const firstPage = await fetchJson(
        `/members?${baseParams.toString()}`,
        signal,
      );

      const firstContent = Array.isArray(
        firstPage?.content,
      )
        ? firstPage.content
        : [];

      const totalPages = Math.max(
        Number(firstPage?.totalPages) || 1,
        1,
      );

      if (totalPages === 1) {
        setMembers(
          firstContent.map(mapMember),
        );

        return;
      }

      const remainingRequests =
        Array.from(
          {
            length: totalPages - 1,
          },
          (_, index) => {
            const pageParams =
              new URLSearchParams(
                baseParams,
              );

            pageParams.set(
              "page",
              String(index + 1),
            );

            return fetchJson(
              `/members?${pageParams.toString()}`,
              signal,
            );
          },
        );

      const remainingPages =
        await Promise.all(
          remainingRequests,
        );

      const allContent = [
        ...firstContent,

        ...remainingPages.flatMap(
          (page) =>
            Array.isArray(page?.content)
              ? page.content
              : [],
        ),
      ];

      setMembers(
        allContent.map(mapMember),
      );
    },
    [
      branchFilter,
      debouncedQuery,
      genderFilter,
      statusFilter,
    ],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    Promise.all([
      loadSummary(controller.signal),
      loadLookups(controller.signal),
    ]).catch((error) => {
      if (error.name !== "AbortError") {
        console.warn(
          "Failed to load member page:",
          error.message,
        );
      }
    });

    return () => {
      controller.abort();
    };
  }, [
    loadLookups,
    loadSummary,
  ]);

  useEffect(() => {
    const controller =
      new AbortController();

    loadMembers(
      controller.signal,
    ).catch((error) => {
      if (error.name !== "AbortError") {
        console.warn(
          "Failed to load members:",
          error.message,
        );

        setMembers([]);
      }
    });

    return () => {
      controller.abort();
    };
  }, [loadMembers]);

  const branches = useMemo(
      () => [
        {
          label: "សាខា",
          value: "",
        },

        ...branchLookups
          .map((branch) => ({
            label:
              branch?.label_km ||
              branch?.labelKm ||
              branch?.name_km ||
              branch?.nameKm ||
              branch?.name_en ||
              branch?.nameEn ||
              branch?.branch_code ||
              branch?.branchCode ||
              "",

            value: String(
              branch?.id ??
              branch?.value ??
              "",
            ),
          }))
          .filter(
            (branch) =>
              branch.value !== "" &&
              branch.label !== "",
          ),
      ],
      [branchLookups],
    );

  const memberStatuses = useMemo(
    () => [
      {
        label: "ស្ថានភាព",
        value: "",
      },

      ...statusLookups.map(
        (status) => {
          const code = String(
            status?.code || "",
          ).toUpperCase();

          return {
            label:
              status?.label_km ||
              status?.labelKm ||
              STATUS_LABELS_KM[code] ||
              "-",

            value: String(
              status?.id ?? "",
            ),
          };
        },
      ),
    ],
    [statusLookups],
  );

  const genders = useMemo(
    () => [
      {
        label: "ភេទ",
        value: "",
      },

      ...genderLookups.map(
        (gender) => {
          const code = String(
            gender?.code || "",
          ).toUpperCase();

          return {
            label:
              gender?.label_km ||
              gender?.labelKm ||
              GENDER_LABELS_KM[code] ||
              "-",

            value: code,
          };
        },
      ),
    ],
    [genderLookups],
  );

  const handleCreateMember =
    async () => {
      setIsCreateOpen(false);

      const controller =
        new AbortController();

      try {
        await Promise.all([
          loadSummary(
            controller.signal,
          ),

          loadMembers(
            controller.signal,
          ),
        ]);
      } catch (error) {
        if (
          error.name !== "AbortError"
        ) {
          console.warn(
            "Failed to refresh members:",
            error.message,
          );
        }
      }
    };

  const tableColumns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",
      render: (_, index) => index,
    },

    {
      header: "សមាជិក",
      width: "w-[20%]",
      align: "left",

      render: (member) => (
        <span className="block w-full truncate font-medium text-text-secondary">
          {member.nameKh}
        </span>
      ),
    },

    {
      header: "ភេទ",
      width: "w-[10%]",
      align: "center",

      render: (member) => (
        <span>
          {member.genderLabel}
        </span>
      ),
    },

    {
      header: "សាខា",
      width: "w-[18%]",
      align: "left",

      render: (member) => (
        <span className="block w-full truncate">
          {member.branchLabel}
        </span>
      ),
    },

    {
      header: "ស្ថានភាព",
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
              STATUS_BADGE_STYLES[
                member.statusCode
              ] ||
              "bg-gray-100 text-text-secondary"
            }
          `}
        >
          {member.statusLabel}
        </span>
      ),
    },

    {
      header: "ថ្ងៃចូលរួម",
      width: "w-[16%]",
      align: "left",

      render: (member) => (
        <span className="block w-full truncate">
          {member.joinedAt}
        </span>
      ),
    },

    {
      header: "សកម្មភាព",
      width: "w-[16%]",
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
      onChange: setBranchFilter,
      options: branches,
      placeholder: "សាខា",
    },

    {
      name: "status",
      value: statusFilter,
      onChange: setStatusFilter,
      options: memberStatuses,
      placeholder: "ស្ថានភាព",
    },

    {
      name: "gender",
      value: genderFilter,
      onChange: setGenderFilter,
      options: genders,
      placeholder: "ភេទ",
    },
  ];

  return (
    <div className="flex min-h-full min-w-0 flex-col gap-4 overflow-hidden">
      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
        <StatCard
          icon={Users}
          label="សមាជិកសរុប"
          value={String(
            summary.total_members,
          )}
          growth="0"
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={AiOutlineWoman}
          label="ភេទស្រី"
          value={String(
            summary.female_members,
          )}
          growth="0"
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Landmark}
          label="ចំនួនព្រះសង្ឃ"
          value={String(
            summary.monk_members,
          )}
          growth="0"
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={FaDharmachakra}
          label="ព្រះពុទ្ធ"
          value={String(
            summary.buddhist_members,
          )}
          growth="0"
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Moon}
          label="អ៊ីស្លាម"
          value={String(
            summary.islam_members,
          )}
          growth="0"
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />
      </div>

      <div className="min-w-0 w-full">
        <DataTable
          title="បញ្ជីសមាជិក"
          data={members}
          columns={tableColumns}
          filters={filterConfig}
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder="ស្វែងរកតាមរយៈឈ្មោះ..."
          pageSize={20}
          actionButton={
            <button
              type="button"
              onClick={() =>
                setIsCreateOpen(true)
              }
              className="
                inline-flex
                h-[34px]
                w-full
                items-center
                justify-center
                gap-2
                whitespace-nowrap
                rounded-lg
                bg-success
                px-4
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

      <CreateMemberModal
        open={isCreateOpen}
        onClose={() =>
          setIsCreateOpen(false)
        }
        onSave={handleCreateMember}
      />
    </div>
  );
}