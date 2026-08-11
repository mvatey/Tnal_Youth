"use client";

import { useEffect, useMemo, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import EventDonationPanel from "@/components/donations/eventdonation/EventDonationPanel";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import MemberCard from "@/components/donations/eventdonation/membercard";
import NumberSponsorCard from "@/components/donations/eventdonation/sponsorcard";

export default function EventDonationPage() {
  const [selectedPeopleCard, setSelectedPeopleCard] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    fetch("/api/backend/donations?page=0&size=100", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load donations.");
        return body?.data ?? body;
      })
      .then((page) => {
        if (!cancelled) setRows((Array.isArray(page?.items) ? page.items : []).filter((row) => row.activityId));
      })
      .catch((loadError) => { if (!cancelled) setError(loadError.message); });
    return () => { cancelled = true; };
  }, []);

  const branchRows = useMemo(() => rows.filter((row) =>
    selectedBranch === "all" || String(row.branchId) === String(selectedBranch),
  ), [rows, selectedBranch]);
  const memberCount = new Set(branchRows.filter((row) => row.memberId).map((row) => row.memberId)).size;
  const sponsorCount = new Set(branchRows.filter((row) => !row.memberId).map((row) => `${row.sponsorId || row.donorName || row.id}`)).size;
  const totalDollar = branchRows.reduce((total, row) => total + Number(row.amountUsd || 0) + Number(row.amountKhr || 0) / Number(row.exchangeRateKhrPerUsd || 4000), 0);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    setSelectedPeopleCard(null);
  };

  return (
    <div className="space-y-4">
      <DonationTabs />
      {error ? <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="flex gap-[50px] xl:grid-cols-2">
        <EventDonationSummaryCard value={`$${totalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="" note="" />
        <DonorCard label="អ្នកវិភាគទានសរុប" value={`${memberCount + sponsorCount} នាក់`} growth="" note="" />
        <MemberCard value={`${memberCount} នាក់`} growth="" note="" selected={selectedPeopleCard === "members"} disabled={selectedBranch === "all"} onClick={() => setSelectedPeopleCard("members")} />
        <NumberSponsorCard value={`${sponsorCount} នាក់`} growth="" note="" selected={selectedPeopleCard === "sponsors"} disabled={selectedBranch === "all"} onClick={() => setSelectedPeopleCard("sponsors")} />
      </div>
      {selectedPeopleCard === "members" ? (
        <EventDonationDetailForm initialQuery={{ branch: selectedBranch }} onCancel={() => setSelectedPeopleCard(null)} />
      ) : selectedPeopleCard === "sponsors" ? (
        <SponsorPanel selectedBranch={selectedBranch} onBranchChange={handleBranchChange} showAddButton={false} />
      ) : (
        <EventDonationPanel selectedBranch={selectedBranch} onBranchChange={handleBranchChange} />
      )}
    </div>
  );
}
