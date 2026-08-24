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

import { downloadExcel } from "@/utils/downloadExcel";
import { AiOutlineWoman } from "react-icons/ai";
import { FaDharmachakra } from "react-icons/fa";
import { RiAddCircleLine } from "react-icons/ri";

import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js";
import StatCard from "@/components/dashboard/statCard";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";

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
  ACTIVE:
    "bg-success-bg text-success",

  INACTIVE:
    "bg-error-bg text-error",

  SUSPENDED:
    "bg-warning-bg text-warning",

  RESIGNED:
    "bg-bg-page-gray text-text-secondary",
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

async function fetchJson(
  path,
  signal,
) {
  const response = await fetch(
    `/api${path}`,
    {
      method: "GET",

      headers: {
        Accept:
          "application/json",
      },

      cache: "no-store",
      signal,
    },
  );

  const text =
    await response.text();

  let body = null;

  if (text) {
    try {
      body =
        JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body ===
      "object"
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

function normalizeArray(data) {
  if (Array.isArray(data)) {
    return data;
  }

  if (
    Array.isArray(
      data?.data,
    )
  ) {
    return data.data;
  }

  if (
    Array.isArray(
      data?.content,
    )
  ) {
    return data.content;
  }

  return [];
}

function formatJoinedDate(
  value,
) {
  if (!value) {
    return "-";
  }

  const match =
    String(value).match(
      /^(\d{4})-(\d{2})-(\d{2})$/,
    );

  if (!match) {
    return String(value);
  }

  const [
    ,
    year,
    month,
    day,
  ] = match;

  const monthName =
    KHMER_MONTHS[
      Number(month) - 1
    ];

  if (!monthName) {
    return String(value);
  }

  return `${Number(
    day,
  )} ${monthName}, ${year}`;
}

function getGenderLabel(
  gender,
) {
  const code =
    String(
      gender?.code || "",
    ).toUpperCase();

  return (
    gender?.label_km ||
    gender?.labelKm ||
    gender?.label_en ||
    gender?.labelEn ||
    GENDER_LABELS_KM[
      code
    ] ||
    "-"
  );
}

function getStatusLabel(
  status,
) {
  const code =
    String(
      status?.code || "",
    ).toUpperCase();

  return (
    status?.label_km ||
    status?.labelKm ||
    status?.label_en ||
    status?.labelEn ||
    STATUS_LABELS_KM[
      code
    ] ||
    "-"
  );
}

function getBranchLabel(
  branch,
) {
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

function mapMember(
  member,
) {
  return {
    id:
      member?.id,

    nameKh:
      member?.full_name_km ||
      member?.full_name_en ||
      "-",

    genderLabel:
      getGenderLabel(
        member?.gender,
      ),

    genderCode:
      String(
        member?.gender?.code ||
          "",
      ).toUpperCase(),

    branchLabel:
      getBranchLabel(
        member?.branch,
      ),

    branchId:
      member?.branch?.id ??
      member?.branch_id ??
      "",

    statusLabel:
      getStatusLabel(
        member?.status,
      ),

    statusCode:
      String(
        member?.status?.code ||
          "",
      ).toUpperCase(),

    statusId:
      member?.status?.id ??
      member?.status_id ??
      "",

    joinedAt:
      formatJoinedDate(
        member?.joined_on,
      ),
  };
}

export default function MembersPage() {
  const router =
    useRouter();

  const [
    members,
    setMembers,
  ] = useState([]);

  const [
    summary,
    setSummary,
  ] = useState(
    EMPTY_SUMMARY,
  );

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

  const [
    query,
    setQuery,
  ] = useState("");

  const [
    debouncedQuery,
    setDebouncedQuery,
  ] = useState("");

  const [
    branchFilter,
    setBranchFilter,
  ] = useState("");

  const { member: currentMember } =
    useCurrentMember();

  const isViewer = currentMember?.isViewer === true;

  // Same single-branch scoping as the activity/donation pages -- a
  // secretary/branch_leader is always scoped to exactly the one branch
  // active in the sidebar's global dropdown (see BranchContext), never
  // an independent pick from this page's own branch filter. ADMIN keeps
  // the existing free-pick filter (including "all branches") untouched.
  const {
    branches: accessibleBranches = [],
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();

  const isBranchScoped =
    (currentMember?.effectiveRole || currentMember?.role) === "secretary" ||
    (currentMember?.effectiveRole || currentMember?.role) === "branch_leader";

  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;

    if (
      globalSelectedBranch &&
      globalSelectedBranch !== "all"
    ) {
      return String(globalSelectedBranch);
    }

    if (accessibleBranches.length > 0) {
      return String(accessibleBranches[0].id);
    }

    return currentMember?.branchId
      ? String(currentMember.branchId)
      : null;
  }, [
    isBranchScoped,
    globalSelectedBranch,
    accessibleBranches,
    currentMember?.branchId,
  ]);

  // What actually drives the fetches/UI below -- a branch-scoped role
  // always uses effectiveBranchId (never "", which would mean "every
  // branch" to loadMembers/loadSummary); everyone else keeps using their
  // own filter pick.
  const effectiveBranchFilter = isBranchScoped
    ? effectiveBranchId ?? ""
    : branchFilter;

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
   * =========================================
   * SEARCH DEBOUNCE
   * =========================================
   */

  useEffect(() => {
    const timeoutId =
      window.setTimeout(
        () => {
          setDebouncedQuery(
            query.trim(),
          );
        },
        350,
      );

    return () => {
      window.clearTimeout(
        timeoutId,
      );
    };
  }, [query]);

  /*
   * =========================================
   * SUMMARY
   * =========================================
   */

  const loadSummary =
    useCallback(
      async (signal) => {
        // branchId is forwarded so a secretary/branch_leader's summary
        // cards are scoped to their one active branch (see
        // effectiveBranchFilter above) once the backend supports this
        // param on /members/summary -- until then it's simply ignored
        // server-side, same as any other unrecognized query param.
        const summaryPath =
          effectiveBranchFilter
            ? `/members/summary?branchId=${encodeURIComponent(
                effectiveBranchFilter,
              )}`
            : "/members/summary";

        const data =
          await fetchJson(
            summaryPath,
            signal,
          );

        setSummary({
          total_members:
            Number(
              data?.total_members,
            ) || 0,

          female_members:
            Number(
              data?.female_members,
            ) || 0,

          monk_members:
            Number(
              data?.monk_members,
            ) || 0,

          buddhist_members:
            Number(
              data?.buddhist_members,
            ) || 0,

          islam_members:
            Number(
              data?.islam_members,
            ) || 0,
        });
      },
      [effectiveBranchFilter],
    );

  /*
   * =========================================
   * LOOKUPS
   *
   * Important:
   * load each lookup independently.
   * One failure won't break all dropdowns.
   * =========================================
   */

  const loadLookups =
    useCallback(
      async (signal) => {
        /*
         * BRANCHES
         */
        try {
          const data =
            await fetchJson(
              "/lookups/branches",
              signal,
            );

          setBranchLookups(
            normalizeArray(data),
          );
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.error(
              "Cannot load branch options:",
              error,
            );

            setBranchLookups([]);
          }
        }

        /*
         * MEMBER STATUSES
         */
        try {
          const data =
            await fetchJson(
              "/lookups/member-statuses",
              signal,
            );

          setStatusLookups(
            normalizeArray(
              data,
            ),
          );
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.error(
              "Cannot load member statuses:",
              error,
            );

            setStatusLookups(
              [],
            );
          }
        }

        /*
         * GENDERS
         */
        try {
          const data =
            await fetchJson(
              "/lookups/genders",
              signal,
            );

          setGenderLookups(
            normalizeArray(
              data,
            ),
          );
        } catch (error) {
          if (
            error.name !==
            "AbortError"
          ) {
            console.error(
              "Cannot load genders:",
              error,
            );

            setGenderLookups(
              [],
            );
          }
        }
      },
      [],
    );

  /*
   * =========================================
   * MEMBERS
   * =========================================
   */

  const loadMembers =
    useCallback(
      async (signal) => {
        const baseParams =
          new URLSearchParams();

        baseParams.set(
          "page",
          "0",
        );

        baseParams.set(
          "size",
          "20",
        );

        if (
          debouncedQuery
        ) {
          baseParams.set(
            "search",
            debouncedQuery,
          );
        }

        if (
          effectiveBranchFilter
        ) {
          baseParams.set(
            "branchId",
            effectiveBranchFilter,
          );
        }

        if (
          statusFilter
        ) {
          baseParams.set(
            "statusId",
            statusFilter,
          );
        }

        if (
          genderFilter
        ) {
          baseParams.set(
            "gender",
            genderFilter,
          );
        }

        const firstPage =
          await fetchJson(
            `/members?${baseParams.toString()}`,
            signal,
          );

        const firstContent =
          Array.isArray(
            firstPage?.content,
          )
            ? firstPage.content
            : [];

        const totalPages =
          Math.max(
            Number(
              firstPage?.totalPages,
            ) || 1,
            1,
          );

        /*
         * Only one page
         */
        if (
          totalPages === 1
        ) {
          setMembers(
            firstContent.map(
              mapMember,
            ),
          );

          return;
        }

        /*
         * Load remaining pages
         */
        const requests =
          Array.from(
            {
              length:
                totalPages -
                1,
            },

            (_, index) => {
              const params =
                new URLSearchParams(
                  baseParams,
                );

              params.set(
                "page",
                String(
                  index + 1,
                ),
              );

              return fetchJson(
                `/members?${params.toString()}`,
                signal,
              );
            },
          );

        const remainingPages =
          await Promise.all(
            requests,
          );

        const allMembers = [
          ...firstContent,

          ...remainingPages.flatMap(
            (page) =>
              Array.isArray(
                page?.content,
              )
                ? page.content
                : [],
          ),
        ];

        setMembers(
          allMembers.map(
            mapMember,
          ),
        );
      },
      [
        effectiveBranchFilter,
        debouncedQuery,
        genderFilter,
        statusFilter,
      ],
    );

  /*
   * =========================================
   * LOAD SUMMARY + LOOKUPS
   * =========================================
   */

  useEffect(() => {
    const controller =
      new AbortController();

    loadSummary(
      controller.signal,
    ).catch((error) => {
      if (
        error.name !==
        "AbortError"
      ) {
        console.warn(
          "Failed to load member summary:",
          error.message,
        );
      }
    });

    loadLookups(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [
    loadLookups,
    loadSummary,
  ]);

  /*
   * =========================================
   * LOAD MEMBERS
   * =========================================
   */

  useEffect(() => {
    const controller =
      new AbortController();

    loadMembers(
      controller.signal,
    ).catch((error) => {
      if (
        error.name !==
        "AbortError"
      ) {
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

  /*
   * =========================================
   * BRANCH OPTIONS
   * =========================================
   */

  const branches =
    useMemo(
      () => [
        {
          label: "សាខា",
          value: "",
        },

        ...branchLookups
          .map(
            (branch) => {
              const id =
                branch?.id ??
                branch?.value ??
                "";

              const label =
                branch?.label_km ||
                branch?.labelKm ||
                branch?.name_km ||
                branch?.nameKm ||
                branch?.name_en ||
                branch?.nameEn ||
                branch?.branch_code ||
                branch?.branchCode ||
                "";

              return {
                label,

                value:
                  id !== null &&
                  id !==
                    undefined
                    ? String(
                        id,
                      )
                    : "",
              };
            },
          )
          .filter(
            (branch) =>
              branch.value !==
                "" &&
              branch.label !==
                "",
          ),
      ],
      [branchLookups],
    );

  // The branch filter shown in the table toolbar is locked to whichever
  // single branch is currently active for a secretary/branch_leader (see
  // effectiveBranchFilter above) -- only that one branch is offered, and
  // the select is disabled (see filterConfig below), same lock used on
  // the activity/donation pages' branch dropdowns.
  const branchFilterOptions = useMemo(() => {
    if (!isBranchScoped) return branches;

    const match = branches.find(
      (option) => option.value === effectiveBranchFilter,
    );

    return match ? [match] : [];
  }, [isBranchScoped, branches, effectiveBranchFilter]);

  /*
   * =========================================
   * STATUS OPTIONS
   * =========================================
   */

  const memberStatuses =
    useMemo(
      () => [
        {
          label:
            "គ្រប់ស្ថានភាព",

          value: "",
        },

        ...statusLookups
          .map(
            (status) => {
              const id =
                status?.id ??
                status?.status_id ??
                status?.statusId ??
                status?.value ??
                "";

              const code =
                String(
                  status?.code ||
                    "",
                ).toUpperCase();

              const label =
                status?.label_km ||
                status?.labelKm ||
                status?.label_en ||
                status?.labelEn ||
                STATUS_LABELS_KM[
                  code
                ] ||
                status?.code ||
                "-";

              return {
                label,

                value:
                  id !== null &&
                  id !==
                    undefined
                    ? String(
                        id,
                      )
                    : "",
              };
            },
          )
          .filter(
            (status) =>
              status.value !==
              "",
          ),
      ],
      [statusLookups],
    );

  /*
   * =========================================
   * GENDER OPTIONS
   * =========================================
   */

  const genders =
    useMemo(
      () => [
        {
          label: "ភេទ",
          value: "",
        },

        ...genderLookups
          .map(
            (gender) => {
              const code =
                String(
                  gender?.code ||
                    gender?.value ||
                    "",
                ).toUpperCase();

              const label =
                gender?.label_km ||
                gender?.labelKm ||
                gender?.label_en ||
                gender?.labelEn ||
                GENDER_LABELS_KM[
                  code
                ] ||
                code;

              return {
                label,
                value: code,
              };
            },
          )
          .filter(
            (gender) =>
              gender.value !==
              "",
          ),
      ],
      [genderLookups],
    );

  /*
   * =========================================
   * CREATE MEMBER CALLBACK
   * =========================================
   */

  const handleCreateMember =
    async (member) => {
      const response = await fetch("/api/members", {
        method: "POST",
        credentials: "include",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(member),
      });

      const text = await response.text();
      let body = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        body = text;
      }

      if (!response.ok) {
        throw new Error(
          (typeof body === "object" &&
            (body?.message || body?.detail || body?.error)) ||
            "មិនអាចបង្កើតសមាជិកបានទេ",
        );
      }

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
          error.name !==
          "AbortError"
        ) {
          console.warn(
            "Failed to refresh members:",
            error.message,
          );
        }
      }
    };

  /*
   * =========================================
   * TABLE
   * =========================================
   */

  const handleDownloadMembers = () => {
  if (
    !Array.isArray(members) ||
    members.length === 0
  ) {
    return;
  }

  const rows = members.map(
    (member, index) => ({
      "ល.រ": index + 1,
      "ឈ្មោះសមាជិក":
        member.nameKh || "-",
      "ភេទ":
        member.genderLabel || "-",
      "សាខា":
        member.branchLabel || "-",
      "ស្ថានភាព":
        member.statusLabel || "-",
      "ថ្ងៃចូលរួម":
        member.joinedAt || "-",
    }),
  );

  const branchLabel = effectiveBranchFilter
    ? branches.find((option) => option.value === effectiveBranchFilter)?.label
    : null;

  downloadExcel({
    rows,
    fileName: branchLabel ? `សមាជិក-${branchLabel}` : "សមាជិក",
    sheetName: "Members",
  });
};

  const tableColumns = [
    {
      header: "ល.រ",
      width: "w-[6%]",
      align: "center",

      render: (
        _,
        index,
      ) => index,
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
          {
            member.genderLabel
          }
        </span>
      ),
    },

    {
      header: "សាខា",
      width: "w-[18%]",
      align: "left",

      render: (member) => (
        <span className="block w-full truncate">
          {
            member.branchLabel
          }
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
                member
                  .statusCode
              ] ||
              "bg-bg-page-gray text-text-secondary"
            }
          `}
        >
          {
            member.statusLabel
          }
        </span>
      ),
    },

    {
      header:
        "ថ្ងៃចូលរួម",

      width: "w-[16%]",
      align: "left",

      render: (member) => (
        <span className="block w-full truncate">
          {
            member.joinedAt
          }
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

  /*
   * =========================================
   * FILTERS
   * =========================================
   */

  const filterConfig = [
    {
      name: "branch",

      value:
        effectiveBranchFilter,

      onChange: isBranchScoped
        ? () => {}
        : setBranchFilter,

      options:
        branchFilterOptions,

      placeholder:
        "សាខា",

      disabled:
        isBranchScoped,
    },

    {
      name: "status",

      value:
        statusFilter,

      onChange:
        setStatusFilter,

      options:
        memberStatuses,

      placeholder:
        "ស្ថានភាព",
    },

    {
      name: "gender",

      value:
        genderFilter,

      onChange:
        setGenderFilter,

      options:
        genders,

      placeholder:
        "ភេទ",
    },
  ];

  return (
    <div className="flex min-h-full min-w-0 flex-col gap-4 overflow-hidden">
      {/* SUMMARY */}

      <div className="grid shrink-0 grid-cols-5 gap-3">
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

      {/* TABLE */}

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
          onDownload={handleDownloadMembers}
          actionButton={
            <button
              type="button"
              onClick={() =>
                !isViewer && setIsCreateOpen(true)
              }
              disabled={isViewer}
              title={isViewer ? "Viewer accounts are read-only" : undefined}
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
                disabled:cursor-not-allowed
                disabled:opacity-50
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

      {/* CREATE MODAL */}

      <CreateMemberModal
        open={
          !isViewer && isCreateOpen
        }
        onClose={() =>
          setIsCreateOpen(
            false,
          )
        }
        onSave={
          handleCreateMember
        }
        branches={branches}
        statuses={memberStatuses}
      />
    </div>
  );
}
