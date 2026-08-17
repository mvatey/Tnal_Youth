"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MyAccountProfileLayout({ children }) {
  const pathname = usePathname();

const tabs = [
    {
      name: "ប័ណ្ណសម្គាល់ខ្លួននិងលិខិត",
      href: "/myAcc/documents",
    },
    {
      name: "សកម្មភាព",
      href: "/myAcc/participation",
    },
    {
      name: "ការធ្វើវិភាគទាន",
      href: "/myAcc/donation",
    },{
      name: "ការបរិច្ចាក",
      href: "/myAcc/sponsor",
    },
    {
      name: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
      href: "/myAcc/password",
    }
    
  ];

  return (
    <div className="space-y-4">
      <div className="bg-bg-page-white rounded-lg shadow-sm overflow-hidden">
      <div className="grid grid-cols-5">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

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
      <div className="min-w-0">{children}</div>
    </div>
  );
}