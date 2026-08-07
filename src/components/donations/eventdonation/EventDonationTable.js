"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowDown, ArrowUp, ChevronsUpDown, List, Trash2 } from "lucide-react";
import Pagination from "@/components/navigation/Pagination";
import SaveButton from "@/components/forms/save";
import tableHeaders from "@/data/donation/tableHeaders.json";

const { eventDonationHeaders: headers } = tableHeaders;

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

  return (
    <>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[980px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-white text-center text-xs font-medium text-text-secondary">
              {headers.map((header, index) => (
                <th key={header} className="px-4">
                  {index === 6 || index === 7 ? (
                    <button
                      type="button"
                      onClick={() => onMoneySort(index === 6 ? "rielAmount" : "dollarAmount")}
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
            {rows.map((row) => (
              <tr
                key={row.id}
                className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
              >
                <td className="px-4 font-normal">{row.rowNumber}</td>
                <td className="px-4">{row.eventName}</td>
                <td className="px-4">{row.branch}</td>
                <td className="whitespace-nowrap px-4">{row.startDate}</td>
                <td className="whitespace-nowrap px-4">{row.endDate}</td>
                <td className="px-4">{row.days}</td>
                <td className="px-4">{row.rielAmount}</td>
                <td className="px-4">{row.dollarAmount}</td>
                <td className="px-4">
                  <div className="flex items-center justify-center gap-[5px]">
                    <Link
                      href={{
                        pathname: detailPath,
                        query: {
                          id: row.id,
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
                      aria-label={`Delete event donation row ${row.id}`}
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
                  colSpan={headers.length}
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
        <SaveButton onClick={onDownload} />
      </div>
    </>
  );
}
