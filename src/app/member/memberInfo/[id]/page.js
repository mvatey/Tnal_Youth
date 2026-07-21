"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import users from "@/data/members.json";

export default function MemberInfoPage({ params }) {
  const router = useRouter();
  const { id } = use(params);

  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const foundMember = users.find(
      (u) => String(u.id) === String(id)
    );

    if (foundMember) {
      const { password, ...memberData } = foundMember;
      setMember(memberData);
    }

    setLoading(false);
  }, [id]);


  // Redirect default member page to participation tab
  useEffect(() => {
    if (member) {
      router.replace(`/member/memberInfo/${id}/documents`);
    }
  }, [member, id, router]);


  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page-gray">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-primary"></div>

          <p className="text-text-secondary">
            កំពុងផ្ទុក...
          </p>
        </div>
      </div>
    );
  }


  if (!member) {
    return (
      <div className="flex h-screen items-center justify-center bg-bg-page-gray">
        <div className="max-w-md rounded-xl bg-white p-8 text-center shadow-sm">

          <p className="mb-4 text-lg font-semibold text-text-primary">
            មិនរកឃើញសមាជិក
          </p>


          <button
            onClick={() => router.back()}
            className="
              mx-auto
              flex
              items-center
              gap-2
              rounded-lg
              bg-primary
              px-5
              py-2.5
              text-white
              transition
              hover:opacity-90
            "
          >
            <ArrowLeft className="h-4 w-4" />

            ត្រលប់ក្រោយ
          </button>

        </div>
      </div>
    );
  }


  return null;
}