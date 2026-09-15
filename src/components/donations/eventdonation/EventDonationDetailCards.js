"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDollarSign, HandCoins, Users } from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import { useLanguage } from "@/context/LanguageContext";

async function fetchJson(url, fallbackMessage) {
  const response = await fetch(url, { cache: "no-store", credentials: "include" });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || fallbackMessage);
  }
  return body?.data ?? body;
}

/**
 * Activity-level donation cards.
 *
 * The main total + donor count cards intentionally use the cross-branch
 * branch-totals endpoint (same one the "សាខា" tab below uses) rather than
 * the currently selected branch's itemised donation list: the total shown
 * here is shared between the organizer and every accepted invited branch,
 * without exposing any one branch's individual donor rows. It stays
 * ACTIVITY_DONATION-only -- member/branch donations -- same lane as the
 * Branch tab. The Sponsor card is a separate lane, fetched and shown on its
 * own rather than folded into the total above (sponsor money already has
 * its own dedicated Sponsor tab).
 */
export default function EventDonationDetailCards() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("event");
  const [branchTotals, setBranchTotals] = useState([]);
  const [sponsorSummary, setSponsorSummary] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("tnal-youth:donations-updated", refresh);
    return () => window.removeEventListener("tnal-youth:donations-updated", refresh);
  }, []);

  useEffect(() => {
    if (!activityId) {
      setBranchTotals([]);
      setSponsorSummary(null);
      return undefined;
    }

    let cancelled = false;
    const failedMessage = t("donationPage.donationSummaryLoadFailed");

    Promise.all([
      fetchJson(
        `/api/backend/donations/activity/${encodeURIComponent(activityId)}/branch-totals`,
        failedMessage,
      ),
      fetchJson(
        `/api/backend/donations/activity/${encodeURIComponent(activityId)}/sponsor-total`,
        failedMessage,
      ),
    ])
      .then(([rows, sponsorTotal]) => {
        if (cancelled) return;
        setBranchTotals(Array.isArray(rows) ? rows : []);
        setSponsorSummary(sponsorTotal ?? null);
      })
      .catch(() => {
        if (!cancelled) {
          setBranchTotals([]);
          setSponsorSummary(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activityId, refreshKey, t]);

  const summary = useMemo(
    () =>
      branchTotals.reduce(
        (totals, row) => ({
          overall:
            totals.overall +
            Number(row?.totalAmountUsd ?? row?.total_amount_usd ?? 0),
          donorCount:
            totals.donorCount +
            Number(row?.donationCount ?? row?.donation_count ?? 0),
        }),
        { overall: 0, donorCount: 0 },
      ),
    [branchTotals],
  );

  const sponsorTotal = Number(
    sponsorSummary?.sumTotalUsd ?? sponsorSummary?.sum_total_usd ?? 0,
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      <StatCard
        icon={CircleDollarSign}
        label={t("donationPage.eventDonationTitle")}
        value={`$${summary.overall.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        iconColor="text-success"
        iconBg="bg-success-bg"
      />
      <StatCard
        icon={HandCoins}
        label={t("donationPage.sponsorAmountInActivities")}
        value={`$${sponsorTotal.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        iconColor="text-warning"
        iconBg="bg-warning-bg"
      />
      <StatCard
        icon={Users}
        label={t("donationPage.donor")}
        value={`${summary.donorCount} ${t("donationPage.personUnit")}`}
        iconColor="text-primary"
        iconBg="bg-secondary-light"
      />
    </div>
  );
}
