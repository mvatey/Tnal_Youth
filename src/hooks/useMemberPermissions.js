"use client";

import useCurrentMember from "@/hooks/useCurrentMember";

export default function useMemberPermissions() {
  const { member, loading } = useCurrentMember();
  const role = String(member?.role || member?.account_role || "").toUpperCase();
  return {
    role,
    loading,
    isAdmin: role === "ADMIN",
    canEditMemberDetails: role === "SECRETARY" || role === "BRANCH_LEADER",
    canManageMemberAccount: ["ADMIN", "SECRETARY", "BRANCH_LEADER"].includes(role),
  };
}
