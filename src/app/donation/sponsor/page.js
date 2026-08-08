"use client";

import { useEffect, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorCard from "@/components/donations/SponsorCard";
import DonorCard from "@/components/donations/DonorCard";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";

export default function SponsorPage() {
  const [summary, setSummary] = useState({ donorCount: 0, overallTotalUsd: 0, donationChangePercent: 0, donorChangePercent: 0 });
  const [selectedBranch, setSelectedBranch] = useState("all");

  useEffect(() => {
    const query = selectedBranch === "all" ? "" : `?branchId=${encodeURIComponent(selectedBranch)}`;
    fetch(`/api/backend/donations/sponsor/summary${query}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load summary.");
        setSummary(body?.data ?? body);
      })
      .catch(() => setSummary({ donorCount: 0, overallTotalUsd: 0, donationChangePercent: 0, donorChangePercent: 0 }));
  }, [selectedBranch]);

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <SponsorCard value={`$${Number(summary.overallTotalUsd || 0).toLocaleString()}`} growth={`${Number(summary.donationChangePercent || 0)}%`} />
        <DonorCard label="អ្នកឧបត្ថម្ភសរុប" value={`${summary.donorCount || 0} នាក់`} growth={`${Number(summary.donorChangePercent || 0)}%`} note="ក្នុងខែនេះ" />
      </div>
      <SponsorPanel selectedBranch={selectedBranch} onBranchChange={setSelectedBranch} />
    </div>
  );
}
