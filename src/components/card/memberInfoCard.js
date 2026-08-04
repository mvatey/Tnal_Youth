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

import {
  getSavedProfileImage,
  saveProfileImage,
} from "@/lib/member/profileImageStorage";

const ROLE_LABELS = {
  ADMIN: "អ្នកគ្រប់គ្រង",
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",

  admin: "អ្នកគ្រប់គ្រង",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",

  អ្នកគ្រប់គ្រង: "អ្នកគ្រប់គ្រង",
  លេខាធិការ: "លេខាធិការ",
  ប្រធានសាខា: "ប្រធានសាខា",
  សមាជិក: "សមាជិក",
};

const STATUS_BADGE_STYLES = {
  ACTIVE: "bg-success-bg text-success",
  INACTIVE: "bg-error-bg text-error",

  active: "bg-success-bg text-success",
  inactive: "bg-error-bg text-error",

  សកម្ម: "bg-success-bg text-success",
  អសកម្ម: "bg-error-bg text-error",
};

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",

  active: "សកម្ម",
  inactive: "អសកម្ម",

  សកម្ម: "សកម្ម",
  អសកម្ម: "អសកម្ម",
};

const MAX_PROFILE_IMAGE_SIZE =
  5 * 1024 * 1024;

function getGenderDisplay(gender) {
  const normalizedGender =
    String(gender || "").trim();

  if (
    normalizedGender === "ស្រី" ||
    normalizedGender === "FEMALE" ||
    normalizedGender === "female"
  ) {
    return "ភេទ ស្រី";
  }

  if (
    normalizedGender === "ប្រុស" ||
    normalizedGender === "MALE" ||
    normalizedGender === "male"
  ) {
    return "ភេទ ប្រុស";
  }

  if (
    normalizedGender === "ព្រះសង្ឃ" ||
    normalizedGender === "MONK" ||
    normalizedGender === "monk"
  ) {
    return "ព្រះសង្ឃ";
  }

  return normalizedGender || "-";
}

function getGenderIcon(gender) {
  const normalizedGender =
    String(gender || "").trim();

  if (
    normalizedGender === "ស្រី" ||
    normalizedGender === "FEMALE" ||
    normalizedGender === "female"
  ) {
    return "♀";
  }

  if (
    normalizedGender === "ប្រុស" ||
    normalizedGender === "MALE" ||
    normalizedGender === "male"
  ) {
    return "♂";
  }

  return "•";
}

function getMemberId(member) {
  return (
    member?.memberId ??
    member?.id ??
    member?.member_id ??
    null
  );
}

function getDefaultProfileImage(member) {
  return (
    member?.profile_photo ||
    member?.profileImage ||
    member?.profile_image ||
    member?.profilePhoto ||
    "/member.png"
  );
}

export default function MemberInfoCard({
  member,
  allowProfileChange = true,
}) {
  const fileInputRef =
    useRef(null);

  const [profilePreview, setProfilePreview] =
    useState("/member.png");

  const [imageError, setImageError] =
    useState("");

  const memberId =
    getMemberId(member);

  const defaultProfileImage =
    getDefaultProfileImage(member);

  /*
   * Load the saved image for the exact member ID.
   *
   * My Account:
   * member comes from useCurrentMember().
   *
   * Member detail:
   * member comes from members.json by URL ID.
   */
  useEffect(() => {
    if (!memberId) {
      setProfilePreview(
        defaultProfileImage,
      );

      return undefined;
    }

    setProfilePreview(
      getSavedProfileImage(
        memberId,
        defaultProfileImage,
      ),
    );

    const handleProfileImageChange = (
      event,
    ) => {
      const changedMemberId =
        event.detail?.memberId;

      if (
        String(changedMemberId) !==
        String(memberId)
      ) {
        return;
      }

      setProfilePreview(
        event.detail?.imageData ||
          defaultProfileImage,
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
    memberId,
    defaultProfileImage,
  ]);

  if (!member) {
    return null;
  }

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

  const role =
    member.role || "MEMBER";

  const roleLabel =
    ROLE_LABELS[role] ||
    ROLE_LABELS[
      String(role).toLowerCase()
    ] ||
    role ||
    ROLE_LABELS.member;

  const status =
    member.status || "ACTIVE";

  const statusLabel =
    STATUS_LABELS[status] ||
    STATUS_LABELS[
      String(status).toLowerCase()
    ] ||
    status;

  const statusStyle =
    STATUS_BADGE_STYLES[status] ||
    STATUS_BADGE_STYLES[
      String(status).toLowerCase()
    ] ||
    "bg-gray-100 text-text-secondary";

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

  const handleChooseImage = () => {
    if (!allowProfileChange) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleProfileImageChange = (
    event,
  ) => {
    const file =
      event.target.files?.[0];

    setImageError("");

    if (!file) {
      return;
    }

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

    if (!memberId) {
      setImageError(
        "រកមិនឃើញលេខសម្គាល់សមាជិក។",
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

      if (!imageData) {
        setImageError(
          "មិនអាចអានរូបភាពបានទេ។",
        );

        return;
      }

      const saved =
        saveProfileImage(
          memberId,
          imageData,
        );

      if (!saved) {
        setImageError(
          "មិនអាចរក្សាទុករូបភាពបានទេ។ រូបភាពអាចមានទំហំធំពេក។",
        );

        return;
      }

      setProfilePreview(
        imageData,
      );
    };

    reader.onerror = () => {
      setImageError(
        "មិនអាចអានឯកសាររូបភាពបានទេ។",
      );
    };

    reader.readAsDataURL(file);

    /*
     * Allow selecting the same file again.
     */
    event.target.value = "";
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
        p-4
        shadow-lg
        sm:p-6
        xl:p-8
      "
    >
      <div
        className="
          grid
          min-w-0
          grid-cols-1
          gap-6
          lg:grid-cols-2
          xl:grid-cols-[auto_1px_repeat(4,minmax(0,1fr))]
          xl:items-center
          xl:gap-6
        "
      >
        {/* Profile */}

        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <div className="shrink-0">
            <div
              className="
                group
                relative
                h-20
                w-20
                overflow-visible
                sm:h-24
                sm:w-24
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
                  sizes="
                    (max-width: 640px) 80px,
                    96px
                  "
                  className="object-cover"
                  onError={() =>
                    setProfilePreview(
                      "/member.png",
                    )
                  }
                />
              </div>

              {allowProfileChange && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="
                      image/jpeg,
                      image/png,
                      image/webp
                    "
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
                    <Camera size={16} />
                  </button>
                </>
              )}
            </div>

            {imageError && (
              <p
                className="
                  mt-3
                  max-w-[150px]
                  text-xs
                  font-medium
                  text-red-200
                "
              >
                {imageError}
              </p>
            )}
          </div>

          <div className="min-w-0 pt-0.5 text-white">
            <h2
              className="
                truncate
                text-lg
                font-bold
                sm:text-2xl
              "
              title={displayName}
            >
              {displayName}
            </h2>

            <p
              className="
                mt-1
                truncate
                text-xs
                text-gray-200
                sm:text-sm
              "
              title={englishName}
            >
              {englishName}
            </p>

            <div
              className="
                mt-3
                flex
                flex-wrap
                items-center
                gap-2
                sm:gap-3
              "
            >
              <span className="text-xs text-gray-200 sm:text-sm">
                {roleLabel}
              </span>

              <span
                className={`
                  rounded-full
                  px-3
                  py-1
                  text-xs
                  font-medium
                  ${statusStyle}
                `}
              >
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="hidden h-24 w-px bg-white/40 xl:block" />

        {/* Gender and branch */}

        <InfoGroup
          firstLabel="ភេទ"
          firstValue={getGenderDisplay(
            member.gender,
          )}
          firstIcon={
            <span className="text-sm">
              {getGenderIcon(
                member.gender,
              )}
            </span>
          }
          secondLabel="សាខា"
          secondValue={branch}
          secondIcon={
            <Building2 className="h-4 w-4 shrink-0" />
          }
        />

        {/* Phone and email */}

        <InfoGroup
          firstLabel="លេខទូរស័ព្ទ"
          firstValue={
            member.phone || "-"
          }
          firstIcon={
            <Phone className="h-4 w-4 shrink-0" />
          }
          secondLabel="អ៊ីមែល"
          secondValue={
            member.email || "-"
          }
          secondIcon={
            <Mail className="h-4 w-4 shrink-0" />
          }
        />

        {/* Dates */}

        <InfoGroup
          firstLabel="ថ្ងៃកំណើត"
          firstValue={dateOfBirth}
          firstIcon={
            <Calendar className="h-4 w-4 shrink-0" />
          }
          secondLabel="ថ្ងៃចូលរួម"
          secondValue={joinedDate}
          secondIcon={
            <CalendarCheck className="h-4 w-4 shrink-0" />
          }
        />

        {/* Nationality and ethnicity */}

        <InfoGroup
          firstLabel="សញ្ជាតិ"
          firstValue={
            member.nationality ||
            "-"
          }
          firstIcon={
            <Globe className="h-4 w-4 shrink-0" />
          }
          secondLabel="ជនជាតិ"
          secondValue={
            member.ethnicity ||
            "-"
          }
          secondIcon={
            <Users className="h-4 w-4 shrink-0" />
          }
        />
      </div>
    </div>
  );
}

function InfoGroup({
  firstLabel,
  firstValue,
  firstIcon,
  secondLabel,
  secondValue,
  secondIcon,
}) {
  return (
    <div
      className="
        min-w-0
        rounded-xl
        bg-white/5
        p-3
        text-white
        xl:rounded-none
        xl:bg-transparent
        xl:p-0
      "
    >
      <InfoItem
        label={firstLabel}
        value={firstValue}
        icon={firstIcon}
      />

      <div className="mt-3.5">
        <InfoItem
          label={secondLabel}
          value={secondValue}
          icon={secondIcon}
        />
      </div>
    </div>
  );
}

function InfoItem({
  label,
  value,
  icon,
}) {
  return (
    <div className="min-w-0">
      <p
        className="
          mb-0.5
          text-xs
          uppercase
          tracking-wider
          text-gray-200
        "
      >
        {label}
      </p>

      <div className="flex min-w-0 items-center gap-2">
        <span className="shrink-0 text-white">
          {icon}
        </span>

        <p
          className="
            min-w-0
            truncate
            text-sm
            font-semibold
          "
          title={
            typeof value === "string"
              ? value
              : ""
          }
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}