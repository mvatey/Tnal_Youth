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
  saveProfileImage,
} from "@/lib/member/profileImageStorage";

const BACKEND_ORIGIN =
  process.env.NEXT_PUBLIC_BACKEND_ORIGIN ||
  "http://localhost:8081";

const DEFAULT_PROFILE_IMAGE =
  "/profiles/default-avatar.jpg";

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
  ACTIVE:
    "bg-success-bg text-success",

  INACTIVE:
    "bg-error-bg text-error",

  SUSPENDED:
    "bg-warning-bg text-warning",

  RESIGNED:
    "bg-gray-100 text-text-secondary",

  active:
    "bg-success-bg text-success",

  inactive:
    "bg-error-bg text-error",

  សកម្ម:
    "bg-success-bg text-success",

  អសកម្ម:
    "bg-error-bg text-error",
};

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  SUSPENDED: "បានផ្អាក",
  RESIGNED: "បានលាលែង",

  active: "សកម្ម",
  inactive: "អសកម្ម",

  សកម្ម: "សកម្ម",
  អសកម្ម: "អសកម្ម",
};

const MAX_PROFILE_IMAGE_SIZE =
  5 * 1024 * 1024;

function getGenderCode(gender) {
  if (
    gender &&
    typeof gender === "object"
  ) {
    return String(
      gender?.code ||
        gender?.value ||
        "",
    ).toUpperCase();
  }

  return String(
    gender || "",
  ).toUpperCase();
}

function getGenderDisplay(gender) {
  if (
    gender &&
    typeof gender === "object"
  ) {
    const label =
      gender?.label_km ||
      gender?.labelKm ||
      gender?.label_en ||
      gender?.labelEn;

    if (label) {
      return `ភេទ ${label}`;
    }
  }

  const code =
    getGenderCode(gender);

  if (
    code === "FEMALE" ||
    gender === "ស្រី"
  ) {
    return "ភេទ ស្រី";
  }

  if (
    code === "MALE" ||
    gender === "ប្រុស"
  ) {
    return "ភេទ ប្រុស";
  }

  if (
    code === "MONK" ||
    gender === "ព្រះសង្ឃ"
  ) {
    return "ព្រះសង្ឃ";
  }

  return gender || "-";
}

function getGenderIcon(gender) {
  const code =
    getGenderCode(gender);

  if (
    code === "FEMALE" ||
    gender === "ស្រី"
  ) {
    return "♀";
  }

  if (
    code === "MALE" ||
    gender === "ប្រុស"
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

function normalizeImageUrl(value) {
  if (!value) {
    return DEFAULT_PROFILE_IMAGE;
  }

  if (
    typeof value === "object"
  ) {
    return normalizeImageUrl(
      value?.url ||
        value?.path ||
        value?.file_url ||
        value?.fileUrl ||
        "",
    );
  }

  const imagePath =
    String(value).trim();

  if (!imagePath) {
    return DEFAULT_PROFILE_IMAGE;
  }

  if (
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  if (
    imagePath.startsWith(
      "/profiles/",
    )
  ) {
    return imagePath;
  }

  const normalizedPath =
    imagePath.startsWith("/")
      ? imagePath
      : `/${imagePath}`;

  return `${BACKEND_ORIGIN}${normalizedPath}`;
}

function getDefaultProfileImage(member) {
  const value =
    member?.profile_photo?.url ||
    member?.profilePhoto?.url ||
    member?.profile_photo_url ||
    member?.profilePhotoUrl ||
    member?.profile_photo ||
    member?.profileImage ||
    member?.profile_image ||
    member?.profilePhoto ||
    "";

  return normalizeImageUrl(value);
}

function getRoleCode(role) {
  if (
    role &&
    typeof role === "object"
  ) {
    return String(
      role?.code ||
        role?.value ||
        "",
    ).toUpperCase();
  }

  return String(
    role || "",
  ).toUpperCase();
}

function getRoleLabel(role) {
  if (
    role &&
    typeof role === "object"
  ) {
    return (
      role?.label_km ||
      role?.labelKm ||
      role?.label_en ||
      role?.labelEn ||
      ROLE_LABELS[
        getRoleCode(role)
      ] ||
      "-"
    );
  }

  const code =
    getRoleCode(role);

  return (
    ROLE_LABELS[code] ||
    ROLE_LABELS[
      String(role || "")
        .trim()
        .toLowerCase()
    ] ||
    role ||
    ROLE_LABELS.MEMBER
  );
}

function getStatusCode(status) {
  if (
    status &&
    typeof status === "object"
  ) {
    return String(
      status?.code ||
        status?.value ||
        "",
    ).toUpperCase();
  }

  return String(
    status || "",
  ).toUpperCase();
}

function getStatusLabel(status) {
  if (
    status &&
    typeof status === "object"
  ) {
    return (
      status?.label_km ||
      status?.labelKm ||
      status?.name_km ||
      status?.nameKm ||
      status?.label_en ||
      status?.labelEn ||
      STATUS_LABELS[
        getStatusCode(status)
      ] ||
      "-"
    );
  }

  const code =
    getStatusCode(status);

  return (
    STATUS_LABELS[code] ||
    STATUS_LABELS[
      String(status || "")
        .trim()
        .toLowerCase()
    ] ||
    status ||
    "-"
  );
}

function getBranchLabel(branch) {
  if (!branch) {
    return "-";
  }

  if (
    typeof branch === "string"
  ) {
    return branch;
  }

  return (
    branch?.label_km ||
    branch?.labelKm ||
    branch?.name_km ||
    branch?.nameKm ||
    branch?.name_en ||
    branch?.nameEn ||
    "-"
  );
}

function getLookupLabel(value) {
  if (!value) {
    return "-";
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  return (
    value?.label_km ||
    value?.labelKm ||
    value?.name_km ||
    value?.nameKm ||
    value?.label_en ||
    value?.labelEn ||
    value?.name_en ||
    value?.nameEn ||
    value?.code ||
    "-"
  );
}

export default function MemberInfoCard({
  member,
  allowProfileChange = true,
}) {
  const fileInputRef =
    useRef(null);

  const [
    profilePreview,
    setProfilePreview,
  ] = useState(
    DEFAULT_PROFILE_IMAGE,
  );

  const [
    imageError,
    setImageError,
  ] = useState("");

  const memberId =
    getMemberId(member);

  const defaultProfileImage =
    getDefaultProfileImage(
      member,
    );

  useEffect(() => {
    setProfilePreview(
      defaultProfileImage,
    );
  }, [
    memberId,
    defaultProfileImage,
  ]);

  useEffect(() => {
    if (!memberId) {
      return undefined;
    }

    const handleImageChange = (
      event,
    ) => {
      if (
        String(
          event.detail?.memberId,
        ) !==
        String(memberId)
      ) {
        return;
      }

      if (
        event.detail?.imageData
      ) {
        setProfilePreview(
          event.detail.imageData,
        );
      }
    };

    window.addEventListener(
      "tnal-profile-image-change",
      handleImageChange,
    );

    return () => {
      window.removeEventListener(
        "tnal-profile-image-change",
        handleImageChange,
      );
    };
  }, [memberId]);

  if (!member) {
    return null;
  }

  const displayName =
    member?.fullNameKm ||
    member?.full_name_km ||
    member?.name_kh ||
    member?.nameKm ||
    member?.name ||
    "-";

  const englishName =
    member?.fullNameEn ||
    member?.full_name_en ||
    member?.name_en ||
    member?.nameEn ||
    "-";

  const role =
    member?.role ||
    member?.user_role ||
    member?.userRole ||
    "MEMBER";

  const roleLabel =
    getRoleLabel(role);

  const status =
    member?.status ||
    member?.status_code ||
    member?.statusCode ||
    "ACTIVE";

  const statusCode =
    getStatusCode(status);

  const statusLabel =
    getStatusLabel(status);

  const statusStyle =
    STATUS_BADGE_STYLES[
      statusCode
    ] ||
    STATUS_BADGE_STYLES[
      String(status || "")
        .toLowerCase()
    ] ||
    "bg-gray-100 text-text-secondary";

  const branch =
    getBranchLabel(
      member?.branch ||
        member?.branch_name_km ||
        member?.branchNameKm,
    );

  const dateOfBirth =
    member?.date_of_birth ||
    member?.dateOfBirth ||
    "-";

  const joinedDate =
    member?.joined_on ||
    member?.joinedOn ||
    member?.joinedAt ||
    "-";

  const nationality =
    getLookupLabel(
      member?.nationality,
    );

  const ethnicity =
    getLookupLabel(
      member?.ethnicity,
    );

  const handleChooseImage = () => {
    if (!allowProfileChange) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleProfileImageChange =
    (event) => {
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

      reader.readAsDataURL(
        file,
      );

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
        {/* PROFILE */}

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
                    DEFAULT_PROFILE_IMAGE
                  }
                  alt={displayName}
                  fill
                  sizes="
                    (max-width: 640px) 80px,
                    96px
                  "
                  className="object-cover"

                  /*
                   * Important:
                   * This allows backend images such as:
                   *
                   * http://localhost:8081/uploads/...
                   *
                   * without Next.js image host validation.
                   */
                  unoptimized

                  onError={() =>
                    setProfilePreview(
                      DEFAULT_PROFILE_IMAGE,
                    )
                  }
                />
              </div>

              {allowProfileChange && (
                <>
                  <input
                    ref={fileInputRef}
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
              title={
                displayName
              }
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
              title={
                englishName
              }
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

        {/* GENDER + BRANCH */}

        <InfoGroup
          firstLabel="ភេទ"
          firstValue={getGenderDisplay(
            member?.gender,
          )}
          firstIcon={
            <span className="text-sm">
              {getGenderIcon(
                member?.gender,
              )}
            </span>
          }
          secondLabel="សាខា"
          secondValue={branch}
          secondIcon={
            <Building2 className="h-4 w-4 shrink-0" />
          }
        />

        {/* PHONE + EMAIL */}

        <InfoGroup
          firstLabel="លេខទូរស័ព្ទ"
          firstValue={
            member?.phone ||
            "-"
          }
          firstIcon={
            <Phone className="h-4 w-4 shrink-0" />
          }
          secondLabel="អ៊ីមែល"
          secondValue={
            member?.email ||
            "-"
          }
          secondIcon={
            <Mail className="h-4 w-4 shrink-0" />
          }
        />

        {/* DATES */}

        <InfoGroup
          firstLabel="ថ្ងៃកំណើត"
          firstValue={
            dateOfBirth
          }
          firstIcon={
            <Calendar className="h-4 w-4 shrink-0" />
          }
          secondLabel="ថ្ងៃចូលរួម"
          secondValue={
            joinedDate
          }
          secondIcon={
            <CalendarCheck className="h-4 w-4 shrink-0" />
          }
        />

        {/* NATIONALITY + ETHNICITY */}

        <InfoGroup
          firstLabel="សញ្ជាតិ"
          firstValue={
            nationality
          }
          firstIcon={
            <Globe className="h-4 w-4 shrink-0" />
          }
          secondLabel="ជនជាតិ"
          secondValue={
            ethnicity
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
            typeof value ===
            "string"
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