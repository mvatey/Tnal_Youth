"use client";

import Image from "next/image";

import {
  useEffect,
  useState,
} from "react";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",

  ADMIN: "អ្នកគ្រប់គ្រង",
  BRANCH_LEADER: "ប្រធានសាខា",
  SECRETARY: "លេខាធិការ",
  MEMBER: "សមាជិក",

  អ្នកគ្រប់គ្រង: "អ្នកគ្រប់គ្រង",
  ប្រធានសាខា: "ប្រធានសាខា",
  លេខាធិការ: "លេខាធិការ",
  សមាជិក: "សមាជិក",
};

const DEFAULT_USER = {
  id: null,
  memberId: null,

  role: "MEMBER",
  account_role: "",

  name_kh: "",
  name_en: "",

  gender: "",

  email: "",
  phone: "",

  date_of_birth: "",

  branch: "",

  profile_photo: "",
};

function getMemberId(user) {
  const possibleIds = [
    user?.memberId,
    user?.member_id,
    user?.id,
  ];

  const validId =
    possibleIds.find(
      (value) =>
        value !== undefined &&
        value !== null &&
        String(value).trim() !== "",
    );

  return validId ?? null;
}

function normalizeProfilePhoto(value) {
  if (
    typeof value !== "string" ||
    !value.trim()
  ) {
    return "/profiles/default-avatar.jpg";
  }

  const trimmed =
    value.trim();

  /*
   * Already usable URL/path.
   */
  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:")
  ) {
    return trimmed;
  }

  /*
   * Backend relative file path:
   *
   * uploads/member-profiles/xxx.jpg
   */
  const backendOrigin =
    process.env
      .NEXT_PUBLIC_BACKEND_ORIGIN ||
    "http://localhost:8081";

  return `${backendOrigin}/${trimmed}`;
}

function getDefaultProfilePhoto(user) {
  /*
   * When this card receives the raw backend member record (a
   * FileResponse object, { id, filePath, ... }, with no "url"
   * property) instead of a component that has already resolved it to
   * a string, every candidate below used to fail the string-only
   * check and this silently fell back to the placeholder avatar.
   */
  const rawPhoto =
    user?.profile_photo ||
    user?.profilePhoto;

  if (
    rawPhoto &&
    typeof rawPhoto === "object" &&
    rawPhoto.id
  ) {
    return `/api/files/${rawPhoto.id}/content`;
  }

  const possibleImages = [
    user?.profile_photo?.url,
    user?.profilePhoto?.url,

    user?.profile_photo,
    user?.profilePhoto,
    user?.profileImage,
    user?.profile_image,

    user?.photo_url,
    user?.photoUrl,
  ];

  const validImage =
    possibleImages.find(
      (value) =>
        typeof value === "string" &&
        value.trim() !== "",
    );

  return normalizeProfilePhoto(
    validImage,
  );
}

function getRole(user) {
  return (
    user?.account_role ||
    user?.accountRole ||
    user?.role ||
    "MEMBER"
  );
}

function getRoleLabel(role) {
  if (!role) {
    return ROLE_LABELS.MEMBER;
  }

  const normalized =
    String(role).trim();

  return (
    ROLE_LABELS[normalized] ||
    ROLE_LABELS[
      normalized.toLowerCase()
    ] ||
    normalized
  );
}

function getNameKm(user) {
  return (
    user?.name_kh ||
    user?.full_name_km ||
    user?.fullNameKm ||
    ""
  );
}

function getNameEn(user) {
  return (
    user?.name_en ||
    user?.full_name_en ||
    user?.fullNameEn ||
    ""
  );
}

function getGender(user) {
  const gender =
    user?.gender;

  if (
    gender &&
    typeof gender === "object"
  ) {
    return (
      gender?.labelKm ||
      gender?.label_km ||
      gender?.labelEn ||
      gender?.code ||
      ""
    );
  }

  return gender || "";
}

function getBranch(user) {
  const branch =
    user?.branch;

  if (
    branch &&
    typeof branch === "object"
  ) {
    return (
      branch?.nameKm ||
      branch?.name_km ||
      branch?.labelKm ||
      branch?.label_km ||
      branch?.nameEn ||
      branch?.name_en ||
      ""
    );
  }

  return (
    branch ||
    user?.branch_name_km ||
    user?.branchNameKm ||
    ""
  );
}

export default function IdCard({
  user,
  templatePreview = "",
}) {
  const displayUser = {
    ...DEFAULT_USER,
    ...(user || {}),
  };

  const profileMemberId =
    getMemberId(
      displayUser,
    );

  const backendProfilePhoto =
    getDefaultProfilePhoto(
      displayUser,
    );

  const [
    profilePhoto,
    setProfilePhoto,
  ] = useState(
    backendProfilePhoto,
  );

  const hasSelectedUser =
    Boolean(
      profileMemberId,
    );

  const hasCustomTemplate =
    Boolean(
      templatePreview,
    );

  const memberId =
    hasSelectedUser
      ? String(
          profileMemberId,
        ).padStart(
          4,
          "0",
        )
      : "0000";

  const role =
    getRole(
      displayUser,
    );

  const roleLabel =
    getRoleLabel(
      role,
    );

  const nameKm =
    getNameKm(
      displayUser,
    );

  const nameEn =
    getNameEn(
      displayUser,
    );

  const gender =
    getGender(
      displayUser,
    );

  const branch =
    getBranch(
      displayUser,
    );

  /*
   * =========================================
   * PROFILE PHOTO
   *
   * Backend/member data is now the source
   * of truth.
   *
   * We no longer read an old saved image
   * from localStorage.
   * =========================================
   */

  useEffect(() => {
    setProfilePhoto(
      backendProfilePhoto,
    );

    const handleProfileImageChange =
      (event) => {
        const changedMemberId =
          event.detail?.memberId;

        if (
          String(
            changedMemberId,
          ) !==
          String(
            profileMemberId,
          )
        ) {
          return;
        }

        setProfilePhoto(
          normalizeProfilePhoto(
            event.detail
              ?.imageData,
          ),
        );
      };

    window.addEventListener(
      "tnal-profile-image-change",
      handleProfileImageChange,
    );

    return () => {
      window.removeEventListener(
        "tnal-profile-image-change",
        handleProfileImageChange,
      );
    };
  }, [
    profileMemberId,
    backendProfilePhoto,
  ]);

  return (
    <div className="flex w-full justify-center py-4">
      <div
        className="
          relative
          h-[340px]
          w-[560px]
          max-w-full
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-lg
        "
      >
        {/* Background */}

        {hasCustomTemplate ? (
          <>
            <img
              src={
                templatePreview
              }
              alt="ID card background template"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-fill
              "
            />

            <div className="absolute inset-0 bg-white/10" />
          </>
        ) : (
          <DefaultIdCardBackground />
        )}

        {/* Footer */}

        <div
          className="
            absolute
            bottom-0
            left-0
            z-20
            flex
            h-[42px]
            w-full
            items-center
            justify-center
            bg-[#062f6b]
            px-4
            text-center
            text-xs
            font-semibold
            text-white
          "
        >
          Member ID : NAS-{memberId}
        </div>

        {/* Card content */}

        <div
          className="
            relative
            z-10
            h-full
            p-6
            pb-[58px]
          "
        >
          {/* Header */}

          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="Cambodian Youth Nursery Association logo"
              width={55}
              height={55}
              className="shrink-0 object-contain"
              priority
            />

            <div className="min-w-0">
              <h1
                className="
                  truncate
                  text-lg
                  font-bold
                  leading-tight
                  text-[#062f6b]
                "
              >
                Cambodian Youth Nursery Association
              </h1>

              <p
                className="
                  mt-1
                  truncate
                  text-xs
                  text-[#062f6b]
                "
              >
                សមាគមថ្នាលយុវជនកម្ពុជា
              </p>
            </div>
          </div>

          {/* Body */}

          <div className="mt-6 flex gap-7">
            {/* Profile photo */}

            <div
              className="
                relative
                h-[160px]
                w-[125px]
                shrink-0
                overflow-hidden
                rounded-xl
                border-4
                border-white
                bg-gray-200
                shadow-md
              "
            >
              <Image
                src={
                  hasSelectedUser
                    ? profilePhoto
                    : "/profiles/default-avatar.jpg"
                }
                alt={
                  nameKm ||
                  nameEn ||
                  "រូបថតសមាជិក"
                }
                fill
                sizes="125px"
                className="object-cover"
                unoptimized
                onError={() =>
                  setProfilePhoto(
                    "/profiles/default-avatar.jpg",
                  )
                }
              />
            </div>

            {/* Member information */}

            <div className="min-w-0 flex-1">
              <h2
                className="
                  mb-4
                  truncate
                  text-xl
                  font-medium
                  text-[#062f6b]
                "
                title={
                  roleLabel
                }
              >
                {roleLabel}
              </h2>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Info
                  label="ឈ្មោះ"
                  value={
                    hasSelectedUser
                      ? nameKm
                      : ""
                  }
                />

                <Info
                  label="ឈ្មោះអង់គ្លេស"
                  value={
                    hasSelectedUser
                      ? nameEn
                      : ""
                  }
                />

                <Info
                  label="ភេទ"
                  value={
                    hasSelectedUser
                      ? gender
                      : ""
                  }
                />

                <Info
                  label="អ៊ីមែល"
                  value={
                    hasSelectedUser
                      ? displayUser.email
                      : ""
                  }
                />

                <Info
                  label="លេខទូរសព្ទ"
                  value={
                    hasSelectedUser
                      ? displayUser.phone
                      : ""
                  }
                />

                <Info
                  label="ថ្ងៃកំណើត"
                  value={
                    hasSelectedUser
                      ? displayUser
                            .date_of_birth ||
                        displayUser
                          .dateOfBirth
                      : ""
                  }
                />

                <Info
                  label="សាខា"
                  value={
                    hasSelectedUser
                      ? branch
                      : ""
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {!hasCustomTemplate && (
          <div
            className="
              pointer-events-none
              absolute
              inset-2
              z-30
              rounded-xl
              border
              border-[#062f6b]/20
            "
          />
        )}
      </div>
    </div>
  );
}

function DefaultIdCardBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-white
          via-[#f6f9ff]
          to-[#dfe9ff]
        "
      />

      <div
        className="
          absolute
          left-0
          top-0
          h-full
          w-[32%]
          bg-[#062f6b]
        "
      />

      <div
        className="
          absolute
          left-[21%]
          top-[-22%]
          h-[150%]
          w-[28%]
          rotate-[8deg]
          rounded-[50%]
          bg-white
        "
      />

      <div
        className="
          absolute
          right-[-10%]
          top-[-28%]
          h-[70%]
          w-[40%]
          rounded-full
          bg-[#8db7ee]
          opacity-20
        "
      />

      <div
        className="
          absolute
          bottom-[-38%]
          right-[2%]
          h-[75%]
          w-[45%]
          rounded-full
          bg-[#9ebcf0]
          opacity-20
        "
      />

      <div
        className="
          absolute
          left-[8%]
          top-[17%]
          h-16
          w-16
          rounded-full
          bg-white/10
        "
      />

      <div
        className="
          absolute
          bottom-[16%]
          left-[7%]
          h-12
          w-12
          rounded-full
          border
          border-white/30
        "
      />
    </div>
  );
}

function Info({
  label,
  value,
}) {
  const displayValue =
    value || "";

  return (
    <div className="min-w-0">
      <p className="text-[10px] text-gray-500">
        {label}
      </p>

      <p
        className="
          min-h-[18px]
          max-w-[150px]
          truncate
          text-xs
          font-bold
          text-[#062f6b]
        "
        title={
          typeof displayValue ===
          "string"
            ? displayValue
            : ""
        }
      >
        {displayValue}
      </p>
    </div>
  );
}