"use client";

import { useEffect, useMemo, useState } from "react";
import EventDonationFilters from "./EventDonationFilters";
import EventDonationTable from "./EventDonationTable";
import AddAlert from "@/components/forms/addalert";
import { addDonationRows } from "@/data/donationData";

const rowsPerPage = 12;
const eventNames = {
  meeting: "កម្មវិធីប្រជុំ",
  charity: "កម្មវិធីសប្បុរសធម៌",
  training: "កម្មវិធីបណ្តុះបណ្តាល",
};

const eventSchedule = [
  {
    type: "meeting",
    startDate: "០១ មិថុនា ២០២៦",
    endDate: "០៣ មិថុនា ២០២៦",
    startDateValue: "2026-06-01",
    endDateValue: "2026-06-03",
    days: "០៣ ថ្ងៃ",
  },
  {
    type: "charity",
    startDate: "០៥ មិថុនា ២០២៦",
    endDate: "០៨ មិថុនា ២០២៦",
    startDateValue: "2026-06-05",
    endDateValue: "2026-06-08",
    days: "០៤ ថ្ងៃ",
  },
  {
    type: "training",
    startDate: "១០ មិថុនា ២០២៦",
    endDate: "១២ មិថុនា ២០២៦",
    startDateValue: "2026-06-10",
    endDateValue: "2026-06-12",
    days: "០៣ ថ្ងៃ",
  },
  {
    type: "meeting",
    startDate: "១៣ មិថុនា ២០២៦",
    endDate: "១៤ មិថុនា ២០២៦",
    startDateValue: "2026-06-13",
    endDateValue: "2026-06-14",
    days: "០២ ថ្ងៃ",
  },
];

function createEventDonationRows() {
  return addDonationRows.map((member, index) => {
    const schedule = eventSchedule[index % eventSchedule.length];
    const realAmount = Number(member.realAmount) || 400000 + (index % 5) * 50000;
    const dollarAmount = Number(member.dollarAmount) || 100 + (index % 4) * 100;

    return {
      id: member.id,
      memberName: member.name,
      avatar: member.avatar,
      gender: member.gender,
      role: "យុវជន",
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
      paymentMethod: member.paymentMethod || "Cash",
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
  const [viewMode, setViewMode] = useState("member");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBranch, setSelectedBranch] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);

  const eventDonationRows = useMemo(createEventDonationRows, []);
  const branches = useMemo(
    () => [...new Set(eventDonationRows.map((row) => row.branch))],
    [eventDonationRows],
  );

  const filteredRows = useMemo(() => {
    return eventDonationRows.filter((row) => {
      const query = searchQuery.trim().toLowerCase();
      const matchesBranch = selectedBranch === "all" || row.branch === selectedBranch;
      const matchesSearch =
        !query ||
        row.memberName.toLowerCase().includes(query) ||
        row.eventName.toLowerCase().includes(query) ||
        row.branch.toLowerCase().includes(query);
      const matchesDateRange = rowMatchesDateRange(row, startDate, endDate);

      return matchesBranch && matchesSearch && matchesDateRange;
    });
  }, [endDate, eventDonationRows, searchQuery, selectedBranch, startDate]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows
    .slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage)
    .map((row, index) => ({
      ...row,
      rowNumber: (safePage - 1) * rowsPerPage + index + 1,
    }));

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const updateViewMode = (value) => {
    setViewMode(value);
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
          viewMode={viewMode}
          onViewModeChange={updateViewMode}
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

      <EventDonationTable
        rows={pagedRows}
        viewMode={viewMode}
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        onDownload={() => setShowDownloadAlert(true)}
      />
    </section>
  );
}
