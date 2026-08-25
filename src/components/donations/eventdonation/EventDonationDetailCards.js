"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";

/**
 * Activity-level donation cards.
 *
 * These cards intentionally use the cross-branch aggregate endpoint rather
 * than the currently selected branch's itemised donation list. That keeps the
 * activity total shared between the organizer and every accepted invited
 * branch: when an invited branch records money, the organizer's cards update
 * too without exposing that branch's individual donor rows.
 */
export default function EventDonationDetailCards() {
  const searchParams = useSearchParams();
  const activityId = searchParams.get("event");
  const [branchTotals, setBranchTotals] = useState([]);

  useEffect(() => {
    if (!activityId) {
      setBranchTotals([]);
      return undefined;
    }

    let cancelled = false;

    fetch(
      `/api/backend/donations/activity/${encodeURIComponent(activityId)}/branch-totals`,
      {
        cache: "no-store",
        credentials: "include",
      },
    )
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || "មិនអាចទាញយកសរុបការបរិច្ចាកកម្មវិធីបានទេ។");
        }
        return body?.data ?? body;
      })
      .then((rows) => {
        if (!cancelled) {
          setBranchTotals(Array.isArray(rows) ? rows : []);
        }
      })
      .catch(() => {
        if (!cancelled) setBranchTotals([]);
      });

    return () => {
      cancelled = true;
    };
  }, [activityId]);

  const summary = useMemo(
    () =>
      branchTotals.reduce(
        (totals, row) => ({
          riel: totals.riel + Number(row?.amountKhr ?? row?.amount_khr ?? 0),
          dollar: totals.dollar + Number(row?.amountUsd ?? row?.amount_usd ?? 0),
          overall:
            totals.overall +
            Number(row?.totalAmountUsd ?? row?.total_amount_usd ?? 0),
          donorCount:
            totals.donorCount +
            Number(row?.donationCount ?? row?.donation_count ?? 0),
        }),
        { riel: 0, dollar: 0, overall: 0, donorCount: 0 },
      ),
    [branchTotals],
  );

  return (
    <div className="flex gap-[50px] xl:grid-cols-2">
      <EventDonationSummaryCard
        value={`$${summary.overall.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        growth=""
        note={`៛ ${summary.riel.toLocaleString()}`}
      />
      <DonorCard
        label="អ្នកវិភាគទាន"
        value={`${summary.donorCount} នាក់`}
        growth=""
        note=""
      />
    </div>
  );
}
