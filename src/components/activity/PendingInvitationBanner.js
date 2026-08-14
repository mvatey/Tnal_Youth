"use client";

import { useCallback, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";

import useCurrentMember from "@/hooks/useCurrentMember";

function getValue(record, camelKey, snakeKey) {
  return record?.[camelKey] ?? record?.[snakeKey];
}

/*
 * Shown on an activity's detail page to the invited branch's own
 * secretary/branch leader when their branch has a PENDING invitation
 * to this activity — the only place in the app this can be accepted
 * or declined today. Once accepted, their branch's own members become
 * selectable on the participants page (see
 * app/activity/[id]/participants/page.js) and canManageParticipants
 * (returned by GET /activities/{id}) becomes true for their account.
 */
export default function PendingInvitationBanner({ activityId }) {
  const { member } = useCurrentMember();
  const [invitation, setInvitation] = useState(null);
  const [responding, setResponding] = useState(false);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState(false);

  const ownBranchId = Number(
    getValue(member, "branchId", "branch_id") ??
      getValue(member?.branch, "id") ??
      member?.branch?.id,
  );

  const loadInvitation = useCallback(async () => {
    if (!Number.isFinite(ownBranchId) || !activityId) return;

    try {
      const response = await fetch(
        `/api/backend/activities/${encodeURIComponent(activityId)}/invited-branches`,
        { cache: "no-store" },
      );
      const body = await response.json().catch(() => null);

      if (!response.ok) return;

      const rows = Array.isArray(body) ? body : Array.isArray(body?.data) ? body.data : [];

      const pendingForOwnBranch = rows.find((row) => {
        const branchId = Number(getValue(row, "branchId", "branch_id"));
        const status = String(
          getValue(row, "invitationStatus", "invitation_status") || "",
        ).toUpperCase();

        return branchId === ownBranchId && status === "PENDING";
      });

      setInvitation(pendingForOwnBranch || null);
    } catch {
      // A failed lookup just means no banner shows — not worth surfacing.
    }
  }, [activityId, ownBranchId]);

  useEffect(() => {
    loadInvitation();
  }, [loadInvitation]);

  if (!invitation || dismissed) {
    return null;
  }

  async function respond(status) {
    setResponding(true);
    setError("");

    try {
      const response = await fetch(
        `/api/backend/activities/${encodeURIComponent(activityId)}/invited-branches/${encodeURIComponent(invitation.id)}/respond`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invitation_status: status }),
        },
      );
      const body = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(body?.message || `Request failed (${response.status})`);
      }

      setDismissed(true);

      if (status === "ACCEPTED") {
        // canManageParticipants for this user only becomes true after a
        // fresh server-side render picks up the new ACCEPTED status.
        window.location.reload();
      }
    } catch (respondError) {
      setError(
        respondError instanceof Error
          ? respondError.message
          : "Something went wrong",
      );
    } finally {
      setResponding(false);
    }
  }

  return (
    <div className="rounded-xl border border-primary/30 bg-primary-light px-5 py-4">
      <p className="text-sm font-semibold text-primary">
        សាខារបស់អ្នកត្រូវបានអញ្ជើញឱ្យចូលរួមក្នុងកម្មវិធីនេះ
      </p>
      <p className="mt-1 text-xs text-text-secondary">
        ទទួលការអញ្ជើញ ដើម្បីអាចបន្ថែមសមាជិកនៃសាខារបស់អ្នកចូលរួមកម្មវិធីនេះបាន។
      </p>

      {error && <p className="mt-2 text-xs text-error">{error}</p>}

      <div className="mt-3 flex items-center gap-3">
        <button
          type="button"
          disabled={responding}
          onClick={() => respond("ACCEPTED")}
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-success px-4 text-xs font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
        >
          <CheckCircle2 size={15} />
          ទទួលការអញ្ជើញ
        </button>

        <button
          type="button"
          disabled={responding}
          onClick={() => respond("DECLINED")}
          className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-4 text-xs font-semibold text-text-secondary transition hover:bg-bg-page-gray disabled:opacity-60"
        >
          <XCircle size={15} />
          បដិសេធ
        </button>
      </div>
    </div>
  );
}
