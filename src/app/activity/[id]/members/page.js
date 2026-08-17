"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import MemberSelectModal from "@/components/activity/MemberSelectModal";
import { useAuth } from "@/context/AuthContext";
import { normalizeRole } from "@/lib/navigation";

/*
 * Lightweight member-invite entry point for an activity that is still
 * upcoming — reached from the "សមាសភាព" card on /activity/{id} instead of
 * routing through the large, mostly-disabled /activity/create?edit={id}
 * form. That form only ever exposes MemberSelectModal as a functional piece
 * for an invited-branch co-host (canManage stays edit-only there); this
 * page reuses the exact same modal component and the exact same
 * invite/participants-invite call, just without the surrounding form.
 *
 * Once the activity is completed, this route is not the right place to be —
 * attendance is ticked from /activity/{id}/participants instead, so this
 * page redirects there. The redirect logic lives here (not just in the
 * Detail page's link target) so a stale/bookmarked link to this page after
 * an activity completes still lands somewhere useful instead of a broken
 * invite flow.
 */

async function fetchApi(path, options = {}) {
  const response = await fetch(`/api/backend${path}`, {
    cache: "no-store",
    headers: { Accept: "application/json", ...(options.headers || {}) },
    ...options,
  });
  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }

  return body;
}

function getValue(record, camelKey, snakeKey) {
  return record?.[camelKey] ?? record?.[snakeKey];
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

function getMemberProfileImage(member) {
  const profilePhoto = member?.profile_photo || member?.profilePhoto;
  const fileId = profilePhoto?.id || member?.profile_photo_id || member?.profilePhotoId;

  if (fileId) {
    return `/api/files/${fileId}/content`;
  }

  const value =
    profilePhoto?.url ||
    profilePhoto?.file_path ||
    profilePhoto?.filePath ||
    member?.profile_image ||
    member?.profileImage;

  if (!value) {
    return "/profiles/default-avatar.jpg";
  }

  try {
    const parsed = new URL(value);
    if (parsed.hostname === "localhost" && parsed.port === "8081") {
      return `/api/backend${parsed.pathname}${parsed.search}`;
    }
  } catch {
    // Relative frontend and proxied API URLs can be used as-is.
  }

  return value;
}

function isCompletedActivity(activity) {
  const status = String(
    getValue(activity, "statusCode", "status_code") ??
      activity?.status?.code ??
      activity?.status ??
      "",
  ).trim().toLowerCase();

  if (status === "cancelled" || status === "canceled") {
    return false;
  }

  const endsAt = getValue(activity, "endsAt", "ends_at");
  const endTime = new Date(endsAt).getTime();

  return (
    status === "completed" ||
    status === "បានបញ្ចប់" ||
    (Number.isFinite(endTime) && Date.now() >= endTime)
  );
}

export default function ActivityMembersPage({ params }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  const isMember = normalizeRole(user?.role) === "member";

  const [activityName, setActivityName] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [redirecting, setRedirecting] = useState(false);

  const [memberOptions, setMemberOptions] = useState([]);
  const [existingParticipantIds, setExistingParticipantIds] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [memberLoadError, setMemberLoadError] = useState("");
  const [branchLabel, setBranchLabel] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setLoadError("");

      try {
        const [activityRecord, participants] = await Promise.all([
          fetchApi(`/activities/${id}`),
          fetchApi(`/activities/${id}/participants`).catch(() => []),
        ]);
        if (cancelled) return;

        if (isMember) {
          setRedirecting(true);
          router.replace(`/activity/${id}`);
          return;
        }

        const canManage = Boolean(getValue(activityRecord, "canManage", "can_manage"));
        const canManageAsInvitedBranch = Boolean(
          getValue(activityRecord, "canManageAsInvitedBranch", "can_manage_as_invited_branch"),
        );

        // Neither an activity's own host staff nor an accepted co-hosting
        // branch's staff — nothing to invite here, send them back to the
        // read-only detail page instead of showing an empty invite screen.
        if (!canManage && !canManageAsInvitedBranch) {
          setRedirecting(true);
          router.replace(`/activity/${id}`);
          return;
        }

        // Once completed, this is an attendance page's job, not an invite
        // flow's — see the file-level comment above.
        if (isCompletedActivity(activityRecord)) {
          setRedirecting(true);
          router.replace(`/activity/${id}/participants`);
          return;
        }

        // Host staff invite from their own (host) branch's roster; an
        // accepted co-hosting branch's staff can only ever invite from
        // their OWN branch's roster — never the host's — mirroring the
        // exact same split MemberSelectModal already uses inside
        // /activity/create?edit={id} (see isInvitedBranchOnly there).
        const branchId = canManage
          ? Number(getValue(activityRecord, "branchId", "branch_id"))
          : Number(
              getValue(
                activityRecord,
                "managedInvitedBranchId",
                "managed_invited_branch_id",
              ),
            );

        const existingIds = (Array.isArray(participants) ? participants : [])
          .map((participant) => Number(getValue(participant, "memberId", "member_id")))
          .filter((memberId) => Number.isFinite(memberId));

        if (cancelled) return;
        setActivityName(
          getValue(activityRecord, "titleKm", "title_km") ||
            getValue(activityRecord, "titleEn", "title_en") ||
            "-",
        );
        setExistingParticipantIds(existingIds);
        setLoading(false);

        if (!Number.isFinite(branchId) || branchId <= 0) {
          setMemberLoadError("មិនអាចកំណត់អត្តសញ្ញាណសាខារបស់អ្នកទេ");
          return;
        }

        setMembersLoading(true);
        try {
          const [branches, page] = await Promise.all([
            fetch("/api/lookups/branches", { cache: "no-store" })
              .then((response) => response.json())
              .catch(() => []),
            fetchApi(`/members?branchId=${branchId}&page=0&size=100`),
          ]);
          if (cancelled) return;

          const branchOption = (Array.isArray(branches) ? branches : []).find(
            (option) => Number(option?.value ?? option?.id) === branchId,
          );
          const resolvedBranchLabel = getOptionLabel(branchOption);
          setBranchLabel(resolvedBranchLabel);

          const records = Array.isArray(page) ? page : page?.content || [];
          setMemberOptions(
            records.map((member) => ({
              id: member.id,
              name: member.full_name_km || member.full_name_en || "-",
              email: member.email || "",
              gender: member.gender?.label_km || member.gender?.labelKm || member.gender?.code || "-",
              role: member.level?.label_km || member.level?.labelKm || member.level?.code || "-",
              branch: member.branch?.label_km || member.branch?.labelKm || resolvedBranchLabel,
              joinedDate: member.joined_on || "-",
              joinedDateValue: member.joined_on || "",
              profileImage: getMemberProfileImage(member),
              status: member.status?.label_km || member.status?.labelKm || member.status?.code || "-",
            })),
          );
        } catch (error) {
          console.error("Load activity members error:", error);
          if (!cancelled) {
            setMemberOptions([]);
            setMemberLoadError(error.message || "Unable to load members for this branch.");
          }
        } finally {
          if (!cancelled) setMembersLoading(false);
        }
      } catch (error) {
        console.error("Load activity error:", error);
        if (!cancelled) {
          setLoadError(error.message || "Something went wrong");
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id, isMember, router]);

  const handleClose = () => {
    router.push(`/activity/${id}`);
  };

  /*
   * Mirrors CreateActivityPage.handleMemberModalSave's edit-mode branch
   * exactly: only members NOT already in existingParticipantIds are sent to
   * the invite endpoint, so re-opening this page and saving again never
   * re-invites (and never re-notifies) someone who already joined. On
   * failure the error is surfaced via alert and re-thrown so
   * MemberSelectModal keeps itself open instead of closing on a failed save.
   */
  const handleSaveMembers = async (selectedIds) => {
    const previouslyInvited = new Set(existingParticipantIds.map(Number));
    const newlySelectedIds = selectedIds
      .map(Number)
      .filter((memberId) => !previouslyInvited.has(memberId));

    if (newlySelectedIds.length === 0) return;

    try {
      await fetchApi(`/activities/${id}/participants/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ member_ids: newlySelectedIds }),
      });
      setExistingParticipantIds((current) => [...current, ...newlySelectedIds]);
    } catch (error) {
      console.error("Invite members error:", error);
      alert(error.message || "មិនអាចអញ្ជើញសមាជិកបានទេ");
      throw error;
    }
  };

  const breadcrumb = (
    <div className="mb-1 flex items-center gap-1 text-sm text-text-secondary">
      <Link href="/activity" className="hover:text-primary">
        កម្មវិធី
      </Link>

      <ChevronRight size={14} />

      <Link href={`/activity/${id}`} className="hover:text-primary">
        ព័ត៌មានលម្អិត
      </Link>

      <ChevronRight size={14} />

      <span className="font-semibold text-primary">អញ្ជើញសមាជិក</span>
    </div>
  );

  if (isMember || redirecting) {
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
      <h1 className="text-2xl font-bold text-secondary">{activityName}</h1>

      <MemberSelectModal
        onClose={handleClose}
        members={memberOptions}
        selectedIds={existingParticipantIds}
        onSave={handleSaveMembers}
        branchName={branchLabel}
        loading={membersLoading}
        error={memberLoadError}
      />
    </div>
  );
}
