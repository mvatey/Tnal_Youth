"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircleDollarSign, Users } from "lucide-react";
import StatCard from "@/components/dashboard/statCard";
import { useLanguage } from "@/context/LanguageContext";

/**
 * Activity-level donation cards.
 *
 * These cards intentionally use a cross-branch, all-donation-type aggregate
 * endpoint rather than the currently selected branch's itemised donation
 * list: the total shown here is "how much this activity raised, period" —
 * shared between the organizer and every accepted invited branch, AND
 * including sponsor donations earmarked for this activity. That is
 * deliberately broader than the Branch tab's own per-branch breakdown, which
 * only counts member/branch donations (sponsor money has its own tab there
 * so it isn't double-counted into any one branch's total).
 */
export default function EventDonationDetailCards() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const activityId = searchParams.get("event");
  const [summaryData, setSummaryData] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("tnal-youth:donations-updated", refresh);
    return () => window.removeEventListener("tnal-youth:donations-updated", refresh);
  }, []);

  useEffect(() => {
    if (!activityId) {
      setSummaryData(null);
      return undefined;
    }

    let cancelled = false;

    fetch(
      `/api/backend/donations/activity/${encodeURIComponent(activityId)}/total`,
      {
        cache: "no-store",
        credentials: "include",
      },
    )
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || t("donationPage.donationSummaryLoadFailed"));
        }
        return body?.data ?? body;
      })
      .then((data) => {
        if (!cancelled) {
          setSummaryData(data ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) setSummaryData(null);
      });

    return () => {
      cancelled = true;
    };
  }, [activityId, refreshKey]);

  const summary = useMemo(
    () => ({
      overall: Number(summaryData?.sumTotalUsd ?? summaryData?.sum_total_usd ?? 0),
      donorCount: Number(summaryData?.count ?? 0),
    }),
    [summaryData],
  );

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
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
        icon={Users}
        label={t("donationPage.donor")}
        value={`${summary.donorCount} ${t("donationPage.personUnit")}`}
        iconColor="text-primary"
        iconBg="bg-secondary-light"
      />
    </div>
  );
}
