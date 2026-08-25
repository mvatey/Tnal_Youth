"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MemberTabNav({ memberId }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, guardNavigate } = useUnsavedChanges();
  const { t } = useLanguage();

const tabs = [
    {
      name: t("memberPage.tabDocuments"),
      href: `/member/memberInfo/${memberId}/documents`,
    },
    {
      name: t("memberPage.tabParticipation"),
      href: `/member/memberInfo/${memberId}/participation`,
    },
    {
      name: t("memberPage.tabDonation"),
      href: `/member/memberInfo/${memberId}/donation`,
    },{
      name: t("memberPage.tabSponsor"),
      href: `/member/memberInfo/${memberId}/sponsor`,
    },
    {
      name: t("memberPage.tabPassword"),
      href: `/member/memberInfo/${memberId}/password`,
    }

  ];

  return (
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
  );
}
