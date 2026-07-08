"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import MemberInfoCard from "@/components/card/memberInfoCard";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import users from "@/data/members.json";

export default function MemberInfoPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundMember = users.find((u) => String(u.id) === String(id));

    if (foundMember) {
      const { password, ...memberData } = foundMember;
      setMember(memberData);
    }

    setLoading(false);
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-page-gray">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">កំពុងផ្ទុក...</p>
        </div>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="flex items-center justify-center h-screen bg-bg-page-gray">
        <div className="bg-white rounded-xl shadow-sm p-8 text-center max-w-md">
          <p className="text-lg font-semibold text-text-primary mb-4">
            មិនរកឃើញសមាជិក
          </p>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-lg hover:opacity-90 transition mx-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            ត្រលប់ក្រោយ
          </button>
        </div>
      </div>
    );
  }

  
}
