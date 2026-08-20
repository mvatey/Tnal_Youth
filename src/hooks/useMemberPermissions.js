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
    // Admin is oversight/read-only on member detail fields. Branch staff
    // perform the actual profile corrections.
    canEditMemberDetails: ["SECRETARY", "BRANCH_LEADER"].includes(role),
    canManageMemberAccount: ["ADMIN", "SECRETARY", "BRANCH_LEADER"].includes(role),
  };
}
