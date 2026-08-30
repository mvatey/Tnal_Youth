"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountProfileLayout from "@/components/navigation/MyAccountProfileLayout";
import StandaloneAccountSettings from "@/components/account/StandaloneAccountSettings";
import useCurrentMember from "@/hooks/useCurrentMember";
import { UnsavedChangesProvider } from "@/context/UnsavedChangesContext";
import { useLanguage } from "@/context/LanguageContext";

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
  const { member, loading, error, refetch } = useCurrentMember();
  const { t } = useLanguage();

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
    t("common.user");

  const displayRole =
    member?.roleLabel || ROLE_LABELS[member?.role] || member?.role || t("myAccount.account");

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
        <Topbar title={t("myAccount.title")} />

        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto p-4 sm:p-5">
          {loading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-text-mute">
                {t("memberPage.loadingMember")}
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
              {t("memberPage.memberNotFound")}
            </div>
          )}

          {!loading && !error && member && (!member.isLinkedMember || member.isViewer) && (
            // No member record to show a profile card or a details page
            // for (ADMIN, or a standalone secretary/branch-leader/member
            // account) — or the account is a VIEWER, who stays read-only
            // everywhere else and gets the same password/email-only
            // treatment here even if it happens to be member-linked.
            <UnsavedChangesProvider>
              <StandaloneAccountSettings
                currentEmail={member.email !== "-" ? member.email : ""}
                onEmailChanged={refetch}
                profile={{
                  nameKm: member.name_kh,
                  nameEn: member.name_en,
                  phone: member.phone,
                  role: member.role,
                  viewerScope: member.viewerScope,
                  profileImage: member.profile_photo || member.profileImage,
                }}
                onProfileChanged={refetch}
              />
            </UnsavedChangesProvider>
          )}

          {!loading && !error && member && member.isLinkedMember && !member.isViewer && (
            <UnsavedChangesProvider>
            <div className="min-w-0 space-y-4">
              <HeaderMemberInfo
                title={
                  isDetailsPage
                    ? t("myAccount.detailProfileTitle")
                    : t("myAccount.profileTitle")
                }
                breadcrumb={{
                  parent: isDetailsPage ? t("myAccount.profileTitle") : t("myAccount.title"),
                  current: isDetailsPage
                    ? t("myAccount.detailProfileTitle")
                    : t("myAccount.profileTitle"),
                }}
                onBack={handleBack}
                buttonText={isDetailsPage ? undefined : t("memberPage.detail")}
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

              {isDetailsPage ? children : (
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
