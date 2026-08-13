"use client";

import { usePathname } from "next/navigation";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import HeaderUserInfo from "@/components/navigation/HeaderUserInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountProfileLayout from "@/components/navigation/MyAccountProfileLayout";
import useCurrentMember from "@/hooks/useCurrentMember";

const ROLE_LABELS = {
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",
};

export default function MyAccountLayout({ children }) {
  const pathname = usePathname();
  const { member, loading, error } = useCurrentMember();
  const isDetailsPage = pathname.startsWith("/myAcc/details");
  const displayName = member?.name_kh || member?.fullNameKm || member?.name_en || member?.fullNameEn || "អ្នកប្រើប្រាស់";
  const displayRole = member?.roleLabel || ROLE_LABELS[member?.role] || member?.role || "គណនី";
  const displayAvatar = member?.profile_photo || member?.profileImage || "/profiles/default-avatar.jpg";

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar role={member?.role || "member"} userName={displayName} userTitle={displayRole} userAvatar={displayAvatar} />
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="គណនីរបស់ខ្ញុំ" />
        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && <div className="rounded-xl border border-border bg-white p-6">កំពុងទាញយកព័ត៌មានគណនី...</div>}
          {!loading && error && <div className="rounded-xl border border-border bg-white p-6 text-error">{error}</div>}
          {!loading && !error && !member && <div className="rounded-xl border border-border bg-white p-6">រកមិនឃើញព័ត៌មានគណនី</div>}
          {!loading && !error && member && (
            isDetailsPage ? children : (
              <div className="min-w-0 space-y-4">
                <HeaderUserInfo />
                <MemberInfoCard member={member} />
                <MyAccountProfileLayout>{children}</MyAccountProfileLayout>
              </div>
            )
          )}
        </main>
      </div>
    </div>
  );
}
