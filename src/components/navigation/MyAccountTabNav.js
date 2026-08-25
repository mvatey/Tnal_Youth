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
    label: "ការបរិច្ចាក",
    href: "/myAcc/sponsor",
  },
];

export default function MyAccountTabNav() {
  const pathname = usePathname();

  return (
    <div className="overflow-x-auto rounded-lg bg-bg-page-white shadow-sm">
      <div className="grid min-w-max grid-cols-4 sm:min-w-0">
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
                min-w-[150px]
                px-3
                sm:min-w-0
                text-sm
                font-medium
                transition

                ${
                  active
                    ? "border-secondary bg-secondary-light text-secondary"
                    : "border-transparent bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
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
