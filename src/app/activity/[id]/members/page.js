"use client";

import {
  use,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import Link from "next/link";

import {
  ChevronRight,
} from "lucide-react";

import MemberSelectModal from "@/components/activity/MemberSelectModal";
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

/*
 * /api/backend/[...path]/route.js only forwards to a hardcoded
 * allowlist of backend roots, and "branches" isn't one of them —
 * fetchApi("/branches/...") 404s with "This backend API path is not
 * allowed." Branch endpoints instead go through their own dedicated
 * Next.js route (/api/branches/[branchId]/..., same one the Branch
 * page already uses successfully), so this hits /api directly
 * instead of /api/backend.
 */
async function fetchBranchesApi(
  path,
) {
  const response = await fetch(
    `/api${path}`,
    {
      cache: "no-store",

      headers: {
        Accept: "application/json",
      },
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

function getOptionLabel(option) {
  return (
    option?.labelKm ||
    option?.label_km ||
    option?.nameKm ||
    option?.name_km ||
    option?.labelEn ||
    option?.label_en ||
    option?.nameEn ||
    option?.name_en ||
    option?.branchCode ||
    option?.code ||
    ""
  );
}

const ROLE_LABELS_KM = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  BRANCH_LEADER: "ប្រធានសាខា",
  SECRETARY: "លេខាធិការ",
  MEMBER: "សមាជិក",
};

/*
 * The account role (member / secretary / branch leader) — NOT the
 * member_level ("កាំ") rank, which is a different field entirely and
 * was being shown here by mistake.
 *
 * Confirmed against the backend response DTOs: MemberListResponse
 * (the old /members?branchId=... source) has NO role field at all —
 * this table's role column could never have worked against it.
 * BranchMemberTableItemResponse (/branches/{id}/members, below) has
 * a `role` field — a UserRole enum, which Jackson serializes as its
 * plain enum name (e.g. "BRANCH_LEADER").
 */
function getMemberRoleLabel(
  member,
) {
  const code = String(
    member?.role || "",
  ).toUpperCase();

  return (
    ROLE_LABELS_KM[code] || "-"
  );
}

const GENDER_LABELS_KM = {
  MALE: "ប្រុស",
  FEMALE: "ស្រី",
  MONK: "ព្រះសង្ឃ",
};

/*
 * BranchMemberTableItemResponse's `gender` is also a plain enum name
 * (e.g. "MALE"), not the { label_km, code } lookup object
 * MemberListResponse used — different DTO, different shape.
 */
function getMemberGenderLabel(
  member,
) {
  const code = String(
    member?.gender || "",
  ).toUpperCase();

  return (
    GENDER_LABELS_KM[code] ||
    (member?.gender ?? "-")
  );
}

function getMemberProfileImage(
  member,
) {
  const profilePhoto =
    member?.profile_photo ||
    member?.profilePhoto;

  const fileId =
    profilePhoto?.id ||
    member?.profile_photo_id ||
    member?.profilePhotoId;

  if (fileId) {
    return `/api/files/${fileId}/content`;
  }

  return (
    profilePhoto?.url ||
    profilePhoto?.file_path ||
    profilePhoto?.filePath ||
    member?.profile_image ||
    member?.profileImage ||
    "/profiles/default-avatar.jpg"
  );
}

function isCompletedActivity(
  activity,
) {
  const status = String(
    getValue(
      activity,
      "statusCode",
      "status_code",
    ) ??
      activity?.status?.code ??
      activity?.status ??
      "",
  )
    .trim()
    .toLowerCase();

  const endsAt =
    getValue(
      activity,
      "endsAt",
      "ends_at",
    );

  const endTime =
    new Date(
      endsAt,
    ).getTime();

  return (
    status === "completed" ||
    (
      Number.isFinite(
        endTime,
      ) &&
      Date.now() >=
        endTime
    )
  );
}

export default function ActivityMembersPage({
  params,
}) {
  const { id } =
    use(params);

  const router =
    useRouter();

  const { user } =
    useAuth();

  const isMember =
    normalizeRole(
      user?.role,
    ) === "member";

  const [
    activityName,
    setActivityName,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState("");

  const [
    redirecting,
    setRedirecting,
  ] = useState(false);

  const [
    memberOptions,
    setMemberOptions,
  ] = useState([]);

  const [
    existingParticipantIds,
    setExistingParticipantIds,
  ] = useState([]);

  const [
    membersLoading,
    setMembersLoading,
  ] = useState(false);

  const [
    memberLoadError,
    setMemberLoadError,
  ] = useState("");

  const [
    branchLabel,
    setBranchLabel,
  ] = useState("");

  useEffect(() => {
    let cancelled =
      false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const [
          activityRecord,
          participants,
        ] = await Promise.all([
          fetchApi(
            `/activities/${id}`,
          ),

          fetchApi(
            `/activities/${id}/participants`,
          ).catch(() => []),
        ]);

        if (cancelled) {
          return;
        }

        if (isMember) {
          setRedirecting(true);

          router.replace(
            `/activity/${id}`,
          );

          return;
        }

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

        if (
          !canManage &&
          !canManageAsInvitedBranch
        ) {
          setRedirecting(true);

          router.replace(
            `/activity/${id}`,
          );

          return;
        }

        if (
          isCompletedActivity(
            activityRecord,
          )
        ) {
          setRedirecting(true);

          router.replace(
            `/activity/${id}/participants`,
          );

          return;
        }

        /*
         * Host:
         * → host branch.
         *
         * Invited:
         * → own accepted invited branch.
         */
        const branchId =
          canManage
            ? Number(
                getValue(
                  activityRecord,
                  "branchId",
                  "branch_id",
                ),
              )
            : Number(
                getValue(
                  activityRecord,
                  "managedInvitedBranchId",
                  "managed_invited_branch_id",
                ),
              );

        /*
         * Because /participants is scoped
         * by backend, invited branch receives
         * only its own existing participants.
         */
        const existingIds =
          asList(participants)
            .map((participant) =>
              Number(
                getValue(
                  participant,
                  "memberId",
                  "member_id",
                ),
              ),
            )
            .filter(
              Number.isFinite,
            );

        setActivityName(
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
        );

        setExistingParticipantIds(
          existingIds,
        );

        setLoading(false);

        if (
          !Number.isFinite(
            branchId,
          ) ||
          branchId <= 0
        ) {
          setMemberLoadError(
            "មិនអាចកំណត់អត្តសញ្ញាណសាខារបស់អ្នកទេ",
          );

          return;
        }

        setMembersLoading(true);

        try {
          const [
            branches,
            memberPage,
          ] = await Promise.all([
            fetch(
              "/api/lookups/branches",
              {
                cache:
                  "no-store",
              },
            )
              .then(
                (response) =>
                  response.json(),
              )
              .catch(
                () => [],
              ),

            /*
             * IMPORTANT:
             * Load ALL branch members.
             *
             * Do not remove already-invited
             * members.
             *
             * Uses /branches/{id}/members (BranchMemberTableItemResponse)
             * rather than the generic /members?branchId=... list —
             * only this endpoint's response includes the member's
             * account role, which this table needs to show.
             */
            fetchBranchesApi(
              `/branches/${branchId}/members?page=0&size=100`,
            ),
          ]);

          if (cancelled) {
            return;
          }

          const branchOption =
            asList(branches).find(
              (option) =>
                Number(
                  option?.value ??
                    option?.id,
                ) ===
                branchId,
            );

          const resolvedBranchLabel =
            getOptionLabel(
              branchOption,
            );

          setBranchLabel(
            resolvedBranchLabel,
          );

          const records =
            asList(
              memberPage,
            );

          setMemberOptions(
            records.map(
              (member) => ({
                id:
                  Number(
                    member.id,
                  ),

                name:
                  member
                    .full_name_km ||
                  member
                    .fullNameKm ||
                  member
                    .full_name_en ||
                  member
                    .fullNameEn ||
                  "-",

                email:
                  member.email ||
                  "",

                gender:
                  getMemberGenderLabel(
                    member,
                  ),

                role:
                  getMemberRoleLabel(
                    member,
                  ),

                branch:
                  member
                    .branch
                    ?.label_km ||
                  member
                    .branch
                    ?.labelKm ||
                  resolvedBranchLabel,

                joinedDate:
                  member
                    .joined_on ||
                  member
                    .joinedOn ||
                  "-",

                joinedDateValue:
                  member
                    .joined_on ||
                  member
                    .joinedOn ||
                  "",

                profileImage:
                  getMemberProfileImage(
                    member,
                  ),

                status:
                  member
                    .status_label_km ||
                  member
                    .statusLabelKm ||
                  member
                    .status_label_en ||
                  member
                    .statusLabelEn ||
                  member
                    .status_code ||
                  member
                    .statusCode ||
                  "-",
              }),
            ),
          );
        } catch (error) {
          if (!cancelled) {
            setMemberOptions(
              [],
            );

            setMemberLoadError(
              error instanceof Error
                ? error.message
                : "Unable to load members.",
            );
          }
        } finally {
          if (!cancelled) {
            setMembersLoading(
              false,
            );
          }
        }
      } catch (error) {
        if (!cancelled) {
          setLoadError(
            error instanceof Error
              ? error.message
              : "Something went wrong",
          );

          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [
    id,
    isMember,
    router,
  ]);

  function handleClose() {
    router.push(
      `/activity/${id}`,
    );
  }

  async function handleSaveMembers(
    selectedIds,
  ) {
    const previouslyInvited =
      new Set(
        existingParticipantIds.map(
          Number,
        ),
      );

    /*
     * Send ONLY new invitations.
     */
    const newlySelectedIds =
      selectedIds
        .map(Number)
        .filter(
          (memberId) =>
            !previouslyInvited.has(
              memberId,
            ),
        );

    if (
      newlySelectedIds.length ===
      0
    ) {
      return;
    }

    try {
      await fetchApi(
        `/activities/${id}/participants/invite`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            member_ids:
              newlySelectedIds,
          }),
        },
      );

      setExistingParticipantIds(
        (current) => [
          ...new Set([
            ...current,
            ...newlySelectedIds,
          ]),
        ],
      );
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "មិនអាចអញ្ជើញសមាជិកបានទេ",
      );

      throw error;
    }
  }

  const breadcrumb = (
    <div className="mb-1 flex items-center gap-1 text-sm text-text-secondary">
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
        href={`/activity/${id}`}
        className="hover:text-primary"
      >
        ព័ត៌មានលម្អិត
      </Link>

      <ChevronRight
        size={14}
      />

      <span className="font-semibold text-primary">
        អញ្ជើញសមាជិក
      </span>
    </div>
  );

  if (
    isMember ||
    redirecting
  ) {
    return null;
  }

  if (loading) {
    return (
      <div className="space-y-5">
        {breadcrumb}

        <div className="rounded-xl border border-border bg-bg-page-white p-6 text-center text-text-secondary">
          កំពុងផ្ទុក...
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="space-y-5">
        {breadcrumb}

        <div className="rounded-xl border border-error/30 bg-error-bg p-6 text-center text-error">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {breadcrumb}

      <h1 className="text-2xl font-bold text-secondary">
        {activityName}
      </h1>

      <MemberSelectModal
        onClose={
          handleClose
        }

        /*
         * ALL members in branch.
         */
        members={
          memberOptions
        }

        /*
         * Existing participants stay checked.
         */
        selectedIds={
          existingParticipantIds
        }

        lockedIds={
          existingParticipantIds
        }

        onSave={
          handleSaveMembers
        }

        branchName={
          branchLabel
        }

        loading={
          membersLoading
        }

        error={
          memberLoadError
        }
      />
    </div>
  );
}