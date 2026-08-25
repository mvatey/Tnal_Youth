"use client";

import {
  use,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ChevronRight,
  Eye,
  Pencil,
} from "lucide-react";

import {
  RiDownloadCloud2Line,
} from "react-icons/ri";

import Link from "next/link";

import SearchBar from "@/components/table-items/SearchBar";
import FilterBar from "@/components/table-items/FilterBar";
import Button from "@/components/table-items/Button";
import Table from "@/components/table-items/Table";

import ParticipantStats, {
  ParticipantStatusBadge as StatusBadge,
} from "@/components/activity/ParticipantStats";

import ParticipationEditModal from "@/components/activity/ParticipantEditModal";
import MemberPreviewModal from "@/components/activity/MemberPreviewModal";

import {
  useAuth,
} from "@/context/AuthContext";

import {
  useBranch,
} from "@/context/BranchContext";

import {
  normalizeRole,
} from "@/lib/navigation";

import { downloadTableAsExcel } from "@/utils/downloadExcel";

const PARTICIPANTS_EXPORT_COLUMNS = [
  { header: "ល.រ", accessor: "no" },
  { header: "ឈ្មោះអ្នកចូលរួម", accessor: "name" },
  { header: "អ៊ីមែល", accessor: "email" },
  { header: "ភេទ", accessor: "gender" },
  { header: "តួនាទី", accessor: "role" },
  { header: "សាខា", accessor: "branch" },
  { header: "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម", accessor: "joinedDate" },
  {
    header: "ស្ថានភាពអញ្ជើញ",
    exportValue: (row) => (row.isInvited ? "បានអញ្ជើញ" : "មិនបានអញ្ជើញ"),
  },
  {
    header: "ស្ថានភាពចូលរួម",
    exportValue: (row) => (row.isParticipated ? "បានចូលរួម" : "មិនបានចូលរួម"),
  },
];

async function fetchApi(
  path,
  options = {},
) {
  const response =
    await fetch(
      `/api/backend${path}`,
      {
        cache: "no-store",

        headers: {
          Accept:
            "application/json",

          ...(options.headers ||
            {}),
        },

        ...options,
      },
    );

  const body =
    await response
      .json()
      .catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message ||
        `Request failed (${response.status})`,
    );
  }

  return body;
}

function getValue(
  record,
  camelKey,
  snakeKey,
) {
  return (
    record?.[camelKey] ??
    record?.[snakeKey]
  );
}

function getLabel(value) {
  if (!value) {
    return "";
  }

  if (
    typeof value ===
    "string"
  ) {
    return value;
  }

  return (
    value.labelKm ??
    value.label_km ??
    value.labelEn ??
    value.label_en ??
    value.code ??
    ""
  );
}

function formatDate(value) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "en-CA",
    {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    },
  ).format(date);
}

function asList(value) {
  if (Array.isArray(value)) {
    return value;
  }

  if (
    Array.isArray(
      value?.content,
    )
  ) {
    return value.content;
  }

  if (
    Array.isArray(
      value?.items,
    )
  ) {
    return value.items;
  }

  return [];
}

function normalizeExistingParticipant(
  participant,
) {
  return {
    ...participant,

    memberId:
      Number(
        getValue(
          participant,
          "memberId",
          "member_id",
        ),
      ),

    branchId:
      Number(
        getValue(
          participant,
          "branchId",
          "branch_id",
        ),
      ),

    attendanceStatus:
      String(
        getValue(
          participant,
          "attendanceStatus",
          "attendance_status",
        ) || "",
      ).toUpperCase(),

    checkedInAt:
      getValue(
        participant,
        "checkedInAt",
        "checked_in_at",
      ),

    registrationSource:
      String(
        getValue(
          participant,
          "registrationSource",
          "registration_source",
        ) || "",
      ).toUpperCase(),
  };
}

export default function ActivityParticipantsPage({
  params,
}) {
  const { id } =
    use(params);

  const { user } =
    useAuth();

  const {
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();

  const isMember =
    normalizeRole(
      user?.role,
    ) === "member";

  const [
    activity,
    setActivity,
  ] = useState(null);

  /*
   * This table contains ONLY
   * the current staff branch.
   */
  const [
    activityParticipants,
    setActivityParticipants,
  ] = useState([]);

  /*
   * Activity-wide totals.
   *
   * Used only by Host Branch.
   */
  const [
    globalSummary,
    setGlobalSummary,
  ] = useState({
    total: 0,
    attended: 0,
    notAttended: 0,
    invitedBranchParticipants:
      0,
  });

  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");

  const [
    selectedRole,
    setSelectedRole,
  ] = useState("all");

  const [
    selectedBranch,
    setSelectedBranch,
  ] = useState("all");

  const [
    selectedDate,
    setSelectedDate,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    isEditOpen,
    setIsEditOpen,
  ] = useState(false);

  const [
    previewMember,
    setPreviewMember,
  ] = useState(null);

  async function refreshSummary() {
    const summary =
      await fetchApi(
        `/activities/${id}/participants/summary${
              globalSelectedBranch !== "all"
                ? `?branchId=${encodeURIComponent(globalSelectedBranch)}`
                : ""
            }`,
      );

    setGlobalSummary({
      total:
        Number(
          getValue(
            summary,
            "total",
            "total",
          ) ?? 0,
        ),

      attended:
        Number(
          getValue(
            summary,
            "attended",
            "attended",
          ) ?? 0,
        ),

      notAttended:
        Number(
          getValue(
            summary,
            "notAttended",
            "not_attended",
          ) ?? 0,
        ),

      invitedBranchParticipants:
        Number(
          getValue(
            summary,
            "invitedBranchParticipants",
            "invited_branch_participants",
          ) ?? 0,
        ),
    });
  }

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const activityRecord =
          await fetchApi(
            `/activities/${id}${
              globalSelectedBranch !== "all"
                ? `?branchId=${encodeURIComponent(globalSelectedBranch)}`
                : ""
            }`,
          );

        const canManage =
          Boolean(
            getValue(
              activityRecord,
              "canManage",
              "can_manage",
            ),
          );

        const canManageAsInvitedBranch =
          Boolean(
            getValue(
              activityRecord,
              "canManageAsInvitedBranch",
              "can_manage_as_invited_branch",
            ),
          );

        const hostBranchId =
          Number(
            getValue(
              activityRecord,
              "branchId",
              "branch_id",
            ),
          );

        const managedInvitedBranchId =
          Number(
            getValue(
              activityRecord,
              "managedInvitedBranchId",
              "managed_invited_branch_id",
            ),
          );

        /*
         * HOST:
         * current roster = host.
         *
         * INVITED:
         * current roster =
         * accepted invited branch.
         */
        const selectedScopedBranchId =
          globalSelectedBranch !== "all"
            ? Number(globalSelectedBranch)
            : null;

        const rosterBranchId =
          !canManage && canManageAsInvitedBranch
            ? (Number.isFinite(selectedScopedBranchId) &&
                selectedScopedBranchId > 0
                ? selectedScopedBranchId
                : managedInvitedBranchId)
            : hostBranchId;

        if (
          !Number.isFinite(
            rosterBranchId,
          ) ||
          rosterBranchId <= 0
        ) {
          throw new Error(
            "មិនអាចកំណត់សាខារបស់កម្មវិធីនេះបានទេ។",
          );
        }

        const [
          memberPage,
          participantResponse,
          summaryResponse,
        ] =
          await Promise.all([
            /*
             * Whole OWN branch roster.
             *
             * This keeps old walk-in
             * attendance behavior.
             */
            fetchApi(
              `/members?branchId=${rosterBranchId}&page=0&size=100`,
            ),

            /*
             * Backend already scopes
             * this to current staff branch.
             */
            fetchApi(
              `/activities/${id}/participants${
              globalSelectedBranch !== "all"
                ? `?branchId=${encodeURIComponent(globalSelectedBranch)}`
                : ""
            }`,
            ),

            /*
             * Whole activity totals.
             */
            fetchApi(
              `/activities/${id}/participants/summary${
              globalSelectedBranch !== "all"
                ? `?branchId=${encodeURIComponent(globalSelectedBranch)}`
                : ""
            }`,
            ),
          ]);

        const members =
          asList(
            memberPage,
          );

        const existingParticipants =
          asList(
            participantResponse,
          ).map(
            normalizeExistingParticipant,
          );

        const existingByMemberId =
          new Map(
            existingParticipants.map(
              (participant) => [
                participant.memberId,
                participant,
              ],
            ),
          );

        const memberById =
          new Map(
            members.map(
              (member) => [
                Number(member.id),
                member,
              ],
            ),
          );

        function buildRow(
          memberId,
          member,
          participant,
        ) {
          const joinedDateValue =
            getValue(
              member,
              "joinedOn",
              "joined_on",
            ) ||
            getValue(
              participant,
              "registeredAt",
              "registered_at",
            ) ||
            "";

          const attendanceStatus =
            participant
              ?.attendanceStatus ||
            "";

          const isInvited =
            Boolean(
              participant,
            ) &&
            participant
              .registrationSource !==
              "WALK_IN";

          return {
            id:
              memberId,

            memberId,

            name:
              getValue(
                member,
                "fullNameKm",
                "full_name_km",
              ) ||
              getValue(
                member,
                "fullNameEn",
                "full_name_en",
              ) ||
              getValue(
                participant,
                "fullNameKm",
                "full_name_km",
              ) ||
              getValue(
                participant,
                "fullNameEn",
                "full_name_en",
              ) ||
              "-",

            email:
              member?.email ||
              participant?.email ||
              "",

            gender:
              getLabel(
                member?.gender,
              ) ||
              "-",

            role:
              getLabel(
                member
                  ?.account_role,
              ) ||
              getLabel(
                member
                  ?.accountRole,
              ) ||
              "-",

            branch:
              getLabel(
                member?.branch,
              ) ||
              getValue(
                participant,
                "branchNameKm",
                "branch_name_km",
              ) ||
              getValue(
                participant,
                "branchNameEn",
                "branch_name_en",
              ) ||
              "-",

            branchId:
              participant
                ?.branchId ||
              Number(
                getValue(
                  member,
                  "branchId",
                  "branch_id",
                ),
              ) ||
              Number(
                member
                  ?.branch
                  ?.id,
              ) ||
              rosterBranchId,

            joinedDateValue:
              joinedDateValue
                ? String(
                    joinedDateValue,
                  ).slice(
                    0,
                    10,
                  )
                : "",

            joinedDate:
              formatDate(
                joinedDateValue,
              ),

            isInvited,

            isParticipated:
              attendanceStatus
                ? attendanceStatus ===
                  "PRESENT"
                : Boolean(
                    participant
                      ?.checkedInAt,
                  ),
          };
        }

        const rows = [];

        const seenMemberIds =
          new Set();

        /*
         * Show all OWN branch members.
         */
        for (
          const member
          of members
        ) {
          const memberId =
            Number(
              member.id,
            );

          if (
            !Number.isFinite(
              memberId,
            )
          ) {
            continue;
          }

          seenMemberIds.add(
            memberId,
          );

          rows.push(
            buildRow(
              memberId,
              member,
              existingByMemberId.get(
                memberId,
              ),
            ),
          );
        }

        /*
         * Preserve historical
         * participant records.
         */
        for (
          const participant
          of existingParticipants
        ) {
          if (
            seenMemberIds.has(
              participant.memberId,
            )
          ) {
            continue;
          }

          rows.push(
            buildRow(
              participant.memberId,

              memberById.get(
                participant.memberId,
              ) ||
                {},

              participant,
            ),
          );
        }

        if (cancelled) {
          return;
        }

        setActivity({
          ...activityRecord,

          name:
            getValue(
              activityRecord,
              "titleKm",
              "title_km",
            ) ||
            getValue(
              activityRecord,
              "titleEn",
              "title_en",
            ) ||
            "-",
        });

        setActivityParticipants(
          rows,
        );

        setGlobalSummary({
          total:
            Number(
              getValue(
                summaryResponse,
                "total",
                "total",
              ) ?? 0,
            ),

          attended:
            Number(
              getValue(
                summaryResponse,
                "attended",
                "attended",
              ) ?? 0,
            ),

          notAttended:
            Number(
              getValue(
                summaryResponse,
                "notAttended",
                "not_attended",
              ) ?? 0,
            ),

          invitedBranchParticipants:
            Number(
              getValue(
                summaryResponse,
                "invitedBranchParticipants",
                "invited_branch_participants",
              ) ?? 0,
            ),
        });
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "មានបញ្ហាកើតឡើង",
          );

          setActivityParticipants(
            [],
          );

          setGlobalSummary({
            total: 0,
            attended: 0,
            notAttended: 0,
            invitedBranchParticipants:
              0,
          });
        }
      } finally {
        if (!cancelled) {
          setLoading(
            false,
          );
        }
      }
    }

    if (isMember) {
      setLoading(false);
    } else {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [
    globalSelectedBranch,
    id,
    isMember,
  ]);

  const isHostBranch =
    Boolean(
      getValue(
        activity,
        "canManage",
        "can_manage",
      ),
    );

  const isInvitedBranch =
    !isHostBranch &&
    Boolean(
      getValue(
        activity,
        "canManageAsInvitedBranch",
        "can_manage_as_invited_branch",
      ),
    );

  /*
   * Invited branch cards:
   *
   * ONLY own branch.
   */
  const localSummary =
    useMemo(() => {
      const attended =
        activityParticipants.filter(
          (participant) =>
            participant
              .isParticipated ===
            true,
        ).length;

      return {
        total:
          activityParticipants
            .length,

        attended,

        notAttended:
          Math.max(
            0,

            activityParticipants
              .length -
              attended,
          ),
      };
    }, [
      activityParticipants,
    ]);

  /*
   * HOST:
   * 4 global cards.
   *
   * INVITED:
   * 3 local cards.
   */
  const displayedSummary =
    isInvitedBranch
      ? localSummary
      : {
          total:
            globalSummary.total,

          attended:
            globalSummary.attended,

          notAttended:
            globalSummary
              .notAttended,
        };

  const roles =
    useMemo(
      () => [
        ...new Set(
          activityParticipants
            .map(
              (item) =>
                item.role,
            )
            .filter(
              (value) =>
                value &&
                value !== "-",
            ),
        ),
      ],
      [
        activityParticipants,
      ],
    );

  const branches =
    useMemo(
      () => [
        ...new Set(
          activityParticipants
            .map(
              (item) =>
                item.branch,
            )
            .filter(
              (value) =>
                value &&
                value !== "-",
            ),
        ),
      ],
      [
        activityParticipants,
      ],
    );

  const filteredParticipants =
    useMemo(() => {
      const query =
        searchQuery
          .trim()
          .toLowerCase();

      const selectedDateValue =
        selectedDate instanceof
        Date
          ? selectedDate
              .toISOString()
              .slice(0, 10)
          : selectedDate ||
            "";

      return activityParticipants.filter(
        (participant) => {
          const name =
            participant
              .name
              ?.toLowerCase() ||
            "";

          const email =
            participant
              .email
              ?.toLowerCase() ||
            "";

          const matchesSearch =
            !query ||
            name.includes(
              query,
            ) ||
            email.includes(
              query,
            );

          const matchesRole =
            selectedRole ===
              "all" ||
            participant
              .role ===
              selectedRole;

          const matchesBranch =
            selectedBranch ===
              "all" ||
            participant
              .branch ===
              selectedBranch;

          const matchesDate =
            !selectedDateValue ||
            participant
              .joinedDateValue ===
              selectedDateValue;

          return (
            matchesSearch &&
            matchesRole &&
            matchesBranch &&
            matchesDate
          );
        },
      );
    }, [
      activityParticipants,
      searchQuery,
      selectedRole,
      selectedBranch,
      selectedDate,
    ]);

  const handleDownloadReport = () => {
    const exportRows = filteredParticipants.map(
      (participant, index) => ({
        ...participant,
        no: index + 1,
      }),
    );

    downloadTableAsExcel({
      data: exportRows,
      columns: PARTICIPANTS_EXPORT_COLUMNS,
      fileName: `participants-${activity?.name || activity?.id || id || "report"}`,
    });
  };

  const columns =
    useMemo(
      () => [
        {
          key: "no",

          label: "ល.រ",

          width: "5%",

          align:
            "center",

          render:
            (
              _row,
              index,
            ) =>
              index +
              1,
        },

        {
          key: "name",

          label:
            "ឈ្មោះអ្នកចូលរួម",

          width: "20%",

          render:
            (row) => (
              <div>
                <p className="font-semibold text-text-primary">
                  {row.name ||
                    "-"}
                </p>

                <p className="text-xs text-text-secondary">
                  {row.email ||
                    "-"}
                </p>
              </div>
            ),
        },

        {
          key:
            "gender",

          label: "ភេទ",

          width: "10%",

          align:
            "center",

          render:
            (row) =>
              row.gender ||
              "-",
        },

        {
          key: "role",

          label:
            "តួនាទី",

          width: "10%",

          align:
            "center",

          render:
            (row) =>
              row.role ||
              "-",
        },

        {
          key:
            "branch",

          label: "សាខា",

          width: "10%",

          align:
            "center",

          render:
            (row) =>
              row.branch ||
              "-",
        },

        {
          key:
            "joinedDate",

          label:
            "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម",

          width: "12%",

          align:
            "center",

          render:
            (row) =>
              row.joinedDate ||
              "-",
        },

        {
          key:
            "isInvited",

          label:
            "ស្ថានភាពអញ្ជើញ",

          width: "12%",

          align:
            "center",

          render:
            (row) => (
              <StatusBadge
                status={
                  row.isInvited
                    ? "បានអញ្ជើញ"
                    : "មិនបានអញ្ជើញ"
                }
              />
            ),
        },

        {
          key:
            "isParticipated",

          label:
            "ស្ថានភាពចូលរួម",

          width: "14%",

          align:
            "center",

          render:
            (row) => (
              <StatusBadge
                status={
                  row.isParticipated
                    ? "បានចូលរួម"
                    : "មិនបានចូលរួម"
                }
              />
            ),
        },

        {
          key:
            "actions",

          label:
            "សកម្មភាព",

          width: "7%",

          align:
            "center",

          render:
            (row) => (
              <button
                type="button"
                onClick={() =>
                  setPreviewMember(
                    row,
                  )
                }
                aria-label={`មើលព័ត៌មាន ${row.name || "សមាជិក"}`}
                className="mx-auto flex w-fit rounded-md p-1 text-primary transition hover:bg-primary-light"
              >
                <Eye
                  size={17}
                />
              </button>
            ),
        },
      ],
      [],
    );

  /*
   * Both authorized branches may
   * edit attendance.
   *
   * There is NO "must complete"
   * frontend restriction anymore.
   */
  const canEditParticipation =
    Boolean(
      getValue(
        activity,
        "canManage",
        "can_manage",
      ) ||
        getValue(
          activity,
          "canManageAsInvitedBranch",
          "can_manage_as_invited_branch",
        ),
    );

  async function handleSaveParticipation(
    updatedParticipants,
  ) {
    setSaveError("");

    const currentByMemberId =
      new Map(
        activityParticipants.map(
          (participant) => [
            participant.memberId,
            participant,
          ],
        ),
      );

    const changedParticipants =
      updatedParticipants.filter(
        (participant) => {
          const current =
            currentByMemberId.get(
              participant.memberId,
            );

          return (
            current &&
            current
              .isParticipated !==
              participant
                .isParticipated
          );
        },
      );

    try {
      /*
       * Do sequentially so the
       * failing member is not hidden
       * by Promise.all.
       */
      for (
        const participant
        of changedParticipants
      ) {
        const response =
          await fetch(
            `/api/backend/activities/${encodeURIComponent(
              id,
            )}/attendance/status`,
            {
              method:
                "PATCH",

              headers: {
                "Content-Type":
                  "application/json",
              },

              body:
                JSON.stringify({
                  member_id:
                    Number(
                      participant
                        .memberId,
                    ),

                  attendance_status:
                    participant
                      .isParticipated
                      ? "PRESENT"
                      : "ABSENT",
                }),
            },
          );

        const body =
          await response
            .json()
            .catch(
              () => null,
            );

        if (
          !response.ok
        ) {
          throw new Error(
            body?.message ||
              `Request failed (${response.status})`,
          );
        }
      }

      setActivityParticipants(
        updatedParticipants,
      );

      /*
       * Host summary is global and
       * therefore must be refreshed.
       */
      if (isHostBranch) {
        await refreshSummary();
      }

      setIsEditOpen(
        false,
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "មានបញ្ហាកើតឡើង";

      setSaveError(
        message,
      );

      throw error;
    }
  }

  if (isMember) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
        អ្នកមិនមានសិទ្ធិមើលទំព័រនេះទេ
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6 text-center text-text-secondary">
        កំពុងផ្ទុក...
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
        {loadError}
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="rounded-xl border border-border bg-bg-page-white p-6 text-center text-text-secondary">
        មិនអាចរកឃើញកម្មវិធីនេះទេ
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="mb-1">
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link
            href="/activity"
            className="hover:text-primary"
          >
            កម្មវិធី
          </Link>

          <ChevronRight
            size={14}
          />

          <Link
            href={`/activity/${activity.id}`}
            className="hover:text-primary"
          >
            ព័ត៌មានលម្អិត
          </Link>

          <ChevronRight
            size={14}
          />

          <span className="font-semibold text-primary">
            សមាសភាពចូលរួម
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">
          {activity.name}
        </h1>
      </div>

      <ParticipantStats
        total={
          displayedSummary.total
        }
        attended={
          displayedSummary.attended
        }
        absent={
          displayedSummary
            .notAttended
        }

        /*
         * HOST = 4 cards.
         *
         * INVITED = old 3 cards.
         */
        showInvitedBranch={
          isHostBranch
        }

        invitedBranch={
          globalSummary
            .invitedBranchParticipants
        }
      />

      {saveError && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {saveError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-page-white p-4">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <SearchBar
            value={
              searchQuery
            }
            onChange={
              setSearchQuery
            }
            placeholder="ស្វែងរកសមាជិក..."
            width="w-full sm:w-[300px]"
          />

          <FilterBar
            filters={[
              {
                key: "role",

                value:
                  selectedRole,

                onChange:
                  setSelectedRole,

                placeholder:
                  "តួនាទី",

                options:
                  roles,
              },

              {
                key:
                  "branch",

                value:
                  selectedBranch,

                onChange:
                  setSelectedBranch,

                placeholder:
                  "សាខា",

                options:
                  branches,
              },

              {
                key: "date",

                value:
                  selectedDate,

                onChange:
                  setSelectedDate,

                placeholder:
                  "ថ្ងៃ/ខែ/ឆ្នាំ",

                type:
                  "date",
              },
            ]}
          />

          <div className="ml-auto flex items-center gap-3">
            {/*
             * NO completed requirement.
             *
             * Host and accepted invited
             * branch can edit their own
             * branch attendance.
             */}
            {canEditParticipation && (
              <button
                type="button"

                onClick={() =>
                  setIsEditOpen(
                    true,
                  )
                }

                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-success px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Pencil
                  size={16}
                />

                កែប្រែការចូលរួម
              </button>
            )}

            <Button
              icon={
                RiDownloadCloud2Line
              }
              onClick={
                handleDownloadReport
              }
            >
              ទាញយករបាយការណ៍
            </Button>
          </div>
        </div>

        <Table
          columns={
            columns
          }

          data={
            filteredParticipants
          }

          rowsPerPage={10}

          emptyMessage="មិនមានសមាជិកចូលរួមទេ"
        />
      </div>

      <ParticipationEditModal
        open={
          isEditOpen
        }

        participants={
          activityParticipants
        }

        onClose={() =>
          setIsEditOpen(
            false,
          )
        }

        onSave={
          handleSaveParticipation
        }
      />

      {previewMember && (
        <MemberPreviewModal
          member={
            previewMember
          }

          onClose={() =>
            setPreviewMember(
              null,
            )
          }
        />
      )}
    </div>
  );
}
