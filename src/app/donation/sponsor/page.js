"use client";

import { useEffect, useMemo, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorCard from "@/components/donations/SponsorCard";
import DonorCard from "@/components/donations/DonorCard";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";

export default function SponsorPage() {
  const [summary, setSummary] = useState({ donorCount: 0, overallTotalUsd: 0, donationChangePercent: 0, donorChangePercent: 0 });
  const { member: currentMember } = useCurrentMember();
  // Same single-branch scoping as the monthly donation pages (see
  // DonationTable.js) — a secretary/branch_leader is always scoped to
  // exactly the one branch active in the sidebar's global dropdown, never
  // an independent "all branches" pick here.
  const { branches: accessibleBranches = [], selectedBranch: globalSelectedBranch = "all" } = useBranch();
  const isBranchScoped = ["secretary", "branch_leader"].includes(currentMember?.role);
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;
    if (globalSelectedBranch && globalSelectedBranch !== "all") return String(globalSelectedBranch);
    if (accessibleBranches.length > 0) return String(accessibleBranches[0].id);
    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [isBranchScoped, globalSelectedBranch, accessibleBranches, currentMember?.branchId]);

  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const selectedBranch = isBranchScoped ? (effectiveBranchId ?? "all") : internalSelectedBranch;
  const setSelectedBranch = isBranchScoped ? () => {} : setInternalSelectedBranch;

  useEffect(() => {
    let cancelled = false;

    if (currentMember?.role === "member") {
      fetchMyAccountCollection("donations/sponsors")
        .then((rows) => {
          if (cancelled) return;
          const totalUsd = rows.reduce(
            (total, row) =>
              total +
              Number(row.amountUsd || row.totalAmountUsd || 0) +
              Number(row.amountKhr || 0) / Number(row.exchangeRateKhrPerUsd || 4000),
            0,
          );
          setSummary({
            donorCount: rows.length,
            overallTotalUsd: totalUsd,
            donationChangePercent: 0,
            donorChangePercent: 0,
          });
        })
        .catch(() => {
          if (!cancelled) {
            setSummary({ donorCount: 0, overallTotalUsd: 0, donationChangePercent: 0, donorChangePercent: 0 });
          }
        });
      return () => { cancelled = true; };
    }

    const query = selectedBranch === "all" ? "" : `?branchId=${encodeURIComponent(selectedBranch)}`;
    fetch(`/api/backend/donations/sponsor/summary${query}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load summary.");
        if (!cancelled) setSummary(body?.data ?? body);
      })
      .catch(() => {
        if (!cancelled) {
          setSummary({ donorCount: 0, overallTotalUsd: 0, donationChangePercent: 0, donorChangePercent: 0 });
        }
      });

    return () => { cancelled = true; };
  }, [currentMember?.role, selectedBranch]);

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <SponsorCard
          value={`$${Number(summary.overallTotalUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          growth={currentMember?.role === "member" ? "" : `${Number(summary.donationChangePercent || 0)}%`}
        />
        <DonorCard
          label={currentMember?.role === "member" ? "ចំនួនកំណត់ត្រារបស់ខ្ញុំ" : "អ្នកឧបត្ថម្ភសរុប"}
          value={`${summary.donorCount || 0} ${currentMember?.role === "member" ? "លើក" : "នាក់"}`}
          growth={currentMember?.role === "member" ? "" : `${Number(summary.donorChangePercent || 0)}%`}
          note={currentMember?.role === "member" ? "" : "ក្នុងខែនេះ"}
        />
      </div>
      <SponsorPanel
        selectedBranch={selectedBranch}
        onBranchChange={setSelectedBranch}
        branchScoped={isBranchScoped}
      />
    </div>
  );
}
