"use client";

import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
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
  const router = useRouter();
  const { member, loading, error } = useCurrentMember();

  const isDetailsPage = pathname.startsWith("/myAcc/details");

  const displayName =
    member?.name_kh ||
    member?.fullNameKm ||
    member?.name_en ||
    member?.fullNameEn ||
    "អ្នកប្រើប្រាស់";

  const displayRole =
    member?.roleLabel || ROLE_LABELS[member?.role] || member?.role || "គណនី";

  const displayAvatar =
    member?.profile_photo || member?.profileImage || "/profiles/default-avatar.jpg";

  const handleBack = () => {
    if (isDetailsPage) {
      router.push("/myAcc/documents");
      return;
    }

    router.back();
  };

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role={member?.role || "member"}
        userName={displayName}
        userTitle={displayRole}
        userAvatar={displayAvatar}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="គណនីរបស់ខ្ញុំ" />

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-gray-500">
                កំពុងទាញយកព័ត៌មានសមាជិក...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {!loading && !error && !member && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
              រកមិនឃើញព័ត៌មានសមាជិក
            </div>
          )}

          {!loading && !error && member && (
            <div className="min-w-0 space-y-4">
              <HeaderMemberInfo
                title={
                  isDetailsPage
                    ? "ប្រវត្តិរូបលម្អិតសមាជិក"
                    : "ប្រវត្តិរូបសមាជិក"
                }
                breadcrumb={{
                  parent: isDetailsPage ? "ប្រវត្តិរូបសមាជិក" : "គណនីរបស់ខ្ញុំ",
                  current: isDetailsPage
                    ? "ប្រវត្តិរូបលម្អិតសមាជិក"
                    : "ប្រវត្តិរូបសមាជិក",
                }}
                onBack={handleBack}
                buttonText={isDetailsPage ? undefined : "ព័ត៌មានលម្អិត"}
                onButtonClick={
                  isDetailsPage
                    ? undefined
                    : () => router.push("/myAcc/details/personal")
                }
              />

              <MemberInfoCard
                member={member}
                profileUploadEndpoint="/api/backend/my-account/profile-photo"
              />

              {!member.isLinkedMember ? (
                <div className="rounded-xl border border-amber-300 bg-amber-50 p-6 text-amber-900">
                  គណនីនេះមិនទាន់បានភ្ជាប់ជាមួយប្រវត្តិរូបសមាជិកទេ។ សូមទាក់ទងអ្នកគ្រប់គ្រងដើម្បីភ្ជាប់គណនីជាមួយសមាជិកត្រឹមត្រូវ។
                </div>
              ) : isDetailsPage ? (
                children
              ) : (
                <MyAccountProfileLayout>{children}</MyAccountProfileLayout>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
