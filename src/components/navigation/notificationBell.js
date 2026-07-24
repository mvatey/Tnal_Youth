// components/navigation/NotificationBell.jsx
"use client";
import Link from "next/link";
import { Bell } from "lucide-react";

export default function NotificationBell({ unreadCount = 0 }) {
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
