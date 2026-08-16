"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MyAccountDetailTabNav() {
  const pathname = usePathname();
  const tabs = [
    { name: "ព័ត៌មានផ្ទាល់ខ្លួន", href: "/myAcc/details/personal" },
    { name: "ព័ត៌មានគ្រួសារ", href: "/myAcc/details/family" },
    { name: "ប្រវត្តិការងារ", href: "/myAcc/details/work" },
    { name: "ការអប់រំ/បណ្តុះបណ្តាល", href: "/myAcc/details/education" },
    { name: "ជំនាញបច្ចេកទេស", href: "/myAcc/details/skill" },
    { name: "កិច្ចការនយោបាយ", href: "/myAcc/details/political" },
  ];

  return (
    <div className="rounded-lg bg-bg-page-white shadow-sm overflow-hidden">
      <div className="grid grid-cols-6">
        {tabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-10 items-center justify-center border-t-2 px-3 text-sm font-medium transition-all ${
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
