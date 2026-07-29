"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  List,
  Trash2,
} from "lucide-react";

import Pagination from "@/components/navigation/Pagination";
import PrimaryActionButton from "@/components/ui/actions/PrimaryActionButton";

const EVENT_DONATION_HEADERS = [
  "ល.រ",
  "កម្មវិធី",
  "សាខា",
  "កាលបរិច្ឆេទចាប់ផ្តើម",
  "កាលបរិច្ឆេទបញ្ចប់",
  "ចំនួនថ្ងៃ",
  "ចំនួនទឹកប្រាក់(រៀល)",
  "ចំនួនទឹកប្រាក់(ដុល្លារ)",
  "សកម្មភាព",
];

function formatKhr(value) {
  return `៛ ${Number(value || 0).toLocaleString("en-US")}`;
}

function formatUsd(value) {
  return `$ ${Number(value || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDays(value) {
  const days = Number(value) || 0;
  return `${days} ថ្ងៃ`;
}

export default function EventDonationTable({
  rows,
  currentPage,
  totalPages,
  onPageChange,
  onDelete,
  onDownload,
  moneySort,
  onMoneySort,
}) {
  const pathname = usePathname();

  const detailPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/eventdonation/detail"
    : "/donation/eventdonation/detail";

  function renderSortIcon(field) {
    if (moneySort?.field !== field) {
      return <ChevronsUpDown size={14} />;
    }

    return moneySort.direction === "asc" ? (
      <ArrowUp size={14} />
    ) : (
      <ArrowDown size={14} />
    );
  }

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {EVENT_DONATION_HEADERS.map((header, index) => {
                const isKhrColumn = index === 6;
                const isUsdColumn = index === 7;
                const sortField = isKhrColumn
                  ? "amountKhr"
                  : isUsdColumn
                    ? "amountUsd"
                    : null;

                return (
                  <th key={header} className="px-4">
                    {sortField ? (
                      <button
                        type="button"
                        onClick={() => onMoneySort(sortField)}
                        className="mx-auto inline-flex items-center justify-center gap-1.5 font-medium transition hover:text-primary"
                      >
                        {header}
                        {renderSortIcon(sortField)}
                      </button>
                    ) : (
                      header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {rows.map((row) => (
              <tr
                key={row.id}
                className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
              >
                <td className="px-4 font-normal">
                  {row.rowNumber}
                </td>

                <td className="px-4">
                  {row.eventName || "-"}
                </td>

                <td className="px-4">
                  {row.branch || "-"}
                </td>

                <td className="whitespace-nowrap px-4">
                  {row.startDate || "-"}
                </td>

                <td className="whitespace-nowrap px-4">
                  {row.endDate || "-"}
                </td>

                <td className="px-4">
                  {formatDays(row.days)}
                </td>

                <td className="whitespace-nowrap px-4">
                  {formatKhr(row.amountKhr)}
                </td>

                <td className="whitespace-nowrap px-4">
                  {formatUsd(row.amountUsd)}
                </td>

                <td className="px-4">
                  <div className="flex items-center justify-center gap-[5px]">
                    <Link
                      href={{
                        pathname: detailPath,
                        query: {
                          id: row.activityId ?? row.id,
                          branch: row.branch,
                          event: row.eventType,
                        },
                      }}
                      className="inline-flex h-[18px] min-w-[52px] items-center justify-center gap-[3px] rounded-[8px] bg-[#5636A3] px-2 text-[10px] font-normal leading-none text-white transition hover:bg-[#4b2f91]"
                    >
                      <List size={11} strokeWidth={2.2} />
                      លម្អិត
                    </Link>

                    <button
                      type="button"
                      className="inline-flex h-[18px] w-[18px] items-center justify-center text-[#E92824] transition hover:text-red-700"
                      aria-label={`លុបទិន្នន័យកម្មវិធី ${row.eventName || row.id}`}
                      onClick={() => onDelete(row.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td
                  colSpan={EVENT_DONATION_HEADERS.length}
                  className="px-4 py-8 text-center text-xs font-medium text-text-secondary"
                >
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />

      <div className="mt-10 flex justify-end">
        <PrimaryActionButton onClick={onDownload} />
      </div>
    </>
  );
}