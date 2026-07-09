"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, Edit3, PlusCircle, Search } from "lucide-react";
import SponsorTypeSelect from "@/components/forms/sponsorTypeSelect";
import Pagination from "@/components/navigation/Pagination";
import SaveButton from "@/components/forms/save";
import AddAlert from "@/components/forms/addalert";

const rowsPerPage = 12;

const sponsorRows = [
  { id: 1, name: "ឌី រីយ៉ា", type: "បុគ្គល", phone: "097 678 8596", email: "diriya12@gmail.com", date: "០១ មិថុនា ២០២៦", amount: "$150", method: "Cash" },
  { id: 2, name: "ឌួង សុភ័ក្ត្រ", type: "បុគ្គល", phone: "088 500 6789", email: "sivheang@gmail.com", date: "០១ មិថុនា ២០២៦", amount: "$50", method: "ABA" },
  { id: 3, name: "ព្រីន សុភិតា", type: "បុគ្គល", phone: "088 345 6547", email: "chetra@gmail.com", date: "០១ មិថុនា ២០២៦", amount: "$150", method: "ACLEDA" },
  { id: 4, name: "សាខា ឧបត្ថម្ភ", type: "ស្ថាប័ន", phone: "097 447 5422", email: "thorn12@gmail.com", date: "០១ មិថុនា ២០២៦", amount: "$200", method: "Cash" },
  { id: 5, name: "សូលីសា គ្រុប", type: "ស្ថាប័ន", phone: "088 346 6573", email: "solisa@gmail.com", date: "០១ មិថុនា ២០២៦", amount: "$150", method: "Cash" },
  { id: 6, name: "ជា គីមឆេង", type: "បុគ្គល", phone: "097 764 3746", email: "ahching@gmail.com", date: "០២ មិថុនា ២០២៦", amount: "$80", method: "ABA" },
  { id: 7, name: "ហេង ចាន់", type: "បុគ្គល", phone: "088 456 3477", email: "chtha@gmail.com", date: "០២ មិថុនា ២០២៦", amount: "$90", method: "Cash" },
  { id: 8, name: "ទេព មករា", type: "បុគ្គល", phone: "097 347 3456", email: "makara@gmail.com", date: "០២ មិថុនា ២០២៦", amount: "$230", method: "Cash" },
  { id: 9, name: "លីដា សហគ្រាស", type: "ស្ថាប័ន", phone: "088 345 6374", email: "leak168@gmail.com", date: "០៤ មិថុនា ២០២៦", amount: "$280", method: "ABA" },
  { id: 10, name: "យឹម ស្រីពៅ", type: "បុគ្គល", phone: "097 346 3476", email: "sreypov@gmail.com", date: "០៤ មិថុនា ២០២៦", amount: "$100", method: "ABA" },
  { id: 11, name: "វី ឌីយ៉ា", type: "បុគ្គល", phone: "088 465 3489", email: "lydeth@gmail.com", date: "០៤ មិថុនា ២០២៦", amount: "$100", method: "Cash" },
  { id: 12, name: "លុន ម៉ាលីស", type: "បុគ្គល", phone: "097 345 6543", email: "malisch@gmail.com", date: "០៤ មិថុនា ២០២៦", amount: "$190", method: "ACLEDA" },
];

const headers = [
  "ល.រ",
  "ឈ្មោះអ្នកឧបត្ថម្ភ",
  "ប្រភេទឧបត្ថម្ភ",
  "លេខទូរស័ព្ទ",
  "អ៊ីមែល",
  "កាលបរិច្ឆេទ",
  "ចំនួនទឹកប្រាក់(ដុល្លារ)",
  "វិធីសាស្ត្រទូទាត់",
  "សកម្មភាព",
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
      <span className="flex h-full w-full items-center justify-between rounded-lg border border-border bg-white px-3 text-[12px] font-medium text-text-secondary shadow-sm transition hover:border-secondary">
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

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return sponsorRows.filter((row) => {
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
        <h1 className="text-base font-semibold text-secondary">ថវិកាឧបត្ថម្ភ</h1>

        <div className="flex w-full flex-nowrap items-center justify-end gap-4 overflow-x-auto pb-1">
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

          <button
            type="button"
            className="inline-flex h-[34px] shrink-0 items-center gap-2 rounded-lg bg-success px-4 text-xs font-medium text-white shadow-sm transition hover:bg-emerald-700"
          >
            <PlusCircle size={17} />
            បន្ថែមអ្នកឧបត្ថម្ភ
          </button>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {headers.map((header) => (
                <th key={header} className="px-4">
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
                <td className="px-4">{row.phone}</td>
                <td className="px-4">{row.email}</td>
                <td className="whitespace-nowrap px-4">{row.date}</td>
                <td className="px-4">{row.amount}</td>
                <td className="px-4">{row.method}</td>
                <td className="px-4">
                  <button
                    type="button"
                    className="inline-flex h-[22px] w-[22px] items-center justify-center text-[#E7A11B] transition hover:text-[#c98510]"
                    aria-label={`Edit sponsor ${row.id}`}
                  >
                    <Edit3 size={16} strokeWidth={2.2} />
                  </button>
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
        <SaveButton onClick={() => setShowDownloadAlert(true)} />
      </div>
    </section>
  );
}
