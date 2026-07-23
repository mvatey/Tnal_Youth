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
              "border-t-4 border-[#5b2cc9] bg-[#f1edff] text-[#4b3192]"
              :
              "bg-white text-gray-600 hover:bg-gray-50"
            }
          `}
        >

          {tab.label}

        </button>

      ))}

    </div>
  );
}