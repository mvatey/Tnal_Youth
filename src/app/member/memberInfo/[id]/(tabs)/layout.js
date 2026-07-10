"use client";

import MemberTabNav from "@/components/navigation/MemberTabNav";
import { useParams } from "next/navigation";


export default function TabsLayout({children}) {


const {id}=useParams();


return (

<div className="space-y-4">


<MemberTabNav memberId={id}/>


<div>
{children}
</div>


</div>

);


}