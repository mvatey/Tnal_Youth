"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";


export default function MemberDetailNav(){

  const pathname = usePathname();


  const tabs = [

    {
      name:"ព័ត៌មានផ្ទាល់ខ្លួន",
      href:"personal"
    },

    {
      name:"ព័ត៌មានគ្រួសារ",
      href:"family"
    },

    {
      name:"ប្រវត្តិការងារ",
      href:"work"
    },

    {
      name:"ការអប់រំ/បណ្តុះបណ្តាល",
      href:"education"
    },

    {
      name:"ជំនាញបច្ចេកទេស",
      href:"skill"
    },

    {
      name:"កិច្ចការនយោបាយ",
      href:"political"
    }

  ];



  return (

    <div className="rounded-lg bg-white shadow-sm overflow-hidden">

      <div className="grid grid-cols-6">


        {
          tabs.map((tab)=>{


            const active = pathname.includes(tab.href);



            return (

              <Link

                key={tab.href}

                href={tab.href}

                className={`flex h-10 items-center justify-center border-t-2 px-3 text-sm font-medium transition-all ${
                  
                  active
                  ?
                  "border-secondary bg-secondary-light text-secondary"
                  :
                  "border-transparent text-text-secondary hover:bg-gray-50"

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