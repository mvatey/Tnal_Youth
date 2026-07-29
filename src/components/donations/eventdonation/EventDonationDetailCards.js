"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import donationData from "@/data/donation/donationData.json";
import activities from "@/data/activityRecords.json";

const SAVED_EVENT_DONATION_ROWS_KEY = "tnal-youth:saved-event-donation-rows";
const DONATION_ROWS_CHANGE_EVENT = "tnal-youth:donation-rows-change";
const RIEL_PER_DOLLAR = 4000;
const { addDonationRows, donationStats } = donationData;

const getSavedRowKey = (row) =>
  [row.branch, row.activityId, row.id].join("|");

export default function EventDonationDetailCards() {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch");
  const activityId =
    searchParams.get("activityId") || searchParams.get("id");
  const [savedRows, setSavedRows] = useState({});
  const [draftRows, setDraftRows] = useState([]);

  useEffect(() => {
    try {
      const savedValue = window.localStorage.getItem(
        SAVED_EVENT_DONATION_ROWS_KEY,
      );
      setSavedRows(savedValue ? JSON.parse(savedValue) : {});
    } catch {
      setSavedRows({});
    }
  }, []);

  useEffect(() => {
    const handleRowsChange = (event) => {
      setDraftRows(Array.isArray(event.detail) ? event.detail : []);
    };

    window.addEventListener(DONATION_ROWS_CHANGE_EVENT, handleRowsChange);
    return () =>
      window.removeEventListener(DONATION_ROWS_CHANGE_EVENT, handleRowsChange);
  }, []);

  const summary = useMemo(() => {
    const selectedActivity = activities.find(
      (activity) => String(activity.id) === String(activityId),
    );
    const activityBranch =
      selectedActivity?.branchName || selectedActivity?.branch || branch;

    const members = selectedActivity
      ? addDonationRows.map((row) => ({
        ...row,
        activityId: selectedActivity.id,
        eventType: selectedActivity.type,
        branch: activityBranch,
      }))
      : [];

    return members.reduce(
      (totals, member) => {
        const saved = savedRows[getSavedRowKey(member)] || {};
        const draft = draftRows.find((row) => row.id === member.id) || {};
        const rielValue =
          draft.realAmount ?? saved.realAmount ?? member.realAmount;
        const dollarValue =
          draft.dollarAmount ?? saved.dollarAmount ?? member.dollarAmount;

        totals.riel += Number(rielValue) || 0;
        totals.dollar += Number(dollarValue) || 0;
        return totals;
      },
      { donors: members.length, riel: 0, dollar: 0 },
    );
  }, [activityId, branch, draftRows, savedRows]);

  const dollarEquivalent = summary.dollar + summary.riel / RIEL_PER_DOLLAR;

  return (
    <div className="flex gap-[50px] xl:grid-cols-2">
      <EventDonationSummaryCard
        value={`$${dollarEquivalent.toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })}`}
        growth=""
        note={`៛ ${summary.riel.toLocaleString()}`}
      />
      <DonorCard
        {...donationStats[1]}
        value={`${summary.donors} នាក់`}
        growth=""
        note=""
      />
    </div>
  );
}
