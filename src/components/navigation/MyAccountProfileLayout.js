"use client";


import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import StatCard from "@/components/dashboard/statCard";
import MyAccountTabNav from "@/components/navigation/MyAccountTabNav";

import {
 Users,
 InfoIcon
} from "lucide-react";

import {
 FaHandHoldingDollar
} from "react-icons/fa6";


export default function MyAccountProfileLayout({
 children,
 member
}){


return (

<div className="space-y-4">


<HeaderMemberInfo

title="ប្រវត្តិរូបសមាជិក"

breadcrumb={{
 parent:"គណនីរបស់ខ្ញុំ",
 current:"ប្រវត្តិរូប"
}}

/>


<div className="grid grid-cols-3 gap-4">


<StatCard
icon={Users}
label="ចំនួនសកម្មភាពចូលរួម"
value="25"
growth="12"
/>


<StatCard
icon={InfoIcon}
label="ចំនួនមិនបានចូលរួម"
value="150"
growth="8"
/>


<StatCard
icon={FaHandHoldingDollar}
label="ចំនួនវិភាគទាន"
value="12"
growth="5"
/>


</div>



<MemberInfoCard member={member}/>



<MyAccountTabNav />



<div>
{children}
</div>



</div>

);

}