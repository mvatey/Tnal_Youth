"use client";

import { useEffect, useMemo, useState } from "react";
import EventDonationFilters from "./EventDonationFilters";
import EventDonationTable from "./EventDonationTable";
import AddAlert from "@/components/forms/addalert";
import donationData from "@/data/donation/donationData.json";
import eventDonationData from "@/data/donation/eventDonationData.json";

const rowsPerPage = 12;
const { addDonationRows, donationRows } = donationData;
const { eventNames, eventSchedule } = eventDonationData;
const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

function createEventDonationRows() {
  return addDonationRows.map((member, index) => {
    const schedule = eventSchedule[index % eventSchedule.length];
    const realAmount = Number(member.realAmount) || 400000 + (index % 5) * 50000;
    const dollarAmount = Number(member.dollarAmount) || 100 + (index % 4) * 100;

    return {
      id: member.id,
      eventType: schedule.type,
      eventName: eventNames[schedule.type],
      branch: member.branch,
      startDate: schedule.startDate,
      endDate: schedule.endDate,
      startDateValue: schedule.startDateValue,
      endDateValue: schedule.endDateValue,
      days: schedule.days,
      rielAmount: `៛ ${realAmount.toLocaleString()}`,
      dollarAmount: `$ ${dollarAmount}`,
    };
  });
}

function rowMatchesDateRange(row, startDate, endDate) {
  if (!startDate && !endDate) return true;

  const selectedStart = startDate || "0000-01-01";
  const selectedEnd = endDate || "9999-12-31";

  return row.startDateValue <= selectedEnd && row.endDateValue >= selectedStart;
}

export default function EventDonationPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [deletedIds, setDeletedIds] = useState([]);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);

  const branches = [...new Set(donationRows.map((row) => row.branch))];
  const eventDonationRows = useMemo(createEventDonationRows, []);
  const hasSelectedBranch = selectedBranch !== "all";

  const filteredRows = useMemo(() => {
    if (!hasSelectedBranch) return [];

    return eventDonationRows.filter((row) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesBranch = row.branch === selectedBranch;
      const matchesSearch =
        !query ||
        row.eventName.toLowerCase().includes(query) ||
        row.branch.toLowerCase().includes(query);
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
      const difference = parseMoney(a[moneySort.field]) - parseMoney(b[moneySort.field]);
      return moneySort.direction === "asc" ? difference : -difference;
    });
  }, [filteredRows, moneySort]);

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

  useEffect(() => {
    if (!showDownloadAlert) return undefined;

    const timeoutId = window.setTimeout(() => {
      setShowDownloadAlert(false);
    }, 3000);

    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert]);

  return (
    <section className="min-h-[650px] rounded-md border border-border bg-[#fbfcfe] px-7 py-4 shadow-sm">
      {showDownloadAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <AddAlert />
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
          onDownload={() => setShowDownloadAlert(true)}
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
