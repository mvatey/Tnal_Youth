"use client";

import MemberDetailNav from "@/components/navigation/MemberDetailNav";

export default function DetailLayout({children}) {

return(
<div className="space-y-4">

<MemberDetailNav/>

{children}

</div>
);

}