"use client";

import { useEffect, useMemo, useState } from "react";
import Pagination from "@/components/navigation/Pagination";
import NotificationItem from "./NotificationItem";
import NotificationTabs from "./NotificationTabs";
import { getNotificationHeading, getNotifications } from "./notificationData";

const rowsPerPage = 10;

export default function NotificationPanel({ type = "system" }) {
  const notifications = useMemo(() => getNotifications(type), [type]);
  const heading = getNotificationHeading(type);
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(notifications.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedNotifications = useMemo(
    () =>
      notifications.slice(
        (safePage - 1) * rowsPerPage,
        safePage * rowsPerPage,
      ),
    [notifications, safePage],
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [type]);

  return (
    <div className="space-y-4">
      <NotificationTabs />

      <section className="overflow-hidden rounded-md border border-border bg-[#fbfcfe] shadow-sm">
        <div className="min-h-[48px] overflow-visible px-8 pb-1 pt-[10px]">
          <h2 className="overflow-visible text-[16px] font-bold leading-[2] text-secondary">{heading}</h2>
        </div>

        <ul className="mt-[10px]">
          {pagedNotifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              notification={notification}
            />
          ))}
        </ul>

        <div className="border-t border-border px-6 py-3">
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            className="space-y-0"
          />
        </div>
      </section>
    </div>
  );
}
