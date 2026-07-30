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
 * Remove this after the backend returns a real memberId.
 */
const TEMP_MEMBER_MAP = {
  9: "1",
  // 10: "2",
  // 11: "3",
};

const AUTH_STORAGE_KEYS = [
  "user",
  "currentUser",
  "authUser",
  "tnal-user",
];

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase();
}

function findJsonMember(authUser) {
  if (!authUser) return {};

  const mappedMemberId = TEMP_MEMBER_MAP[authUser.id];

  return (
    members.find(
      (item) =>
        mappedMemberId &&
        String(item.id) === String(mappedMemberId),
    ) ||
    members.find(
      (item) =>
        authUser.email &&
        normalize(item.email) === normalize(authUser.email),
    ) ||
    members.find(
      (item) =>
        authUser.phone &&
        normalize(item.phone) === normalize(authUser.phone),
    ) ||
    members.find(
      (item) =>
        authUser.memberId &&
        String(item.id) === String(authUser.memberId),
    ) ||
    members.find(
      (item) =>
        authUser.id &&
        String(item.id) === String(authUser.id),
    ) ||
    {}
  );
}

export function combineAuthUserWithMember(authUser) {
  if (!authUser) return null;

  const jsonMember = findJsonMember(authUser);

  const normalizedRole =
    AUTH_ROLE_TO_JSON_ROLE[authUser.role] ||
    normalize(authUser.role) ||
    jsonMember.role ||
    "member";

  return {
    ...jsonMember,

    /*
     * Prefer memberId because authUser.id is normally the user-account ID,
     * not necessarily the member ID.
     */
    id:
      authUser.memberId ??
      jsonMember.id ??
      authUser.id ??
      null,

    userId: authUser.id ?? null,

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

    role: normalizedRole,

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

function readStoredAuthUser() {
  if (typeof window === "undefined") {
    return null;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) continue;

    try {
      const parsedValue = JSON.parse(storedValue);

      /*
       * Supports structures such as:
       * { user: {...} }
       * { data: {...} }
       * or a direct user object.
       */
      return (
        parsedValue?.user ||
        parsedValue?.data?.user ||
        parsedValue?.data ||
        parsedValue
      );
    } catch (error) {
      console.warn(
        `Cannot parse auth user from localStorage key "${key}":`,
        error,
      );
    }
  }

  return null;
}

export default function getCurrentMember(authUser = null) {
  const resolvedAuthUser =
    authUser || readStoredAuthUser();

  return combineAuthUserWithMember(resolvedAuthUser);
}