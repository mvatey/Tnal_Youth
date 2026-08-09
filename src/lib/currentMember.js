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
function lookupLabel(value) {
  if (!value) return "-";
  if (typeof value === "string") return value;
  return value.label_km || value.labelKm || value.label_en || value.labelEn || value.code || "-";
}

function fileUrl(file, fallback) {
  const id = file?.id;
  if (id) return `/api/files/${id}/content`;

  const value = file?.file_path || file?.filePath || file?.url || fallback;
  if (!value) return "/member.png";

  try {
    const parsed = new URL(value);
    if (parsed.hostname === "localhost" && parsed.port === "8081") {
      return `/api/backend${parsed.pathname}`;
    }
  } catch {
    // Relative URLs are already safe for the browser.
  }
  return value;
}

export function combineAuthUserWithMember(authUser, memberDetail = null) {
  if (!authUser) {
    return null;
  }

  const memberId =
    authUser.memberId ??
    authUser.member_id ??
    null;
  const backendRole = normalizeRole(authUser.role);

  const detail = memberDetail || {};
  const profilePhoto = detail.profile_photo || detail.profilePhoto;
  const cvFile = detail.cv_file || detail.cvFile;

  return {
    ...authUser,
    ...detail,
    id: memberId,
    memberId,
    userId: authUser.id ?? authUser.userId ?? null,
    name_kh:
      detail.full_name_km ||
      detail.fullNameKm ||
      authUser.fullNameKm ||
      authUser.full_name_km ||
      "-",
    name_en:
      detail.full_name_en ||
      detail.fullNameEn ||
      authUser.fullNameEn ||
      authUser.full_name_en ||
      "-",
    phone: detail.phone || authUser.phone || "-",
    email: detail.email || authUser.email || "-",
    role:
      AUTH_ROLE_TO_UI_ROLE[backendRole] ||
      backendRole.toLowerCase() ||
      "member",
    profile_photo: fileUrl(profilePhoto, authUser.profileImage || authUser.profile_image),
    profileImage: fileUrl(profilePhoto, authUser.profileImage || authUser.profile_image),
    profilePhotoId: profilePhoto?.id ?? null,
    cvFileId: cvFile?.id ?? null,
    cvFile,
    status: detail.status ? lookupLabel(detail.status) : authUser.status || "ACTIVE",
    statusId: detail.status?.id ?? null,
    branch:
      detail.branch?.nameKm ||
      detail.branch?.name_km ||
      authUser.branchNameKm ||
      authUser.branchNameEn ||
      "-",
    branchId: detail.branch_id ?? detail.branchId ?? detail.branch?.id ?? null,
    gender: detail.gender || authUser.gender || "-",
    religion: lookupLabel(detail.religion),
    religionId: detail.religion?.id ?? null,
    joinedAt: detail.joined_on || detail.joinedOn || authUser.joinedAt || "-",
    date_of_birth:
      detail.date_of_birth ||
      detail.dateOfBirth ||
      authUser.dateOfBirth ||
      authUser.date_of_birth ||
      "-",
    placeOfBirth: detail.place_of_birth || detail.placeOfBirth || "",
    currentAddress: detail.current_address || detail.currentAddress || "",
    permanentAddress: detail.permanent_address || detail.permanentAddress || "",
    bio: detail.bio || "",
    nationality: lookupLabel(detail.nationality),
    nationalityId: detail.nationality?.id ?? null,
    ethnicity: lookupLabel(detail.ethnicity),
    ethnicityId: detail.ethnicity?.id ?? null,
    level: lookupLabel(detail.level),
    levelId: detail.level?.id ?? null,
    shirtSize: detail.tshirtSize || detail.tshirt_size || "-",
    isLinkedMember: Boolean(memberId && memberDetail),
    family: authUser.family || null,
    workHistory: authUser.workHistory || [],
    educationHistory: authUser.educationHistory || [],
  };
}

export default function getCurrentMember(authUser = null) {
  return combineAuthUserWithMember(authUser);
}
