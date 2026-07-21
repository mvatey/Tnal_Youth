"use client";

import { useRouter } from "next/navigation";

import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountDetailTabNav from "@/components/navigation/MyAccountDetailTabNav";

import { getCurrentMember } from "@/lib/currentMember";


export default function DetailsLayout({ children }) {

  const router = useRouter();

  const member = getCurrentMember();


  return (
    <div className="space-y-4">

      <HeaderMemberInfo
        title="ប្រវត្តិរូបលម្អិតសមាជិក"
        breadcrumb={{
          parent: "ប្រវត្តិរូបសមាជិក",
          current: "ព័ត៌មានលម្អិត",
        }}
        onBack={() => router.push("/myAcc/documents")}
      />


      <MemberInfoCard
        member={member}
      />


      <MyAccountDetailTabNav
        memberId={member.id}
      />


      <div>
        {children}
      </div>


    </div>
  );
}