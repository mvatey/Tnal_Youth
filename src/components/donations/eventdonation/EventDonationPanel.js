"use client";

import { useEffect, useMemo, useState } from "react";
import EventDonationFilters from "./EventDonationFilters";
import EventDonationTable from "./EventDonationTable";
import AddAlert from "@/components/forms/addalert";
import { downloadCsv } from "@/utils/downloadCsv";

const rowsPerPage = 12;
const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

export default function EventDonationPanel({ selectedBranch: controlledSelectedBranch, onBranchChange }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [error, setError] = useState("");

  const selectedBranch = controlledSelectedBranch ?? internalSelectedBranch;
  const setSelectedBranch = onBranchChange ?? setInternalSelectedBranch;

  useEffect(() => {
    let cancelled = false;
    async function loadRows() {
      setError("");
      try {
        const [response, branchResponse] = await Promise.all([
          fetch("/api/backend/donations?page=0&size=100", { cache: "no-store" }),
          fetch("/api/lookups/branches", { cache: "no-store" }),
        ]);
        const [body, branchBody] = await Promise.all([
          response.json().catch(() => null),
          branchResponse.json().catch(() => null),
        ]);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load event donations.");
        if (!branchResponse.ok || branchBody?.success === false) throw new Error(branchBody?.message || "Unable to load branches.");
        const page = body?.data ?? body;
        if (!cancelled) {
          setRows(groupEventDonationRows(Array.isArray(page?.items) ? page.items : []));
          const values = branchBody?.data ?? branchBody;
          setBranches((Array.isArray(values) ? values : [])
            .map((branch) => ({
              value: String(branch.value ?? branch.id ?? ""),
              label:
                branch.labelKm ??
                branch.nameKm ??
                branch.labelEn ??
                branch.nameEn ??
                branch.label ??
                branch.name ??
                branch.code ??
                "",
            }))
            .filter((branch) => branch.value && branch.label));
        }
      } catch (loadError) {
        if (!cancelled) {
          setRows([]);
          setError(loadError.message || "Unable to load event donations.");
        }
      }
    }
    loadRows();
    return () => { cancelled = true; };
  }, []);

  const hasSelectedBranch = selectedBranch !== "all";
  const filteredRows = useMemo(() => rows.filter((row) => {
    if (!hasSelectedBranch || String(row.branchId) !== String(selectedBranch)) return false;
    const query = searchQuery.trim().toLowerCase();
    if (query && !row.eventName.toLowerCase().includes(query) && !row.branch.toLowerCase().includes(query)) return false;
    if (startDate && row.startDateValue < startDate) return false;
    if (endDate && row.startDateValue > endDate) return false;
    return true;
  }), [endDate, hasSelectedBranch, rows, searchQuery, selectedBranch, startDate]);

  const sortedRows = useMemo(() => {
    if (!moneySort) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const difference = parseMoney(a[moneySort.field]) - parseMoney(b[moneySort.field]);
      return moneySort.direction === "asc" ? difference : -difference;
    });
  }, [filteredRows, moneySort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage).map((row, index) => ({
    ...row,
    rowNumber: (safePage - 1) * rowsPerPage + index + 1,
  }));
  const updateFilter = (setter) => (value) => { setter(value); setCurrentPage(1); };
  const handleDownload = () => {
    if (downloadCsv(sortedRows, "event-donations.csv")) setShowDownloadAlert(true);
  };

  useEffect(() => {
    if (!showDownloadAlert) return undefined;
    const timeoutId = window.setTimeout(() => setShowDownloadAlert(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert]);

  return (
    <section className="min-h-[650px] rounded-md border border-border bg-[#fbfcfe] px-7 py-4 shadow-sm">
      {showDownloadAlert && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10"><AddAlert /></div>}
      {error ? <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-base font-semibold text-secondary">វិភាគទានក្នុងកម្មវិធី</h1>
        <EventDonationFilters searchQuery={searchQuery} onSearchChange={updateFilter(setSearchQuery)} selectedBranch={selectedBranch} onBranchChange={updateFilter(setSelectedBranch)} startDate={startDate} onStartDateChange={updateFilter(setStartDate)} endDate={endDate} onEndDateChange={updateFilter(setEndDate)} branches={branches} />
      </div>
      {hasSelectedBranch ? (
        <EventDonationTable rows={pagedRows} currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} onDelete={() => setError("Deletion is disabled here. Open the donation record before deleting it.")} onDownload={handleDownload} moneySort={moneySort} onMoneySort={(field) => {
          setMoneySort((current) => ({ field, direction: current?.field === field && current.direction === "asc" ? "desc" : "asc" }));
          setCurrentPage(1);
        }} />
      ) : <div className="min-h-[560px] rounded-sm bg-[#fbfcfe]" />}
    </section>
  );
}

function mapEventRow(row) {
  const paidDate = row.paidAt ? row.paidAt.slice(0, 10) : "";
  return {
    id: row.id,
    branchId: row.branchId,
    activityId: row.activityId,
    eventType: row.typeLabelKm || row.typeLabelEn || row.typeCode || "-",
    eventName: row.activityTitle || "-",
    branch: row.branchName || "-",
    startDate: paidDate || "-",
    endDate: paidDate || "-",
    startDateValue: paidDate,
    endDateValue: paidDate,
    days: 1,
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
  };
}

function groupEventDonationRows(donations) {
  const groups = new Map();

  donations
    .filter((donation) => donation.activityId)
    .forEach((donation) => {
      const row = mapEventRow(donation);
      const key = `${row.activityId}:${row.branchId ?? ""}`;
      const current = groups.get(key);
      const amountKhr = Number(donation.amountKhr || 0);
      const amountUsd = Number(donation.amountUsd || 0);

      if (!current) {
        groups.set(key, {
          ...row,
          amountKhr,
          amountUsd,
        });
        return;
      }

      current.amountKhr += amountKhr;
      current.amountUsd += amountUsd;

      if (row.startDateValue && (!current.startDateValue || row.startDateValue < current.startDateValue)) {
        current.startDateValue = row.startDateValue;
        current.startDate = row.startDate;
      }
      if (row.endDateValue && (!current.endDateValue || row.endDateValue > current.endDateValue)) {
        current.endDateValue = row.endDateValue;
        current.endDate = row.endDate;
      }
    });

  return Array.from(groups.values()).map(({ amountKhr, amountUsd, ...row }) => {
    const start = row.startDateValue ? new Date(`${row.startDateValue}T00:00:00`) : null;
    const end = row.endDateValue ? new Date(`${row.endDateValue}T00:00:00`) : null;
    const days = start && end
      ? Math.max(1, Math.round((end - start) / 86400000) + 1)
      : 1;

    return {
      ...row,
      days,
      rielAmount: amountKhr.toLocaleString("en-US"),
      dollarAmount: amountUsd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  });
}
