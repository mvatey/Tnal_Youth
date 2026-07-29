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

import donationData from "@/data/donation/donationData.json";
import activities from "@/data/activityRecords.json";
import sponsorData from "@/data/donation/sponsorData.json";

const {
  donationStats = [],
} = donationData;

const { sponsorRows = [] } = sponsorData;

const SAVED_EVENT_DONATION_ROWS_KEY =
  "tnal-youth:saved-event-donation-rows";

const RIEL_PER_DOLLAR = 4000;

function parseMoney(value) {
  return (
    Number(
      String(value ?? "").replace(/[^\d.-]/g, "")
    ) || 0
  );
}

function getActivityBranch(activity) {
  return (
    activity.branchName ||
    activity.branch ||
    "-"
  );
}

export default function EventDonationPage() {
  const [
    selectedPeopleCard,
    setSelectedPeopleCard,
  ] = useState(null);

  const [
    selectedBranch,
    setSelectedBranch,
  ] = useState("all");

  const [
    savedEventRows,
    setSavedEventRows,
  ] = useState({});

  const [
    visibleEventRows,
    setVisibleEventRows,
  ] = useState([]);

  const hasSelectedBranch =
    selectedBranch !== "all";

  const branchActivities = useMemo(() => {
    if (!hasSelectedBranch) {
      return activities;
    }

    return activities.filter(
      (activity) =>
        getActivityBranch(activity) ===
        selectedBranch
    );
  }, [hasSelectedBranch, selectedBranch]);

  const branchSponsors = useMemo(() => {
    return sponsorRows.filter((sponsor, index) => {
      const fallbackBranch =
        activities.length > 0
          ? getActivityBranch(
              activities[index % activities.length]
            )
          : null;

      const sponsorBranch =
        sponsor.branchName ||
        sponsor.branch ||
        fallbackBranch;

      return (
        !hasSelectedBranch ||
        sponsorBranch === selectedBranch
      );
    });
  }, [hasSelectedBranch, selectedBranch]);

  const savedMemberDonations = useMemo(() => {
    const allowedActivityIds = new Set(
      branchActivities.map((activity) =>
        String(activity.id)
      )
    );

    return Object.entries(savedEventRows)
      .map(([key, savedRow]) => {
        const [
          branch,
          activityId,
          memberId,
        ] = key.split("|");

        return {
          branch,
          activityId,
          memberId,
          ...savedRow,
        };
      })
      .filter((row) => {
        const matchesBranch =
          !hasSelectedBranch ||
          row.branch === selectedBranch;

        const matchesActivity =
          allowedActivityIds.has(
            String(row.activityId)
          );

        return (
          matchesBranch &&
          matchesActivity
        );
      });
  }, [
    branchActivities,
    hasSelectedBranch,
    savedEventRows,
    selectedBranch,
  ]);

  const memberCount = useMemo(() => {
    const uniqueMemberIds = new Set(
      savedMemberDonations
        .filter(
          (row) =>
            Number(row.realAmount) > 0 ||
            Number(row.dollarAmount) > 0
        )
        .map((row) =>
          String(row.memberId)
        )
    );

    return uniqueMemberIds.size;
  }, [savedMemberDonations]);

  const sponsorCount =
    branchSponsors.length;

  const totalDollar = useMemo(
    () =>
      visibleEventRows.reduce(
        (total, row) =>
          total +
          parseMoney(row.amountUsd) +
          parseMoney(row.amountKhr) /
            RIEL_PER_DOLLAR,
        0
      ),
    [visibleEventRows]
  );

  useEffect(() => {
    try {
      const savedValue =
        window.localStorage.getItem(
          SAVED_EVENT_DONATION_ROWS_KEY
        );

      setSavedEventRows(
        savedValue
          ? JSON.parse(savedValue)
          : {}
      );
    } catch {
      setSavedEventRows({});
    }
  }, []);

  const handleBranchChange = (branch) => {
    setSelectedBranch(branch);
    setSelectedPeopleCard(null);
  };

  const donorCardData =
    donationStats[1] ?? {};

  return (
    <div className="space-y-4">
      <DonationTabs />

      <div className="flex flex-wrap gap-[50px]">
        <EventDonationSummaryCard
          value={`$${totalDollar.toLocaleString(
            "en-US",
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}`}
          growth="+15%"
          note="ក្នុងខែនេះ"
        />

        <DonorCard
          {...donorCardData}
          value={`${
            memberCount + sponsorCount
          } នាក់`}
          growth="+10%"
          note="ក្នុងខែនេះ"
        />

        <MemberCard
          value={`${memberCount} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
          selected={
            selectedPeopleCard === "members"
          }
          disabled={!hasSelectedBranch}
          onClick={() =>
            setSelectedPeopleCard("members")
          }
        />

        <NumberSponsorCard
          value={`${sponsorCount} នាក់`}
          growth="+15%"
          note="ក្នុងខែនេះ"
          selected={
            selectedPeopleCard === "sponsors"
          }
          disabled={!hasSelectedBranch}
          onClick={() =>
            setSelectedPeopleCard("sponsors")
          }
        />
      </div>

      {selectedPeopleCard === "members" ? (
        <EventDonationDetailForm
          initialQuery={{
            branch: selectedBranch,
          }}
          onCancel={() =>
            setSelectedPeopleCard(null)
          }
        />
      ) : selectedPeopleCard ===
        "sponsors" ? (
        <SponsorPanel
          selectedBranch={selectedBranch}
          showAddButton={false}
          typeOptions={[
            "បុគ្គល",
            "ស្ថាប័ន",
          ]}
        />
      ) : (
        <EventDonationPanel
          selectedBranch={selectedBranch}
          onBranchChange={
            handleBranchChange
          }
          onRowsChange={setVisibleEventRows}
        />
      )}
    </div>
  );
}
