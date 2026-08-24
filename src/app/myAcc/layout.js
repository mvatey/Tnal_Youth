"use client";

import { useEffect, useState } from "react";
import { CircleDollarSign, CreditCard, HandCoins } from "lucide-react";
import { FaHandHoldingDollar } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";
import { usePathname, useRouter } from "next/navigation";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberInfoCard from "@/components/card/memberInfoCard";
import MyAccountProfileLayout from "@/components/navigation/MyAccountProfileLayout";
import StandaloneAccountSettings from "@/components/account/StandaloneAccountSettings";
import useCurrentMember from "@/hooks/useCurrentMember";
import { UnsavedChangesProvider } from "@/context/UnsavedChangesContext";
import StatCard from "@/components/dashboard/statCard";
import { fetchAllDonationRecords, summarizeDonationRecords } from "@/lib/memberDonationRecords";

const ROLE_LABELS = {
  SECRETARY: "លេខាធិការ",
  BRANCH_LEADER: "ប្រធានសាខា",
  MEMBER: "សមាជិក",
  secretary: "លេខាធិការ",
  branch_leader: "ប្រធានសាខា",
  member: "សមាជិក",
};

function formatDonationTotal(amountKhr, amountUsd) {
  const parts = [];
  if (Number(amountKhr) > 0) parts.push(`${Number(amountKhr).toLocaleString()} ៛`);
  if (Number(amountUsd) > 0) parts.push(`$${Number(amountUsd).toLocaleString()}`);
  return parts.length ? parts.join(" / ") : "0";
}

export default function MyAccountLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { member, loading, error, refetch } = useCurrentMember();

  /*
   * Staff (mainly secretaries) can be assigned to more than one
   * branch. The self-service personal-info endpoint already
   * returns the full list as `assigned_branches` — useCurrentMember()
   * doesn't carry it, so it's fetched separately here just for the
   * profile card's "+N" badge. Best-effort: a failure just falls
   * back to showing the primary branch only.
   */
  const [assignedBranches, setAssignedBranches] = useState([]);
  const [monthlyDonationSummary, setMonthlyDonationSummary] = useState({
    donationCount: 0, totalDonationKhr: 0, totalDonationUsd: 0,
    cashPaymentCount: 0, bankPaymentCount: 0, materialDonationCount: 0,
  });
  const [activityDonationSummary, setActivityDonationSummary] = useState({
    donationCount: 0, totalDonationKhr: 0, totalDonationUsd: 0,
    cashPaymentCount: 0, bankPaymentCount: 0, materialDonationCount: 0,
  });

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

  const isDonation = pathname === "/myAcc/donation";
  const isSponsor = pathname === "/myAcc/sponsor";

  useEffect(() => {
    if (!memberId || (!isDonation && !isSponsor)) return undefined;

    const controller = new AbortController();
    fetchAllDonationRecords(
      "/api/backend/my-account/donations/records",
      controller.signal,
    )
      .then((items) => {
        if (isDonation) {
          setMonthlyDonationSummary(
            summarizeDonationRecords(items, "MONTHLY_DONATION"),
          );
        }
        if (isSponsor) {
          setActivityDonationSummary(
            summarizeDonationRecords(items, "ACTIVITY_DONATION"),
          );
        }
      })
      .catch((summaryError) => {
        if (summaryError.name !== "AbortError") {
          console.error("Cannot load My Account donation summary:", summaryError);
        }
      });

    return () => controller.abort();
  }, [memberId, isDonation, isSponsor]);

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

              {isDonation && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={FaHandHoldingDollar} label="ចំនួនវិភាគទាន" value={monthlyDonationSummary.donationCount} iconColor="text-primary" iconBg="bg-secondary-light" />
                  <StatCard icon={CircleDollarSign} label="ទឹកប្រាក់សរុប" value={formatDonationTotal(monthlyDonationSummary.totalDonationKhr, monthlyDonationSummary.totalDonationUsd)} iconColor="text-error" iconBg="bg-error-bg" />
                  <StatCard icon={HiCash} label="ការទូទាត់តាម Cash" value={monthlyDonationSummary.cashPaymentCount} iconColor="text-warning" iconBg="bg-warning-bg" />
                  <StatCard icon={CreditCard} label="ការទូទាត់តាមធនាគារ" value={monthlyDonationSummary.bankPaymentCount} iconColor="text-secondary" iconBg="bg-secondary-light" />
                </div>
              )}

              {isSponsor && (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <StatCard icon={FaHandHoldingDollar} label="ចំនួនការបរិច្ចាក" value={activityDonationSummary.donationCount} iconColor="text-primary" iconBg="bg-secondary-light" />
                  <StatCard icon={CircleDollarSign} label="ទឹកប្រាក់សរុប" value={formatDonationTotal(activityDonationSummary.totalDonationKhr, activityDonationSummary.totalDonationUsd)} iconColor="text-success" iconBg="bg-success-bg" />
                  <StatCard icon={HandCoins} label="ចំនួនសម្ភារៈ" value={activityDonationSummary.materialDonationCount} iconColor="text-warning" iconBg="bg-warning-bg" />
                  <StatCard icon={CreditCard} label="ការទូទាត់តាមធនាគារ" value={activityDonationSummary.bankPaymentCount} iconColor="text-secondary" iconBg="bg-secondary-light" />
                </div>
              )}

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
