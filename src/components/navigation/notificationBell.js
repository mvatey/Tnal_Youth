// components/navigation/NotificationBell.jsx
"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";

const POLL_INTERVAL_MS = 45000;

export default function NotificationBell({ unreadCount: unreadCountProp }) {
  // When a caller passes unreadCount explicitly, respect it and skip our
  // own fetch. Otherwise (the normal case — Topbar renders <NotificationBell
  // /> with no props) fetch the real count from the backend so the red
  // badge reflects actual unread notifications instead of always being 0.
  const [fetchedCount, setFetchedCount] = useState(0);
  const unreadCount =
    unreadCountProp !== undefined ? unreadCountProp : fetchedCount;

  useEffect(() => {
    if (unreadCountProp !== undefined) {
      return undefined;
    }

    let cancelled = false;

    async function loadUnreadCount() {
      try {
        const response = await fetch(
          "/api/backend/notifications/me/unread-count",
          { cache: "no-store" },
        );
        const body = await response.json().catch(() => null);

        if (!response.ok) return;

        const unread = body?.data?.unread ?? body?.unread;

        if (!cancelled && Number.isFinite(Number(unread))) {
          setFetchedCount(Number(unread));
        }
      } catch {
        // Silently keep the previous count; the bell just won't update
        // this cycle. Not worth surfacing an error for a badge count.
      }
    }

    loadUnreadCount();
    const intervalId = setInterval(loadUnreadCount, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      clearInterval(intervalId);
    };
  }, [unreadCountProp]);

  return (
    <Link
      href="/notification"
      className="relative w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-bg-page-gray transition"
    >
      <Bell size={18} strokeWidth={2.25} className="text-text-primary" />
      {unreadCount > 0 && (
        <span className="absolute -top-1.5 -right-1.5 min-w-[18px] min-h-[18px] px-1 flex items-center justify-center bg-error text-white text-[10px] font-semibold rounded-full border-2 border-white">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
