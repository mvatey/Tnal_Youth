"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


const MY_ACCOUNT_DETAIL_TABS = [
  {
    label: "ព័ត៌មានផ្ទាល់ខ្លួន",
    href: "/myAcc/details/personal",
  },
  {
    label: "ព័ត៌មានគ្រួសារ",
    href: "/myAcc/details/family",
  },
  {
    label: "ប្រវត្តិការងារ",
    href: "/myAcc/details/work",
  },
  {
    label: "ការសិក្សា",
    href: "/myAcc/details/education",
  },
  {
    label: "ជំនាញ",
    href: "/myAcc/details/skill",
  },
  {
    label: "កិច្ចការនយោបាយ",
    href: "/myAcc/details/political",
  },
];


export default function MyAccountDetailTabNav() {

  const pathname = usePathname();


  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">

      <div className="grid grid-cols-6">

        {MY_ACCOUNT_DETAIL_TABS.map((tab)=>{

          const active =
            pathname === tab.href ||
            pathname.startsWith(tab.href + "/");


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
                transition-all
                duration-200

                ${
                  active
                  ? "border-secondary bg-secondary-light text-secondary"
                  : "border-transparent bg-white text-text-secondary hover:bg-gray-50"
                }
              `}
            >
              <span className="truncate">
                {tab.label}
              </span>
            </Link>
          );

        })}

      </div>

    </div>
  );
}