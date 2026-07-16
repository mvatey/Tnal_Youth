"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import DonationDetailButton from "@/components/donations/DonationDetailButton";
import Pagination from "@/components/navigation/Pagination";
import SaveButton from "@/components/forms/save";

const memberHeaders = [
  "ល.រ",
  "សមាជិក",
  "សាខា",
  "ក្នុងកម្មវិធី",
  "កាលបរិច្ឆេទចាប់ផ្តើម",
  "កាលបរិច្ឆេទបញ្ចប់",
  "ចំនួនថ្ងៃ",
  "ចំនួនទឹកប្រាក់(ដុល្លារ)",
  "វិធីសាស្ត្រទូទាត់",
  "សកម្មភាព",
];

const branchHeaders = [
  "ល.រ",
  "សាខា",
  "ក្នុងកម្មវិធី",
  "កាលបរិច្ឆេទចាប់ផ្តើម",
  "កាលបរិច្ឆេទបញ្ចប់",
  "ចំនួនថ្ងៃ",
  "ចំនួនទឹកប្រាក់សរុប(ដុល្លារ)",
  "សកម្មភាព",
];

export default function EventDonationTable({
  rows,
  viewMode = "member",
  currentPage,
  totalPages,
  onPageChange,
  onDownload,
}) {
  const pathname = usePathname();
  const detailPath = pathname?.startsWith("/admin/donation")
    ? "/admin/donation/eventdonation/detail"
    : "/donation/eventdonation/detail";
  const headers = viewMode === "member" ? memberHeaders : branchHeaders;

  return (
    <>
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
            {rows.map((row) => (
              <tr
                key={row.id}
                className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
              >
                {viewMode === "member" ? (
                  <>
                    <td className="px-4 font-normal">{row.rowNumber}</td>
                    <td className="px-4 text-left">
                      <div className="flex items-center gap-3">
                        <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full bg-primary-light">
                          {row.avatar ? (
                            <Image
                              src={row.avatar}
                              alt={row.memberName}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <span className="flex h-full w-full items-center justify-center text-[11px] font-semibold text-primary">
                              {row.memberName?.charAt(0)}
                            </span>
                          )}
                        </div>
                        <span className="min-w-0 truncate font-medium">{row.memberName}</span>
                      </div>
                    </td>
                    <td className="px-4">{row.branch}</td>
                    <td className="px-4">{row.eventName}</td>
                    <td className="whitespace-nowrap px-4">{row.startDate}</td>
                    <td className="whitespace-nowrap px-4">{row.endDate}</td>
                    <td className="px-4">{row.days}</td>
                    <td className="px-4">{row.dollarAmount}</td>
                    <td className="px-4">{row.paymentMethod}</td>
                  </>
                ) : (
                  <>
                    <td className="px-4 font-normal">{row.rowNumber}</td>
                    <td className="px-4">{row.branch}</td>
                    <td className="px-4">{row.eventName}</td>
                    <td className="whitespace-nowrap px-4">{row.startDate}</td>
                    <td className="whitespace-nowrap px-4">{row.endDate}</td>
                    <td className="px-4">{row.days}</td>
                    <td className="px-4">{row.dollarAmount}</td>
                  </>
                )}
                <td className="px-4">
                  <div className="flex items-center justify-center gap-[5px]">
                    <DonationDetailButton
                      href={{
                        pathname: detailPath,
                        query: {
                          id: row.id,
                          branch: row.branch,
                          event: row.eventType,
                        },
                      }}
                    />
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
