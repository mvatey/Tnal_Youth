"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import NotificationAction from "./NotificationAction";
import NotificationDateStatus from "./NotificationDateStatus";
import NotificationStatusBadge from "./NotificationStatusBadge";

const longDescriptionLength = 110;

export default function NotificationItem({
  notification,
  onMarkRead,
}) {
  const router = useRouter();

  const [expanded, setExpanded] =
    useState(false);

  const [opening, setOpening] =
    useState(false);

  const description =
    notification.description || "";

  const canExpand =
    description.length >
    longDescriptionLength;

  async function handleOpenNotification() {
    if (opening) {
      return;
    }

    setOpening(true);

    try {
      // Mark notification as read first.
      if (!notification.read) {
        await onMarkRead?.(
          notification.id,
        );
      }

      // Backend normally returns:
      // /activity/{activityId}
      if (notification.actionUrl) {
        router.push(
          notification.actionUrl,
        );

        return;
      }

      // Safe fallback for activity notifications.
      if (
        notification.activityId &&
        String(
          notification.typeCode || "",
        )
          .toUpperCase()
          .startsWith("ACTIVITY_")
      ) {
        router.push(
          `/activity/${notification.activityId}${
            notification.branchId != null
              ? `?branchId=${encodeURIComponent(notification.branchId)}`
              : ""
          }`,
        );
      }
    } finally {
      setOpening(false);
    }
  }

  function handleToggleExpand(event) {
    // Prevent clicking "Show More"
    // from opening the Activity page.
    event.stopPropagation();

    setExpanded(
      (current) => !current,
    );
  }

  return (
    <li
      onClick={handleOpenNotification}
      onKeyDown={(event) => {
        if (
          event.key === "Enter" ||
          event.key === " "
        ) {
          event.preventDefault();
          handleOpenNotification();
        }
      }}
      role="button"
      tabIndex={0}
      className={`grid grid-cols-[minmax(0,1fr)_120px_86px] items-start gap-5 border-b border-border px-8 last:border-b-0 cursor-pointer transition hover:bg-bg-page-gray ${
        expanded
          ? "min-h-[132px] py-4"
          : "min-h-[86px] py-3"
      }`}
    >
      <div className="min-w-0 overflow-visible pb-1 pt-[2px]">
        <h3 className="overflow-visible whitespace-normal text-[14px] font-bold leading-[1.75] text-text-primary">
          {notification.title}
        </h3>

        <p
          className={`mt-1 text-[12px] font-medium text-text-secondary ${
            expanded
              ? "whitespace-normal leading-5"
              : "truncate leading-[1.6]"
          }`}
        >
          {description}
        </p>

        <div className="mt-[10px]">
          <NotificationStatusBadge
            label={notification.badge}
            variant={
              notification.variant
            }
          />
        </div>
      </div>

      <div className="self-center">
        {canExpand ? (
          <NotificationAction
            expanded={expanded}
            onClick={
              handleToggleExpand
            }
          />
        ) : null}
      </div>

      <div className="self-center">
        <NotificationDateStatus
          date={notification.date}
          read={notification.read}
        />
      </div>
    </li>
  );
}