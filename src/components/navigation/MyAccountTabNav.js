"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  {
    label: "ប័ណ្ណសម្គាល់ខ្លួននិងលិខិត",
    href: "/myAcc/documents",
  },
  {
    label: "ការចូលរួមកម្មវិធី",
    href: "/myAcc/participation",
  },
  {
    label: "ការធ្វើវិភាគទាន",
    href: "/myAcc/donation",
  },
  {
    label: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
    href: "/myAcc/password",
  },
];

export default function MyAccountTabNav() {
  const pathname = usePathname();

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-4">
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
                px-3
                text-sm
                font-medium
                transition

                ${
                  active
                    ? "border-secondary bg-secondary-light text-secondary"
                    : "border-transparent bg-white text-text-secondary hover:bg-gray-50"
                }
              `}
            >
              <span className="truncate">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
