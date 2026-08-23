"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";

import Link from "next/link";
import {
  ChevronRight,
  PlusCircle,
  Trash2,
} from "lucide-react";
import { RiDownloadCloud2Line } from "react-icons/ri";
import { HiSaveAs } from "react-icons/hi";

import QuantityInput from "@/components/forms/QuantityInput";
import { downloadTableAsExcel } from "@/utils/downloadExcel";

const KHR_PER_USD = 4000;

const EXPENSE_EXPORT_COLUMNS = [
  { header: "ល.រ", accessor: "no" },
  { header: "ឈ្មោះ", accessor: "name" },
  { header: "ការពិពណ៌នា", accessor: "category" },
  { header: "ចំនួន", accessor: "quantity" },
  { header: "តម្លៃ/ឯកតា (រៀល)", accessor: "unitPriceRiel" },
  { header: "តម្លៃ/ឯកតា ($)", accessor: "unitPriceDollar" },
  { header: "តម្លៃសរុប ($)", exportValue: (row) => formatDollar(row.totalDollar) },
];

function createEmptyRow(id) {
  return {
    id,
    name: "",
    category: "",

    // Start at one so entered prices immediately contribute to the total.
    quantity: 1,

    unitPriceRiel: "0",
    unitPriceDollar: "0.00",

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

function sanitizeInteger(value) {
  return value.replace(/\D/g, "");
}

const getAmountFieldClass = (value) =>
  parseNumber(value) > 0
    ? "border-border bg-success-bg"
    : "border-border bg-bg-page-gray";

async function fetchJson(path, options = {}) {
  const response = await fetch(path, { cache: "no-store", ...options });
  const body = await response.json().catch(() => null);
  if (!response.ok) throw new Error(body?.message || `Request failed (${response.status})`);
  return body;
}

function todayIsoDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function ExpensePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("activityId");

  const [activity, setActivity] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const [rows, setRows] =
    useState(initialRows);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetchJson(`/api/backend/activities/${encodeURIComponent(id)}`)
      .then((record) => {
        if (!cancelled) setActivity({ ...record, name: record.titleKm || record.titleEn || "" });
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Unable to load activity.");
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

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

  const handleAmountFocus = (rowId, field, value) => {
    if (parseNumber(value) === 0) {
      updateRow(rowId, field, "");
    }
  };

  const handleAmountBlur = (rowId, field, fallback) => {
    const row = rows.find((item) => item.id === rowId);

    if (row?.[field] === "") {
      updateRow(rowId, field, fallback);
    }
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

  const handleDownloadReport = () => {
    const activeRows = rows
      .filter((row) => row.name.trim())
      .map((row, index) => ({ ...row, no: index + 1 }));

    downloadTableAsExcel({
      data: activeRows,
      columns: EXPENSE_EXPORT_COLUMNS,
      fileName: `expense-${activity?.name || id || "report"}`,
    });
  };

  const handleSave = async () => {
    const activeRows = rows.filter((row) => row.name.trim());
    if (!id || activeRows.length === 0) {
      setError("Please enter at least one expense name.");
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      await Promise.all(
        activeRows.map((row) =>
          fetchJson(`/api/backend/activities/${encodeURIComponent(id)}/expenses`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              name: row.name.trim(),
              description: row.category.trim() || null,
              quantity: parseNumber(row.quantity),
              amount_khr: parseNumber(row.totalRiel),
              amount_usd: parseNumber(row.directDollarTotal),
              spent_on: todayIsoDate(),
              receipt_file_id: null,
            }),
          }),
        ),
      );
      router.push(`/activity/${id}`);
    } catch (saveError) {
      setError(saveError.message || "Unable to save activity expenses.");
    } finally {
      setIsSaving(false);
    }
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

      {error && (
        <div className="rounded-lg border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-border bg-bg-page-white p-5">
        <div className="mb-4 flex justify-end">
          <button
            type="button"
            onClick={handleDownloadReport}
            className="flex h-[34px] items-center gap-2 rounded-lg bg-secondary px-5 text-sm font-semibold text-white transition hover:bg-secondary-hover"
          >
            <RiDownloadCloud2Line
              size={18}
            />

            ទាញយករបាយការណ៍
          </button>
        </div>

        <div className="overflow-hidden rounded-lg border border-border">
          <table className="w-full table-fixed border-collapse text-[12px] text-text-secondary">
            <thead>
              <tr className="h-11 border-b border-border bg-bg-page-gray font-medium text-text-secondary">
                <th className="w-[5%] text-center">
                  ល.រ
                </th>

                <th className="w-[18%] text-center">
                  ឈ្មោះ
                </th>

                <th className="w-[18%] text-center">
                  ការពិពណ៌នា
                </th>

                <th className="w-[8%] text-center">
                  ចំនួន
                </th>

                <th className="w-[15%] text-center">
                  តម្លៃ/ឯកតា (រៀល)
                </th>

                <th className="w-[15%] text-center">
                  តម្លៃ/ឯកតា ($)
                </th>

                <th className="w-[13%] text-center">
                  តម្លៃសរុប ($)
                </th>

                <th className="w-[8%] text-center">
                  សកម្មភាព
                </th>
              </tr>
            </thead>

            <tbody>
              {rows.map(
                (row, index) => (
                  <tr
                    key={row.id}
                    className="h-[42px] border-b border-border bg-bg-page-white text-[12px] text-text-secondary transition-colors last:border-b-0 hover:bg-bg-page-gray"
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
                        placeholder={row.name ? "" : "បញ្ចូលឈ្មោះ"}
                        className="h-10 w-full rounded-md border border-border px-3 text-[12px] text-text-secondary outline-none transition placeholder:text-text-secondary focus:border-secondary"
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
                        placeholder={row.category ? "" : "បញ្ចូលការពិពណ៌នា"}
                        className="h-10 w-full rounded-md border border-border px-3 text-[12px] text-text-secondary outline-none transition placeholder:text-text-secondary focus:border-secondary"
                      />
                    </td>

                    {/* Quantity */}
                    <td className="px-1">
                      <QuantityInput
                        value={row.quantity}
                        min={1}
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
                    <td className="px-3">
                      <div className={`mx-auto flex h-7 w-full max-w-[112px] items-center gap-1 rounded-md border px-2 ${getAmountFieldClass(row.unitPriceRiel)}`}>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={
                            row.unitPriceRiel
                          }
                          onChange={(event) =>
                            updateRow(
                              row.id,
                              "unitPriceRiel",
                              sanitizeInteger(event.target.value)
                            )
                          }
                          onFocus={() =>
                            handleAmountFocus(row.id, "unitPriceRiel", row.unitPriceRiel)
                          }
                          onBlur={() =>
                            handleAmountBlur(row.id, "unitPriceRiel", "0")
                          }
                          placeholder={row.unitPriceRiel ? "" : "0"}
                          className="w-full bg-transparent text-[12px] text-text-secondary outline-none placeholder:text-text-secondary"
                        />

                        <span className="text-[12px] text-text-secondary">
                          ៛
                        </span>
                      </div>
                    </td>

                    {/* Editable dollar */}
                    <td className="px-3">
                      <div className={`mx-auto flex h-7 w-full max-w-[112px] items-center gap-1 rounded-md border px-2 ${getAmountFieldClass(row.unitPriceDollar)}`}>
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
                          onFocus={() =>
                            handleAmountFocus(row.id, "unitPriceDollar", row.unitPriceDollar)
                          }
                          onBlur={() =>
                            handleAmountBlur(row.id, "unitPriceDollar", "0.00")
                          }
                          placeholder={row.unitPriceDollar ? "" : "0.00"}
                          className="w-full bg-transparent text-[12px] text-text-secondary outline-none placeholder:text-text-secondary"
                        />

                        <span className="text-[12px] text-text-secondary">
                          $
                        </span>
                      </div>
                    </td>

                    {/* Combined row total */}
                    <td className="px-3">
                      <div className="mx-auto flex h-7 w-full max-w-[112px] items-center gap-1 rounded-md border border-border bg-bg-page-gray px-2 text-[12px] text-text-secondary">
                        <span className="min-w-0 flex-1 text-left">
                          {formatDollar(row.totalDollar)}
                        </span>

                        <span>
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
            href={id ? `/activity/create?edit=${id}` : "/activity/create"}
            className="flex h-[34px] w-[91px] items-center justify-center rounded-lg border border-border bg-bg-page-white text-sm font-semibold text-text-secondary"
          >
            បោះបង់
          </Link>

          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex h-[34px] w-[196px] items-center justify-center gap-2 rounded-lg bg-secondary text-sm font-semibold text-white hover:bg-secondary-hover"
          >
            <HiSaveAs size={16} />

            រក្សាទុក
          </button>
        </div>
      </div>
    </div>
  );
}
