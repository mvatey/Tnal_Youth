"use client";

import { useEffect, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import EventDonationPanel from "@/components/donations/eventdonation/EventDonationPanel";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import donationData from "@/data/donation/donationData.json";
import eventDonationData from "@/data/donation/eventDonationData.json";
import sponsorData from "@/data/donation/sponsorData.json";
import MemberCard from "@/components/donations/eventdonation/membercard";
import NumberSponsorCard from "@/components/donations/eventdonation/sponsorcard";

const { addDonationRows, donationRows, donationStats } = donationData;
const { eventTypes } = eventDonationData;
const { sponsorRows } = sponsorData;
const SAVED_EVENT_DONATION_ROWS_KEY = "tnal-youth:saved-event-donation-rows";
const RIEL_PER_DOLLAR = 4000;
const parseMoney = (value) =>
  Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

export default function EventDonationPage() {
  const [selectedPeopleCard, setSelectedPeopleCard] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [savedEventRows, setSavedEventRows] = useState({});
  const hasSelectedBranch = selectedBranch !== "all";
  const branchMembers = addDonationRows.filter(
    (row) => !hasSelectedBranch || row.branch === selectedBranch,
  );
  const branchSponsors = sponsorRows.filter((row, index) => {
    const rowBranch =
      row.branch || donationRows[index % donationRows.length]?.branch;
    return !hasSelectedBranch || rowBranch === selectedBranch;
  });
  const memberCount = branchMembers.length;
  const sponsorCount = branchSponsors.length;

  const memberMoney = branchMembers.reduce(
    (totals, row) => {
      const index = addDonationRows.findIndex((member) => member.id === row.id);
      const eventType = eventTypes[index % eventTypes.length];
      const saved =
        savedEventRows[[row.branch, eventType, row.id].join("|")] || {};

      totals.riel +=
        Number(saved.realAmount ?? row.realAmount) ||
        400000 + (index % 5) * 50000;
      totals.dollar +=
        Number(saved.dollarAmount ?? row.dollarAmount) ||
        100 + (index % 4) * 100;
      return totals;
    },
    { riel: 0, dollar: 0 },
  );
  const sponsorMoney = branchSponsors.reduce(
    (totals, row) => {
      totals.riel += parseMoney(row.rielAmount);
      totals.dollar += parseMoney(row.dollarAmount);
      return totals;
    },
    { riel: 0, dollar: 0 },
  );
  const totalRiel = memberMoney.riel + sponsorMoney.riel;
  const totalDollar =
    memberMoney.dollar + sponsorMoney.dollar + totalRiel / RIEL_PER_DOLLAR;

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(
        SAVED_EVENT_DONATION_ROWS_KEY,
      );
      setSavedEventRows(savedValue ? JSON.parse(savedValue) : {});
    } catch {
      setSavedEventRows({});
    }
  }, []);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    setSelectedPeopleCard(null);
  };

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <EventDonationSummaryCard
          value={`$${totalDollar.toLocaleString(undefined, {
            maximumFractionDigits: 2,
          })}`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />
        <DonorCard
          {...donationStats[1]}
          value={`${memberCount + sponsorCount} នាក់`}
          growth="+10%"
          note="ក្នុងខែនេះ"
        />
        <MemberCard
          value={`${memberCount} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
          selected={selectedPeopleCard === "members"}
          disabled={!hasSelectedBranch}
          onClick={() => setSelectedPeopleCard("members")}
        />
        <NumberSponsorCard
          value={`${sponsorCount} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
          selected={selectedPeopleCard === "sponsors"}
          disabled={!hasSelectedBranch}
          onClick={() => setSelectedPeopleCard("sponsors")}
        />
      </div>
      {selectedPeopleCard === "members" ? (
        <EventDonationDetailForm
          initialQuery={{ branch: selectedBranch }}
          onCancel={() => setSelectedPeopleCard(null)}
        />
      ) : selectedPeopleCard === "sponsors" ? (
        <SponsorPanel selectedBranch={selectedBranch} showAddButton={false} />
      ) : (
        <EventDonationPanel
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
        />
      )}
    </div>
  );
}
