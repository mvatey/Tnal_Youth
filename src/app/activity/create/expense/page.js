"use client";

import {
  useMemo,
  useState,
} from "react";

import { useParams } from "next/navigation";

import Link from "next/link";
import {
  ChevronRight,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";

import activities from "@/data/activity.json";
import QuantityInput from "@/components/forms/QuantityInput";

const KHR_PER_USD = 4000;

function createEmptyRow(id) {
  return {
    id,
    name: "",
    category: "",

    // Quantity displays a real zero
    quantity: 0,

    // Empty strings allow placeholders to display
    unitPriceRiel: "",
    unitPriceDollar: "",

    // Calculated values
    totalRiel: 0,
    directDollarTotal: 0,
    totalDollar: 0,
  };
}

const initialRows = Array.from(
  { length: 3 },
  (_, index) => createEmptyRow(index + 1)
);

function parseNumber(value) {
  if (
    value === "" ||
    value === null ||
    value === undefined
  ) {
    return 0;
  }

  const number = Number(value);

  return Number.isFinite(number)
    ? number
    : 0;
}

function formatDollar(value) {
  return parseNumber(value).toFixed(2);
}

function sanitizeDollarInput(value) {
  let sanitizedValue = value.replace(
    /[^\d.]/g,
    ""
  );

  const parts = sanitizedValue.split(".");

  if (parts.length > 2) {
    sanitizedValue =
      parts[0] +
      "." +
      parts.slice(1).join("");
  }

  if (sanitizedValue.includes(".")) {
    const [whole, decimal = ""] =
      sanitizedValue.split(".");

    sanitizedValue = `${whole}.${decimal.slice(
      0,
      2
    )}`;
  }

  return sanitizedValue;
}

export default function ExpensePage() {
  const params = useParams();
  const id = params?.id;

  
  const activity = activities.find(
    (item) =>
      String(item.id) === String(id)
  );

  const [rows, setRows] =
    useState(initialRows);

  const updateRow = (
    rowId,
    key,
    value
  ) => {
    setRows((currentRows) =>
      currentRows.map((row) => {
        if (row.id !== rowId) {
          return row;
        }

        const updatedRow = {
          ...row,
          [key]: value,
        };

        const quantity = parseNumber(
          updatedRow.quantity
        );

        const unitPriceRiel = parseNumber(
          updatedRow.unitPriceRiel
        );

        const unitPriceDollar =
          parseNumber(
            updatedRow.unitPriceDollar
          );

        const totalRiel =
          quantity * unitPriceRiel;

        const directDollarTotal =
          quantity * unitPriceDollar;

        // Convert riel total into dollars
        const convertedRielDollar =
          totalRiel / KHR_PER_USD;

        // Combined row total in dollars
        const totalDollar =
          directDollarTotal +
          convertedRielDollar;

        return {
          ...updatedRow,
          totalRiel,
          directDollarTotal,
          totalDollar,
        };
      })
    );
  };

  const addRowBelow = (rowId) => {
    setRows((currentRows) => {
      const rowIndex =
        currentRows.findIndex(
          (row) => row.id === rowId
        );

      const newRow = createEmptyRow(
        `${Date.now()}-${Math.random()}`
      );

      if (rowIndex === -1) {
        return [...currentRows, newRow];
      }

      return [
        ...currentRows.slice(
          0,
          rowIndex + 1
        ),
        newRow,
        ...currentRows.slice(
          rowIndex + 1
        ),
      ];
    });
  };

  const deleteRow = (rowId) => {
    setRows((currentRows) => {
      const filteredRows =
        currentRows.filter(
          (row) => row.id !== rowId
        );

      // Keep at least one row
      return filteredRows.length > 0
        ? filteredRows
        : [createEmptyRow(Date.now())];
    });
  };

  const summary = useMemo(() => {
    const totals = rows.reduce(
      (result, row) => {
        result.riel += parseNumber(
          row.totalRiel
        );

        result.dollar += parseNumber(
          row.directDollarTotal
        );

        return result;
      },
      {
        riel: 0,
        dollar: 0,
      }
    );

    return {
      ...totals,

      // Direct dollars + converted riel
      allDollar:
        totals.dollar +
        totals.riel / KHR_PER_USD,
    };
  }, [rows]);

  const handleSave = () => {
    const expenseData = {
      activityId: id,
      exchangeRate: KHR_PER_USD,
      rows,
      summary,
    };

    console.log(
      "Saved expenses:",
      expenseData
    );

    localStorage.setItem(
      `activity-expenses-${id}`,
      JSON.stringify(expenseData)
    );

    alert(
      "បានរក្សាទុកចំណាយដោយជោគជ័យ"
    );
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <div className="flex items-center gap-1 text-sm text-text-secondary">
          <Link
            href="/activity"
            className="hover:text-primary"
          >
            កម្មវិធី
          </Link>

          <ChevronRight size={14} />

          <Link
            href={`/activity/${activity?.id}`}
            className="hover:text-primary"
          >
            ព័ត៌មានលម្អិត
          </Link>

          <ChevronRight size={14} />

          <span className="font-semibold text-primary">
            ចំណាយ
          </span>
        </div>

        <h1 className="mt-3 text-2xl font-bold text-secondary">
          ចំណាយ
        </h1>

        <p className="mt-1 text-sm text-text-secondary">
          {activity?.name}
        </p>
      </div>

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
          <table className="w-full min-w-[1250px] table-fixed border-collapse text-sm">
            <thead>
              <tr className="h-11 border-b border-border bg-bg-page-gray text-text-secondary">
                <th className="w-[5%] text-center">
                  ល.រ
                </th>

                <th className="w-[17%] text-center">
                  ឈ្មោះ
                </th>

                <th className="w-[17%] text-center">
                  ការពិពណ៌នា
                </th>

                <th className="w-[8%] text-center">
                  ចំនួន
                </th>

                <th className="w-[14%] text-center">
                  តម្លៃ/ឯកតា (រៀល)
                </th>

                <th className="w-[14%] text-center">
                  តម្លៃ/ឯកតា ($)
                </th>

                <th className="w-[13%] text-center">
                  តម្លៃសរុប ($)
                </th>

                <th className="w-[12%] text-center">
                  សកម្មភាព
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, index) => (
                  <tr
                    key={row.id}
                    className="h-14 border-b border-border last:border-b-0"
                  >
                    <td className="text-center text-text-secondary">
                      {index + 1}
                    </td>

                    {/* Name */}
                    <td className="px-1">
                      <input
                        type="text"
                        value={row.name}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "name",
                            event.target.value
                          )
                        }
                        placeholder="បញ្ចូលឈ្មោះ"
                        className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none transition placeholder:text-text-secondary focus:border-secondary"
                      />
                    </td>

                    {/* Description */}
                    <td className="px-1">
                      <input
                        type="text"
                        value={row.category}
                        onChange={(event) =>
                          updateRow(
                            row.id,
                            "category",
                            event.target.value
                          )
                        }
                        placeholder="បញ្ចូលការពិពណ៌នា"
                        className="h-10 w-full rounded-md border border-border px-3 text-sm outline-none transition placeholder:text-text-secondary focus:border-secondary"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="px-1">
                      <QuantityInput
                        value={row.quantity}
                        min={0}
                        onChange={(value) =>
                          updateRow(
                            row.id,
                            "quantity",
                            value
                          )
                        }
                      />
                    </td>

                    {/* Editable riel */}
                    <td className="px-1">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={
                            row.unitPriceRiel
                          }
                          onChange={(
                            event
                          ) =>
                            updateRow(
                              row.id,
                              "unitPriceRiel",
                              event.target
                                .value
                            )
                          }
                          placeholder="0"
                          className="
                            h-10
                            w-full
                            rounded-md
                            border
                            border-border
                            px-3
                            pr-9
                            text-sm
                            outline-none
                            transition
                            placeholder:text-text-secondary
                            focus:border-secondary
                            [appearance:textfield]
                            [&::-webkit-inner-spin-button]:appearance-none
                            [&::-webkit-outer-spin-button]:appearance-none
                          "
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                          ៛
                        </span>
                      </div>
                    </td>

                    {/* Editable dollar */}
                    <td className="px-1">
                      <div className="relative">
                        <input
                          type="text"
                          inputMode="decimal"
                          value={
                            row.unitPriceDollar
                          }
                          onChange={(
                            event
                          ) => {
                            const value =
                              sanitizeDollarInput(
                                event.target
                                  .value
                              );

                            updateRow(
                              row.id,
                              "unitPriceDollar",
                              value
                            );
                          }}
                          placeholder="0.00"
                          className="h-10 w-full rounded-md border border-border px-3 pr-9 text-sm outline-none transition placeholder:text-text-secondary focus:border-secondary"
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                          $
                        </span>
                      </div>
                    </td>

                    {/* Combined row total */}
                    <td className="px-1">
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={formatDollar(
                            row.totalDollar
                          )}
                          className="h-10 w-full cursor-default rounded-md border border-border bg-bg-page-gray px-3 pr-9 text-sm outline-none"
                        />

                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-text-secondary">
                          $
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="text-center">
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() =>
                            addRowBelow(
                              row.id
                            )
                          }
                          className="text-success transition hover:scale-110"
                          aria-label="បន្ថែមជួរ"
                        >
                          <PlusCircle
                            size={17}
                          />
                        </button>

                        <button
                          type="button"
                          onClick={() =>
                            deleteRow(
                              row.id
                            )
                          }
                          className="text-error transition hover:scale-110"
                          aria-label="លុបជួរ"
                        >
                          <Trash2
                            size={17}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="ml-auto mt-5 w-full max-w-[405px] rounded-lg border border-border p-5">
          <h3 className="mb-4 text-lg font-bold text-secondary">
            សរុបចំណាយ
          </h3>

          <div className="flex items-center justify-between text-sm text-text-secondary">
            <span>
              សរុបចំណាយ (រៀល)
            </span>

            <span className="font-semibold text-text-primary">
              {summary.riel.toLocaleString()}{" "}
              ៛
            </span>
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-text-secondary">
            <span>
              សរុបចំណាយ ($)
            </span>

            <span className="font-semibold text-text-primary">
              {formatDollar(
                summary.dollar
              )}{" "}
              $
            </span>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4 font-bold text-secondary">
            <span>
              សរុបទាំងអស់ ($)
            </span>

            <span>
              {formatDollar(
                summary.allDollar
              )}{" "}
              $
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-5 flex justify-between">
          <Link
            href={`/activity/${id}`}
            className="flex h-10 w-32 items-center justify-center rounded-lg border border-border bg-white text-sm font-semibold text-text-secondary"
          >
            បោះបង់
          </Link>

          <button
            type="button"
            onClick={handleSave}
            className="flex h-10 items-center gap-2 rounded-lg bg-secondary px-8 text-sm font-semibold text-white hover:bg-secondary-hover"
          >
            <RiDownloadCloud2Line
              size={18}
            />

            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}