"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import DonationFilterSelect from "../monthlydonation/DonationFilterSelect";
import DonationSearchInput from "@/components/forms/searchBar";
import Table from "@/components/tables/table";
import SaveAlert from "@/components/forms/savealert";
import donationData from "@/data/donation/donationData.json";
import eventDonationData from "@/data/donation/eventDonationData.json";

const SAVED_EVENT_DONATION_ROWS_KEY = "tnal-youth:saved-event-donation-rows";
const { addDonationRows } = donationData;
const { eventNames, eventTypes } = eventDonationData;

const getSavedRowKey = (row) =>
  [row.branch, row.eventType, row.id].join("|");

function buildEventMembers() {
  return addDonationRows.map((row, index) => {
    const eventType = eventTypes[index % eventTypes.length];

    return {
      ...row,
      eventType,
      eventName: eventNames[eventType],
      realAmount: row.realAmount || "0",
      dollarAmount: row.dollarAmount || "0.00",
      paymentMethod: row.paymentMethod || "Cash",
    };
  });
}

export default function EventDonationDetailForm({ initialQuery = {} }) {
  const router = useRouter();
  const pathname = usePathname();
  const listPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/eventdonation"
    : "/donation/eventdonation";
  const eventMembers = useMemo(buildEventMembers, []);
  const queryValues = useMemo(() => {
    const eventFromQuery = initialQuery.event;

    return {
      branch: initialQuery.branch || null,
      event: eventFromQuery ? eventNames[eventFromQuery] || eventFromQuery : null,
      id: initialQuery.id || null,
    };
  }, [initialQuery.branch, initialQuery.event, initialQuery.id]);
  const selectedId = queryValues.id;
  const currentRow = eventMembers.find(
    (row) => String(row.id) === String(selectedId),
  );
  const initialBranch = queryValues.branch || currentRow?.branch || "all";
  const initialEvent = queryValues.event || currentRow?.eventName || "all";

  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [selectedEvent, setSelectedEvent] = useState(initialEvent);
  const [searchQuery, setSearchQuery] = useState("");
  const [savedMessage, setSavedMessage] = useState("");
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [savedRows, setSavedRows] = useState({});

  const branches = useMemo(
    () => [...new Set(eventMembers.map((row) => row.branch))],
    [eventMembers],
  );

  const members = useMemo(
    () =>
      eventMembers
        .filter(
          (row) =>
            selectedEvent === "all" || row.eventName === selectedEvent,
        )
        .map((row) => ({
          ...row,
          ...savedRows[getSavedRowKey(row)],
        })),
    [eventMembers, savedRows, selectedEvent],
  );

  useEffect(() => {
    const savedValue = window.localStorage.getItem(
      SAVED_EVENT_DONATION_ROWS_KEY,
    );

    if (!savedValue) return;

    try {
      setSavedRows(JSON.parse(savedValue));
    } catch {
      setSavedRows({});
    }
  }, []);

  useEffect(() => {
    setSelectedBranch((currentBranch) =>
      currentBranch === initialBranch ? currentBranch : initialBranch,
    );
    setSelectedEvent((currentEvent) =>
      currentEvent === initialEvent ? currentEvent : initialEvent,
    );
  }, [initialBranch, initialEvent]);

  useEffect(() => {
    if (!showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showSaveAlert]);

  const handleSave = (rows) => {
    const completed = rows.filter(
      (row) => Number(row.realAmount) > 0 || Number(row.dollarAmount) > 0,
    );
    const nextRows = { ...savedRows };

    rows.forEach((row) => {
      nextRows[getSavedRowKey(row)] = {
        realAmount: row.realAmount ?? "",
        dollarAmount: row.dollarAmount ?? "",
        paymentMethod: row.paymentMethod || "Cash",
      };
    });

    window.localStorage.setItem(
      SAVED_EVENT_DONATION_ROWS_KEY,
      JSON.stringify(nextRows),
    );
    setSavedRows(nextRows);

    setSavedMessage(
      completed.length > 0
        ? `បានរក្សាទុកវិភាគទាន ${completed.length} នាក់`
        : "សូមបញ្ចូលចំនួនទឹកប្រាក់យ៉ាងហោចណាស់ម្នាក់",
    );
    router.push(listPath);
  };

  const handleReset = (rows) => {
    setSavedRows((currentRows) => {
      const nextRows = { ...currentRows };

      rows.forEach((row) => {
        nextRows[getSavedRowKey(row)] = {
          realAmount: "0",
          dollarAmount: "0",
          paymentMethod: row.paymentMethod || "Cash",
        };
      });

      window.localStorage.setItem(
        SAVED_EVENT_DONATION_ROWS_KEY,
        JSON.stringify(nextRows),
      );

      return nextRows;
    });
  };

  const handleReceiptSave = () => {
    setSavedMessage("បានរក្សាទុកវិក្កយបត្រដោយជោគជ័យ");
    setShowSaveAlert(true);
  };

  return (
    <>
      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <SaveAlert message="អបអរសាទរ ! វិភាគទានកម្មវិធីត្រូវបានបន្ថែមដោយជោគជ័យ" />
        </div>
      )}

      <section className="min-h-[545px] rounded-md border border-border bg-[#fbfbfd] p-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <h1 className="text-base font-semibold text-secondary">
            ការកត់ត្រាវិភាគទានក្នុងកម្មវិធី
          </h1>
          {savedMessage && (
            <p className="text-sm font-medium text-success" role="status">
              {savedMessage}
            </p>
          )}
        </div>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap items-end gap-6">
            <DonationFilterSelect
              label="សាខា"
              value={selectedBranch}
              onChange={setSelectedBranch}
              options={branches}
              allLabel="ជ្រើសរើសសាខា"
              className="w-[158px]"
              required
            />
            <DonationFilterSelect
              label="កម្មវិធី"
              value={selectedEvent}
              onChange={setSelectedEvent}
              options={Object.values(eventNames)}
              allLabel="ជ្រើសរើសកម្មវិធី"
              className="w-[158px]"
              required
            />
          </div>

          <DonationSearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            showLabel={false}
          />
        </div>

        {selectedBranch !== "all" && (
          <Table
            members={members}
            selectedBranch={selectedBranch}
            searchQuery={searchQuery}
            onReset={handleReset}
            onCancel={() => router.push(listPath)}
            onSave={handleSave}
            onReceiptSave={handleReceiptSave}
          />
        )}
      </section>
    </>
  );
}
