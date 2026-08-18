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
import useCurrentMember from "@/hooks/useCurrentMember";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { useBranch } from "@/context/BranchContext";

const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

function mapMyEventRow(row) {
  return {
    id: row.id,
    eventName: row.activity?.titleKm || row.activity?.titleEn || "-",
    branch: row.branch?.nameKm || row.branch?.nameEn || "-",
    date: row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-GB") : "-",
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || row.totalAmountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
  };
}

function MyEventDonationsTable({ rows }) {
  if (!rows.length) {
    return (
      <section className="min-h-[200px] rounded-md border border-border bg-bg-page-white px-7 py-8 text-center text-xs font-medium text-text-secondary shadow-sm">
        មិនមានទិន្នន័យវិភាគទាននៅឡើយទេ
      </section>
    );
  }

  return (
    <section className="overflow-x-auto rounded-md border border-border bg-bg-page-white px-7 py-4 shadow-sm">
      <table className="w-full min-w-[760px] border-collapse border border-border">
        <thead>
          <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
            <th className="px-4">ល.រ</th>
            <th className="px-4">កម្មវិធី</th>
            <th className="px-4">សាខា</th>
            <th className="px-4">ថ្ងៃខែឆ្នាំ</th>
            <th className="px-4">ចំនួនប្រាក់រៀល</th>
            <th className="px-4">ចំនួនប្រាក់ដុល្លារ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0">
              <td className="px-4">{index + 1}</td>
              <td className="px-4">{row.eventName}</td>
              <td className="px-4">{row.branch}</td>
              <td className="whitespace-nowrap px-4">{row.date}</td>
              <td className="px-4">{row.rielAmount}</td>
              <td className="px-4">{row.dollarAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function EventDonationPage() {
  const { member: currentMember, loading: currentMemberLoading } = useCurrentMember();
  const isMemberScoped = currentMember?.role === "member";
  // Only entry staff (secretary / branch_leader) may open the bulk "record
  // donations for members" flow — admin/viewer are view-only.
  const canManage = ["secretary", "branch_leader"].includes(currentMember?.role);
  // Same role set is also who's always scoped to exactly one branch — the
  // one active in the sidebar's global dropdown (see DonationTable.js) —
  // rather than an independent "all branches" pick on this page.
  const isBranchScoped = canManage;
  const { branches: accessibleBranches = [], selectedBranch: globalSelectedBranch = "all" } = useBranch();
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;
    if (globalSelectedBranch && globalSelectedBranch !== "all") return String(globalSelectedBranch);
    if (accessibleBranches.length > 0) return String(accessibleBranches[0].id);
    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [isBranchScoped, globalSelectedBranch, accessibleBranches, currentMember?.branchId]);

  const [selectedPeopleCard, setSelectedPeopleCard] = useState(null);
  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const selectedBranch = isBranchScoped ? (effectiveBranchId ?? "all") : internalSelectedBranch;
  const [rows, setRows] = useState([]);
  const [myRows, setMyRows] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    if (currentMemberLoading) return undefined;
    let cancelled = false;

    if (isMemberScoped) {
      fetchMyAccountCollection("donations/events")
        .then((items) => { if (!cancelled) setMyRows(items.map(mapMyEventRow)); })
        .catch((loadError) => { if (!cancelled) setError(loadError.message); });
      return () => { cancelled = true; };
    }

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
  }, [currentMemberLoading, isMemberScoped]);

  const branchRows = useMemo(() => rows.filter((row) =>
    selectedBranch === "all" || String(row.branchId) === String(selectedBranch),
  ), [rows, selectedBranch]);
  const memberCount = new Set(branchRows.filter((row) => row.memberId).map((row) => row.memberId)).size;
  const sponsorCount = new Set(branchRows.filter((row) => !row.memberId).map((row) => `${row.sponsorId || row.donorName || row.id}`)).size;
  const totalDollar = branchRows.reduce((total, row) => total + Number(row.amountUsd || 0) + Number(row.amountKhr || 0) / Number(row.exchangeRateKhrPerUsd || 4000), 0);
  const myTotalDollar = myRows.reduce((total, row) => total + parseMoney(row.dollarAmount), 0);

  const handleBranchChange = (branch) => {
    // A secretary/branch_leader has no branch to pick here anymore — the
    // sidebar's global dropdown is the only thing that changes it (see
    // effectiveBranchId above); the panels below are rendered with their
    // own branch filter locked (branchScoped) for this role.
    if (!isBranchScoped) setInternalSelectedBranch(branch);
    setSelectedPeopleCard(null);
  };

  if (isMemberScoped) {
    return (
      <div className="space-y-4">
        <DonationTabs />
        {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
        <div className="flex gap-[50px] xl:grid-cols-2">
          <EventDonationSummaryCard
            label="វិភាគទានក្នុងកម្មវិធីរបស់ខ្ញុំ"
            value={`$${myTotalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            growth=""
            note=""
          />
          <DonorCard label="ចំនួនកំណត់ត្រា" value={`${myRows.length} នាក់`} growth="" note="" />
        </div>
        <MyEventDonationsTable rows={myRows} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DonationTabs />
      {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <div className="flex gap-[50px] xl:grid-cols-2">
        <EventDonationSummaryCard value={`$${totalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="" note="" />
        <DonorCard label="អ្នកវិភាគទានសរុប" value={`${memberCount + sponsorCount} នាក់`} growth="" note="" />
        <MemberCard
          value={`${memberCount} នាក់`}
          growth=""
          note=""
          selected={selectedPeopleCard === "members"}
          disabled={selectedBranch === "all" || !canManage}
          onClick={() => setSelectedPeopleCard("members")}
        />
        <NumberSponsorCard
          value={`${sponsorCount} នាក់`}
          growth=""
          note=""
          selected={selectedPeopleCard === "sponsors"}
          disabled={selectedBranch === "all"}
          onClick={() => setSelectedPeopleCard("sponsors")}
        />
      </div>
      {selectedPeopleCard === "members" && canManage ? (
        <EventDonationDetailForm initialQuery={{ branch: selectedBranch }} onCancel={() => setSelectedPeopleCard(null)} />
      ) : selectedPeopleCard === "sponsors" ? (
        <SponsorPanel
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          showAddButton={false}
          branchScoped={isBranchScoped}
        />
      ) : (
        <EventDonationPanel
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          branchScoped={isBranchScoped}
        />
      )}
    </div>
  );
}
