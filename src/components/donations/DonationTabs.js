"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { label: "វិភាគទានប្រចាំខែ", href: "/donation" },
  { label: "វិភាគទានក្នុងកម្មវិធី", href: "/donation/eventdonation" },
  { label: "ថវិកាឧបត្ថម្ភ", href: "/donation/sponsor" },
];

export default function DonationTabs() {
  const pathname = usePathname();
  const isAdminDonation = pathname?.startsWith("/admin/donation");
  const routePrefix = isAdminDonation ? "/admin/donation" : "/donation";
  const monthlyHref = routePrefix;

  return (
    <nav className="flex grid-cols gap-[80px] sm:grid-cols-3" aria-label="Donation categories">
      {tabs.map((tab) => {
        const href =
          tab.href === "/donation"
            ? monthlyHref
            : tab.href.replace("/donation", routePrefix);
        const active =
          pathname === href ||
          (tab.href === "/donation" &&
            (pathname === "/donation/add" ||
              pathname === "/admin/donation/add" ||
              pathname === "/admin/donation/monthly" ||
              pathname === "/admin/donation/monthly/add")) ||
          (tab.href !== "/donation" && pathname.startsWith(href));

        return (
          <Link
            key={href}
            href={href}
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
