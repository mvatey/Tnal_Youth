"use client";

import { notFound } from "next/navigation";
import { useMemo, use } from "react";
import { usePathname, useRouter } from "next/navigation";

import MemberInfoCard from "@/components/card/memberInfoCard";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import StatCard from "@/components/dashboard/statCard";

import { Users, InfoIcon } from "lucide-react";
import { FaHandHoldingDollar } from "react-icons/fa6";

import users from "@/data/members.json";


export default function MemberInfoLayout({ children, params }) {

  const router = useRouter();

  const pathname = usePathname();

  const { id } = use(params);


  const member = useMemo(() => {
    return users.find(
      (user)=> String(user.id) === String(id)
    );
  },[id]);


  if(!member){
    notFound();
  }


  // check current page
  const isDetailPage =
    pathname.includes("/details");



  return (

    <div className="space-y-4">


      <HeaderMemberInfo

        title="ព័ត៌មានលម្អិតសមាជិក"

        breadcrumb={{
          parent:"បញ្ជីសមាជិក",
          current:"ព័ត៌មានលម្អិតសមាជិក",
        }}

        buttonText="ព័ត៌មានលម្អិត"


        onButtonClick={()=>{

          router.push(
            `/member/memberInfo/${id}/details/personal`
          );

        }}

      />



      <div className="grid grid-cols-3 gap-4">

        <StatCard
          icon={Users}
          label="ចំនួនសកម្មភាពចូលរួម"
          value="25"
          growth="12"
          iconColor="text-primary"
          iconBg="bg-secondary-light"
        />


        <StatCard
          icon={InfoIcon}
          label="ចំនួនមិនបានចូលរួម"
          value="150"
          growth="8"
          iconColor="text-error"
          iconBg="bg-error-bg"
        />


        <StatCard
          icon={FaHandHoldingDollar}
          label="ចំនួនវិភាគទាន"
          value="12"
          growth="5"
          iconColor="text-warning"
          iconBg="bg-warning-bg"
        />

      </div>



      <MemberInfoCard member={member}/>



      {
        !isDetailPage && (
          <MemberTabNav memberId={member.id}/>
        )
      }



      <div>
        {children}
      </div>



    </div>

  );

}