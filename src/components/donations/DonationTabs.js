"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import donationOptions from "@/data/donation/donationOptions.json";

const { donationTabs } = donationOptions;
const monthlyDonationPaths = [
  "/donation/add",
  "/donation/monthlydonation",
  "/donation/monthlydonation/add",
  "/admin/donation/add",
  "/members/donation/add",
  "/admin/donation/monthly",
  "/members/donation/monthly",
  "/admin/donation/monthly/add",
  "/members/donation/monthly/add",
];

export default function DonationTabs() {
  const pathname = usePathname();
  const isAdminDonation = pathname?.startsWith("/admin/donation");
  const isMemberDonation = pathname?.startsWith("/members/donation");
  const routePrefix = isAdminDonation
    ? "/admin/donation"
    : isMemberDonation
      ? "/members/donation"
      : "/donation";
  const monthlyHref = routePrefix;
  const visibleTabs = isMemberDonation
    ? donationTabs.filter((tab) => tab.href !== "/donation/sponsor")
    : donationTabs;

  return (
    <nav className="flex grid-cols gap-[80px] sm:grid-cols-3" aria-label="Donation categories">
      {visibleTabs.map((tab) => {
        const href =
          tab.href === "/donation"
            ? monthlyHref
            : tab.href.replace("/donation", routePrefix);
        const active =
          pathname === href ||
          (tab.href === "/donation" && monthlyDonationPaths.includes(pathname)) ||
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
