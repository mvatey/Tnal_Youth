import members from "@/data/members.json";

const AUTH_ROLE_TO_JSON_ROLE = {
  ADMIN: "admin",
  SECRETARY: "secretary",
  BRANCH_LEADER: "branch_leader",
  MEMBER: "member",
};

/*
 * Temporary backend user ID -> members.json member ID.
 *
 * IMPORTANT:
 * Set the correct mapping for each login account.
 *
 * Example:
 * backend user 9 = member JSON 3 (Phan Rithy)
 */
const TEMP_MEMBER_MAP = {
  9: "3",

  // Add the real mappings for your test users:
  // 10: "1",
  // 11: "2",
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
  if (!authUser) {
    return null;
  }

  /*
   * 1. Prefer the actual memberId returned by backend.
   */
  if (authUser.memberId !== undefined && authUser.memberId !== null) {
    const memberByMemberId = members.find(
      (member) =>
        String(member.id) ===
        String(authUser.memberId),
    );

    if (memberByMemberId) {
      return memberByMemberId;
    }
  }

  /*
   * 2. Temporary test mapping.
   */
  const mappedMemberId =
    TEMP_MEMBER_MAP[authUser.id];

  if (mappedMemberId) {
    const mappedMember = members.find(
      (member) =>
        String(member.id) ===
        String(mappedMemberId),
    );

    if (mappedMember) {
      return mappedMember;
    }
  }

  /*
   * 3. Match unique email.
   */
  if (authUser.email) {
    const memberByEmail = members.find(
      (member) =>
        normalize(member.email) ===
        normalize(authUser.email),
    );

    if (memberByEmail) {
      return memberByEmail;
    }
  }

  /*
   * 4. Match phone.
   */
  if (authUser.phone) {
    const memberByPhone = members.find(
      (member) =>
        normalize(member.phone) ===
        normalize(authUser.phone),
    );

    if (memberByPhone) {
      return memberByPhone;
    }
  }

  /*
   * Do not match authUser.id directly to member.id.
   *
   * Backend user ID and member ID are different entities.
   */
  return null;
}

export function combineAuthUserWithMember(authUser) {
  if (!authUser) {
    return null;
  }

  const jsonMember =
    findJsonMember(authUser);

  const normalizedRole =
    AUTH_ROLE_TO_JSON_ROLE[
      authUser.role
    ] ||
    normalize(authUser.role) ||
    jsonMember?.role ||
    "member";

  /*
   * When a JSON member is successfully matched,
   * use that member as the main source for all
   * profile information.
   *
   * Backend auth data is only fallback data.
   */
  return {
    ...(jsonMember || {}),

    id:
      jsonMember?.id ??
      authUser.memberId ??
      null,

    memberId:
      jsonMember?.id ??
      authUser.memberId ??
      null,

    userId:
      authUser.id ?? null,

    name_kh:
      jsonMember?.name_kh ||
      authUser.fullNameKm ||
      "-",

    name_en:
      jsonMember?.name_en ||
      authUser.fullNameEn ||
      "-",

    phone:
      jsonMember?.phone ||
      authUser.phone ||
      "-",

    email:
      jsonMember?.email ||
      authUser.email ||
      "-",

    role:
      normalizedRole,

    profile_photo:
      jsonMember?.profile_photo ||
      authUser.profileImage ||
      "/member.png",

    profileImage:
      jsonMember?.profile_photo ||
      authUser.profileImage ||
      "/member.png",

    status:
      jsonMember?.status ||
      "សកម្ម",

    branch:
      jsonMember?.branch ||
      "-",

    gender:
      jsonMember?.gender ||
      "-",

    religion:
      jsonMember?.religion ||
      "-",

    joinedAt:
      jsonMember?.joinedAt ||
      "-",

    date_of_birth:
      jsonMember?.date_of_birth ||
      "-",

    nationality:
      jsonMember?.nationality ||
      "-",

    ethnicity:
      jsonMember?.ethnicity ||
      "-",

    level:
      jsonMember?.level ||
      "-",

    shirtSize:
      jsonMember?.shirtSize ||
      "-",

    family:
      jsonMember?.family ||
      null,

    workHistory:
      jsonMember?.workHistory ||
      [],

    educationHistory:
      jsonMember?.educationHistory ||
      [],
  };
}

function readStoredAuthUser() {
  if (
    typeof window === "undefined"
  ) {
    return null;
  }

  for (const key of AUTH_STORAGE_KEYS) {
    const storedValue =
      localStorage.getItem(key);

    if (!storedValue) {
      continue;
    }

    try {
      const parsedValue =
        JSON.parse(storedValue);

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

export default function getCurrentMember(
  authUser = null,
) {
  const resolvedAuthUser =
    authUser ||
    readStoredAuthUser();

  return combineAuthUserWithMember(
    resolvedAuthUser,
  );
}
