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

import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

async function fetchApi(
  path,
  options = {},
) {
  const response = await fetch(
    `/api/backend${path}`,
    {
      cache: "no-store",

      headers: {
        Accept: "application/json",
        ...(options.headers || {}),
      },

      ...options,
    },
  );

  const body = await response
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

  if (typeof value === "string") {
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

  if (Array.isArray(value?.content)) {
    return value.content;
  }

  if (Array.isArray(value?.items)) {
    return value.items;
  }

  return [];
}

function normalizeExistingParticipant(
  participant,
) {
  return {
    ...participant,

    memberId: Number(
      getValue(
        participant,
        "memberId",
        "member_id",
      ),
    ),

    branchId: Number(
      getValue(
        participant,
        "branchId",
        "branch_id",
      ),
    ),

    attendanceStatus: String(
      getValue(
        participant,
        "attendanceStatus",
        "attendance_status",
      ) || "",
    ).toUpperCase(),

    checkedInAt: getValue(
      participant,
      "checkedInAt",
      "checked_in_at",
    ),

    registrationSource: String(
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
  const { id } = use(params);

  const { user } = useAuth();

  const isMember =
    normalizeRole(user?.role) ===
    "member";

  const [
    activity,
    setActivity,
  ] = useState(null);

  /*
   * Table data.
   *
   * Host:
   * → host branch members only.
   *
   * Invited:
   * → invited branch members only.
   */
  const [
    activityParticipants,
    setActivityParticipants,
  ] = useState([]);

  /*
   * Global summary is used ONLY
   * for the host branch.
   */
  const [
    globalSummary,
    setGlobalSummary,
  ] = useState({
    total: 0,
    attended: 0,
    notAttended: 0,
    invitedBranchParticipants: 0,
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

  async function refreshGlobalSummary() {
    const summary = await fetchApi(
      `/activities/${id}/participants/summary`,
    );

    setGlobalSummary({
      total: Number(
        getValue(
          summary,
          "total",
          "total",
        ) ?? 0,
      ),

      attended: Number(
        getValue(
          summary,
          "attended",
          "attended",
        ) ?? 0,
      ),

      notAttended: Number(
        getValue(
          summary,
          "notAttended",
          "not_attended",
        ) ?? 0,
      ),

      invitedBranchParticipants: Number(
        getValue(
          summary,
          "invitedBranchParticipants",
          "invited_branch_participants",
        ) ?? 0,
      ),
    });
  }

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        /*
         * First get Activity Detail.
         */
        const activityRecord =
          await fetchApi(
            `/activities/${id}`,
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
         * Decide which branch roster
         * this user should see.
         */
        let rosterBranchId =
          hostBranchId;

        if (
          !canManage &&
          canManageAsInvitedBranch &&
          Number.isFinite(
            managedInvitedBranchId,
          ) &&
          managedInvitedBranchId > 0
        ) {
          rosterBranchId =
            managedInvitedBranchId;
        }

        if (
          !Number.isFinite(
            rosterBranchId,
          ) ||
          rosterBranchId <= 0
        ) {
          throw new Error(
            "Unable to determine activity branch.",
          );
        }

        const [
          memberPage,
          participantResponse,
          summaryResponse,
        ] = await Promise.all([
          /*
           * ALL members from current user's
           * permitted branch.
           */
          fetchApi(
            `/members?branchId=${rosterBranchId}&page=0&size=100`,
          ),

          /*
           * Backend returns only the participant
           * records belonging to this user's
           * permitted branch.
           */
          fetchApi(
            `/activities/${id}/participants`,
          ),

          /*
           * Global Activity totals.
           */
          fetchApi(
            `/activities/${id}/participants/summary`,
          ),
        ]);

        const members =
          asList(memberPage);

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

        const membersById =
          new Map(
            members.map((member) => [
              Number(member.id),
              member,
            ]),
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
              ?.attendanceStatus || "";

          const isInvited =
            Boolean(participant) &&
            participant
              .registrationSource !==
              "WALK_IN";

          return {
            id: memberId,
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
              ) || "-",

            role:
              getLabel(
                member?.level,
              ) || "-",

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
              participant?.branchId ||
              Number(
                getValue(
                  member,
                  "branchId",
                  "branch_id",
                ),
              ) ||
              Number(
                member?.branch?.id,
              ) ||
              rosterBranchId,

            joinedDateValue:
              joinedDateValue
                ? String(
                    joinedDateValue,
                  ).slice(0, 10)
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
         * Show ALL branch members.
         *
         * This preserves the old walk-in /
         * manual attendance flow.
         */
        for (const member of members) {
          const memberId =
            Number(member.id);

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
         * Keep participant history even if
         * member no longer appears in normal
         * branch list.
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
              membersById.get(
                participant.memberId,
              ) || {},
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
          total: Number(
            getValue(
              summaryResponse,
              "total",
              "total",
            ) ?? 0,
          ),

          attended: Number(
            getValue(
              summaryResponse,
              "attended",
              "attended",
            ) ?? 0,
          ),

          notAttended: Number(
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
              : "Something went wrong",
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
          setLoading(false);
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
   * Invited branch summary:
   * only this branch's own table.
   */
  const localSummary =
    useMemo(() => {
      const attended =
        activityParticipants.filter(
          (participant) =>
            participant
              .isParticipated === true,
        ).length;

      return {
        total:
          activityParticipants.length,

        attended,

        notAttended:
          Math.max(
            0,
            activityParticipants.length -
              attended,
          ),
      };
    }, [
      activityParticipants,
    ]);

  /*
   * Host gets global 4 cards.
   *
   * Invited branch gets local 3 cards.
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
              (participant) =>
                participant.role,
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
              (participant) =>
                participant.branch,
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
        selectedDate instanceof Date
          ? selectedDate
              .toISOString()
              .slice(0, 10)
          : selectedDate || "";

      return activityParticipants.filter(
        (participant) => {
          const name =
            participant.name
              ?.toLowerCase() || "";

          const email =
            participant.email
              ?.toLowerCase() || "";

          const matchesSearch =
            !query ||
            name.includes(query) ||
            email.includes(query);

          const matchesRole =
            selectedRole === "all" ||
            participant.role ===
              selectedRole;

          const matchesBranch =
            selectedBranch === "all" ||
            participant.branch ===
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

  const columns =
    useMemo(
      () => [
        {
          key: "no",
          label: "ល.រ",
          width: "5%",
          align: "center",

          render:
            (_row, index) =>
              index + 1,
        },

        {
          key: "name",
          label:
            "ឈ្មោះអ្នកចូលរួម",
          width: "20%",

          render: (row) => (
            <div>
              <p className="font-semibold text-text-primary">
                {row.name || "-"}
              </p>

              <p className="text-xs text-text-secondary">
                {row.email || "-"}
              </p>
            </div>
          ),
        },

        {
          key: "gender",
          label: "ភេទ",
          width: "10%",
          align: "center",

          render: (row) =>
            row.gender || "-",
        },

        {
          key: "role",
          label: "តួនាទី",
          width: "10%",
          align: "center",

          render: (row) =>
            row.role || "-",
        },

        {
          key: "branch",
          label: "សាខា",
          width: "10%",
          align: "center",

          render: (row) =>
            row.branch || "-",
        },

        {
          key: "joinedDate",
          label:
            "ថ្ងៃ/ខែ/ឆ្នាំ ចូលរួម",
          width: "12%",
          align: "center",

          render: (row) =>
            row.joinedDate || "-",
        },

        {
          key: "isInvited",
          label:
            "ស្ថានភាពអញ្ជើញ",
          width: "12%",
          align: "center",

          render: (row) => (
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
          key: "isParticipated",
          label:
            "ស្ថានភាពចូលរួម",
          width: "14%",
          align: "center",

          render: (row) => (
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
          key: "actions",
          label: "សកម្មភាព",
          width: "7%",
          align: "center",

          render: (row) => (
            <Link
              href={`/member/memberInfo/${row.memberId}/documents`}
              className="mx-auto flex w-fit rounded-md p-1 text-primary transition hover:bg-primary-light"
            >
              <Eye size={17} />
            </Link>
          ),
        },
      ],
      [],
    );

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
            current.isParticipated !==
              participant.isParticipated
          );
        },
      );

    try {
      /*
       * Do one by one so if one member
       * fails we know immediately.
       */
      for (
        const participant
        of changedParticipants
      ) {
        const response = await fetch(
          `/api/backend/activities/${encodeURIComponent(
            id,
          )}/attendance/status`,
          {
            method: "PATCH",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              member_id:
                Number(
                  participant.memberId,
                ),

              attendance_status:
                participant
                  .isParticipated
                  ? "PRESENT"
                  : "ABSENT",
            }),
          },
        );

        const body = await response
          .json()
          .catch(() => null);

        if (!response.ok) {
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
       * Host's global cards may change
       * after attendance editing.
       */
      if (isHostBranch) {
        await refreshGlobalSummary();
      }

      setIsEditOpen(false);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Something went wrong";

      setSaveError(message);

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
      <div>
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link
            href="/activity"
            className="hover:text-primary"
          >
            កម្មវិធី
          </Link>

          <ChevronRight size={14} />

          <Link
            href={`/activity/${activity.id}`}
            className="hover:text-primary"
          >
            ព័ត៌មានលម្អិត
          </Link>

          <ChevronRight size={14} />

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
          displayedSummary.notAttended
        }

        /*
         * Only host branch gets the
         * fourth card.
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
            value={searchQuery}
            onChange={
              setSearchQuery
            }
            placeholder="ស្វែងរកសមាជិក..."
            width="w-[300px]"
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
                options: roles,
              },

              {
                key: "branch",
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
                type: "date",
              },
            ]}
          />

          <div className="ml-auto flex items-center gap-3">
            {canEditParticipation && (
              <button
                type="button"
                onClick={() =>
                  setIsEditOpen(true)
                }
                className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-success px-5 text-sm font-semibold text-white transition hover:bg-emerald-700"
              >
                <Pencil size={16} />
                កែប្រែការចូលរួម
              </button>
            )}

            <Button
              icon={
                RiDownloadCloud2Line
              }
            >
              ទាញយករបាយការណ៍
            </Button>
          </div>
        </div>

        <Table
          columns={columns}
          data={
            filteredParticipants
          }
          rowsPerPage={10}
          emptyMessage="មិនមានសមាជិកចូលរួមទេ"
        />
      </div>

      <ParticipationEditModal
        open={isEditOpen}
        participants={
          activityParticipants
        }
        onClose={() =>
          setIsEditOpen(false)
        }
        onSave={
          handleSaveParticipation
        }
      />
    </div>
  );
}