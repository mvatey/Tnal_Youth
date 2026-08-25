"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";

export default function MemberTabNav({ memberId }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isDirty, guardNavigate } = useUnsavedChanges();

const tabs = [
    {
      name: "ប័ណ្ណសម្គាល់ខ្លួននិងលិខិត",
      href: `/member/memberInfo/${memberId}/documents`,
    },
    {
      name: "សកម្មភាព",
      href: `/member/memberInfo/${memberId}/participation`,
    },
    {
      name: "ការធ្វើវិភាគទាន",
      href: `/member/memberInfo/${memberId}/donation`,
    },{
      name: "ការបរិច្ចាក",
      href: `/member/memberInfo/${memberId}/sponsor`,
    },
    {
      name: "ផ្លាស់ប្ដូរពាក្យសម្ងាត់",
      href: `/member/memberInfo/${memberId}/password`,
    }

  ];

  return (
    <div className="overflow-x-auto rounded-lg bg-bg-page-white shadow-sm">
      <div className="grid min-w-max grid-cols-5 sm:min-w-0">
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
  );
}
