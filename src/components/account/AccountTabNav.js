"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LockKeyhole } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const tabs = [
  {
    labelKey: "memberPage.tabDocuments",
    href: "/myAcc/documents",
    icon: FileText,
  },
  {
    labelKey: "memberPage.tabPassword",
    href: "/myAcc/password",
    icon: LockKeyhole,
  },
];

export default function AccountTabs() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <nav className="overflow-hidden rounded-xl border border-border bg-bg-page-white shadow-sm">
      <div className="grid grid-cols-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const active =
            pathname === tab.href ||
            pathname.startsWith(`${tab.href}/`);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                flex
                h-12
                items-center
                justify-center
                gap-2
                border-t-2
                px-4
                text-center
                text-sm
                font-semibold
                transition
                ${
                  active
                    ? "border-secondary bg-secondary-light text-secondary"
                    : "border-transparent bg-bg-page-white text-text-secondary hover:bg-bg-page-gray hover:text-secondary"
                }
              `}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">
                {t(tab.labelKey)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
