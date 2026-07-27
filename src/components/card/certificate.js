"use client";

import Image from "next/image";
import {
  Battambang,
  Kantumruy_Pro,
  Moul,
  Noto_Sans_Khmer,
} from "next/font/google";

const kantumruyPro = Kantumruy_Pro({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const battambang = Battambang({
  subsets: ["khmer"],
  weight: ["400", "700"],
  display: "swap",
});

const moul = Moul({
  subsets: ["khmer"],
  weight: ["400"],
  display: "swap",
});

const TEXT_COLOR = "#12224c";
const DESCRIPTION_COLOR = "#4b5563";
const DEFAULT_BORDER_COLOR = "#12224c";

const FONT_FAMILIES = {
  "Noto Sans": notoSansKhmer.style.fontFamily,
  "Kantumruy Pro": kantumruyPro.style.fontFamily,
  Battambang: battambang.style.fontFamily,
  Moul: moul.style.fontFamily,
};

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
  const isMember = recipientType === "member";

  const selectedFontFamily = FONT_FAMILIES[font] || FONT_FAMILIES["Noto Sans"];

  const selectedFontWeight = font === "Moul" ? 400 : 700;

  /*
   * These certificate texts always remain English.
   */
  const mainTitle = "CERTIFICATE";
  const subTitle = "OF APPRECIATION";

  const presentedText = "This certificate is proudly presented to";

  /*
   * Only the selected member/activity name changes language.
   */
  const recipientName = isKhmer
    ? member?.name_kh || "ឈ្មោះសមាជិក"
    : member?.name_en || member?.name_kh || "Member Name";
  const defaultDescription = isMember
    ? "For active participation and valuable contribution to the Cambodian Youth Nursery Association."
    : "For successfully organizing and completing this activity.";

  const displayedDescription = description?.trim() || defaultDescription;

  return (
    <div className="flex w-full justify-center">
      <div
        className="
          relative
          h-[460px]
          w-full
          max-w-[780px]
          overflow-hidden
          rounded-lg
          bg-white
          shadow-xl
        "
        style={{
          border: `10px solid ${color}`,
        }}
      >
        {/* Background */}

        {templatePreview ? (
          <>
            <img
              src={templatePreview}
              alt="certificate background"
              className="
                absolute
                inset-0
                h-full
                w-full
                object-cover
              "
            />

            <div className="absolute inset-0 bg-white/35" />
          </>
        ) : (
          <>
            <div
              className="
                absolute
                inset-0
                bg-gradient-to-br
                from-white
                via-white
                to-[#eef4fb]
              "
            />

            <div
              className="
                absolute
                left-0
                top-0
                h-24
                w-24
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
                h-32
                w-32
                rounded-tl-full
                bg-[#12224c]
                opacity-10
              "
            />
          </>
        )}

        {/* Border */}

        <div
          className="
            pointer-events-none
            absolute
            inset-3
            border-2
          "
          style={{
            borderColor: color,
          }}
        />

        {/* Certificate Content */}

        <div
          className="
            relative
            z-10
            flex
            h-full
            flex-col
            items-center
            px-14
            py-8
            text-center
          "
        >
          <Image
            src="/logo.png"
            alt="Cambodian Youth Nursery Association logo"
            width={70}
            height={70}
            className="object-contain"
          />

          <h2
            className="
              mt-2
              text-lg
              font-bold
            "
            style={{
              color: TEXT_COLOR,
            }}
          >
            Cambodian Youth Nursery Association
          </h2>

          <h1
            className={`
              mt-5
              font-bold
              tracking-wide
              ${sizeStyle.title}
            `}
            style={{
              color: TEXT_COLOR,
            }}
          >
            {mainTitle}
          </h1>

          <p
            className="
              mt-1
              text-sm
              font-medium
              tracking-[0.25em]
            "
            style={{
              color: TEXT_COLOR,
            }}
          >
            {subTitle}
          </p>

          <p
            className="
              mt-5
              text-sm
            "
            style={{
              color: DESCRIPTION_COLOR,
            }}
          >
            {presentedText}
          </p>
          {/* Member or Activity Name */}

          <h2
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
              fontFamily: selectedFontFamily,
              fontWeight: selectedFontWeight,
            }}
          >
            {recipientName}
          </h2>

          {/* Description */}

          <p
            className={`
              mt-5
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

          {/* Activity Information */}

          {recipientType === "activity" && activity && (
            <div
              className="
      mt-3
      flex
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
              <span>
                Activity:{" "}
                {isKhmer
                  ? activity.title_kh || "-"
                  : activity.title_en || activity.title_kh || "-"}
              </span>

              <span>Location: {activity.location || "-"}</span>

              <span>Date: {activity.startDate || "-"}</span>

              <span>Branch: {activity.branch || "-"}</span>
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
            "
            style={{
              color: TEXT_COLOR,
            }}
          >
            <div className="text-center">
              <div
                className="
                  mb-2
                  h-px
                  w-32
                  bg-[#12224c]
                "
              />

              <p className="text-xs">President</p>
            </div>

            <div className="text-center">
              <div
                className="
                  mb-2
                  h-px
                  w-32
                  bg-[#12224c]
                "
              />

              <p className="text-xs">Date</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
