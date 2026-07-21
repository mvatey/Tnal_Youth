"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronRight, Download } from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";

import Pagination from "@/components/dashboard/Pagination";
import { ReceiptIcon } from "@/components/donations/monthlydonation/AddDonationTableRow";
import members from "@/data/members.json";
import activities from "@/data/activity.json";

const ROWS_PER_PAGE = 10;
const KHR_PER_USD = 4000;

function createInitialRows() {
  const getMemberIdentity = (member) =>
    String(
      member.email || member.phone || member.name || member.id
    )
      .trim()
      .toLowerCase();

  const uniqueMembers = Array.from(
    new Map(
      members.map((member) => [
        getMemberIdentity(member),
        member,
      ])
    ).values()
  );

  return uniqueMembers.map((member) => ({
    id: member.id,
    name: member.name || "",
    gender: member.gender || "",
    joinedDate:
      member.joinedDate ||
      member.joinedAt ||
      "",

    amountRiel: "0",
    amountDollar: "0.00",

    paymentMethod: "Cash",
    receipt: null,
  }));
}

function parseAmount(value) {
  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function sanitizeInteger(value) {
  return value.replace(/\D/g, "");
}

function sanitizeDecimal(value) {
  let cleanedValue = value.replace(
    /[^\d.]/g,
    ""
  );

  const parts = cleanedValue.split(".");

  if (parts.length > 2) {
    cleanedValue =
      parts[0] +
      "." +
      parts.slice(1).join("");
  }

  if (cleanedValue.includes(".")) {
    const [whole, decimal = ""] =
      cleanedValue.split(".");

    cleanedValue = `${whole}.${decimal.slice(
      0,
      2
    )}`;
  }

  return cleanedValue;
}

const getAmountFieldClass = (value) =>
  Number(value) > 0
    ? "border-[#65686b] bg-[#eef5f3]"
    : "border-[#65686b] bg-[#e5e7eb]";

function getTotalInDollars(row) {
  return (
    parseAmount(row.amountDollar) +
    parseAmount(row.amountRiel) / KHR_PER_USD
  );
}

export default function IncomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activityId =
    searchParams.get("activityId");

  const activity = useMemo(() => {
    if (!activityId) {
      return null;
    }

    return activities.find(
      (item) =>
        String(item.id) ===
        String(activityId)
    );
  }, [activityId]);

  const [rows, setRows] = useState(() =>
    createInitialRows()
  );

  const [currentPage, setCurrentPage] =
    useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(
      rows.length / ROWS_PER_PAGE
    )
  );

  const pagedRows = useMemo(() => {
    const startIndex =
      (currentPage - 1) *
      ROWS_PER_PAGE;

    return rows.slice(
      startIndex,
      startIndex + ROWS_PER_PAGE
    );
  }, [rows, currentPage]);

  const updateRow = (
    rowId,
    field,
    value
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId
          ? {
              ...row,
              [field]: value,
            }
          : row
      )
    );
  };

  const handleAmountFocus = (rowId, field, value) => {
    if (parseAmount(value) === 0) {
      updateRow(rowId, field, "");
    }
  };

  const handleAmountBlur = (rowId, field, fallback) => {
    setRows((currentRows) =>
      currentRows.map((row) =>
        row.id === rowId && row[field] === ""
          ? { ...row, [field]: fallback }
          : row
      )
    );
  };

  const handleReceiptChange = (
    rowId,
    event
  ) => {
    const file =
      event.target.files?.[0] || null;

    updateRow(rowId, "receipt", file);
  };

  const summary = useMemo(() => {
    return rows.reduce(
      (total, row) => ({
        riel:
          total.riel +
          parseAmount(row.amountRiel),

        dollar:
          total.dollar +
          parseAmount(
            row.amountDollar
          ),

        totalDollar:
          total.totalDollar +
          getTotalInDollars(row),
      }),
      {
        riel: 0,
        dollar: 0,
        totalDollar: 0,
      }
    );
  }, [rows]);

  const handleSave = () => {
    const incomeData = {
      activityId,
      activityName:
        activity?.name || "",
      rows: rows.map((row) => ({
        ...row,
        receipt: row.receipt
          ? {
              name: row.receipt.name,
              size: row.receipt.size,
              type: row.receipt.type,
            }
          : null,
      })),
      summary,
    };

    localStorage.setItem(
      `activity-income-${activityId}`,
      JSON.stringify(incomeData)
    );

    router.back();
  };

  const cancelHref = activityId
    ? `/activity/${activityId}`
    : "/activity/create";

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex flex-wrap items-center gap-1 text-sm text-text-secondary">
          <Link
            href="/activity"
            className="hover:text-primary"
          >
            កម្មវិធី
          </Link>

          <ChevronRight size={14} />

          {activityId && (
            <>
              <Link
                href={`/activity/${activityId}`}
                className="hover:text-primary"
              >
                ព័ត៌មានលម្អិត
              </Link>

              <ChevronRight size={14} />
            </>
          )}

          <span className="font-semibold text-primary">
            ចំណូល
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">
          ចំណូល
        </h1>

        {activity?.name && (
          <p className="mt-1 text-sm text-text-secondary">
            {activity.name}
          </p>
        )}
      </div>

      {/* Income table */}
      <div className="rounded-xl border border-border bg-white p-5">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:bg-secondary-hover"
          >
            <RiDownloadCloud2Line
              size={18}
            />

            ទាញយករបាយការណ៍
          </button>
        </div>

        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-[1050px] table-fixed border-collapse text-[12px] text-text-secondary">
            <thead>
              <tr className="h-11 border-b border-border bg-bg-page-gray font-medium text-text-secondary">
                <th className="w-[5%] text-center">
                  ល.រ
                </th>

                <th className="w-[15%] text-center">
                  សមាជិក
                </th>

                <th className="w-[8%] text-center">
                  ភេទ
                </th>

                <th className="w-[12%] text-center">
                  ថ្ងៃខែឆ្នាំចូលរួម
                </th>

                <th className="w-[17%] text-center">
                  ចំនួនវិភាគទាន (រៀល)
                </th>

                <th className="w-[17%] text-center">
                  ចំនួនវិភាគទាន ($)
                </th>

                <th className="w-[18%] text-center">
                  វិធីសាស្ត្រទូទាត់ប្រាក់
                </th>

                <th className="w-[8%] text-center">
                  វិក្កយបត្រ
                </th>
              </tr>
            </thead>

            <tbody>
              {pagedRows.map(
                (row, index) => {
                  const realIndex =
                    (currentPage - 1) *
                      ROWS_PER_PAGE +
                    index;

                  return (
                    <tr
                      key={row.id}
                      className="h-[42px] border-b border-[#e5eaf0] bg-[#fbfcfe] text-[12px] text-text-secondary transition-colors hover:bg-[#f6f8fb]"
                    >
                      <td className="text-center text-text-secondary">
                        {realIndex + 1}
                      </td>

                      <td className="max-w-0 overflow-hidden px-2">
                        <p className="truncate font-medium text-text-primary" title={row.name}>
                          {row.name}
                        </p>
                      </td>

                      <td className="text-center text-text-secondary">
                        {row.gender}
                      </td>

                      <td className="text-center text-text-secondary">
                        {row.joinedDate}
                      </td>

                      {/* Independent riel input */}
                      <td className="px-3">
                        <div className={`mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border px-2 ${getAmountFieldClass(row.amountRiel)}`}>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={
                              row.amountRiel
                            }
                            onChange={(
                              event
                            ) => {
                              const value =
                                sanitizeInteger(
                                  event
                                    .target
                                    .value
                                );

                              updateRow(
                                row.id,
                                "amountRiel",
                                value
                              );
                            }}
                            onFocus={() =>
                              handleAmountFocus(
                                row.id,
                                "amountRiel",
                                row.amountRiel
                              )
                            }
                            onBlur={() =>
                              handleAmountBlur(
                                row.id,
                                "amountRiel",
                                "0"
                              )
                            }
                            placeholder={row.amountRiel ? "" : "0"}
                            className="w-full bg-transparent text-[12px] text-text-secondary outline-none placeholder:text-text-secondary"
                          />

                          <span className="text-[12px] text-text-secondary">
                            ៛
                          </span>
                        </div>
                      </td>

                      {/* Independent dollar input */}
                      <td className="px-3">
                        <div className={`mx-auto flex h-7 w-[112px] items-center gap-1 rounded-md border px-2 ${getAmountFieldClass(row.amountDollar)}`}>
                          <input
                            type="text"
                            inputMode="decimal"
                            value={
                              row.amountDollar
                            }
                            onChange={(
                              event
                            ) => {
                              const value =
                                sanitizeDecimal(
                                  event
                                    .target
                                    .value
                                );

                              updateRow(
                                row.id,
                                "amountDollar",
                                value
                              );
                            }}
                            onFocus={() =>
                              handleAmountFocus(
                                row.id,
                                "amountDollar",
                                row.amountDollar
                              )
                            }
                            onBlur={() =>
                              handleAmountBlur(
                                row.id,
                                "amountDollar",
                                "0.00"
                              )
                            }
                            placeholder={row.amountDollar ? "" : "0.00"}
                            className="w-full bg-transparent text-[12px] text-text-secondary outline-none placeholder:text-text-secondary"
                          />

                          <span className="text-[12px] text-text-secondary">
                            $
                          </span>
                        </div>
                      </td>

                      <td className="px-3">
                        <select
                          value={
                            row.paymentMethod
                          }
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              row.id,
                              "paymentMethod",
                              event
                                .target
                                .value
                            )
                          }
                          className="mx-auto block h-7 w-[82px] rounded-md border border-slate-400 bg-white px-2 text-[12px] text-text-secondary outline-none focus:border-[#4B2E91]"
                        >
                          <option value="Cash">
                            Cash
                          </option>

                          <option value="ABA">
                            ABA
                          </option>

                          <option value="ACLEDA">
                            ACLEDA
                          </option>

                          <option value="Wing">
                            Wing
                          </option>
                        </select>
                      </td>

                      <td className="px-3 text-center">
                        <label
                          className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-md text-[#4B2E91] hover:bg-[#4B2E91]/10"
                          aria-label="receipt"
                        >
                          <ReceiptIcon size={18} />

                          <input
                            type="file"
                            accept="image/*,.pdf"
                            className="hidden"
                            onChange={(
                              event
                            ) =>
                              handleReceiptChange(
                                row.id,
                                event
                              )
                            }
                          />

                        </label>
                      </td>
                    </tr>
                  );
                }
              )}

              {pagedRows.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="py-10 text-center text-sm text-text-secondary"
                  >
                    មិនមានទិន្នន័យសមាជិកទេ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={
              setCurrentPage
            }
          />
        </div>

        {/* Summary */}
        <div
          className="ml-auto mt-5 w-full max-w-[360px] rounded-lg border border-border p-4"
          aria-live="polite"
        >
          <h3 className="mb-3 font-bold text-secondary">
            សរុបចំណូល
          </h3>

          <div className="flex justify-between gap-5 text-sm text-text-secondary">
            <span>
              សរុបចំណូល (រៀល)
            </span>

            <span className="font-semibold text-text-primary">
              {summary.riel.toLocaleString()}
              {" "}៛
            </span>
          </div>

          <div className="mt-2 flex justify-between gap-5 text-sm text-text-secondary">
            <span>
              សរុបចំណូល ($)
            </span>

            <span className="font-semibold text-text-primary">
              {summary.dollar.toFixed(2)}
              {" "}$
            </span>
          </div>

          <div className="mt-3 flex justify-between gap-5 border-t border-border pt-3 font-bold text-secondary">
            <span>
              សរុបទាំងអស់ ($)
            </span>

            <span>
              {summary.totalDollar.toFixed(2)}
              {" "}$
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Link
          href={cancelHref}
          className="flex h-[34px] w-[91px] items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary transition hover:bg-gray-50"
        >
          បោះបង់
        </Link>

        <button
          type="button"
          onClick={handleSave}
          className="flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-white transition hover:bg-secondary-hover"
        >
          <Download size={16} />

          រក្សាទុក
        </button>
      </div>
    </div>
  );
}
