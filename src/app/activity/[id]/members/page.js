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

import {
  useAuth,
} from "@/context/AuthContext";

import {
  normalizeRole,
} from "@/lib/navigation";

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

function asList(value) {
  if (
    Array.isArray(value)
  ) {
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
    value.labelKm ||
    value.label_km ||
    value.labelEn ||
    value.label_en ||
    value.nameKm ||
    value.name_km ||
    value.nameEn ||
    value.name_en ||
    value.code ||
    ""
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
    member
      ?.profile_photo_id ||
    member
      ?.profilePhotoId;

  if (fileId) {
    return `/api/files/${fileId}/content`;
  }

  return (
    profilePhoto?.url ||
    profilePhoto
      ?.file_path ||
    profilePhoto
      ?.filePath ||
    member
      ?.profile_image ||
    member
      ?.profileImage ||
    "/profiles/default-avatar.jpg"
  );
}

function formatMemberDate(
  value,
) {
  if (!value) {
    return "-";
  }

  return String(
    value,
  ).slice(
    0,
    10,
  );
}

function isCompletedActivity(
  activity,
) {
  const status =
    String(
      getValue(
        activity,
        "statusCode",
        "status_code",
      ) ??
        activity
          ?.status
          ?.code ??
        activity
          ?.status ??
        "",
    )
      .trim()
      .toLowerCase();

  if (
    status ===
      "cancelled" ||
    status ===
      "canceled"
  ) {
    return false;
  }

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
    status ===
      "completed" ||
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
        ] =
          await Promise.all([
            fetchApi(
              `/activities/${id}`,
            ),

            /*
             * Backend participant list
             * is scoped to current staff
             * branch.
             */
            fetchApi(
              `/activities/${id}/participants`,
            ).catch(
              () => [],
            ),
          ]);

        if (cancelled) {
          return;
        }

        if (isMember) {
          setRedirecting(
            true,
          );

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

        /*
         * Only host staff or accepted
         * invited staff may invite.
         */
        if (
          !canManage &&
          !canManageAsInvitedBranch
        ) {
          setRedirecting(
            true,
          );

          router.replace(
            `/activity/${id}`,
          );

          return;
        }

        /*
         * Completed Activity:
         * go to participant composition.
         */
        if (
          isCompletedActivity(
            activityRecord,
          )
        ) {
          setRedirecting(
            true,
          );

          router.replace(
            `/activity/${id}/participants`,
          );

          return;
        }

        /*
         * HOST:
         * branchId = host.
         *
         * INVITED:
         * branchId =
         * managedInvitedBranchId.
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

        if (
          !Number.isFinite(
            branchId,
          ) ||
          branchId <= 0
        ) {
          throw new Error(
            "មិនអាចកំណត់សាខារបស់អ្នកបានទេ",
          );
        }

        /*
         * Already invited IDs.
         *
         * IMPORTANT:
         * We DO NOT remove them from
         * the member list.
         */
        const existingIds =
          asList(
            participants,
          )
            .map(
              (participant) =>
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

        setExistingParticipantIds(
          existingIds,
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

        setLoading(false);
        setMembersLoading(
          true,
        );

        try {
          const [
            branchesResponse,
            memberPage,
          ] =
            await Promise.all([
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
               * IMPORTANT FIX:
               *
               * Use the normal member
               * endpoint.
               *
               * This returns ALL branch
               * members, including:
               *
               * - members without account
               * - Secretary
               * - Branch Leader
               * - normal Member
               *
               * Do NOT use
               * /branches/{id}/members
               * for Activity invitation.
               */
              fetchApi(
                `/members?branchId=${branchId}&page=0&size=100`,
              ),
            ]);

          if (cancelled) {
            return;
          }

          const branchOptions =
            asList(
              branchesResponse,
            );

          const branchOption =
            branchOptions.find(
              (option) =>
                Number(
                  option?.value ??
                    option?.id,
                ) ===
                branchId,
            );

          const resolvedBranchLabel =
            getLabel(
              branchOption,
            );

          setBranchLabel(
            resolvedBranchLabel,
          );

          const records =
            asList(
              memberPage,
            );

          /*
           * NO filtering by:
           *
           * invited/not invited
           * account role
           * user account existence
           *
           * All branch members stay
           * visible.
           */
          setMemberOptions(
            records.map(
              (member) => {
                const joinedDate =
                  member
                    .joined_on ||
                  member
                    .joinedOn ||
                  "";

                return {
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
                    getLabel(
                      member.gender,
                    ) ||
                    "-",

                  /*
                   * Latest backend member
                   * list now contains
                   * account_role.
                   */
                  role:
                    getLabel(
                      member
                        .account_role ||
                        member
                          .accountRole,
                    ) ||
                    "-",

                  branch:
                    getLabel(
                      member.branch,
                    ) ||
                    resolvedBranchLabel ||
                    "-",

                  joinedDate:
                    formatMemberDate(
                      joinedDate,
                    ),

                  joinedDateValue:
                    joinedDate
                      ? String(
                          joinedDate,
                        ).slice(
                          0,
                          10,
                        )
                      : "",

                  profileImage:
                    getMemberProfileImage(
                      member,
                    ),

                  status:
                    getLabel(
                      member.status,
                    ) ||
                    "-",
                };
              },
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
      cancelled =
        true;
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
     * Send ONLY newly-selected IDs.
     *
     * Already invited users remain
     * visible + checked in modal,
     * but are not re-invited.
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
      handleClose();
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

          body:
            JSON.stringify({
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

      handleClose();
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
        {
          activityName
        }
      </h1>

      <MemberSelectModal
        onClose={
          handleClose
        }

        /*
         * ALL own-branch members:
         *
         * invited
         * +
         * not invited.
         */
        members={
          memberOptions
        }

        /*
         * Already invited:
         * checked.
         */
        selectedIds={
          existingParticipantIds
        }

        /*
         * Already invited:
         * locked so they cannot
         * accidentally be removed.
         */
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