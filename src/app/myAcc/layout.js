"use client";


import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";


export default function MyAccountLayout({
 children
}){


return (

<div className="flex h-screen overflow-hidden bg-bg-page-gray">


<Sidebar
role="secretary"
userName="ផាន វិទ្ធី"
userTitle="លេខាធិការ"
userAvatar="/secretary.jpg"
/>



<div className="flex-1 flex flex-col overflow-hidden">


<Topbar title="គណនីរបស់ខ្ញុំ"/>



<main className="flex-1 overflow-y-auto p-5 no-scrollbar">

{children}

</main>


</div>


</div>

);

}