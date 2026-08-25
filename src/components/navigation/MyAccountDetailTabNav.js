"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";

export default function MyAccountDetailTabNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, guardNavigate } = useUnsavedChanges();
  const tabs = [
    { name: "ព័ត៌មានផ្ទាល់ខ្លួន", href: "/myAcc/details/personal" },
    { name: "ព័ត៌មានគ្រួសារ", href: "/myAcc/details/family" },
    { name: "ប្រវត្តិការងារ", href: "/myAcc/details/work" },
    { name: "ការអប់រំ/បណ្តុះបណ្តាល", href: "/myAcc/details/education" },
    { name: "ជំនាញបច្ចេកទេស", href: "/myAcc/details/skill" },
    { name: "កិច្ចការនយោបាយ", href: "/myAcc/details/political" },
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
