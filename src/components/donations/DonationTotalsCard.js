"use client";

/*
 * The small right-aligned summary card already used on the monthly-donation
 * and activity income/expense pages (riel line, dollar line, then a bold
 * combined-$ total under a divider). Pulled out here so the event-donation
 * "សមាជិក" (this branch's entries) and "សាខា" (every branch's totals) tabs
 * can both show the same card instead of two divergent copies.
 */
export default function DonationTotalsCard({
  title,
  riel,
  dollar,
  total,
  rielLabel = "សរុបចំនួន (រៀល)",
  dollarLabel = "សរុបចំនួន (ដុល្លារ)",
  totalLabel = "សរុបទាំងអស់ ($)",
  className = "",
}) {
  return (
    <div
      className={`ml-auto mt-5 w-full max-w-[360px] rounded-lg border border-border bg-bg-page-white p-4 ${className}`}
      aria-live="polite"
    >
      <h3 className="mb-3 font-bold text-secondary">{title}</h3>

      <div className="flex justify-between gap-5 text-sm text-text-secondary">
        <span>{rielLabel}</span>
        <span className="font-semibold text-text-primary">
          {(riel || 0).toLocaleString()} ៛
        </span>
      </div>

      <div className="mt-2 flex justify-between gap-5 text-sm text-text-secondary">
        <span>{dollarLabel}</span>
        <span className="font-semibold text-text-primary">
          {(dollar || 0).toFixed(2)} $
        </span>
      </div>

      <div className="mt-3 flex justify-between gap-5 border-t border-border pt-3 font-bold text-secondary">
        <span>{totalLabel}</span>
        <span>{(total || 0).toFixed(2)} $</span>
      </div>
    </div>
  );
}
