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
import { RiAddCircleLine } from "react-icons/ri";
import DharmaWheel from "@/components/icons/DharmaWheel";

import CreateMemberModal from "@/components/popup/CreateMemberModal.js";
import DataTable from "@/components/table/DataTable.js";
import StatCard from "@/components/dashboard/statCard";
import ButtonSeeDetail from "@/components/forms/ButtonSeeDetail";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";

const EMPTY_SUMMARY = {
  total_members: 0,
  total_members_change_percent: null,
  female_members: 0,
  female_members_change_percent: null,
  monk_members: 0,
  monk_members_change_percent: null,
  buddhist_members: 0,
  buddhist_members_change_percent: null,
  islam_members: 0,
  islam_members_change_percent: null,
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

const MONTHS_KM = [
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

const MONTHS_EN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
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
  locale = "km",
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
    (locale === "en"
      ? MONTHS_EN
      : MONTHS_KM)[
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
  label,
  t,
) {
  if (label && gender && typeof gender === "object") {
    return label(gender, "-");
  }

  const code =
    String(
      gender?.code || "",
    ).toUpperCase();

  return (
    gender?.label_km ||
    gender?.labelKm ||
    gender?.label_en ||
    gender?.labelEn ||
    (code === "MALE"
      ? t?.("memberPage.male")
      : code === "FEMALE"
        ? t?.("memberPage.femaleGender")
        : code === "MONK"
          ? t?.("memberPage.monkGender")
          : code === "OTHER"
            ? t?.("memberPage.otherGender")
            : GENDER_LABELS_KM[
                code
              ]) ||
    "-"
  );
}

function getStatusLabel(
  status,
  label,
  t,
) {
  if (label && status && typeof status === "object") {
    return label(status, "-");
  }

  const code =
    String(
      status?.code || "",
    ).toUpperCase();

  return (
    status?.label_km ||
    status?.labelKm ||
    status?.label_en ||
    status?.labelEn ||
    (code === "ACTIVE"
      ? t?.("memberPage.active")
      : code === "INACTIVE"
        ? t?.("memberPage.inactive")
        : code === "SUSPENDED"
          ? t?.("memberPage.suspended")
          : code === "RESIGNED"
            ? t?.("memberPage.resigned")
            : STATUS_LABELS_KM[
                code
              ]) ||
    "-"
  );
}

function getBranchLabel(
  branch,
  label,
) {
  if (label) {
    return label(branch, "-");
  }

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
  {
    label,
    locale,
    t,
    branchLookups = [],
    genderLookups = [],
  },
) {
  const genderCode = String(member?.gender?.code || "").toUpperCase();
  const branchId = member?.branch?.id ?? member?.branch_id;
  const localizedGender = genderLookups.find(
    (item) => String(item?.code || "").toUpperCase() === genderCode,
  );
  const localizedBranch = branchLookups.find(
    (item) => String(item?.id ?? item?.value ?? "") === String(branchId ?? ""),
  );

  return {
    id:
      member?.id,

    nameKh:
      label(member, "-"),

    genderLabel:
      getGenderLabel(
        localizedGender || member?.gender,
        label,
        t,
      ),

    genderCode:
      String(
        member?.gender?.code ||
          "",
      ).toUpperCase(),

    branchLabel:
      getBranchLabel(
        localizedBranch || member?.branch,
        label,
      ),

    branchId:
      member?.branch?.id ??
      member?.branch_id ??
      "",

    statusLabel:
      getStatusLabel(
        member?.status,
        label,
        t,
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
        locale,
      ),
  };
}

export default function MembersPage() {
  const { t, label, locale } =
    useLanguage();

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

          total_members_change_percent:
            data?.total_members_change_percent ??
            null,

          female_members:
            Number(
              data?.female_members,
            ) || 0,

          female_members_change_percent:
            data?.female_members_change_percent ??
            null,

          monk_members:
            Number(
              data?.monk_members,
            ) || 0,

          monk_members_change_percent:
            data?.monk_members_change_percent ??
            null,

          buddhist_members:
            Number(
              data?.buddhist_members,
            ) || 0,

          buddhist_members_change_percent:
            data?.buddhist_members_change_percent ??
            null,

          islam_members:
            Number(
              data?.islam_members,
            ) || 0,

          islam_members_change_percent:
            data?.islam_members_change_percent ??
            null,
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
              (member) =>
                mapMember(member, {
                  label,
                  locale,
                  t,
                  branchLookups,
                  genderLookups,
                }),
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
            (member) =>
              mapMember(member, {
                  label,
                  locale,
                  t,
                  branchLookups,
                  genderLookups,
              }),
          ),
        );
      },
      [
        effectiveBranchFilter,
        branchLookups,
        debouncedQuery,
        genderFilter,
        genderLookups,
        label,
        locale,
        statusFilter,
        t,
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
          label: t("memberPage.branch"),
          value: "",
        },

        ...branchLookups
          .map(
            (branch) => {
              const id =
                branch?.id ??
                branch?.value ??
                "";

              const branchLabel =
                label(
                  branch,
                  branch?.branch_code ||
                    branch?.branchCode ||
                    "",
                );

              return {
                label: branchLabel,

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
      [branchLookups, label, t],
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
            t("memberPage.allStatuses"),

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

              const statusLabel =
                getStatusLabel(
                  status,
                  label,
                  t,
                );

              return {
                label: statusLabel,

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
      [statusLookups, label, t],
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
          label: t("memberPage.gender"),
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

              const genderLabel =
                getGenderLabel(
                  gender,
                  label,
                  t,
                ) || code;

              return {
                label: genderLabel,
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
      [genderLookups, label, t],
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
            t("memberPage.createFailed"),
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
      [t("memberPage.no")]: index + 1,
      [t("memberPage.member")]:
        member.nameKh || "-",
      [t("memberPage.gender")]:
        member.genderLabel || "-",
      [t("memberPage.branch")]:
        member.branchLabel || "-",
      [t("memberPage.status")]:
        member.statusLabel || "-",
      [t("memberPage.joinedAt")]:
        member.joinedAt || "-",
    }),
  );

  const branchLabel = effectiveBranchFilter
    ? branches.find((option) => option.value === effectiveBranchFilter)?.label
    : null;

  downloadExcel({
    rows,
    fileName: branchLabel ? `${t("memberPage.membersFileName")}-${branchLabel}` : t("memberPage.membersFileName"),
    sheetName: "Members",
  });
};

  const tableColumns = [
    {
      header: t("memberPage.no"),
      width: "w-[6%]",
      align: "center",

      render: (
        _,
        index,
      ) => index,
    },

    {
      header: t("memberPage.member"),
      width: "w-[20%]",
      align: "left",

      render: (member) => (
        <span className="block w-full truncate font-medium text-text-secondary">
          {member.nameKh}
        </span>
      ),
    },

    {
      header: t("memberPage.gender"),
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
      header: t("memberPage.branch"),
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
      header: t("memberPage.status"),
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
        t("memberPage.joinedAt"),

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
      header: t("memberPage.actions"),
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
        t("memberPage.branch"),

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
        t("memberPage.status"),
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
        t("memberPage.gender"),
    },
  ];

  return (
    <div className="flex min-h-full min-w-0 flex-col gap-4 overflow-hidden">
      {/* SUMMARY */}

      <div className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <StatCard
          icon={Users}
          label={t("memberPage.totalMembers")}
          value={String(
            summary.total_members,
          )}
          growth={
            summary.total_members_change_percent
          }
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={AiOutlineWoman}
          label={t("memberPage.female")}
          value={String(
            summary.female_members,
          )}
          growth={
            summary.female_members_change_percent
          }
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Landmark}
          label={t("memberPage.monks")}
          value={String(
            summary.monk_members,
          )}
          growth={
            summary.monk_members_change_percent
          }
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={DharmaWheel}
          label={t("memberPage.buddhist")}
          value={String(
            summary.buddhist_members,
          )}
          growth={
            summary.buddhist_members_change_percent
          }
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />

        <StatCard
          icon={Moon}
          label={t("memberPage.islam")}
          value={String(
            summary.islam_members,
          )}
          growth={
            summary.islam_members_change_percent
          }
          iconColor="text-secondary"
          iconBg="bg-secondary-light"
        />
      </div>

      {/* TABLE */}

      <div className="min-w-0 w-full">
        <DataTable
          title={t("memberPage.listTitle")}
          data={members}
          columns={tableColumns}
          filters={filterConfig}
          searchQuery={query}
          onSearchChange={setQuery}
          searchPlaceholder={t("memberPage.searchByName")}
          pageSize={20}
          onDownload={handleDownloadMembers}
          actionButton={
            <button
              type="button"
              onClick={() =>
                !isViewer && setIsCreateOpen(true)
              }
              disabled={isViewer}
              title={isViewer ? t("memberPage.viewerReadOnly") : undefined}
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
                {t("memberPage.addMember")}
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
