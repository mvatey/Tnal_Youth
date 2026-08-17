"use client";

import { useRouter, usePathname } from "next/navigation";

export default function DocumentTabs() {

  const router = useRouter();
  const pathname = usePathname();


  const tabs = [
    {
      key: "company",
      label: "ឯកសារស្ថាប័ន",
      path: "/document/company",
    },

    {
      key: "member",
      label: "ឯកសារផ្ទាល់ខ្លួនរបស់សមាជិក",
      path: "/document/member",
    },
  ];



  return (
    <div className="flex shrink-0 gap-5">

      {tabs.map((tab) => (

        <button
          key={tab.key}
          onClick={() => router.push(tab.path)}

          className={`
            h-[50px]
            w-[260px]
            rounded-md
            text-sm
            font-medium
            shadow-sm
            transition

            ${
              pathname === tab.path
              ? 
              "border-t-4 border-secondary bg-secondary-light text-secondary"
              :
              "bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
            }
          `}
        >

          {tab.label}

        </button>

      ))}

    </div>
  );
}