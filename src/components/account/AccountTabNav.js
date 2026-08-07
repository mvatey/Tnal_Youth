"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, LockKeyhole } from "lucide-react";

const tabs = [
  {
    label: "ប័ណ្ណសម្គាល់ខ្លួន និង លិខិត",
    href: "/myAcc/documents",
    icon: FileText,
  },
  {
    label: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
    href: "/myAcc/password",
    icon: LockKeyhole,
  },
];

export default function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav className="overflow-hidden rounded-xl border border-border bg-white shadow-sm">
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
                    : "border-transparent bg-white text-text-secondary hover:bg-gray-50 hover:text-secondary"
                }
              `}
            >
              <Icon size={16} className="shrink-0" />
              <span className="truncate">
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}