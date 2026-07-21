import members from "@/data/members.json";

const AUTH_ROLE_TO_JSON_ROLE = {
  ADMIN: "admin",
  SECRETARY: "secretary",
  BRANCH_LEADER: "branch_leader",
  MEMBER: "member",
};

/*
 * Temporary mapping:
 * backend user ID -> members.json member ID
 *
 * Replace these IDs with your real backend user IDs
 * and matching mock member IDs.
 */
const TEMP_MEMBER_MAP = {
  9: "1",
  // 10: "2",
  // 11: "3",
};

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

export function combineAuthUserWithMember(authUser) {
  if (!authUser) return null;

  const normalizedRole =
    AUTH_ROLE_TO_JSON_ROLE[authUser.role] ||
    normalize(authUser.role);

  const mappedMemberId = TEMP_MEMBER_MAP[authUser.id];

  const jsonMember =
    // 1. Explicit temporary mapping
    members.find(
      (item) =>
        mappedMemberId &&
        String(item.id) === String(mappedMemberId),
    ) ||

    // 2. Match by email
    members.find(
      (item) =>
        authUser.email &&
        normalize(item.email) === normalize(authUser.email),
    ) ||

    // 3. Match by phone
    members.find(
      (item) =>
        authUser.phone &&
        normalize(item.phone) === normalize(authUser.phone),
    ) ||

    // 4. Match by same ID
    members.find(
      (item) =>
        authUser.id &&
        String(item.id) === String(authUser.id),
    ) ||

    // No matching temporary member
    {};

  return {
    ...jsonMember,

    id: authUser.id ?? jsonMember.id,

    name_kh:
      authUser.fullNameKm ||
      jsonMember.name_kh ||
      "-",

    name_en:
      authUser.fullNameEn ||
      jsonMember.name_en ||
      "-",

    phone:
      authUser.phone ||
      jsonMember.phone ||
      "-",

    email:
      authUser.email ||
      jsonMember.email ||
      "-",

    role:
      normalizedRole ||
      jsonMember.role ||
      "member",

    profile_photo:
    authUser.profileImage ||
    jsonMember.profile_photo ||
    "/member.png",

    status:
      jsonMember.status ||
      "សកម្ម",

    branch:
      jsonMember.branch ||
      "-",

    gender:
      jsonMember.gender ||
      "-",

    religion:
      jsonMember.religion ||
      "-",

    joinedAt:
      jsonMember.joinedAt ||
      "-",

    date_of_birth:
      jsonMember.date_of_birth ||
      "-",

    nationality:
      jsonMember.nationality ||
      "-",

    ethnicity:
      jsonMember.ethnicity ||
      "-",

    family:
      jsonMember.family ||
      null,

    workHistory:
      jsonMember.workHistory ||
      [],

    educationHistory:
      jsonMember.educationHistory ||
      [],
  };
}