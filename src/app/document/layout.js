"use client";

import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import DocumentTabs from "@/components/document/DocumentTabs";


export default function DocumentLayout({children}) {

  const router = useRouter();
  const pathname = usePathname();


  const activeTab =
    pathname.includes("/member")
      ? "member"
      : "company";



  function changeTab(tab){

    if(tab === "company"){
      router.push("/document/company");
    }

    if(tab === "member"){
      router.push("/document/member");
    }

  }



  return (

    <div className="flex h-screen overflow-hidden bg-bg-page-gray">


      <Sidebar
        role="secretary"
        userName="ផាន វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />



      <div className="flex flex-1 flex-col min-h-0">


        <Topbar title="ឯកសារ" />



        <main className="flex-1 overflow-y-auto hide-scrollbar p-4">


          <DocumentTabs
            activeTab={activeTab}
            onChangeTab={changeTab}
          />



          <div className="mt-5">

            {children}

          </div>


        </main>


      </div>


    </div>

  );

}