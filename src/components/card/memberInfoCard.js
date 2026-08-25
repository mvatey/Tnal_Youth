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
  notifyProfileImageChange,
} from "@/lib/member/profileImageStorage";
import { useLanguage } from "@/context/LanguageContext";

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
};

const STATUS_LABELS = {
  ACTIVE: "សកម្ម",
  INACTIVE: "អសកម្ម",
  SUSPENDED: "បានផ្អាក",
  RESIGNED: "បានលាលែង",

  active: "សកម្ម",
  inactive: "អសកម្ម",
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
};

const MAX_PROFILE_IMAGE_SIZE =
  5 * 1024 * 1024;

/*
 * =========================================
 * MEMBER ID
 * =========================================
 */

function getMemberId(member) {
  return (
    member?.memberId ??
    member?.member_id ??
    member?.id ??
    null
  );
}

/*
 * =========================================
 * PROFILE IMAGE
 * =========================================
 */

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

  /*
   * Local preview saved as base64/blob.
   */
  if (
    imagePath.startsWith("data:") ||
    imagePath.startsWith("blob:")
  ) {
    return imagePath;
  }

  /*
   * Full backend URL.
   */
  if (
    imagePath.startsWith("http://") ||
    imagePath.startsWith("https://")
  ) {
    return imagePath;
  }

  /*
   * Local public image.
   */
  if (
    imagePath.startsWith("/profiles/") ||
    imagePath.startsWith("/images/") ||
    imagePath.startsWith("/api/")
  ) {
    return imagePath;
  }

  /*
   * Any root-relative URL belongs to the frontend application.
   * In particular, /api/files and /api/backend carry the logged-in
   * user's cookie to Spring Boot. Rewriting them to a direct backend
   * URL breaks authenticated profile images.
   */
  if (imagePath.startsWith("/")) {
    return imagePath;
  }

  /*
   * Backend relative upload:
   *
   * uploads/member-profiles/xxx.jpg
   */
  const normalizedPath =
    imagePath.startsWith("uploads/")
      ? `/${imagePath}`
      : `/uploads/${imagePath}`;

  return `${BACKEND_ORIGIN}${normalizedPath}`;
}

function getDefaultProfileImage(
  member,
) {
  /*
   * The backend's profile_photo/profilePhoto field is a FileResponse
   * object ({ id, filePath, ... }) — it has no "url" property. Without
   * this check, the chain below always fell through every candidate to
   * the raw object itself, normalizeImageUrl() couldn't find a usable
   * value on it either, and the default placeholder avatar showed even
   * though a photo was uploaded and saved. This is what allowed a
   * profile photo uploaded from My Account to show correctly right
   * after upload (the upload response is handled separately, further
   * below) but disappear anywhere else the member is loaded fresh —
   * such as the Members module's own member detail page.
   */
  const profilePhoto =
    member?.profile_photo ||
    member?.profilePhoto;

  if (
    profilePhoto &&
    typeof profilePhoto === "object" &&
    profilePhoto.id
  ) {
    return `/api/files/${profilePhoto.id}/content`;
  }

  const value =
    member?.profile_photo?.url ||
    member?.profilePhoto?.url ||
    member?.profile_photo_url ||
    member?.profilePhotoUrl ||
    member?.profileImage ||
    member?.profile_image ||
    "";

  return normalizeImageUrl(
    value,
  );
}

/*
 * =========================================
 * GENDER
 * =========================================
 */

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

  if (code === "FEMALE") {
    return "ភេទ ស្រី";
  }

  if (code === "MALE") {
    return "ភេទ ប្រុស";
  }

  if (code === "MONK") {
    return "ព្រះសង្ឃ";
  }

  return gender || "-";
}

function getGenderIcon(gender) {
  const code =
    getGenderCode(gender);

  if (code === "FEMALE") {
    return "♀";
  }

  if (code === "MALE") {
    return "♂";
  }

  return "•";
}

/*
 * =========================================
 * ROLE
 * =========================================
 */

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
  "-");
}

/*
 * =========================================
 * STATUS
 * =========================================
 */

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

/*
 * =========================================
 * BRANCH / LOOKUPS
 * =========================================
 */

function getBranchLabel(
  member,
) {
  const branch =
    member?.branch;

  if (
    branch &&
    typeof branch === "object"
  ) {
    return (
      branch?.name_km ||
      branch?.nameKm ||
      branch?.label_km ||
      branch?.labelKm ||
      branch?.name_en ||
      branch?.nameEn ||
      "-"
    );
  }

  return (
    member?.branch_name_km ||
    member?.branchNameKm ||
    member?.branch_name_en ||
    member?.branchNameEn ||
    branch ||
    "-"
  );
}

/*
 * Some staff (mainly secretaries) are assigned to more than one
 * branch — see the `branch_staff` table. The member/personal-info
 * responses expose the full list as `assigned_branches`; this reads
 * it off either the `member` object directly or a separate
 * `assignedBranches` prop, whichever is supplied.
 */
function getAssignedBranchNames(
  assignedBranches,
) {
  if (!Array.isArray(assignedBranches)) {
    return [];
  }

  return assignedBranches
    .map(
      (item) =>
        item?.name_km ||
        item?.nameKm ||
        item?.name_en ||
        item?.nameEn ||
        "",
    )
    .filter(Boolean);
}

function formatBranchDisplay(
  primaryLabel,
  assignedBranches,
) {
  const names =
    getAssignedBranchNames(
      assignedBranches,
    );

  if (names.length <= 1) {
    return {
      text: primaryLabel,
      title: primaryLabel,
    };
  }

  const extraCount =
    names.length - 1;

  return {
    text: `${primaryLabel} +${extraCount}`,
    title: names.join(", "),
  };
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

/*
 * =========================================
 * COMPONENT
 * =========================================
 */

export default function MemberInfoCard({
  member,
  allowProfileChange = true,
  profileUploadEndpoint =
    "/api/backend/my-account/profile-photo",
  /*
   * Full list of branches this person is actively assigned to
   * (from branch_staff), for staff — mainly secretaries — who
   * cover more than one branch. Optional: falls back to
   * member?.assigned_branches / member?.assignedBranches when
   * not passed explicitly.
   */
  assignedBranches,
}) {
  const { t, label } =
    useLanguage();

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

  const [
    isUploadingImage,
    setIsUploadingImage,
  ] = useState(false);

  const memberId =
    getMemberId(member);

  const defaultProfileImage =
    getDefaultProfileImage(
      member,
    );

  /*
   * IMPORTANT:
   *
   * Use the same local saved profile
   * image as IdCard.
   *
   * This fixes:
   *
   * Blue card  -> default avatar
   * ID card    -> uploaded face
   */
  useEffect(() => {
    if (!memberId) {
      setProfilePreview(
        defaultProfileImage,
      );

      return undefined;
    }

    setProfilePreview(
      defaultProfileImage,
    );

    const handleImageChange = (
      event,
    ) => {
      const changedMemberId =
        event.detail?.memberId;

      if (
        String(
          changedMemberId,
        ) !==
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
      handleImageChange,
    );

    return () => {
      window.removeEventListener(
        "tnal-profile-image-change",
        handleImageChange,
      );
    };
  }, [
    memberId,
    defaultProfileImage,
  ]);

  if (!member) {
    return null;
  }

  /*
   * =========================================
   * DISPLAY DATA
   * =========================================
   */

  const displayName =
    label(member, "-");

  const englishName =
    member?.full_name_en ||
    member?.fullNameEn ||
    member?.name_en ||
    member?.nameEn ||
    "-";

  /*
   * IMPORTANT:
   *
   * Personal info returns:
   *
   * account_role
   *
   * So check it BEFORE generic role.
   */
  const role =
  member?.account_role ||
  member?.accountRole ||
  member?.role ||
  member?.user_role ||
  member?.userRole ||
  "";

  const roleLabel =
    getRoleCode(role) === "ADMIN"
      ? t("memberPage.roleAdmin")
      : getRoleCode(role) === "SECRETARY"
        ? t("memberPage.roleSecretary")
        : getRoleCode(role) === "BRANCH_LEADER"
          ? t("memberPage.roleBranchLeader")
          : getRoleCode(role) === "MEMBER"
            ? t("memberPage.roleMember")
            : getRoleLabel(role);

  /*
   * Personal info returns:
   *
   * account_status
   */
  const status =
    member?.account_status ||
    member?.accountStatus ||
    member?.status ||
    member?.status_code ||
    member?.statusCode ||
    "ACTIVE";

  const statusCode =
    getStatusCode(status);

  const statusLabel =
    statusCode === "ACTIVE"
      ? t("memberPage.active")
      : statusCode === "INACTIVE"
        ? t("memberPage.inactive")
        : statusCode === "SUSPENDED"
          ? t("memberPage.suspended")
          : statusCode === "RESIGNED"
            ? t("memberPage.resigned")
            : getStatusLabel(status);

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
    getBranchLabel(member);

  const branchAssignments =
    assignedBranches ??
    member?.assigned_branches ??
    member?.assignedBranches;

  const branchDisplay =
    formatBranchDisplay(
      branch,
      branchAssignments,
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
      member?.nationality ||
        member?.nationality_name_km ||
        member?.nationalityNameKm,
    );

  const ethnicity =
    getLookupLabel(
      member?.ethnicity ||
        member?.ethnicity_name_km ||
        member?.ethnicityNameKm,
    );

  /*
   * =========================================
   * PROFILE IMAGE UPLOAD
   * =========================================
   */

  const handleChooseImage = () => {
    if (!allowProfileChange) {
      return;
    }

    fileInputRef.current?.click();
  };

  const handleProfileImageChange =
    async (event) => {
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
          t("memberPage.imageOnly", "សូមជ្រើសរើសឯកសាររូបភាពប៉ុណ្ណោះ។"),
        );

        event.target.value = "";

        return;
      }

      if (
        file.size >
        MAX_PROFILE_IMAGE_SIZE
      ) {
        setImageError(
          t("memberPage.imageTooLarge", "ទំហំរូបភាពមិនត្រូវលើស 5MB។"),
        );

        event.target.value = "";

        return;
      }

      if (!memberId) {
        setImageError(
          t("memberPage.missingMemberId", "រកមិនឃើញលេខសម្គាល់សមាជិក។"),
        );

        event.target.value = "";

        return;
      }

      const formData =
        new FormData();

      formData.append(
        "file",
        file,
      );

      setIsUploadingImage(true);

      try {
        const response = await fetch(
          profileUploadEndpoint,
          {
            method: "POST",
            credentials: "include",
            body: formData,
          },
        );

        const responseBody =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          throw new Error(
              responseBody?.message ||
              responseBody?.error ||
              t("memberPage.uploadProfileFailed", "មិនអាចបញ្ចូលរូបភាពប្រវត្តិរូបបានទេ។"),
          );
        }

        const profilePhoto =
          responseBody?.profilePhoto ||
          responseBody?.profile_photo;

        const uploadedImage =
          profilePhoto?.id
            ? `/api/files/${profilePhoto.id}/content`
            : normalizeImageUrl(
                profilePhoto?.url,
              );

        setProfilePreview(
          uploadedImage,
        );

        notifyProfileImageChange(
          memberId,
          uploadedImage,
        );
      } catch (error) {
        setImageError(
          error?.message ||
            t("memberPage.uploadProfileFailed", "មិនអាចបញ្ចូលរូបភាពប្រវត្តិរូបបានទេ។"),
        );
      } finally {
        setIsUploadingImage(false);
        event.target.value = "";
      }

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
        {/* =================================
            PROFILE
        ================================= */}

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
                    disabled={
                      isUploadingImage
                    }
                    onClick={
                      handleChooseImage
                    }
                    aria-label={t("memberPage.changeProfilePhoto", "ប្ដូររូបភាពប្រវត្តិរូប")}
                    title={t("memberPage.changeProfilePhoto", "ប្ដូររូបភាពប្រវត្តិរូប")}
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

          {/* NAME / ROLE / STATUS */}

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

        {/* =================================
            GENDER + BRANCH
        ================================= */}

        <InfoGroup
          firstLabel={t("memberPage.gender")}
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
          secondLabel={t("memberPage.branch")}
          secondValue={branchDisplay.text}
          secondTitle={branchDisplay.title}
          secondIcon={
            <Building2 className="h-4 w-4 shrink-0" />
          }
        />

        {/* =================================
            PHONE + EMAIL
        ================================= */}

        <InfoGroup
          firstLabel={t("branchPage.phone", "លេខទូរស័ព្ទ")}
          firstValue={
            member?.phone || "-"
          }
          firstIcon={
            <Phone className="h-4 w-4 shrink-0" />
          }
          secondLabel={t("branchPage.email", "អ៊ីមែល")}
          secondValue={
            member?.email || "-"
          }
          secondIcon={
            <Mail className="h-4 w-4 shrink-0" />
          }
        />

        {/* =================================
            DATES
        ================================= */}

        <InfoGroup
          firstLabel={t("memberPage.dateOfBirth", "ថ្ងៃកំណើត")}
          firstValue={
            dateOfBirth
          }
          firstIcon={
            <Calendar className="h-4 w-4 shrink-0" />
          }
          secondLabel={t("memberPage.joinedAt")}
          secondValue={
            joinedDate
          }
          secondIcon={
            <CalendarCheck className="h-4 w-4 shrink-0" />
          }
        />

        {/* =================================
            NATIONALITY + ETHNICITY
        ================================= */}

        <InfoGroup
          firstLabel={t("memberPage.nationality", "សញ្ជាតិ")}
          firstValue={
            nationality
          }
          firstIcon={
            <Globe className="h-4 w-4 shrink-0" />
          }
          secondLabel={t("memberPage.ethnicity", "ជនជាតិ")}
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

/*
 * =========================================
 * INFO GROUP
 * =========================================
 */

function InfoGroup({
  firstLabel,
  firstValue,
  firstTitle,
  firstIcon,
  secondLabel,
  secondValue,
  secondTitle,
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
        title={firstTitle}
        icon={firstIcon}
      />

      <div className="mt-3.5">
        <InfoItem
          label={secondLabel}
          value={secondValue}
          title={secondTitle}
          icon={secondIcon}
        />
      </div>
    </div>
  );
}

/*
 * =========================================
 * INFO ITEM
 * =========================================
 */

function InfoItem({
  label,
  value,
  title,
  icon,
}) {
  const tooltip =
    title ||
    (typeof value === "string"
      ? value
      : "");

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
          title={tooltip}
        >
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
