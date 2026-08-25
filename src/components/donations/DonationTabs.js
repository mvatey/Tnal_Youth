"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import donationOptions from "@/data/donation/donationOptions.json";

const { donationTabs } = donationOptions;

export default function DonationTabs() {
  const pathname = usePathname();
  const isAdminDonation = pathname?.startsWith("/admin/donation");
  const routePrefix = isAdminDonation ? "/admin/donation" : "/donation";
  const monthlyHref = routePrefix;

  return (
    <nav className="flex gap-3 overflow-x-auto sm:grid sm:grid-cols-3 sm:overflow-visible" aria-label="Donation categories">
      {donationTabs.map((tab) => {
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
            className={`flex h-[58px] min-w-[180px] flex-1 items-center justify-center rounded-sm px-3 text-14 font-medium transition sm:min-w-0 ${
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
