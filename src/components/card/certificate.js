"use client";

import Image from "next/image";

const TEXT_COLOR = "#12224c";
const DESCRIPTION_COLOR = "#4b5563";
const DEFAULT_BORDER_COLOR = "#12224c";

const SIZE_STYLES = {
  small: {
    title: "text-[28px]",
    name: "text-[23px]",
    description: "text-xs",
  },
  medium: {
    title: "text-[36px]",
    name: "text-[28px]",
    description: "text-sm",
  },
  large: {
    title: "text-[44px]",
    name: "text-[34px]",
    description: "text-base",
  },
};

const FONT_FAMILIES = {
  "Noto Sans": "var(--font-noto-sans-khmer)",
  "Kantumruy Pro": "var(--font-kantumruy-pro)",
  Battambang: "var(--font-battambang)",
  Moul: "var(--font-moul)",
};

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
  const sizeStyle = SIZE_STYLES[fontSize] || SIZE_STYLES.medium;

  const isKhmer = language === "km";
  const isActivity = recipientType === "activity";
  const hasCustomTemplate = Boolean(templatePreview);

  const certificateFont =
    FONT_FAMILIES[font] ||
    (isKhmer ? "var(--font-kantumruy-pro)" : "Arial, sans-serif");

  const recipientName = isKhmer
    ? member?.name_kh ||
      member?.fullNameKm ||
      member?.full_name_km ||
      "ឈ្មោះសមាជិក"
    : member?.name_en ||
      member?.fullNameEn ||
      member?.full_name_en ||
      member?.name_kh ||
      "Member Name";

  const activityTitle = isKhmer
    ? activity?.title_kh || activity?.titleKm || activity?.title || ""
    : activity?.title_en ||
      activity?.titleEn ||
      activity?.title ||
      activity?.title_kh ||
      "";

  const activityLocation = activity?.location || activity?.address || "";

  const activityDate =
    activity?.startDate || activity?.start_date || activity?.date || "";

  const activityBranch =
    activity?.branch?.name_kh ||
    activity?.branch?.name_en ||
    activity?.branchName ||
    activity?.branch ||
    "";

  const defaultDescription = isKhmer
    ? isActivity
      ? "សម្រាប់ការចូលរួមយ៉ាងសកម្ម និងការរួមចំណែកដ៏មានតម្លៃក្នុងសកម្មភាពនេះ។"
      : "សម្រាប់ការចូលរួមយ៉ាងសកម្ម និងការរួមចំណែកដ៏មានតម្លៃដល់សមាគមថ្នាលយុវជនកម្ពុជា។"
    : isActivity
      ? "For active participation and valuable contribution to this activity."
      : "For active participation and valuable contribution to the Cambodian Youth Nursery Association.";

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
        style={{
          border: hasCustomTemplate ? "none" : `10px solid ${color}`,
        }}
      >
        {/* Background */}
        {hasCustomTemplate ? (
          <>
            <img
              src={templatePreview}
              alt="Certificate template"
              className="absolute inset-0 h-full w-full object-fill"
            />

            <div className="absolute inset-0 bg-white/5" />
          </>
        ) : (
          <DefaultCertificateBackground color={color} />
        )}

        {/* Default inner border */}
        {!hasCustomTemplate && (
          <div
            className="
              pointer-events-none
              absolute
              inset-3
              z-20
              border-2
            "
            style={{
              borderColor: color,
            }}
          />
        )}

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
            fontFamily: certificateFont,
          }}
        >
          {/* Logo */}
          <Image
            src="/logo.png"
            alt="Organization logo"
            width={68}
            height={68}
            className="object-contain"
            priority
          />

          {/* Organization name */}
          <h2
            className="mt-2 text-lg font-bold"
            style={{
              color: TEXT_COLOR,
            }}
          >
            {isKhmer
              ? "សមាគមថ្នាលយុវជនកម្ពុជា"
              : "Cambodian Youth Nursery Association"}
          </h2>

          {/* Main title */}
          <h1
            className={`
              mt-4
              font-bold
              tracking-wide
              ${sizeStyle.title}
            `}
            style={{
              color: TEXT_COLOR,
            }}
          >
            {isKhmer ? "បណ្ណសរសើរ" : "CERTIFICATE"}
          </h1>

          {/* Subtitle */}
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
            {isKhmer ? "លិខិតបញ្ជាក់នៃការកោតសរសើរ" : "OF APPRECIATION"}
          </p>

          {/* Presented text */}
          <p
            className="mt-4 text-sm"
            style={{
              color: DESCRIPTION_COLOR,
            }}
          >
            {isKhmer
              ? "បណ្ណសរសើរនេះត្រូវបានប្រគល់ជូន"
              : "This certificate is proudly presented to"}
          </p>

          {/* Recipient name */}
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
              borderColor: color,
              fontWeight: font === "Moul" ? 400 : 700,
            }}
          >
            {recipientName}
          </h3>

          {/* Description */}
          <p
            className={`
              mt-4
              max-w-[620px]
              leading-7
              ${sizeStyle.description}
            `}
            style={{
              color: DESCRIPTION_COLOR,
            }}
          >
            {displayedDescription}
          </p>

          {/* Activity details */}
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
                color: DESCRIPTION_COLOR,
              }}
            >
              {activityTitle && (
                <span>
                  {isKhmer ? "សកម្មភាព៖ " : "Activity: "}
                  {activityTitle}
                </span>
              )}

              {activityLocation && (
                <span>
                  {isKhmer ? "ទីតាំង៖ " : "Location: "}
                  {activityLocation}
                </span>
              )}

              {activityDate && (
                <span>
                  {isKhmer ? "កាលបរិច្ឆេទ៖ " : "Date: "}
                  {activityDate}
                </span>
              )}

              {activityBranch && (
                <span>
                  {isKhmer ? "សាខា៖ " : "Branch: "}
                  {activityBranch}
                </span>
              )}
            </div>
          )}

          {/* Footer */}
          <div
            className="
              mt-auto
              flex
              w-full
              items-end
              justify-between
              px-10
              pb-1
            "
            style={{
              color: TEXT_COLOR,
            }}
          >
            <div className="text-center">
              <div
                className="mb-2 h-px w-32"
                style={{
                  backgroundColor: color,
                }}
              />

              <p className="text-xs">{isKhmer ? "ប្រធានសមាគម" : "President"}</p>
            </div>

            <div className="text-center">
              <div
                className="mb-2 h-px w-32"
                style={{
                  backgroundColor: color,
                }}
              />

              <p className="text-xs">{isKhmer ? "កាលបរិច្ឆេទ" : "Date"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DefaultCertificateBackground({ color }) {
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

      {/* Top-left corner */}
      <div
        className="
          absolute
          left-0
          top-0
          h-28
          w-28
          rounded-br-full
          opacity-10
        "
        style={{
          backgroundColor: color,
        }}
      />

      {/* Bottom-right corner */}
      <div
        className="
          absolute
          bottom-0
          right-0
          h-36
          w-36
          rounded-tl-full
          opacity-10
        "
        style={{
          backgroundColor: color,
        }}
      />

      {/* Top-right circle */}
      <div
        className="
          absolute
          right-[-6%]
          top-[-24%]
          h-56
          w-56
          rounded-full
          opacity-20
        "
        style={{
          backgroundColor: "#8db7ee",
        }}
      />

      {/* Bottom-left circle */}
      <div
        className="
          absolute
          bottom-[-30%]
          left-[5%]
          h-64
          w-64
          rounded-full
          opacity-15
        "
        style={{
          backgroundColor: "#9ebcf0",
        }}
      />

      {/* Left accent line */}
      <div
        className="
          absolute
          left-[8%]
          top-[14%]
          h-16
          w-1
          rounded-full
          opacity-20
        "
        style={{
          backgroundColor: color,
        }}
      />

      {/* Decorative outlined circle */}
      <div
        className="
          absolute
          bottom-[12%]
          right-[12%]
          h-14
          w-14
          rounded-full
          border-2
          opacity-10
        "
        style={{
          borderColor: color,
        }}
      />
    </div>
  );
}
