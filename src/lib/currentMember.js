const AUTH_ROLE_TO_UI_ROLE = {
  ADMIN: "admin",
  SECRETARY: "secretary",
  BRANCH_LEADER: "branch_leader",
  MEMBER: "member",
};

function normalizeRole(value) {
  return String(value ?? "")
    .replace(/^ROLE_/i, "")
    .trim()
    .toUpperCase();
}

/**
 * Converts the authenticated backend user into the shape used by the V1 UI.
 * The database response remains the only source of identity and role data.
 */
export function combineAuthUserWithMember(authUser) {
  if (!authUser) {
    return null;
  }

  const memberId =
    authUser.memberId ??
    authUser.member_id ??
    null;
  const backendRole = normalizeRole(authUser.role);

  return {
    ...authUser,
    id: memberId,
    memberId,
    userId: authUser.id ?? authUser.userId ?? null,
    name_kh:
      authUser.fullNameKm ||
      authUser.full_name_km ||
      "-",
    name_en:
      authUser.fullNameEn ||
      authUser.full_name_en ||
      "-",
    phone: authUser.phone || "-",
    email: authUser.email || "-",
    role:
      AUTH_ROLE_TO_UI_ROLE[backendRole] ||
      backendRole.toLowerCase() ||
      "member",
    profile_photo:
      authUser.profileImage ||
      authUser.profile_image ||
      "/member.png",
    profileImage:
      authUser.profileImage ||
      authUser.profile_image ||
      "/member.png",
    status: authUser.status || "ACTIVE",
    branch:
      authUser.branchNameKm ||
      authUser.branchNameEn ||
      "-",
    gender: authUser.gender || "-",
    religion: authUser.religion || "-",
    joinedAt: authUser.joinedAt || "-",
    date_of_birth:
      authUser.dateOfBirth ||
      authUser.date_of_birth ||
      "-",
    nationality: authUser.nationality || "-",
    ethnicity: authUser.ethnicity || "-",
    level: authUser.level || "-",
    shirtSize: authUser.shirtSize || "-",
    family: authUser.family || null,
    workHistory: authUser.workHistory || [],
    educationHistory: authUser.educationHistory || [],
  };
}

export default function getCurrentMember(authUser = null) {
  return combineAuthUserWithMember(authUser);
}
