"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";

export default function EventDonationDetailCards() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");
  const activityId = searchParams.get("event");
  const [rows, setRows] = useState([]);

  useEffect(() => {
    if (!activityId) return undefined;
    let cancelled = false;
    fetch(`/api/backend/donations?page=0&size=1000&activityId=${encodeURIComponent(activityId)}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load donations.");
        return body?.data ?? body;
      })
      .then((page) => {
        if (cancelled) return;
        setRows((Array.isArray(page?.items) ? page.items : []).filter((row) =>
          String(row.activityId) === String(activityId) && (!branchId || String(row.branchId) === String(branchId)),
        ));
      })
      .catch(() => { if (!cancelled) setRows([]); });
    return () => { cancelled = true; };
  }, [activityId, branchId]);

  const summary = useMemo(() => rows.reduce((totals, row) => {
    totals.riel += Number(row.amountKhr || 0);
    totals.dollar += Number(row.amountUsd || 0);
    totals.donors.add(`${row.memberId || row.sponsorId || row.donorName || row.id}`);
    return totals;
  }, { riel: 0, dollar: 0, donors: new Set() }), [rows]);
  const dollarEquivalent = summary.dollar + summary.riel / 4000;

  return (
    <div className="flex gap-[50px] xl:grid-cols-2">
      <EventDonationSummaryCard value={`$${dollarEquivalent.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="" note={`៛ ${summary.riel.toLocaleString()}`} />
      <DonorCard label="អ្នកវិភាគទាន" value={`${summary.donors.size} នាក់`} growth="" note="" />
    </div>
  );
}
