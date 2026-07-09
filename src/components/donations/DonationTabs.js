"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "វិភាគទានប្រចាំខែ", href: "/donation" },
  { label: "វិភាគទានក្នុងកម្មវិធី", href: "/donation/eventdonation" },
  { label: "ថវិកាឧបត្ថម្ភ", href: "/donation/support" },
];

export default function DonationTabs() {
  const pathname = usePathname();

  return (
    <nav className="flex grid-cols gap-[80px] sm:grid-cols-3" aria-label="Donation categories">
      {tabs.map((tab) => {
        const active =
          pathname === tab.href ||
          (tab.href === "/donation" && pathname === "/donation/add") ||
          (tab.href !== "/donation" && pathname.startsWith(tab.href));

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`flex h-[58px] w-[224px] items-center justify-center rounded-sm text-14 font-medium transition ${
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
