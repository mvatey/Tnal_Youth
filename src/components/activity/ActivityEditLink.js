"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { useBranch } from "@/context/BranchContext";

/**
 * The activity detail page is server-rendered, but the selected sidebar branch
 * is client state. Keep the Edit Activity control hidden when that active
 * branch is an accepted invited branch rather than the activity host branch.
 * The backend remains the final host-only authorization check.
 */
export default function ActivityEditLink({ activityId, hostBranchId, canManage, label }) {
  const { selectedBranch = "all" } = useBranch();

  const viewingInvitedBranch =
    selectedBranch !== "all" &&
    String(selectedBranch) !== String(hostBranchId);

  if (!canManage || viewingInvitedBranch) {
    return null;
  }

  return (
    <Link
      href={`/activity/create?edit=${activityId}`}
      className="flex h-[34px] items-center gap-2 rounded-lg bg-secondary px-4 text-sm font-medium text-white hover:bg-secondary-hover"
    >
      <Pencil size={15} />
      {label}
    </Link>
  );
}
