"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { notificationTabs } from "./notificationData";

export default function NotificationTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-3 overflow-x-auto sm:flex-wrap sm:gap-8"
      aria-label="Notification categories"
    >
      {notificationTabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-[58px] min-w-[180px] flex-1 items-center justify-center rounded-sm px-3 text-[14px] font-semibold transition sm:w-[224px] sm:flex-none ${
              active
                ? "border-t-4 border-secondary bg-secondary-light text-secondary"
                : "text-text-primary hover:bg-primary-lighter"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
