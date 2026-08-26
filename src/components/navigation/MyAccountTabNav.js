"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const TABS = [
  {
    key: "tabDocuments",
    href: "/myAcc/documents",
  },
  {
    key: "tabParticipation",
    href: "/myAcc/participation",
  },
  {
    key: "tabDonation",
    href: "/myAcc/donation",
  },
  {
    key: "tabSponsor",
    href: "/myAcc/sponsor",
  },
  {
    key: "tabPassword",
    href: "/myAcc/password",
  },
];

export default function MyAccountTabNav() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <div className="overflow-x-auto rounded-lg bg-bg-page-white shadow-sm">
      <div className="grid min-w-max grid-cols-5 sm:min-w-0">
        {TABS.map((tab) => {
          const active =
            pathname === "/myAcc"
              ? tab.href === "/myAcc/documents"
              : pathname === tab.href || pathname.startsWith(tab.href + "/");

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex
                h-10
                items-center
                justify-center
                border-t-2
                min-w-[150px]
                px-3
                sm:min-w-0
                text-sm
                font-medium
                transition

                ${
                  active
                    ? "border-secondary bg-secondary-light text-secondary"
                    : "border-transparent bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
                }
              `}
            >
              <span className="truncate">{t(`memberPage.${tab.key}`)}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
