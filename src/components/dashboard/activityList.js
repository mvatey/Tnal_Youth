"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const TYPE_BADGE = {
  INTERNAL: {
    label: "កម្មវិធីខាងក្នុង",
    color: "var(--color-primary, #6D5BD0)",
    tint: "var(--color-primary-light, #F1EEFC)",
  },
  EXTERNAL: {
    label: "កម្មវិធីខាងក្រៅ",
    color: "var(--color-success, #2FA36B)",
    tint: "var(--color-success-bg, #E9F9F1)",
  },
};

function normalizeType(type) {
  return String(type ?? "")
    .trim()
    .toUpperCase();
}

function TypeBadge({ type }) {
  const normalizedType =
    normalizeType(type);

  const config =
    TYPE_BADGE[normalizedType] ?? {
      label: type || "-",
      color: "var(--color-text-secondary, #6B7280)",
      tint: "var(--color-bg-page-gray, #F1F2F5)",
    };

  return (
    <span
      style={{
        display: "inline-block",
        borderRadius: 6,
        background: config.tint,
        padding: "2px 7px",
        color: config.color,
        fontSize: 10,
        fontWeight: 400,
        whiteSpace: "nowrap",
      }}
    >
      {config.label}
    </span>
  );
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat(
    "km-KH",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

function ActivityThumbnail({ activity }) {
  // The backend sends the cover image's FILE ID (coverImageId), not a
  // ready-to-use URL -- files are only ever servable through
  // /api/backend/files/{id}/content, same as the activity detail page
  // (see app/activity/[id]/page.js). Used to read activity?.image, a
  // field the backend never actually sent, so every card silently fell
  // back to the placeholder regardless of whether the activity had a
  // photo.
  const coverImageId =
    activity?.coverImageId ??
    activity?.cover_image_id;

  const imageUrl = coverImageId
    ? `/api/backend/files/${coverImageId}/content`
    : "/activity-placeholder.svg";

  return (
    <img
      src={imageUrl}
      alt={
        activity?.titleKm ??
        activity?.title_km ??
        activity?.title ??
        ""
      }
      onError={(event) => {
        event.currentTarget.src =
          "/activity-placeholder.svg";
      }}
      style={{
        width: 64,
        height: 44,
        flexShrink: 0,
        borderRadius: 8,
        background: "var(--color-bg-page-gray, #F1F2F5)",
        objectFit: "cover",
      }}
    />
  );
}

function ViewMoreLink({
  onClick,
}) {
  const [
    isHovered,
    setIsHovered,
  ] = useState(false);

  return (
    <button
      type="button"
      onClick={onClick}
      onMouseEnter={() =>
        setIsHovered(true)
      }
      onMouseLeave={() =>
        setIsHovered(false)
      }
      style={{
        border: "none",
        background: "none",
        padding: 0,
        color: isHovered
          ? "#4A3AA8"
          : "#6D5BD0",
        fontFamily: "inherit",
        fontSize: 11,
        textDecoration: "underline",
        cursor: "pointer",
      }}
    >
      មើលទាំងអស់
    </button>
  );
}

function ActivityRow({
  activity,
  variant,
  onClick,
}) {
  const title =
    activity?.titleKm ??
    activity?.title_km ??
    activity?.title ??
    "-";

  const type =
    activity?.type?.code ??
    activity?.type ??
    "";

  const participantCount =
    Number(
      activity?.participantCount ??
        activity?.participant_count ??
        activity?.attendeeCount
    ) || 0;

  const dateValue =
    activity?.startsAt ??
    activity?.starts_at ??
    activity?.date;

  const isCompleted =
    variant === "completed";

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        width: "100%",
        alignItems: "center",
        gap: 10,
        border: "none",
        borderBottom:
          "1px solid var(--color-border, #F2F3F5)",
        background: "transparent",
        padding: "7px 0",
        textAlign: "left",
        fontFamily: "inherit",
        cursor: "pointer",
      }}
    >
      <ActivityThumbnail
        activity={activity}
      />

      <div
        style={{
          minWidth: 0,
          flex: 1,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 6,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              color: "var(--color-text-primary, #232629)",
              fontSize: 12,
              fontWeight: 500,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {title}
          </span>

          <TypeBadge type={type} />
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent:
              "space-between",
            gap: 8,
            marginTop: 2,
          }}
        >
          <span
            style={{
              overflow: "hidden",
              color: "var(--color-text-mute, #9AA0A8)",
              fontSize: 10,
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {formatDateTime(dateValue)}
          </span>

          {isCompleted && (
            <span
              style={{
                flexShrink: 0,
                color: "var(--color-text-mute, #9AA0A8)",
                fontSize: 10,
              }}
            >
              អ្នកចូលរួមសរុប{" "}
              {participantCount.toLocaleString()}
              នាក់
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

function ActivityListSkeleton() {
  return (
    <div
      style={{
        padding: "12px 0",
      }}
    >
      {[0, 1, 2].map((item) => (
        <div
          key={item}
          style={{
            display: "flex",
            gap: 10,
            borderBottom:
              "1px solid var(--color-border, #F2F3F5)",
            padding: "7px 0",
          }}
        >
          <div
            className="animate-pulse"
            style={{
              width: 64,
              height: 44,
              flexShrink: 0,
              borderRadius: 8,
              background: "var(--color-bg-page-gray, #F1F2F5)",
            }}
          />

          <div
            style={{
              flex: 1,
            }}
          >
            <div
              className="animate-pulse"
              style={{
                width: "60%",
                height: 9,
                marginBottom: 6,
                borderRadius: 4,
                background: "var(--color-bg-page-gray, #F1F2F5)",
              }}
            />

            <div
              className="animate-pulse"
              style={{
                width: "40%",
                height: 7,
                borderRadius: 4,
                background: "var(--color-bg-page-gray, #F1F2F5)",
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivityListCard({
  title,
  activities = [],
  loading = false,
  variant,
  onViewAll,
}) {
  const router =
    useRouter();

  function openActivity(
    activity
  ) {
    const activityId =
      activity?.id;

    if (!activityId) {
      return;
    }

    router.push(
      `/activity/${activityId}`
    );
  }

  return (
    <div
      className="app-card"
      style={{
        height: "100%",
        boxSizing: "border-box",
        border:
          "1px solid var(--color-border, #EEF0F3)",
        borderRadius: 14,
        background: "var(--color-bg-page-white, #FFFFFF)",
        padding: 16,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
          marginBottom: 6,
        }}
      >
        <h3
          style={{
            margin: 0,
            color: "var(--color-text-primary, #232629)",
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          {title}
        </h3>

        <ViewMoreLink
          onClick={
            onViewAll ??
            (() =>
              router.push(
                "/activity"
              ))
          }
        />
      </div>

      {loading ? (
        <ActivityListSkeleton />
      ) : activities.length === 0 ? (
        <div
          style={{
            padding: "18px 0",
            color: "var(--color-text-mute, #9AA0A8)",
            fontSize: 11,
            textAlign: "center",
          }}
        >
          មិនទាន់មានកម្មវិធីទេ
        </div>
      ) : (
        activities
          .slice(0, 5)
          .map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
              variant={variant}
              onClick={() =>
                openActivity(activity)
              }
            />
          ))
      )}
    </div>
  );
}

export function RecentActivities({
  activities = [],
  loading = false,
}) {
  return (
    <ActivityListCard
      title="កម្មវិធីថ្មីៗ"
      activities={activities}
      loading={loading}
      variant="completed"
    />
  );
}

export function UpcomingActivities({
  activities = [],
  loading = false,
}) {
  return (
    <ActivityListCard
      title="កម្មវិធីបន្ទាប់"
      activities={activities}
      loading={loading}
      variant="upcoming"
    />
  );
}

export default function ActivityList({
  recentCompleted = [],
  upcoming = [],
  loading = false,
}) {
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <ActivityListCard
        title="កម្មវិធីថ្មីៗ"
        activities={
          recentCompleted
        }
        loading={loading}
        variant="completed"
      />

      <ActivityListCard
        title="កម្មវិធីបន្ទាប់"
        activities={upcoming}
        loading={loading}
        variant="upcoming"
      />
    </div>
  );
}