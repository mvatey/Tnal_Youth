"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useLanguage } from "@/context/LanguageContext";

// Only ever rendered for a member-linked account — a standalone account
// (ADMIN, or a secretary/branch-leader/member account with no member
// record) gets StandaloneAccountSettings directly instead, since it has
// no member data for any of these tabs to show.
export default function MyAccountProfileLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, guardNavigate } = useUnsavedChanges();
  const { t } = useLanguage();

  const tabs = [
    {
      name: t("memberPage.tabDocuments"),
      href: "/myAcc/documents",
    },
    {
      name: t("memberPage.tabParticipation"),
      href: "/myAcc/participation",
    },
    {
      name: t("memberPage.tabDonation"),
      href: "/myAcc/donation",
    },
    {
      name: t("memberPage.tabEventDonation"),
      href: "/myAcc/eventdonation",
    },
    {
      name: t("memberPage.tabPassword"),
      href: "/myAcc/password",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-lg bg-bg-page-white shadow-sm">
      <div className="grid min-w-max grid-cols-5 sm:min-w-0">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              onClick={(event) => {
                if (isDirty) {
                  event.preventDefault();
                  guardNavigate(() => router.push(tab.href));
                }
              }}
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
                transition-all
                duration-200

                ${
                  active
                    ? "border-secondary bg-secondary-light text-secondary"
                    : "border-transparent bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
                }
              `}
            >
              <span className="truncate">
                {tab.name}
              </span>
            </Link>
          );
        })}
      </div>
      </div>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
