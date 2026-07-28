"use client";

import Image from "next/image";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const DEFAULT_USER = {
  id: "",
  role: "member",
  name_kh: "",
  name_en: "",
  gender: "",
  email: "",
  phone: "",
  date_of_birth: "",
  branch: "",
  profile_photo: "/profile.png",
};

export default function IdCard({
  user,
  templatePreview = "",
}) {
  const displayUser = {
    ...DEFAULT_USER,
    ...(user || {}),
  };

  const hasSelectedUser = Boolean(displayUser.id);
  const hasCustomTemplate = Boolean(templatePreview);

  const memberId = hasSelectedUser
    ? String(displayUser.id).padStart(4, "0")
    : "0000";

  const roleKey =
    typeof displayUser.role === "string"
      ? displayUser.role.toLowerCase()
      : "member";

  const roleLabel =
    ROLE_LABELS[roleKey] ||
    displayUser.role ||
    ROLE_LABELS.member;

  const profilePhoto =
    displayUser.profile_photo ||
    displayUser.profilePhoto ||
    "/profile.png";

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
        {/* ====================================
            BACKGROUND
        ==================================== */}

        {hasCustomTemplate ? (
          <>
            <img
              src={templatePreview}
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

        {/* ====================================
            FOOTER
        ==================================== */}

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

        {/* ====================================
            CARD CONTENT
        ==================================== */}

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
                    : "/profile.png"
                }
                alt={
                  displayUser.name_kh ||
                  displayUser.name_en ||
                  "រូបថតសមាជិក"
                }
                fill
                sizes="125px"
                className="object-cover"
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
              >
                {roleLabel}
              </h2>

              <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                <Info
                  label="ឈ្មោះ"
                  value={
                    hasSelectedUser
                      ? displayUser.name_kh
                      : ""
                  }
                />

                <Info
                  label="ឈ្មោះអង់គ្លេស"
                  value={
                    hasSelectedUser
                      ? displayUser.name_en
                      : ""
                  }
                />

                <Info
                  label="ភេទ"
                  value={
                    hasSelectedUser
                      ? displayUser.gender
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
                      ? displayUser.date_of_birth
                      : ""
                  }
                />

                <Info
                  label="សាខា"
                  value={
                    hasSelectedUser
                      ? displayUser.branch
                      : ""
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* ====================================
            DEFAULT INNER BORDER
        ==================================== */}

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
      {/* Main light background */}

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

      {/* Dark left section */}

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

      {/* White curved area */}

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

      {/* Top-right circle */}

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

      {/* Bottom-right circle */}

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

      {/* Left decorative circle */}

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

      {/* Bottom-left outline circle */}

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
        title={value || ""}
      >
        {value || ""}
      </p>
    </div>
  );
}