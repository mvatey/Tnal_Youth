"use client";

import { useRouter, usePathname } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { normalizeRole } from "@/lib/navigation";

export default function DocumentTabs() {

  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = normalizeRole(user?.role);

  /*
   * A MEMBER only ever sees documents dedicated to them (their own
   * certificates/letters of appointment) — the organizational tab
   * stays staff/admin/viewer-only, so it's dropped from the tab list
   * entirely rather than shown-but-empty.
   */
  const allTabs = [
    {
      key: "company",
      label: t("documentPage.organizationDocuments"),
      path: "/document/company",
    },

    {
      key: "member",
      label: t("documentPage.memberDocuments"),
      path: "/document/member",
    },
  ];

  const tabs =
    role === "member"
      ? allTabs.filter((tab) => tab.key === "member")
      : allTabs;



  return (
    <div className="flex shrink-0 gap-3 overflow-x-auto pb-1 sm:gap-5">

      {tabs.map((tab) => (

        <button
          key={tab.key}
          onClick={() => router.push(tab.path)}

          className={`
            h-[50px]
            min-w-[220px]
            sm:w-[260px]
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
