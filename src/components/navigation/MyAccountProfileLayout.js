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


export default function MyAccountProfileLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-4 overflow-hidden rounded-xl border border-border bg-white">
        {TABS.map((tab) => {
          const isActive =
            tab.href === "/myAcc"
              ? pathname === "/myAcc"
              : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-12 items-center justify-center border-t-2 px-4 text-sm font-medium transition ${
                isActive
                  ? "border-secondary bg-secondary-light text-secondary"
                  : "border-transparent text-text-secondary hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </Link>
          );
        })}
      </div>

      <div className="mt-4 min-w-0">
        {children}
      </div>
    </div>
  );
}