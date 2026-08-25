"use client";

import Link from "next/link";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useUnsavedChanges } from "@/context/UnsavedChangesContext";
import { useLanguage } from "@/context/LanguageContext";


export default function MemberDetailNav(){

  const pathname = usePathname();
  const router = useRouter();
  const params = useParams();
  const memberId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const { isDirty, guardNavigate } = useUnsavedChanges();
  const { t } = useLanguage();


  const tabs = [

    {
      name:t("memberPage.detailPersonal"),
      href:"personal"
    },

    {
      name:t("memberPage.detailFamily"),
      href:"family"
    },

    {
      name:t("memberPage.detailWork"),
      href:"work"
    },

    {
      name:t("memberPage.detailEducation"),
      href:"education"
    },

    {
      name:t("memberPage.detailSkill"),
      href:"skill"
    },

    {
      name:t("memberPage.detailPolitical"),
      href:"political"
    }

  ];



  return (

    <div className="overflow-x-auto rounded-lg bg-bg-page-white shadow-sm">

      <div className="grid min-w-max grid-cols-6 sm:min-w-0">


        {
          tabs.map((tab)=>{


            const href = `/member/memberInfo/${encodeURIComponent(memberId || "")}/details/${tab.href}`;
            const active = pathname === href;



            return (

              <Link

                key={tab.href}

                href={href}

                onClick={(event) => {
                  if (isDirty) {
                    event.preventDefault();
                    guardNavigate(() => router.push(href));
                  }
                }}

                className={`flex h-10 min-w-[140px] items-center justify-center border-t-2 px-3 text-sm font-medium transition-all sm:min-w-0 ${

                  active
                  ?
                  "border-secondary bg-secondary-light text-secondary"
                  :
                  "border-transparent text-text-secondary hover:bg-bg-page-gray"

                }`}

              >

                <span className="truncate">
                  {tab.name}
                </span>


              </Link>

            );


          })
        }


      </div>


    </div>

  );

}
