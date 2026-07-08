"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function MemberTabNav({ memberId }) {
  const pathname = usePathname();

  const tabs = [
    {
      name: "សកម្មភាព",
      href: `/member/memberInfo/${memberId}/participation`,
    },
    {
      name: "ការធ្វើវិភាគទាន",
      href: `/member/memberInfo/${memberId}/donation`,
    },
    {
      name: "ប័ណ្ណសម្គាល់ខ្លួននិងលិខិត",
      href: `/member/memberInfo/${memberId}/documents`,
    },
    {
      name: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
      href: `/member/memberInfo/${memberId}/password`,
    },
  ];

  return (
    <div className="bg-white rounded-sm shadow-sm overflow-hidden">
      <div className="grid grid-cols-4">
        {tabs.map((tab) => {
          const active = pathname === tab.href;

          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex h-12 items-center justify-center border-t-4 text-base font-medium transition-all duration-200
                ${
                  active
                    ? "border-secondary bg-secodary-light text-secondary"
                    : "border-transparent bg-white text-text-primary hover:bg-gray-50"
                }`}
            >
              {tab.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}