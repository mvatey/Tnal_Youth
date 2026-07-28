"use client";

import Image from "next/image";

const TEXT_COLOR = "#12224c";
const DESCRIPTION_COLOR = "#4b5563";
const DEFAULT_BORDER_COLOR = "#12224c";

const SIZE_STYLES = {
  small: {
    name: "text-[23px]",
  },

  medium: {
    name: "text-[28px]",
  },

  large: {
    name: "text-[34px]",
  },
};

const FONT_FAMILIES = {
  "Noto Sans": "var(--font-noto-sans-khmer)",
  "Kantumruy Pro": "var(--font-kantumruy-pro)",
  Battambang: "var(--font-battambang)",
  Moul: "var(--font-moul)",
};

function getMemberName(member, language) {
  if (language === "en") {
    return (
      member?.name_en ||
      member?.fullNameEn ||
      member?.full_name_en ||
      member?.name_kh ||
      "Member Name"
    );
  }

  return (
    member?.name_kh ||
    member?.fullNameKm ||
    member?.full_name_km ||
    "ឈ្មោះសមាជិក"
  );
}

export default function CertificateCard({
  recipientType = "member",
  member,
  activity,
  language = "km",
  color = DEFAULT_BORDER_COLOR,
  font = "Noto Sans",
  fontSize = "medium",
  description = "",
  templatePreview = "",
}) {
  const isActivity = recipientType === "activity";

  const hasCustomTemplate = Boolean(templatePreview);

  const sizeStyle = SIZE_STYLES[fontSize] || SIZE_STYLES.medium;

  /*
   * Only the member name changes
   * when language changes.
   */
  const recipientName = getMemberName(member, language);

  /*
   * Only the member name uses
   * the selected font.
   */
  const memberNameFont = FONT_FAMILIES[font] || "var(--font-kantumruy-pro)";

  /*
   * All other certificate text
   * always stays in Khmer.
   */
  const certificateTextFont = "var(--font-kantumruy-pro)";

  const activityTitle =
    activity?.title_kh || activity?.titleKm || activity?.title || "";

  const activityLocation = activity?.location || activity?.address || "";

  const activityDate =
    activity?.startDate || activity?.start_date || activity?.date || "";

  const activityBranch =
    activity?.branch?.name_kh || activity?.branchName || activity?.branch || "";

  const defaultDescription = isActivity
    ? "សម្រាប់ការចូលរួមយ៉ាងសកម្ម និងការរួមចំណែកដ៏មានតម្លៃក្នុងសកម្មភាពនេះ។"
    : "សម្រាប់ការចូលរួមយ៉ាងសកម្ម និងការរួមចំណែកដ៏មានតម្លៃដល់សមាគមថ្នាលយុវជនកម្ពុជា។";

  const displayedDescription = description?.trim() || defaultDescription;

  return (
    <div className="flex w-full justify-center py-4">
      <div
        className="
          relative
          h-[439px]
          w-[780px]
          shrink-0
          overflow-hidden
          rounded-xl
          bg-white
          shadow-xl
        "
      >
        {/* Background */}

        {hasCustomTemplate ? (
          <>
            <img
              src={templatePreview}
              alt="Certificate template"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-fill
              "
            />

            <div className="absolute inset-0 bg-white/5" />
          </>
        ) : (
          <DefaultCertificateBackground />
        )}

        {/* Outer border */}

        <div
          className="
    pointer-events-none
    absolute
    inset-0
    z-20
    rounded-2xl
    border-[10px]
  "
          style={{
            borderColor: color,
          }}
        />

        <div />

        {/* Certificate content */}

        <div
          className="
            absolute
            inset-0
            z-10
            flex
            flex-col
            items-center
            px-14
            py-8
            text-center
          "
          style={{
            fontFamily: certificateTextFont,
          }}
        >
          <Image
            src="/logo.png"
            alt="Organization logo"
            width={68}
            height={68}
            className="object-contain"
            priority
          />

          <h2
            className="mt-2 text-lg font-bold"
            style={{
              color: TEXT_COLOR,
            }}
          >
            សមាគមថ្នាលយុវជនកម្ពុជា
          </h2>

          <h1
            className="
              mt-4
              text-[36px]
              font-bold
              tracking-wide
            "
            style={{
              color: TEXT_COLOR,
            }}
          >
            បណ្ណសរសើរ
          </h1>

          <p
            className="
              mt-1
              text-sm
              font-medium
              tracking-[0.2em]
            "
            style={{
              color: TEXT_COLOR,
            }}
          >
            លិខិតបញ្ជាក់នៃការកោតសរសើរ
          </p>

          <p
            className="mt-4 text-sm"
            style={{
              color: DESCRIPTION_COLOR,
            }}
          >
            បណ្ណសរសើរនេះត្រូវបានប្រគល់ជូន
          </p>

          {/* Only member name changes */}

          <h3
            className={`
              mt-3
              max-w-[650px]
              border-b-2
              px-10
              pb-2
              leading-relaxed
              ${sizeStyle.name}
            `}
            style={{
              color: TEXT_COLOR,
              borderColor: TEXT_COLOR,
              fontFamily: memberNameFont,
              fontWeight:
                font === "Moul" ? 400 : font === "Battambang" ? 700 : 600,
            }}
          >
            {recipientName}
          </h3>

          <p
            className="
              mt-4
              max-w-[620px]
              text-sm
              leading-7
            "
            style={{
              color: DESCRIPTION_COLOR,
            }}
          >
            {displayedDescription}
          </p>

          {isActivity && activity && (
            <div
              className="
                  mt-3
                  flex
                  max-w-[650px]
                  flex-wrap
                  justify-center
                  gap-x-6
                  gap-y-1
                  text-xs
                "
              style={{
                color: TEXT_COLOR,
                borderColor: TEXT_COLOR,
                fontFamily: memberNameFont,
                fontWeight:
                  font === "Moul" ? 400 : font === "Battambang" ? 700 : 600,
              }}
            >
              {activityTitle && <span>សកម្មភាព៖ {activityTitle}</span>}

              {activityLocation && <span>ទីតាំង៖ {activityLocation}</span>}

              {activityDate && <span>កាលបរិច្ឆេទ៖ {activityDate}</span>}

              {activityBranch && <span>សាខា៖ {activityBranch}</span>}
            </div>
          )}

          <div className="mt-auto w-full" />
        </div>
      </div>
    </div>
  );
}

function DefaultCertificateBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white">
      <div
        className="
          absolute
          inset-0
          bg-gradient-to-br
          from-white
          via-[#fbfdff]
          to-[#eaf1ff]
        "
      />

      <div
        className="
          absolute
          left-0
          top-0
          h-28
          w-28
          rounded-br-full
          bg-[#12224c]
          opacity-10
        "
      />

      <div
        className="
          absolute
          bottom-0
          right-0
          h-36
          w-36
          rounded-tl-full
          bg-[#12224c]
          opacity-10
        "
      />

      <div
        className="
          absolute
          right-[-6%]
          top-[-24%]
          h-56
          w-56
          rounded-full
          bg-[#8db7ee]
          opacity-20
        "
      />

      <div
        className="
          absolute
          bottom-[-30%]
          left-[5%]
          h-64
          w-64
          rounded-full
          bg-[#9ebcf0]
          opacity-15
        "
      />

      <div
        className="
          absolute
          left-[8%]
          top-[14%]
          h-16
          w-1
          rounded-full
          bg-[#12224c]
          opacity-20
        "
      />

      <div
        className="
          absolute
          bottom-[12%]
          right-[12%]
          h-14
          w-14
          rounded-full
          border-2
          border-[#12224c]
          opacity-10
        "
      />
    </div>
  );
}
