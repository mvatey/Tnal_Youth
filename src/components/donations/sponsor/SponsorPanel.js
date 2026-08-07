"use client";

import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, CalendarDays, ChevronsUpDown, FileText, PencilLineIcon, PencilRulerIcon, PenSquareIcon, PlusCircle, Search, SquarePen, SquarePenIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import SponsorTypeSelect from "@/components/forms/sponsorTypeSelect";
import Pagination from "@/components/navigation/Pagination";
import SaveButton from "@/components/forms/save";
import AddAlert from "@/components/forms/addalert";
import SaveAlert from "@/components/forms/savealert";
import sponsorData from "@/data/donation/sponsorData.json";
import donationData from "@/data/donation/donationData.json";
import tableHeaders from "@/data/donation/tableHeaders.json";
import { MdEditSquare } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { BsPencilSquare } from "react-icons/bs";
import { PiPencilSlash } from "react-icons/pi";
import { VscEditSparkle } from "react-icons/vsc";
import { downloadCsv } from "@/utils/downloadCsv";

const { sponsorRows: sponsorDataRows } = sponsorData;
const { donationRows } = donationData;
const { sponsorHeaders: headers } = tableHeaders;
const rowsPerPage = 12;
const SPONSOR_CREATED_ROWS_KEY = "tnal-youth:sponsor-donation-created-rows";
const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

function SponsorReceiptPreview({ receipt }) {
  if (!receipt) {
    return null;
  }

  return (
    <span
      className="inline-flex h-8 w-11 items-center justify-center overflow-hidden rounded-md border border-[#4B2E91]/20 bg-white text-[#4B2E91] shadow-sm"
      title={receipt.name || "Receipt"}
    >
      {receipt.type?.startsWith("image/") ? (
        <img
          src={receipt.dataUrl}
          alt={receipt.name || "Receipt"}
          className="h-full w-full object-cover"
        />
      ) : (
        <FileText size={17} strokeWidth={2.2} />
      )}
    </span>
  );
}

function DateFilter({ value, onChange }) {
  return (
    <label className="relative block h-[34px] w-[154px] shrink-0 cursor-pointer">
      <input
        type="date"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
        aria-label="កាលបរិច្ឆេទ"
       
      />
      <span className="flex h-full w-full items-center justify-between rounded-lg border border-border bg-white px-3 text-[16px] font-Semibold text-text-secondary shadow-sm transition hover:border-secondary">
        <span className="truncate">{value || "កាលបរិច្ឆេទ"}</span>
        <CalendarDays size={16} strokeWidth={2.2} />
      </span>
    </label>
  );
}

export default function SponsorPanel({
  selectedBranch = "all",
  showAddButton = true,
  typeOptions,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const routePrefix = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/sponsor"
    : "/donation/sponsor";
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);
  const [createdRows, setCreatedRows] = useState([]);

  useEffect(() => {
    const savedRowsValue = window.localStorage.getItem(
      SPONSOR_CREATED_ROWS_KEY,
    );
    const shouldShowSaveAlert = window.localStorage.getItem(
      "tnal-youth:sponsor-save-alert",
    );

    try {
      const savedRows = savedRowsValue ? JSON.parse(savedRowsValue) : [];
      setCreatedRows(
        Array.isArray(savedRows)
          ? savedRows.filter((row) => row.name?.trim())
          : [],
      );
    } catch {
      setCreatedRows([]);
    }

    if (shouldShowSaveAlert === "true") {
      window.localStorage.removeItem("tnal-youth:sponsor-save-alert");
      setShowSaveAlert(true);
    }

  }, []);

  const allRows = useMemo(
    () => [...createdRows, ...sponsorDataRows],
    [createdRows],
  );

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return allRows.filter((row, index) => {
      const rowBranch =
        row.branch || donationRows[index % donationRows.length]?.branch;
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.phone.includes(query) ||
        row.email.toLowerCase().includes(query);
      const matchesType = !selectedType || row.type === selectedType;
      const matchesDate = !selectedDate || row.dateValue === selectedDate;
      const matchesBranch =
        selectedBranch === "all" || rowBranch === selectedBranch;

      return matchesSearch && matchesType && matchesDate && matchesBranch;
    });
  }, [allRows, searchQuery, selectedBranch, selectedDate, selectedType]);

  const sortedRows = useMemo(() => {
    if (!moneySort) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const difference = parseMoney(a[moneySort.field]) - parseMoney(b[moneySort.field]);
      return moneySort.direction === "asc" ? difference : -difference;
    });
  }, [filteredRows, moneySort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
  };

  const handleDownload = () => {
    if (downloadCsv(sortedRows, "sponsor-donations.csv")) {
      setShowDownloadAlert(true);
    }
  };

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
          <AddAlert message="ការទាញយកថវិការឧបត្ថម្ភជោគជ័យ!" />
        </div>
      )}

      {showSaveAlert && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10">
          <SaveAlert message="អបអរសាទរ ! ថវិការឧបត្ថម្ភត្រូវបានរក្សាទុកដោយជោគជ័យ" />
        </div>
      )}

      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-base font-semibold text-secondary">
          ថវិកាឧបត្ថម្ភ
          {selectedBranch !== "all" && ` — ${selectedBranch}`}
        </h1>

        <div className="flex w-full flex-nowrap items-center justify-end gap-[5px] overflow-x-auto pb-1">
          <label className="block h-[34px] w-[260px] shrink-0">
            <span className="flex h-full items-center rounded-lg border border-border bg-white px-3 shadow-sm">
              <input
                className=" flex-1 bg-transparent pr-2 text-[12px] font-medium text-text-secondary outline-none placeholder:text-text-secondary focus:placeholder-transparent"
                value={searchQuery}
                onChange={(event) => updateFilter(setSearchQuery)(event.target.value)}
                placeholder="ស្វែងរកតាមឈ្មោះអ្នកឧបត្ថម្ភ ..."
              />
              <Search size={16} className="text-text-secondary" />
            </span>
          </label>

          <SponsorTypeSelect
            value={selectedType}
            onChange={updateFilter(setSelectedType)}
            options={typeOptions}
            placeholder="ប្រភេទអ្នកឧបត្ថម្ភ"
            className="w-[180px]"
            size="compact"
          />

          <DateFilter
            value={selectedDate}
            onChange={updateFilter(setSelectedDate)}
          />

          {showAddButton && (
            <button
              type="button"
              onClick={() => router.push(`${routePrefix}/add`)}
              className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
            >
              <PlusCircle size={17} />
              បន្ថែមការឧបត្ថម្ភ
            </button>
          )}
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {headers.map((header, index) => (
                <th
                  key={header}
                  className={`px-4 ${header === "លេខទូរស័ព្ទ" ? "whitespace-nowrap" : ""}`}
                >
                  {index === 6 || index === 7 ? (
                    <button
                      type="button"
                      onClick={() => {
                        const field = index === 6 ? "rielAmount" : "dollarAmount";
                        setMoneySort((current) => ({
                          field,
                          direction: current?.field === field && current.direction === "asc" ? "desc" : "asc",
                        }));
                        setCurrentPage(1);
                      }}
                      className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium transition hover:text-primary"
                    >
                      {header}
                      {moneySort?.field === (index === 6 ? "rielAmount" : "dollarAmount") && moneySort.direction === "asc" ? (
                        <ArrowUp size={14} />
                      ) : moneySort?.field === (index === 6 ? "rielAmount" : "dollarAmount") && moneySort.direction === "desc" ? (
                        <ArrowDown size={14} />
                      ) : (
                        <ChevronsUpDown size={14} />
                      )}
                    </button>
                  ) : header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {pagedRows.map((row, index) => (
              <tr
                key={row.id}
                className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
              >
                <td className="px-4">{(safePage - 1) * rowsPerPage + index + 1}</td>
                <td className="px-4">{row.name}</td>
                <td className="px-4">{row.type}</td>
                <td className="whitespace-nowrap px-4">{row.phone}</td>
                <td className="px-4">{row.email}</td>
                <td className="whitespace-nowrap px-4">{row.date}</td>
                <td className="px-4">
                  {row.rielAmount || "0"}
                </td>
                <td className="px-4">
                  {row.dollarAmount || "0"}
                </td>
                <td className="px-4">{row.method}</td>
                <td className="px-4">
                  <div className="inline-flex items-center justify-center gap-2">
                    <button
                      type="button"
                      onClick={() => router.push(`${routePrefix}/edit?id=${row.id}`)}
                      className="inline-flex h-[20px] w-[24px] items-center justify-center rounded-[8px] text-[#D4AF37] transition hover:text-[#b88f1f]"
                      aria-label={`Edit sponsor ${row.id}`}
                    >
                      <BsPencilSquare size={16}  />
                    </button>
                    <SponsorReceiptPreview receipt={row.receipt} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={safePage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <div className="mt-10 flex justify-end">
        <SaveButton onClick={handleDownload} />
      </div>
    </section>
  );
}
