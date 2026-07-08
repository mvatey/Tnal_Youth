// components/navigation/NotificationBell.jsx
"use client";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationBell({ unreadCount = 1 }) {
  return (
    <Link
      href="/notifications"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-border bg-white transition hover:bg-bg-page-gray"
      aria-label="ការជូនដំណឹង"
    >
      <Bell size={20} strokeWidth={2} className="text-text-primary" />
      {unreadCount > 0 && (
        <span className="absolute right-0.5 top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white" />
      )}
    </Link>
  );
}
