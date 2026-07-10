"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { notificationTabs } from "./notificationData";

export default function NotificationTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="flex flex-wrap gap-8"
      aria-label="Notification categories"
    >
      {notificationTabs.map((tab) => {
        const active = pathname === tab.href || pathname.startsWith(tab.href);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-[58px] w-[224px] items-center justify-center rounded-sm text-[14px] font-semibold transition ${
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
