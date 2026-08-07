import { DEFAULT_MEMBER_PROFILE_PHOTO } from "@/lib/memberProfilePhoto";

const ROLE_MAP = { ADMIN: "admin", SECRETARY: "secretary", BRANCH_LEADER: "branch_leader", MEMBER: "member" };

/**
 * Converts the authenticated /api/auth/me response to the shape used by the
 * account layout. Profile and organisational records are never read from JSON
 * or browser storage; memberId is the database member primary key.
 */
export function combineAuthUserWithMember(authUser) {
  if (!authUser) return null;
  const memberId = authUser.memberId ?? authUser.member_id ?? null;
  return {
    ...authUser,
    id: memberId,
    memberId,
    userId: authUser.id ?? authUser.userId ?? null,
    name_kh: authUser.fullNameKm || authUser.full_name_km || "-",
    name_en: authUser.fullNameEn || authUser.full_name_en || "-",
    phone: authUser.phone || "-",
    email: authUser.email || "-",
    role: ROLE_MAP[authUser.role] || String(authUser.role || "member").toLowerCase(),
    profile_photo: authUser.profileImage || authUser.profile_image || DEFAULT_MEMBER_PROFILE_PHOTO,
    status: authUser.status || "ACTIVE",
    branch: authUser.branchNameKm || authUser.branchNameEn || "-",
  };
}

export default function getCurrentMember(authUser = null) {
  return combineAuthUserWithMember(authUser);
}
