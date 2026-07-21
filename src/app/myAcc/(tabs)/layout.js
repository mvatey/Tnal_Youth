"use client";

import HeaderUserInfo from "@/components/navigation/HeaderUserInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountTabNav from "@/components/navigation/MyAccountTabNav";

import { getCurrentMember } from "@/lib/currentMember";


export default function MyAccountTabsLayout({
  children
}) {


const member = getCurrentMember();



return (

<div className="space-y-4">


  <HeaderUserInfo />


  <MemberInfoCard 
    member={member}
  />


  <MyAccountTabNav />


  {children}


</div>


);


}