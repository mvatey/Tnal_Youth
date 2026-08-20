"use client";

import useCurrentMember from "@/hooks/useCurrentMember";

export default function useMemberPermissions() {
  const { member, loading } = useCurrentMember();
  const rawRole = member?.role || member?.account_role || "";
  const role = String(
    typeof rawRole === "object"
      ? rawRole?.code || rawRole?.value || ""
      : rawRole,
  )
    .replace(/^ROLE_/i, "")
    .toUpperCase();
  return {
    role,
    loading,
    isAdmin: role === "ADMIN",
    // All roles that can manage the Member page can edit its detail tabs.
    // Admin was previously omitted here even though the backend authorizes
    // Admin and the Member list exposes the same management actions.
    canEditMemberDetails: ["ADMIN", "SECRETARY", "BRANCH_LEADER"].includes(role),
    canManageMemberAccount: ["ADMIN", "SECRETARY", "BRANCH_LEADER"].includes(role),
  };
}
