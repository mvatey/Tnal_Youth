"use client";

import { useEffect, useMemo, useState } from "react";
import EventDonationFilters from "./EventDonationFilters";
import EventDonationTable from "./EventDonationTable";
import AddSuccessAlert from "@/components/ui/feedback/AddSuccessAlert";
import { downloadCsv } from "@/utils/downloadCsv";
import activities from "@/data/activityRecords.json";
import SaveSuccessAlert from "@/components/ui/feedback/SaveSuccessAlert";
const EVENT_DONATION_SAVE_ALERT_KEY = "tnal-youth:event-donation-save-alert";
const rowsPerPage = 12;

function calculateDurationDays(startDate, endDate) {
  if (!startDate || !endDate) return 0;

  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);

  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime())
  ) {
    return 0;
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;

  return (
    Math.floor(
      (end.getTime() - start.getTime()) /
        millisecondsPerDay
    ) + 1
  );
}
function createEventDonationRows() {
  return activities.map((activity, index) => {
    const startDate =
      activity.startDate ||
      activity.dateValue ||
      "";

    const endDate =
      activity.endDate ||
      activity.startDate ||
      activity.dateValue ||
      "";

    const amountKhr =
      Number(activity.amountKhr) ||
      400000 + (index % 5) * 50000;

    const amountUsd =
      Number(activity.amountUsd) ||
      100 + (index % 4) * 100;

    return {
      id: activity.id,
      activityId: activity.id,

      eventType: activity.type,
      eventName:
        activity.name ||
        activity.title ||
        "មិនមានឈ្មោះកម្មវិធី",

      branch:
        activity.branchName ||
        activity.branch ||
        "-",

      startDate,
      endDate,

      startDateValue: startDate,
      endDateValue: endDate,

      days: calculateDurationDays(
        startDate,
        endDate
      ),

      amountKhr,
      amountUsd,
    };
  });
}

function rowMatchesDateRange(row, startDate, endDate) {
  if (!startDate && !endDate) return true;

  const selectedStart = startDate || "0000-01-01";
  const selectedEnd = endDate || "9999-12-31";

  return row.startDateValue <= selectedEnd && row.endDateValue >= selectedStart;
}

export default function EventDonationPanel({
  selectedBranch: controlledSelectedBranch,
  onBranchChange,
  onRowsChange,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletedIds, setDeletedIds] = useState([]);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const selectedBranch = controlledSelectedBranch ?? internalSelectedBranch;
  const setSelectedBranch = onBranchChange ?? setInternalSelectedBranch;
const branches = useMemo(() => {
  return [
    ...new Set(
      activities
        .map(
          (activity) =>
            activity.branchName ||
            activity.branch
        )
        .filter(Boolean)
    ),
  ];
}, []);
  const eventDonationRows = useMemo(createEventDonationRows, []);
  const hasSelectedBranch = selectedBranch !== "all";

  const filteredRows = useMemo(() => {
    if (!hasSelectedBranch) return [];

    return eventDonationRows.filter((row) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesBranch = row.branch === selectedBranch;
const matchesSearch =
  !query ||
  String(row.eventName || "")
    .toLowerCase()
    .includes(query) ||
  String(row.branch || "")
    .toLowerCase()
    .includes(query);
      const matchesDateRange = rowMatchesDateRange(row, startDate, endDate);
      const isDeleted = deletedIds.includes(row.id);

      return matchesBranch && matchesSearch && matchesDateRange && !isDeleted;
    });
  }, [
    deletedIds,
    endDate,
    eventDonationRows,
    hasSelectedBranch,
    searchQuery,
    selectedBranch,
    startDate,
  ]);

 const sortedRows = useMemo(() => {
  if (!moneySort) return filteredRows;

  return [...filteredRows].sort((a, b) => {
    const firstValue =
      Number(a[moneySort.field]) || 0;

    const secondValue =
      Number(b[moneySort.field]) || 0;

    const difference =
      firstValue - secondValue;

    return moneySort.direction === "asc"
      ? difference
      : -difference;
  });
}, [filteredRows, moneySort]);

  useEffect(() => {
    onRowsChange?.(sortedRows);
  }, [onRowsChange, sortedRows]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows
    .slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    .map((row, index) => ({
      ...row,
      rowNumber: (safePage - 1) * rowsPerPage + index + 1,
    }));

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const updateStartDate = (value) => {
    setStartDate(value);
    if (endDate && value && endDate < value) {
      setEndDate(value);
    }
    setCurrentPage(1);
  };

  const handleDownload = () => {
    if (downloadCsv(sortedRows, "event-donations.csv")) {
      setShowDownloadAlert(true);
    }
  };

  useEffect(() => {
    const shouldShowSaveAlert = window.localStorage.getItem(
      EVENT_DONATION_SAVE_ALERT_KEY,
    );

    if (shouldShowSaveAlert === "true") {
      window.localStorage.removeItem(EVENT_DONATION_SAVE_ALERT_KEY);
      setShowSaveAlert(true);
    }
  }, []);

  useEffect(() => {
    if (!showDownloadAlert && !showSaveAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowDownloadAlert(false);
      setShowSaveAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert, showSaveAlert]);

  return (
    <section className="min-h-[650px] rounded-md border border-border bg-[#fbfcfe] px-7 py-4 shadow-sm">
      {showDownloadAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <AddSuccessAlert />
        </div>
      )}

      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <SaveSuccessAlert message="អបអរសាទរ ! វិភាគទានកម្មវិធីត្រូវបានរក្សាទុកដោយជោគជ័យ" />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-base font-semibold text-secondary">
          វិភាគទានក្នុងកម្មវិធី
        </h1>

        <EventDonationFilters
          searchQuery={searchQuery}
          onSearchChange={updateFilter(setSearchQuery)}
          selectedBranch={selectedBranch}
          onBranchChange={updateFilter(setSelectedBranch)}
          startDate={startDate}
          onStartDateChange={updateStartDate}
          endDate={endDate}
          onEndDateChange={updateFilter(setEndDate)}
          branches={branches}
        />
      </div>

      {hasSelectedBranch ? (
        <EventDonationTable
          rows={pagedRows}
          currentPage={safePage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          onDelete={(rowId) => setDeletedIds((current) => [...current, rowId])}
          onDownload={handleDownload}
          moneySort={moneySort}
          onMoneySort={(field) => {
            setMoneySort((current) => ({
              field,
              direction: current?.field === field && current.direction === "asc" ? "desc" : "asc",
            }));
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="min-h-[560px] rounded-sm bg-[#fbfcfe]" />
      )}
    </section>
  );
}
