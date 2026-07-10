"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ChevronRight,
  FileUp,
} from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";

import Pagination from "@/components/dashboard/Pagination";
import members from "@/data/members.json";
import activities from "@/data/activity.json";

const ROWS_PER_PAGE = 10;

function createInitialRows() {
  return members.map((member) => ({
    id: member.id,
    name: member.name || "",
    gender: member.gender || "",
    joinedDate:
      member.joinedDate ||
      member.joinedAt ||
      "",

    amountRiel: "",
    amountDollar: "",

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

export default function IncomePage() {
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
      }),
      {
        riel: 0,
        dollar: 0,
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

    alert(
      "បានរក្សាទុកចំណូលដោយជោគជ័យ"
    );
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
          <table className="w-full min-w-[1100px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="h-11 border-b border-border bg-bg-page-gray text-text-secondary">
                <th className="w-[5%] text-center">
                  ល.រ
                </th>

                <th className="w-[22%] text-center">
                  សមាជិក
                </th>

                <th className="w-[9%] text-center">
                  ភេទ
                </th>

                <th className="w-[14%] text-center">
                  ថ្ងៃខែឆ្នាំចូលរួម
                </th>

                <th className="w-[15%] text-center">
                  ចំនួនវិភាគទាន (រៀល)
                </th>

                <th className="w-[15%] text-center">
                  ចំនួនវិភាគទាន ($)
                </th>

                <th className="w-[13%] text-center">
                  វិធីបង់ប្រាក់
                </th>

                <th className="w-[7%] text-center">
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
                      className="h-14 border-b border-border"
                    >
                      <td className="text-center text-text-secondary">
                        {realIndex + 1}
                      </td>

                      <td className="px-2">
                        <p className="font-semibold text-text-primary">
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
                      <td className="px-1">
                        <div className="relative">
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
                            placeholder="0"
                            className="h-10 w-full rounded-md border border-border px-3 pr-9 text-sm outline-none transition focus:border-secondary"
                          />

                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                            ៛
                          </span>
                        </div>
                      </td>

                      {/* Independent dollar input */}
                      <td className="px-1">
                        <div className="relative">
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
                            placeholder="0.00"
                            className="h-10 w-full rounded-md border border-border px-3 pr-9 text-sm outline-none transition focus:border-secondary"
                          />

                          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                            $
                          </span>
                        </div>
                      </td>

                      <td className="px-1">
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
                          className="h-10 w-full rounded-md border border-border bg-white px-2 text-sm outline-none transition focus:border-secondary"
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

                      <td className="text-center">
                        <label className="inline-flex cursor-pointer flex-col items-center gap-1 text-secondary transition hover:text-secondary-hover">
                          <FileUp size={17} />

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

                          {row.receipt && (
                            <span className="max-w-[70px] truncate text-[10px] text-success">
                              {
                                row
                                  .receipt
                                  .name
                              }
                            </span>
                          )}
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
        <div className="ml-auto mt-5 w-full max-w-[360px] rounded-lg border border-border p-4">
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
              {summary.dollar.toFixed(2)}
              {" "}$
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <Link
          href={cancelHref}
          className="flex h-10 w-32 items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary transition hover:bg-gray-50"
        >
          បោះបង់
        </Link>

        <button
          type="button"
          onClick={handleSave}
          className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-8 text-sm font-semibold text-white transition hover:bg-secondary-hover"
        >
          <RiDownloadCloud2Line
            size={18}
          />

          រក្សាទុក
        </button>
      </div>
    </div>
  );
}