"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountProfileLayout from "@/components/navigation/MyAccountProfileLayout";
import useCurrentMember from "@/hooks/useCurrentMember";
import { UnsavedChangesProvider } from "@/context/UnsavedChangesContext";

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

  /*
   * Staff (mainly secretaries) can be assigned to more than one
   * branch. The self-service personal-info endpoint already
   * returns the full list as `assigned_branches` — useCurrentMember()
   * doesn't carry it, so it's fetched separately here just for the
   * profile card's "+N" badge. Best-effort: a failure just falls
   * back to showing the primary branch only.
   */
  const [assignedBranches, setAssignedBranches] = useState([]);

  const memberId = member?.memberId ?? member?.id ?? null;

  useEffect(() => {
    if (!memberId) {
      setAssignedBranches([]);
      return undefined;
    }

    const controller = new AbortController();

    async function loadAssignedBranches() {
      try {
        const response = await fetch(
          "/api/backend/my-account/personal-info",
          {
            credentials: "include",
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setAssignedBranches([]);
          return;
        }

        const data = await response.json();

        setAssignedBranches(data?.assigned_branches || []);
      } catch (fetchError) {
        if (fetchError.name !== "AbortError") {
          setAssignedBranches([]);
        }
      }
    }

    loadAssignedBranches();

    return () => {
      controller.abort();
    };
  }, [memberId]);

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
              <p className="text-sm text-text-mute">
                កំពុងទាញយកព័ត៌មានសមាជិក...
              </p>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-xl border border-error/30 bg-bg-page-white p-6 text-center">
              <p className="text-sm text-error">{error}</p>
            </div>
          )}

          {!loading && !error && !member && (
            <div className="rounded-xl border border-border bg-bg-page-white p-6 text-center text-sm text-text-mute">
              រកមិនឃើញព័ត៌មានសមាជិក
            </div>
          )}

          {!loading && !error && member && (
            <UnsavedChangesProvider>
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
                assignedBranches={assignedBranches}
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
            </UnsavedChangesProvider>
          )}
        </main>
      </div>
    </div>
  );
}
