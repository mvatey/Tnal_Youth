"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import MemberDetailNav from "@/components/navigation/MemberDetailNav";


export default function DetailLayout({ children, params }) {
  const router = useRouter();
  const { id } = use(params);

  return (
    <div className="space-y-4">
      

      <MemberDetailNav />

      <div>{children}</div>
    </div>
  );
}