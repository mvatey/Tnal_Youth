"use client";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  CircleDollarSign,
  CreditCard,
  HandCoins,
  InfoIcon,
  Users,
} from "lucide-react";

import { FaHandHoldingDollar } from "react-icons/fa6";
import { HiCash } from "react-icons/hi";

import MemberInfoCard from "@/components/card/memberInfoCard";
import HeaderMemberInfo from "@/components/navigation/headerMemberInfo";
import MemberTabNav from "@/components/navigation/MemberTabNav";
import StatCard from "@/components/dashboard/statCard";

import useMemberPermissions from "@/hooks/useMemberPermissions";
import { UnsavedChangesProvider } from "@/context/UnsavedChangesContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchAllDonationRecords, summarizeDonationRecords } from "@/lib/memberDonationRecords";
import useUsdKhrExchangeRate from "@/lib/useUsdKhrExchangeRate";

/*
 * This layout owns the profile header's own copy of `member` (for the
 * name/photo/role/status card and the summary stat cards), fetched once
 * on mount. A child tab page (e.g. details/personal) can mutate that same
 * data server-side -- role, account status, branch -- through its own,
 * independent save flow, but had no way to tell this layout to reload
 * its copy, so the header only ever caught up on the next full page
 * load/navigation. Exposing refetchMember() here lets a child call it
 * right after a successful save instead.
 */
export const MemberProfileRefreshContext =
  createContext(() => {});

async function fetchJson(
  path,
  signal,
) {
  const response = await fetch(
    `/api${path}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
      signal,
    },
  );

  const text =
    await response.text();

  let body = null;

  if (text) {
    try {
      body = JSON.parse(text);
    } catch {
      body = text;
    }
  }

  if (!response.ok) {
    const message =
      typeof body === "object"
        ? body?.message ||
          body?.detail ||
          body?.error
        : body;

    throw new Error(
      message ||
        `Request failed with status ${response.status}`,
    );
  }

  return body;
}

// Converts everything to a single USD figure (matching the totals card
// used on the sponsor/branch donation views -- see SponsorPanel.js) rather
// than showing KHR and USD as two separate numbers. Falls back to a fixed
// 4,000 KHR/USD rate while the live rate is still loading or unavailable.
function formatDonationTotal(
  amountKhr,
  amountUsd,
  exchangeRateKhrPerUsd,
) {
  const total =
    Number(amountUsd || 0) +
    Number(amountKhr || 0) /
      (exchangeRateKhrPerUsd || 4000);

  return `$${total.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export default function MemberInfoLayout({
  children,
  params,
}) {
  const { t } =
    useLanguage();

  const router = useRouter();
  const pathname = usePathname();

  const { id } = use(params);

  /*
   * This is the logged-in account's own role (not the role of the
   * member being viewed) — admin, secretary, and branch leader may all
   * change a member's photo on their behalf. A VIEWER-role account (any
   * viewerScope) must never be able to, regardless of what it's scoped
   * to view.
   */
  const { role: loggedInRole } =
    useMemberPermissions();

  const canChangeProfilePhoto =
    ["ADMIN", "SECRETARY", "BRANCH_LEADER"].includes(loggedInRole);

  const exchangeRateKhrPerUsd =
    useUsdKhrExchangeRate();

  const [
    member,
    setMember,
  ] = useState(null);

  /*
   * Staff (mainly secretaries) can be assigned to more than one
   * branch. The profile card's "សាខា" field shows this alongside
   * the member's primary branch — see MemberInfoCard.
   */
  const [
    assignedBranches,
    setAssignedBranches,
  ] = useState([]);

  const [
    activitySummary,
    setActivitySummary,
  ] = useState({
    joinedActivityCount: 0,
    notJoinedActivityCount: 0,
    totalDonationKhr: 0,
    totalDonationUsd: 0,
  });

  const [monthlyDonationSummary, setMonthlyDonationSummary] =
    useState({
      donationCount: 0,
      totalDonationKhr: 0,
      totalDonationUsd: 0,
      cashPaymentCount: 0,
      bankPaymentCount: 0,
    });

  const [activityDonationSummary, setActivityDonationSummary] =
    useState({
      donationCount: 0,
      totalDonationKhr: 0,
      totalDonationUsd: 0,
      materialDonationCount: 0,
      bankPaymentCount: 0,
    });

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const isDetailPage =
    pathname.includes("/details");

  const isDocuments =
    pathname.endsWith("/documents");

  const isParticipation =
    pathname.endsWith("/participation");

  const isDonation =
    pathname.endsWith("/donation");

  const isEventDonation =
    pathname.endsWith("/eventdonation");

  const isPassword =
    pathname.endsWith("/password");

  const showDefaultStats =
    isDocuments ||
    isParticipation ||
    isPassword;

  const loadMember = useCallback(
    async (signal) => {
      if (!id) {
        setMember(null);
        setAssignedBranches([]);
        setLoading(false);

        return;
      }

      try {
        setLoading(true);
        setError("");

        const data =
          await fetchJson(
            `/members/${id}`,
            signal,
          );

        setMember(
          data?.member || data,
        );

        /*
         * Best-effort: pulls the member's full assigned-branch
         * list (branch_staff) for the profile card's "+N" badge.
         * A failure here shouldn't block the page or show an
         * error — the card just falls back to the primary branch.
         */
        try {
          const personalInfo =
            await fetchJson(
              `/members/${id}/personal-info`,
              signal,
            );

          setAssignedBranches(
            personalInfo?.assigned_branches ||
              [],
          );
        } catch (assignedBranchesError) {
          if (
            assignedBranchesError.name !==
            "AbortError"
          ) {
            setAssignedBranches([]);
          }
        }
      } catch (fetchError) {
        if (
          fetchError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load member:",
            fetchError,
          );

          setMember(null);
          setAssignedBranches([]);

          setError(
            fetchError.message ||
              t("memberPage.loadMemberFailed"),
          );
        }
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [id, t],
  );

  useEffect(() => {
    const controller =
      new AbortController();

    loadMember(
      controller.signal,
    );

    return () => {
      controller.abort();
    };
  }, [loadMember]);

  const refetchMember =
    useCallback(
      () => loadMember(),
      [loadMember],
    );

  useEffect(() => {
    if (
      !id ||
      !showDefaultStats
    ) {
      return undefined;
    }

    const controller =
      new AbortController();

    async function loadActivitySummary() {
      try {
        const data =
          await fetchJson(
            `/backend/members/${id}/activities/summary`,
            controller.signal,
          );

        setActivitySummary({
          joinedActivityCount:
            Number(
              data?.joinedActivityCount,
            ) || 0,
          notJoinedActivityCount:
            Number(
              data?.notJoinedActivityCount,
            ) || 0,
          totalDonationKhr:
            Number(
              data?.totalDonationKhr,
            ) || 0,
          totalDonationUsd:
            Number(
              data?.totalDonationUsd,
            ) || 0,
        });
      } catch (summaryError) {
        if (
          summaryError.name !==
          "AbortError"
        ) {
          console.error(
            "Cannot load member summary:",
            summaryError,
          );

          setActivitySummary({
            joinedActivityCount: 0,
            notJoinedActivityCount: 0,
            totalDonationKhr: 0,
            totalDonationUsd: 0,
          });
        }
      }
    }

    loadActivitySummary();

    return () => {
      controller.abort();
    };
  }, [id, showDefaultStats]);

  useEffect(() => {
    if (!id || !isDonation) return undefined;

    const controller = new AbortController();

    fetchAllDonationRecords(
      `/api/backend/donations?memberId=${encodeURIComponent(id)}`,
      controller.signal,
    )
      .then((items) => {
        const summary = summarizeDonationRecords(items, "MONTHLY_DONATION");
        setMonthlyDonationSummary(summary);
      })
      .catch((summaryError) => {
        if (summaryError.name !== "AbortError") {
          console.error("Cannot load monthly donation summary:", summaryError);
        }
      });

    return () => controller.abort();
  }, [id, isDonation]);

  useEffect(() => {
    if (!id || !isEventDonation) return undefined;

    const controller = new AbortController();

    fetchAllDonationRecords(
      `/api/backend/donations?memberId=${encodeURIComponent(id)}`,
      controller.signal,
    )
      .then((items) => {
        const summary = summarizeDonationRecords(items, "ACTIVITY_DONATION");
        setActivityDonationSummary(summary);
      })
      .catch((summaryError) => {
        if (summaryError.name !== "AbortError") {
          console.error("Cannot load activity donation summary:", summaryError);
        }
      });

    return () => controller.abort();
  }, [id, isEventDonation]);

  const handleOpenDetails = () => {
    router.push(
      `/member/memberInfo/${id}/details/personal`,
    );
  };

  const handleBack = () => {
    if (isDetailPage) {
      router.push(
        `/member/memberInfo/${id}/documents`,
      );

      return;
    }

    router.push("/member");
  };

  if (loading) {
    return (
      <div className="flex min-h-[300px] items-center justify-center">
        <p className="text-sm text-gray-500">
          {t("memberPage.loadingMember")}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-white p-6 text-center">
        <p className="text-sm text-error">
          {error}
        </p>
      </div>
    );
  }

  if (!member) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500">
        {t("memberPage.memberNotFound")}
      </div>
    );
  }

  return (
    <UnsavedChangesProvider>
    <div className="space-y-4">
      <HeaderMemberInfo
        title={
          isDetailPage
            ? t("memberPage.detailProfileTitle")
            : t("memberPage.profileTitle")
        }
        breadcrumb={{
          parent: isDetailPage
            ? t("memberPage.profileTitle")
            : t("memberPage.listTitle"),

          current: isDetailPage
            ? t("memberPage.detailProfileTitle")
            : t("memberPage.profileTitle"),
        }}
        onBack={handleBack}
        buttonText={
          isDetailPage
            ? undefined
            : t("memberPage.detail")
        }
        onButtonClick={
          isDetailPage
            ? undefined
            : handleOpenDetails
        }
      />

      {/* Leave summary cards static for now */}

      {!isDetailPage &&
        showDefaultStats && (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-3
            "
          >
            <StatCard
              icon={Users}
              label={t("memberPage.joinedActivities")}
              value={
                activitySummary
                  .joinedActivityCount
              }
              iconColor="text-primary"
              iconBg="bg-secondary-light"
            />

            <StatCard
              icon={InfoIcon}
              label={t("memberPage.missedActivities")}
              value={
                activitySummary
                  .notJoinedActivityCount
              }
              iconColor="text-error"
              iconBg="bg-error-bg"
            />

            <StatCard
              icon={FaHandHoldingDollar}
              label={t("memberPage.totalDonationAmount")}
              value={formatDonationTotal(
                activitySummary
                  .totalDonationKhr,
                activitySummary
                  .totalDonationUsd,
                exchangeRateKhrPerUsd,
              )}
              iconColor="text-warning"
              iconBg="bg-warning-bg"
            />
          </div>
        )}

      {!isDetailPage &&
        isDonation && (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <StatCard
              icon={FaHandHoldingDollar}
              label={t("memberPage.donationCount")}
              value={monthlyDonationSummary.donationCount}
              iconColor="text-primary"
              iconBg="bg-secondary-light"
            />

            <StatCard
              icon={CircleDollarSign}
              label={t("memberPage.totalAmount")}
              value={formatDonationTotal(
                monthlyDonationSummary.totalDonationKhr,
                monthlyDonationSummary.totalDonationUsd,
                exchangeRateKhrPerUsd,
              )}
              iconColor="text-error"
              iconBg="bg-error-bg"
            />

            <StatCard
              icon={HiCash}
              label={t("memberPage.cashPayment")}
              value={monthlyDonationSummary.cashPaymentCount}
              iconColor="text-warning"
              iconBg="bg-warning-bg"
            />

            <StatCard
              icon={CreditCard}
              label={t("memberPage.bankPayment")}
              value={monthlyDonationSummary.bankPaymentCount}
              iconColor="text-secondary"
              iconBg="bg-secondary-light"
            />
          </div>
        )}

      {!isDetailPage &&
        isEventDonation && (
          <div
            className="
              grid
              grid-cols-1
              gap-4
              md:grid-cols-2
              xl:grid-cols-4
            "
          >
            <StatCard
              icon={Users}
              label={t("memberPage.contributionCount")}
              value={activityDonationSummary.donationCount}
              iconColor="text-primary"
              iconBg="bg-secondary-light"
            />

            <StatCard
              icon={CircleDollarSign}
              label={t("memberPage.totalAmount")}
              value={formatDonationTotal(
                activityDonationSummary.totalDonationKhr,
                activityDonationSummary.totalDonationUsd,
                exchangeRateKhrPerUsd,
              )}
              iconColor="text-success"
              iconBg="bg-success-bg"
            />

            <StatCard
              icon={HandCoins}
              label={t("memberPage.materialCount")}
              value={activityDonationSummary.materialDonationCount}
              iconColor="text-warning"
              iconBg="bg-warning-bg"
            />

            <StatCard
              icon={CreditCard}
              label={t("memberPage.bankPayment")}
              value={activityDonationSummary.bankPaymentCount}
              iconColor="text-secondary"
              iconBg="bg-secondary-light"
            />
          </div>
        )}

      {/* Now receives real API member */}

      <MemberInfoCard
        member={member}
        assignedBranches={assignedBranches}
        profileUploadEndpoint={
          `/api/backend/members/${member.id}/profile-photo`
        }
        /*
         * See canChangeProfilePhoto above -- admin, secretary, and
         * branch leader may upload a photo on this member's behalf.
         * A VIEWER account can never upload, regardless of its
         * viewerScope.
         */
        allowProfileChange={
          canChangeProfilePhoto
        }
      />

      {!isDetailPage && (
        <MemberTabNav
          memberId={member.id}
        />
      )}

      <div>
        <MemberProfileRefreshContext.Provider
          value={refetchMember}
        >
          {children}
        </MemberProfileRefreshContext.Provider>
      </div>
    </div>
    </UnsavedChangesProvider>
  );
}
