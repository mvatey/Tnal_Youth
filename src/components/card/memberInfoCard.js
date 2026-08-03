"use client";

import Image from "next/image";
import {
  Building2,
  Calendar,
  CalendarCheck,
  Camera,
  Globe,
  Mail,
  Phone,
  Users,
} from "lucide-react";

import {
  useEffect,
  useRef,
  useState,
} from "react";

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",

  admin: "អ្នកគ្រប់គ្រង",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",
};

const STATUS_BADGE_STYLES = {
  ACTIVE: "bg-success-bg text-success",
  INACTIVE: "bg-error-bg text-error",
  សកម្ម: "bg-success-bg text-success",
  អសកម្ម: "bg-error-bg text-error",
};

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  សកម្ម: "សកម្ម",
  អសកម្ម: "អសកម្ម",
};

const MAX_PROFILE_IMAGE_SIZE =
  5 * 1024 * 1024;

function getGenderDisplay(gender) {
  if (
    gender === "ស្រី" ||
    gender === "FEMALE"
  ) {
    return "ភេទ ស្រី";
  }

  if (
    gender === "ប្រុស" ||
    gender === "MALE"
  ) {
    return "ភេទ ប្រុស";
  }

  if (
    gender === "ព្រះសង្ឃ" ||
    gender === "MONK"
  ) {
    return "ព្រះសង្ឃ";
  }

  return gender || "-";
}

function getGenderIcon(gender) {
  if (
    gender === "ស្រី" ||
    gender === "FEMALE"
  ) {
    return "♀";
  }

  if (
    gender === "ប្រុស" ||
    gender === "MALE"
  ) {
    return "♂";
  }

  return "•";
}

function getProfileStorageKey(
  memberId,
) {
  return `tnal-member-profile-image-${memberId}`;
}

export default function MemberInfoCard({
  member,
  allowProfileChange = true,
}) {
  const fileInputRef =
    useRef(null);

  const [profilePreview, setProfilePreview] =
    useState("");

  const [imageError, setImageError] =
    useState("");

  if (!member) return null;

  const displayName =
    member.fullNameKm ||
    member.name_kh ||
    member.full_name_km ||
    member.name ||
    "-";

  const englishName =
    member.fullNameEn ||
    member.name_en ||
    member.full_name_en ||
    "-";

  const defaultProfileImage =
    member.profileImage ||
    member.profile_photo ||
    member.profile_image ||
    "/member.png";

  const role =
    member.role || "MEMBER";

  const status =
    member.status || "ACTIVE";

  const statusLabel =
    STATUS_LABELS[status] ||
    status;

  const branch =
    member.branch?.nameKm ||
    member.branch?.name_km ||
    member.branch?.name ||
    member.branch ||
    "-";

  const dateOfBirth =
    member.dateOfBirth ||
    member.date_of_birth ||
    "-";

  const joinedDate =
    member.joinedAt ||
    member.joined_on ||
    member.joinedOn ||
    "-";

  const memberId =
    member.id ||
    member.memberId ||
    member.member_id ||
    "current";

  useEffect(() => {
    try {
      const savedImage =
        localStorage.getItem(
          getProfileStorageKey(
            memberId,
          ),
        );

      setProfilePreview(
        savedImage ||
          defaultProfileImage,
      );
    } catch (error) {
      console.error(
        "Cannot load profile image:",
        error,
      );

      setProfilePreview(
        defaultProfileImage,
      );
    }
  }, [
    memberId,
    defaultProfileImage,
  ]);

  const handleChooseImage = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    setImageError("");

    if (!file) return;

    if (
      !file.type.startsWith(
        "image/",
      )
    ) {
      setImageError(
        "សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ។",
      );

      event.target.value = "";
      return;
    }

    if (
      file.size >
      MAX_PROFILE_IMAGE_SIZE
    ) {
      setImageError(
        "ទំហំរូបភាពមិនត្រូវលើស 5MB។",
      );

      event.target.value = "";
      return;
    }

    const reader =
      new FileReader();

    reader.onload = () => {
      const imageData =
        String(
          reader.result || "",
        );

      setProfilePreview(
        imageData,
      );

      try {
        localStorage.setItem(
          getProfileStorageKey(
            memberId,
          ),
          imageData,
        );
      } catch (error) {
        console.error(
          "Cannot save profile image:",
          error,
        );

        setImageError(
          "មិនអាចរក្សាទុករូបភាពបានទេ។ រូបភាពអាចមានទំហំធំពេក។",
        );
      }
    };

    reader.onerror = () => {
      setImageError(
        "មិនអាចអានឯកសាររូបភាពបានទេ។",
      );
    };

    reader.readAsDataURL(file);
  };

  return (
    <div
      className="
        app-card
        overflow-hidden
        rounded-2xl
        bg-gradient-to-r
        from-primary
        to-primary-sidebar
        p-8
        shadow-lg
      "
    >
      <div
        className="
          flex
          flex-col
          items-start
          gap-6
          lg:flex-row
          lg:items-center
          lg:gap-8
        "
      >
        {/* Profile */}

        <div className="flex shrink-0 items-start gap-5">
          <div>
            <div
              className="
                group
                relative
                h-24
                w-24
                overflow-visible
              "
            >
              <div
                className="
                  relative
                  h-full
                  w-full
                  overflow-hidden
                  rounded-2xl
                  border
                  border-white/20
                  bg-white/10
                  shadow-xl
                "
              >
                <Image
                  src={
                    profilePreview ||
                    defaultProfileImage
                  }
                  alt={displayName}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>

              {allowProfileChange && (
                <>
                  <input
                    ref={
                      fileInputRef
                    }
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={
                      handleProfileImageChange
                    }
                  />

                  <button
                    type="button"
                    onClick={
                      handleChooseImage
                    }
                    aria-label="ប្ដូររូបភាពប្រវត្តិរូប"
                    title="ប្ដូររូបភាពប្រវត្តិរូប"
                    className="
                      absolute
                      -bottom-2
                      -right-2
                      z-20
                      flex
                      h-8
                      w-8
                      items-center
                      justify-center
                      rounded-full
                      border-2
                      border-secondary
                      bg-secondary
                      text-white
                      shadow-md
                      transition
                      hover:scale-105
                      hover:bg-secondary-hover
                      focus:outline-none
                      focus:ring-2
                      focus:ring-white/70
                    "
                  >
                    <Camera
                      size={16}
                    />
                  </button>
                </>
              )}
            </div>

            {imageError && (
              <p
                className="
                  mt-3
                  max-w-40
                  text-xs
                  font-medium
                  text-red-200
                "
              >
                {imageError}
              </p>
            )}
          </div>

          <div className="pr-20 pt-0.5 text-white">
            <h2 className="mb-1 text-2xl font-bold">
              {displayName}
            </h2>

            <p className="text-sm text-gray-200">
              {englishName}
            </p>

            <div className="mt-3 flex items-center gap-3">
              <span className="text-sm text-gray-200">
                {ROLE_LABELS[
                  role
                ] || role}
              </span>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ${
                    STATUS_BADGE_STYLES[
                      status
                    ] ||
                    "bg-gray-100 text-text-secondary"
                  }
                `}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden h-24 w-px bg-white/40 lg:block" />

        {/* Gender and branch */}

        <div className="min-w-0 flex-1 text-white">
          <div className="mb-3.5">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              ភេទ
            </p>

            <div className="flex items-center gap-2">
              <span className="text-sm">
                {getGenderIcon(
                  member.gender,
                )}
              </span>

              <p className="text-sm font-semibold">
                {getGenderDisplay(
                  member.gender,
                )}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              សាខា
            </p>

            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 shrink-0 text-white" />

              <p className="truncate text-sm font-semibold">
                {branch}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden h-24 w-px bg-white/40 lg:block" />

        {/* Phone and email */}

        <div className="min-w-0 flex-1 text-white">
          <div className="mb-3.5">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              លេខទូរស័ព្ទ
            </p>

            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 shrink-0 text-white" />

              <p className="text-sm font-semibold">
                {member.phone ||
                  "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              អ៊ីមែល
            </p>

            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 shrink-0 text-white" />

              <p className="truncate text-sm font-semibold">
                {member.email ||
                  "-"}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden h-24 w-px bg-white/40 lg:block" />

        {/* Dates */}

        <div className="min-w-0 flex-1 text-white">
          <div className="mb-3.5">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              ថ្ងៃកំណើត
            </p>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 shrink-0 text-white" />

              <p className="text-sm font-semibold">
                {dateOfBirth}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              ថ្ងៃចូលរួម
            </p>

            <div className="flex items-center gap-2">
              <CalendarCheck className="h-4 w-4 shrink-0 text-white" />

              <p className="text-sm font-semibold">
                {joinedDate}
              </p>
            </div>
          </div>
        </div>

        <div className="hidden h-24 w-px bg-white/40 lg:block" />

        {/* Nationality and ethnicity */}

        <div className="min-w-0 flex-1 text-white">
          <div className="mb-3.5">
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              សញ្ជាតិ
            </p>

            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 shrink-0 text-white" />

              <p className="text-sm font-semibold">
                {member.nationality ||
                  "-"}
              </p>
            </div>
          </div>

          <div>
            <p className="mb-0.5 text-xs uppercase tracking-wider text-gray-200">
              ជនជាតិ
            </p>

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 shrink-0 text-white" />

              <p className="text-sm font-semibold">
                {member.ethnicity ||
                  "-"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}