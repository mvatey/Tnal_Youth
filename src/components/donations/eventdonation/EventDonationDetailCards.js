"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import donationData from "@/data/donation/donationData.json";
import eventDonationData from "@/data/donation/eventDonationData.json";

const SAVED_EVENT_DONATION_ROWS_KEY = "tnal-youth:saved-event-donation-rows";
const DONATION_ROWS_CHANGE_EVENT = "tnal-youth:donation-rows-change";
const RIEL_PER_DOLLAR = 4000;
const { addDonationRows, donationStats } = donationData;
const { eventTypes } = eventDonationData;

const getSavedRowKey = (row) => [row.branch, row.eventType, row.id].join("|");

export default function EventDonationDetailCards() {
  const searchParams = useSearchParams();
  const branch = searchParams.get("branch");
  const eventType = searchParams.get("event");
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
    const members = addDonationRows
      .map((row, index) => ({
        ...row,
        index,
        eventType: eventTypes[index % eventTypes.length],
      }))
      .filter(
        (row) => row.branch === branch && row.eventType === eventType,
      );

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
  }, [branch, draftRows, eventType, savedRows]);

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
