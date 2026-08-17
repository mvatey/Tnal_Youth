"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import { Bell } from "lucide-react";

const POLL_INTERVAL_MS = 45000;

export default function NotificationBell({
  unreadCount: unreadCountProp,
}) {
  const [fetchedCount, setFetchedCount] =
    useState(0);

  const unreadCount =
    unreadCountProp !== undefined
      ? unreadCountProp
      : fetchedCount;

  const loadUnreadCount =
    useCallback(async () => {
      if (
        unreadCountProp !== undefined
      ) {
        return;
      }

      try {
        const response = await fetch(
          "/api/backend/notifications/me/unread-count",
          {
            cache: "no-store",
          },
        );

        const body =
          await response
            .json()
            .catch(() => null);

        if (!response.ok) {
          return;
        }

        const unread =
          body?.data?.unread ??
          body?.unread;

        if (
          Number.isFinite(
            Number(unread),
          )
        ) {
          setFetchedCount(
            Number(unread),
          );
        }
      } catch {
        // Keep previous count if request fails.
      }
    }, [unreadCountProp]);

  useEffect(() => {
    if (
      unreadCountProp !== undefined
    ) {
      return undefined;
    }

    loadUnreadCount();

    const intervalId =
      setInterval(
        loadUnreadCount,
        POLL_INTERVAL_MS,
      );

    return () => {
      clearInterval(intervalId);
    };
  }, [
    unreadCountProp,
    loadUnreadCount,
  ]);

  useEffect(() => {
    if (
      unreadCountProp !== undefined
    ) {
      return undefined;
    }

    function handleNotificationRead() {
      loadUnreadCount();
    }

    window.addEventListener(
      "notification-read",
      handleNotificationRead,
    );

    return () => {
      window.removeEventListener(
        "notification-read",
        handleNotificationRead,
      );
    };
  }, [
    unreadCountProp,
    loadUnreadCount,
  ]);

  return (
    <Link
      href="/notification"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-border transition hover:bg-bg-page-gray"
    >
      <Bell
        size={18}
        strokeWidth={2.25}
        className="text-text-primary"
      />

      {unreadCount > 0 && (
        <span className="absolute -right-1.5 -top-1.5 flex min-h-[18px] min-w-[18px] items-center justify-center rounded-full border-2 border-white bg-error px-1 text-[10px] font-semibold text-white">
          {unreadCount > 9
            ? "9+"
            : unreadCount}
        </span>
      )}
    </Link>
  );
}