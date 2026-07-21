"use client";

import { useRouter } from "next/navigation";

import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountDetailTabNav from "@/components/navigation/MyAccountDetailTabNav";

import useCurrentMember from "@/hooks/useCurrentMember";

export default function DetailsLayout({ children }) {
  const router = useRouter();

  const {
    member,
    loading,
    error,
  } = useCurrentMember();

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        កំពុងទាញយកព័ត៌មានសមាជិក...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6">
        <p className="text-sm text-red-500">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-border bg-white p-6">
        រកមិនឃើញព័ត៌មានសមាជិក
      </div>
    );
  }

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

      <MemberInfoCard member={member} />

      <MyAccountDetailTabNav memberId={member.id} />

      <div>
        {children}
      </div>
    </div>
  );
}