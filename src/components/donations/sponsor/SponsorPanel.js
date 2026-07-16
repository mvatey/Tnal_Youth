"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Search } from "lucide-react";
import SponsorTypeSelect from "@/components/forms/sponsorTypeSelect";
import Pagination from "@/components/navigation/Pagination";
import SaveButton from "@/components/forms/save";
import AddAlert from "@/components/forms/addalert";
import SaveAlert from "@/components/forms/savealert";
import { sponsorRows as sponsorDataRows } from "@/data/sponsorData";

const rowsPerPage = 12;

const headers = [
  "ល.រ",
  "ឈ្មោះអ្នកឧបត្ថម្ភ",
  "ប្រភេទឧបត្ថម្ភ",
  "លេខទូរស័ព្ទ",
  "អ៊ីមែល",
  "កាលបរិច្ឆេទ",
  "ចំនួនទឹកប្រាក់(ដុល្លារ)",
  "វិធីសាស្ត្រទូទាត់",
];

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

export default function SponsorPanel() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [showSaveAlert, setShowSaveAlert] = useState(false);

  useEffect(() => {
    const shouldShowSaveAlert = window.localStorage.getItem(
      "tnal-youth:sponsor-save-alert",
    );

    if (shouldShowSaveAlert === "true") {
      window.localStorage.removeItem("tnal-youth:sponsor-save-alert");
      setShowSaveAlert(true);
    }
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sponsorDataRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.name.toLowerCase().includes(query) ||
        row.phone.includes(query) ||
        row.email.toLowerCase().includes(query);
      const matchesType = !selectedType || row.type === selectedType;

      return matchesSearch && matchesType;
    });
  }, [searchQuery, selectedType]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = filteredRows.slice(
    (safePage - 1) * rowsPerPage,
    safePage * rowsPerPage,
  );

  const updateFilter = (setter) => (value) => {
    setter(value);
    setCurrentPage(1);
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
        <h1 className="text-base font-semibold text-secondary">ថវិកាឧបត្ថម្ភ</h1>

        <div className="flex w-full flex-nowrap items-center justify-end gap-[5px] overflow-x-auto pb-1">
          <label className="block h-[34px] w-[260px] shrink-0">
            <span className="flex h-full items-center rounded-lg border border-border bg-white px-3 shadow-sm">
              <input
                className="w-full flex-1 bg-transparent pr-2 text-[12px] font-medium text-text-secondary outline-none placeholder:text-text-secondary"
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
            placeholder="ប្រភេទអ្នកឧបត្ថម្ភ"
            className="w-[180px]"
            size="compact"
          />

          <DateFilter
            value={selectedDate}
            onChange={updateFilter(setSelectedDate)}
          />

        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {headers.map((header) => (
                <th
                  key={header}
                  className={`px-4 ${header === "លេខទូរស័ព្ទ" ? "whitespace-nowrap" : ""}`}
                >
                  {header}
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
                <td className="px-4">{row.amount}</td>
                <td className="px-4">{row.method}</td>
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
        <SaveButton onClick={() => setShowDownloadAlert(true)} />
      </div>
    </section>
  );
}
