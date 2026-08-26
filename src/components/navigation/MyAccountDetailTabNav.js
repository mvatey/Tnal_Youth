"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useLanguage } from "@/context/LanguageContext";

export default function MyAccountDetailTabNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, guardNavigate } = useUnsavedChanges();
  const { t } = useLanguage();
  const tabs = [
    { name: t("memberPage.detailPersonal"), href: "/myAcc/details/personal" },
    { name: t("memberPage.detailFamily"), href: "/myAcc/details/family" },
    { name: t("memberPage.detailWork"), href: "/myAcc/details/work" },
    { name: t("memberPage.detailEducation"), href: "/myAcc/details/education" },
    { name: t("memberPage.detailSkill"), href: "/myAcc/details/skill" },
    { name: t("memberPage.detailPolitical"), href: "/myAcc/details/political" },
  ];

  return (
    <div className="overflow-x-auto rounded-lg bg-bg-page-white shadow-sm">
      <div className="grid min-w-max grid-cols-6 sm:min-w-0">
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
              className={`flex h-10 min-w-[140px] items-center justify-center border-t-2 px-3 text-sm font-medium transition-all sm:min-w-0 ${
                active
                  ? "border-secondary bg-secondary-light text-secondary"
                  : "border-transparent text-text-secondary hover:bg-bg-page-gray"
              }`}
            >
              <span className="truncate">{tab.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
