"use client";

import Image from "next/image";

const ROLE_LABELS = {
  admin: "អ្នកគ្រប់គ្រង",
  branch_leader: "ប្រធានសាខា",
  secretary: "លេខាធិការ",
  member: "សមាជិក",
};

const NAME_SIZE_STYLES = {
  small: "text-[20px]",
  medium: "text-[25px]",
  large: "text-[30px]",
};

function getFontFamily(font) {
  const fonts = {
    "Noto Sans":
      '"Noto Sans Khmer", sans-serif',

    "Kantumruy Pro":
      '"Kantumruy Pro", sans-serif',

    Battambang:
      '"Battambang", sans-serif',

    Moul:
      '"Moul", serif',
  };

  return (
    fonts[font] ||
    fonts["Noto Sans"]
  );
}

function getBranchName(branch) {
  if (!branch) {
    return "";
  }

  if (typeof branch === "string") {
    return branch;
  }

  return (
    branch.name_kh ||
    branch.name_en ||
    branch.name ||
    ""
  );
}

function formatKhmerDate(dateValue) {
  if (!dateValue) {
    return "មិនមានកាលបរិច្ឆេទ";
  }

  const parsedDate =
    new Date(dateValue);

  if (
    Number.isNaN(
      parsedDate.getTime(),
    )
  ) {
    return dateValue;
  }

  try {
    return new Intl.DateTimeFormat(
      "km-KH",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
      },
    ).format(parsedDate);
  } catch {
    return dateValue;
  }
}

export default function LetterOfAppointment({
  user,
  language = "km",
  color = "#12224c",
  font = "Noto Sans",
  fontSize = "medium",
  description = "",
  templatePreview = "",
}) {
  if (!user) {
    return null;
  }

  /*
   * Language changes only the member name.
   * Every other label remains Khmer.
   */
  const displayName =
    language === "en"
      ? user.name_en ||
        user.fullNameEn ||
        user.name_kh ||
        "មិនមានឈ្មោះ"
      : user.name_kh ||
        user.fullNameKm ||
        user.name_en ||
        "មិនមានឈ្មោះ";

  const roleLabel =
    ROLE_LABELS[user.role] ||
    user.role ||
    "សមាជិក";

  const branchName =
    getBranchName(user.branch) ||
    "សាខា";

  const memberId =
    user.id !== undefined &&
    user.id !== null
      ? String(user.id)
      : "0";

  const letterNumber =
    `NAS-AP-2026-${memberId.padStart(
      4,
      "0",
    )}`;

  const memberNameSize =
    NAME_SIZE_STYLES[fontSize] ||
    NAME_SIZE_STYLES.medium;

  const memberNameFont =
    getFontFamily(font);

  const issueDate =
    formatKhmerDate(
      user.joinedAt,
    );

  const defaultDescription = `សមាគមថ្នាលយុវជនកម្ពុជា សម្រេចតែងតាំងឈ្មោះខាងលើឱ្យបំពេញតួនាទីជា ${roleLabel} ប្រចាំ ${branchName}។ សាមីខ្លួនត្រូវអនុវត្តតួនាទី ភារកិច្ច និងការទទួលខុសត្រូវ ប្រកបដោយស្មារតីស្ម័គ្រចិត្ត សាមគ្គីភាព តម្លាភាព និងគោរពតាមបទបញ្ជារបស់សមាគម។`;

  return (
    <div className="flex w-full justify-center py-3">
      <div
        className="
          relative
          h-[490px]
          w-[700px]
          shrink-0
          overflow-hidden
          rounded-2xl
          bg-[#fffefb]
          shadow-lg
        "
        style={{
          /*
           * Selected color changes only
           * the outer appointment-letter border.
           */
          border: `8px solid ${color}`,
        }}
      >
        {/* Template background */}

        {templatePreview && (
          <img
            src={templatePreview}
            alt="គំរូលិខិតតែងតាំង"
            className="
              absolute
              inset-0
              h-full
              w-full
              object-fill
            "
          />
        )}

        {/* Keep content readable */}

        <div className="absolute inset-0 bg-white/5" />

        {/* Letter number */}

        <div
          className="
            absolute
            right-7
            top-5
            z-20
            text-right
            text-[10px]
            font-medium
            text-[#12224c]
          "
        >
          <p>លេខលិខិត</p>
          <p>{letterNumber}</p>
        </div>

        {/* Main content */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            flex-col
            items-center
            px-20
            pb-1
            pt-4
            text-[#12224c]
          "
          style={{
            fontFamily:
              '"Kantumruy Pro", "Noto Sans Khmer", sans-serif',
          }}
        >
          <Image
            src="/logo.png"
            alt="TNAL Youth logo"
            width={58}
            height={58}
            className="object-contain"
            priority
          />

          <h1 className="mt-1 text-[27px] font-bold">
            លិខិតតែងតាំង
          </h1>

          <div className="mt-1 flex items-center gap-2">
            <span className="h-px w-16 bg-[#d6a42e]" />

            <span className="text-sm text-[#d6a42e]">
              ❖
            </span>

            <span className="h-px w-16 bg-[#d6a42e]" />
          </div>

          <p className="mt-2 text-[11px] font-medium">
            សមាគមថ្នាលយុវជនកម្ពុជា
            (TNAL Youth Association)
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-px w-12 bg-[#d6a42e]" />

            <span className="text-xs text-[#d6a42e]">
              ❖
            </span>

            <span className="h-px w-12 bg-[#d6a42e]" />
          </div>

          <p className="mt-0.5 text-[10px] font-medium">
            សម្រេចតែងតាំង
          </p>

          {/* Only member name changes font,
              font size and language */}

          <h2
            className={`
              mt-1
              font-bold
              leading-tight
              ${memberNameSize}
            `}
            style={{
              fontFamily:
                memberNameFont,
            }}
          >
            {displayName}
          </h2>

          <p className="mt-1  text-[10px] font-medium">
            ជា {roleLabel}
          </p>

          <p className="mt-0.5 text-[10px] font-medium">
            {branchName}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-px w-20 bg-[#d6a42e]" />

            <span className="text-xs text-[#d6a42e]">
              ❖
            </span>

            <span className="h-px w-20 bg-[#d6a42e]" />
          </div>

          <p
            className="
              mt-3
              max-w-[580px]
              text-center
              text-[10px]
              leading-5
              text-[#244363]
            "
          >
            {description?.trim() ||
              defaultDescription}
          </p>

          <p className="mt-2 text-[10px] font-medium">
            ចេញនៅថ្ងៃទី {issueDate}
          </p>

          {/* Signatures */}

          <div
            className="
              mt-auto
              grid
              w-full
              grid-cols-3
              items-end
              px-7
            "
          >
            <div className="text-center">
              <div
                className="
                  mx-auto
                  mb-1
                  h-7
                  w-24
                  border-b
                  border-[#d6a42e]
                "
              />

              <p className="text-[10px] font-bold">
                ប្រធានសមាគម
              </p>

              <p className="mt-0.5 text-[8px]">
                សមាគមថ្នាលយុវជនកម្ពុជា
              </p>
            </div>

            <div className="flex justify-center">
              <div
                className="
                  relative
                  flex
                  h-16
                  w-16
                  items-center
                  justify-center
                  rounded-full
                  border-[3px]
                  border-red-600
                  bg-white
                "
              >
                <div
                  className="
                    absolute
                    inset-1
                    rounded-full
                    border
                    border-red-600
                  "
                />

                <Image
                  src="/logo.png"
                  alt="Official seal"
                  width={43}
                  height={43}
                  className="object-contain"
                />
              </div>
            </div>

            <div className="text-center">
              <div
                className="
                  mx-auto
                  mb-1
                  h-7
                  w-24
                  border-b
                  border-[#d6a42e]
                "
              />

              <p className="text-[10px] font-bold">
                អគ្គលេខាធិការ
              </p>

              <p className="mt-0.5 text-[8px]">
                សមាគមថ្នាលយុវជនកម្ពុជា
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}