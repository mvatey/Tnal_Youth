"use client";

import Image from "next/image";

const TEXT_COLOR = "#12224c";
const DESCRIPTION_COLOR = "#4b5563";
const DEFAULT_BORDER_COLOR = "#12224c";

const BASE_CARD_WIDTH = 780;
const BASE_CARD_HEIGHT = 439;

const CARD_WIDTHS = {
  650: 650,
  780: 780,
  900: 900,
};

const FONT_FAMILIES = {
  "Noto Sans":
    "var(--font-noto-sans-khmer)",

  "Kantumruy Pro":
    "var(--font-kantumruy-pro)",

  Battambang:
    "var(--font-battambang)",

  Moul:
    "var(--font-moul)",
};

function getMemberName(
  member,
  language,
) {
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

  // This color affects only the recipient name.
  color = TEXT_COLOR,

  font = "Noto Sans",

  // Whole certificate width.
  cardSize = "780",

  description = "",
  templatePreview = "",
}) {
  const isActivity =
    recipientType === "activity";

  const hasCustomTemplate =
    Boolean(templatePreview);

  const selectedWidth =
    CARD_WIDTHS[
      String(cardSize)
    ] || BASE_CARD_WIDTH;

  const scale =
    selectedWidth /
    BASE_CARD_WIDTH;

  const selectedHeight =
    BASE_CARD_HEIGHT *
    scale;

  const recipientName =
    getMemberName(
      member,
      language,
    );

  const memberNameFont =
    FONT_FAMILIES[font] ||
    "var(--font-kantumruy-pro)";

  const certificateTextFont =
    "var(--font-kantumruy-pro)";

  const activityTitle =
    activity?.title_kh ||
    activity?.titleKm ||
    activity?.title ||
    "";

  const activityLocation =
    activity?.location ||
    activity?.address ||
    "";

  const activityDate =
    activity?.startDate ||
    activity?.start_date ||
    activity?.date ||
    "";

  const activityBranch =
    activity?.branch?.name_kh ||
    activity?.branchName ||
    activity?.branch ||
    "";

  const defaultDescription =
    isActivity
      ? "សម្រាប់ការចូលរួមយ៉ាងសកម្ម និងការរួមចំណែកដ៏មានតម្លៃក្នុងសកម្មភាពនេះ។"
      : "សម្រាប់ការចូលរួមយ៉ាងសកម្ម និងការរួមចំណែកដ៏មានតម្លៃដល់សមាគមថ្នាលយុវជនកម្ពុជា។";

  const displayedDescription =
    description?.trim() ||
    defaultDescription;

  return (
    <div className="flex w-full justify-center py-4">
      {/* Scaled visible area */}

      <div
        className="
          relative
          shrink-0
        "
        style={{
          width: `${selectedWidth}px`,
          height: `${selectedHeight}px`,
        }}
      >
        {/* Base certificate scaled as one complete card */}

        <div
          className="
            absolute
            left-0
            top-0
            h-[439px]
            w-[780px]
            origin-top-left
            overflow-hidden
            rounded-xl
            bg-white
            shadow-xl
          "
          style={{
            transform: `scale(${scale})`,
          }}
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

          {/* Fixed outer border
              The user-selected color does not affect this. */}

          <div
            className="
              pointer-events-none
              absolute
              inset-0
              z-30
              rounded-2xl
              border-[10px]
            "
            style={{
              borderColor:
                DEFAULT_BORDER_COLOR,
            }}
          />

          {/* Main certificate content */}

          <div
            className="
              absolute
              inset-0
              z-10
              flex
              flex-col
              items-center
              px-14
              pb-[92px]
              pt-5
              text-center
            "
            style={{
              fontFamily:
                certificateTextFont,
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
              className="
                mt-2
                text-lg
                font-bold
              "
              style={{
                color:
                  TEXT_COLOR,
              }}
            >
              សមាគមថ្នាលយុវជនកម្ពុជា
            </h2>

            <h1
              className="
                mt-3
                text-[36px]
                font-bold
                tracking-wide
              "
              style={{
                color:
                  TEXT_COLOR,
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
                color:
                  TEXT_COLOR,
              }}
            >
              លិខិតបញ្ជាក់នៃការកោតសរសើរ
            </p>

            <p
              className="mt-3 text-sm"
              style={{
                color:
                  DESCRIPTION_COLOR,
              }}
            >
              បណ្ណសរសើរនេះត្រូវបានប្រគល់ជូន
            </p>

            {/* Recipient name
                Only this text changes color. */}

            <h3
              className="
                mt-2
                max-w-[650px]
                border-b-2
                px-10
                pb-1
                text-[28px]
                leading-relaxed
              "
              style={{
                color,

                // Underline stays dark blue.
                borderColor:
                  TEXT_COLOR,

                fontFamily:
                  memberNameFont,

                fontWeight:
                  font === "Moul"
                    ? 400
                    : font ===
                        "Battambang"
                      ? 700
                      : 600,
              }}
            >
              {recipientName}
            </h3>

            <p
              className="
                mt-3
                max-w-[620px]
                text-xs
                leading-5
              "
              style={{
                color:
                  DESCRIPTION_COLOR,
              }}
            >
              {displayedDescription}
            </p>

            {isActivity &&
              activity && (
                <div
                  className="
                    mt-2
                    flex
                    max-w-[650px]
                    flex-wrap
                    justify-center
                    gap-x-5
                    gap-y-1
                    text-[10px]
                  "
                  style={{
                    color:
                      TEXT_COLOR,

                    fontFamily:
                      memberNameFont,

                    fontWeight:
                      font ===
                      "Moul"
                        ? 400
                        : font ===
                            "Battambang"
                          ? 700
                          : 600,
                  }}
                >
                  {activityTitle && (
                    <span>
                      សកម្មភាព៖{" "}
                      {activityTitle}
                    </span>
                  )}

                  {activityLocation && (
                    <span>
                      ទីតាំង៖{" "}
                      {activityLocation}
                    </span>
                  )}

                  {activityDate && (
                    <span>
                      កាលបរិច្ឆេទ៖{" "}
                      {activityDate}
                    </span>
                  )}

                  {activityBranch && (
                    <span>
                      សាខា៖{" "}
                      {activityBranch}
                    </span>
                  )}
                </div>
              )}
          </div>

          {/* Signatures */}

          <div
            className="
              absolute
              bottom-5
              left-0
              right-0
              z-20
              flex
              items-end
              justify-between
              px-[110px]
            "
            style={{
              fontFamily:
                certificateTextFont,
            }}
          >
            <Signature
              title="ប្រធានសមាគម"
            />

            <Signature
              title="អគ្គលេខាធិការ"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

function Signature({
  title,
}) {
  return (
    <div className="w-[150px] text-center">
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

      <p
        className="
          text-[10px]
          font-bold
        "
        style={{
          color: TEXT_COLOR,
        }}
      >
        {title}
      </p>

      <p
        className="
          mt-0.5
          text-[8px]
        "
        style={{
          color:
            DESCRIPTION_COLOR,
        }}
      >
        សមាគមថ្នាលយុវជនកម្ពុជា
      </p>
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