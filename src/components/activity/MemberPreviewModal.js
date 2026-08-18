"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import MemberInfoCard from "@/components/card/memberInfoCard";

/*
 * The "Eye" preview in MemberSelectModal only has access to the
 * lightweight row shown in that table (id, name, email, gender, role,
 * branch, joinedDate, profileImage, status) — it never carried phone,
 * date of birth, nationality, ethnicity, or a joined date under the key
 * MemberInfoCard actually reads (joined_on/joinedOn/joinedAt), so those
 * fields always rendered as "-" here even though the same card works
 * fine on the member's real profile page. Fetch the full member record
 * (the same endpoint the profile page/layout uses) as soon as the modal
 * opens so the preview shows real data instead of just the summary row.
 */
async function fetchJson(path, signal) {
  const response = await fetch(`/api${path}`, {
    method: "GET",
    headers: { Accept: "application/json" },
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
        ? body?.message || body?.detail || body?.error
        : body;

    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return body;
}

/**
 * A read-only "quick look" at a member's brief info card (the same card used
 * on the member detail page), opened from the Eye action in
 * MemberSelectModal. Profile-photo editing is intentionally disabled here —
 * this is a preview, not the member's own profile page.
 */
export default function MemberPreviewModal({ member, onClose }) {
  const [fullMember, setFullMember] = useState(member);
  const [assignedBranches, setAssignedBranches] = useState([]);

  const memberId = member?.id ?? member?.memberId ?? member?.member_id;

  useEffect(() => {
    // Show whatever we already have immediately, then fill in the rest
    // once the full record comes back.
    setFullMember(member);
    setAssignedBranches([]);

    if (!memberId) {
      return undefined;
    }

    const controller = new AbortController();

    async function loadFullMember() {
      try {
        const data = await fetchJson(`/members/${memberId}`, controller.signal);
        const detail = data?.member || data;

        setFullMember((current) => ({ ...current, ...detail }));
      } catch (error) {
        if (error.name !== "AbortError") {
          // Keep showing the summary row we already had — the preview
          // just won't have the extra fields filled in.
          console.error("Cannot load member preview details:", error);
        }
      }
    }

    // Best-effort, same as the member profile layout: a secretary/branch
    // leader covering more than one branch gets the "+N" badge here too.
    async function loadAssignedBranches() {
      try {
        const personalInfo = await fetchJson(
          `/members/${memberId}/personal-info`,
          controller.signal,
        );

        setAssignedBranches(personalInfo?.assigned_branches || []);
      } catch {
        setAssignedBranches([]);
      }
    }

    loadFullMember();
    loadAssignedBranches();

    return () => controller.abort();
  }, [memberId, member]);

  if (!member) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 px-5"
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            aria-label="បិទ"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-bg-page-white text-text-secondary shadow-md transition hover:text-primary"
          >
            <X size={18} />
          </button>
        </div>

        <MemberInfoCard
          member={fullMember}
          allowProfileChange={false}
          assignedBranches={assignedBranches}
        />
      </div>
    </div>
  );
}
