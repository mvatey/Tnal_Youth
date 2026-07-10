"use client";

import { useState } from "react";
import NotificationAction from "./NotificationAction";
import NotificationDateStatus from "./NotificationDateStatus";
import NotificationStatusBadge from "./NotificationStatusBadge";

const longDescriptionLength = 110;

export default function NotificationItem({ notification }) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = notification.description.length > longDescriptionLength;

  return (
    <li
      className={`grid grid-cols-[minmax(0,1fr)_120px_86px] items-start gap-5 border-b border-border px-8 last:border-b-0 ${
        expanded ? "min-h-[132px] py-4" : "h-[74px]"
      }`}
    >
      <div className="min-w-0 pt-[2px] pb-[10px]">
        <h3 className="truncate text-[14px] font-bold leading-none text-text-primary">
          {notification.title}
        </h3>
        <p
          className={`mt-1 text-[12px] font-medium text-text-secondary ${
            expanded
              ? "whitespace-normal leading-5"
              : "truncate leading-3"
          }`}
        >
          {notification.description}
        </p>
        <div className="mt-[10px]">
          <NotificationStatusBadge
            label={notification.badge}
            variant={notification.variant}
          />
        </div>
      </div>

      <div className="self-center">
        {canExpand ? (
          <NotificationAction
            expanded={expanded}
            onClick={() => setExpanded((current) => !current)}
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
