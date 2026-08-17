"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import DonationTotalsCard from "@/components/donations/DonationTotalsCard";

// Short polling instead of a push channel — this app has no WebSocket/SSE
// infrastructure, so "real-time" here means the branches tab quietly
// refetches on an interval while it's open. 8s keeps it feeling live
// without hammering the backend; only this tab polls (see the unmount
// cleanup below), so it stops the moment the staff member switches back
// to "សមាជិក" or away from this activity.
const POLL_INTERVAL_MS = 8000;

async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}

function formatUsd(value) {
  const amount = Number(value || 0);
  return `$ ${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

const ROLE_LABELS = {
  ORGANIZER: "សាខារៀបចំ",
  INVITED: "សាខាដែលបានអញ្ជើញ",
};

/*
 * Cross-branch donation totals for ONE activity — every branch eligible to
 * record a donation here (the organizer plus every branch with an
 * ACCEPTED co-hosting invitation), each with its running total. Backed by
 * GET /api/donations/activity/{activityId}/branch-totals, which is a plain
 * SUM(...)/GROUP BY over the existing donations table (no new table — see
 * DonationServiceImpl#activityBranchTotals on the backend). Deliberately
 * aggregate-only: it never lists another branch's individual donations
 * (donor, member, payment method, ...), only the summed total and count —
 * a branch's own itemised entries stay on the "សមាជិក" tab, visible only
 * to that branch's own staff.
 */
export default function EventDonationBranchTotals({ activityId }) {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);
  const pollTimerRef = useRef(null);

  useEffect(() => {
    if (!activityId) return undefined;
    let cancelled = false;

    async function load(isBackgroundRefresh) {
      if (!isBackgroundRefresh) setLoading(true);
      try {
        const data = await fetchJson(
          `/api/backend/donations/activity/${encodeURIComponent(activityId)}/branch-totals`,
        );
        if (cancelled) return;
        setRows(Array.isArray(data) ? data : []);
        setError("");
        setLastUpdatedAt(new Date());
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load branch totals.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load(false);
    pollTimerRef.current = window.setInterval(() => load(true), POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      if (pollTimerRef.current) window.clearInterval(pollTimerRef.current);
    };
  }, [activityId]);

  // Riel/dollar sub-totals sum the RAW per-branch components (amountKhr /
  // amountUsd); the combined "សរុបទាំងអស់ ($)" total instead sums each
  // branch's totalAmountUsd, which the backend already normalised using
  // each donation's OWN stored exchange rate — more accurate than
  // re-deriving it here off a single flat rate.
  const grandTotals = useMemo(
    () =>
      rows.reduce(
        (acc, row) => ({
          riel: acc.riel + Number(row.amountKhr || 0),
          dollar: acc.dollar + Number(row.amountUsd || 0),
          total: acc.total + Number(row.totalAmountUsd || 0),
        }),
        { riel: 0, dollar: 0, total: 0 },
      ),
    [rows],
  );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-text-secondary">
          {lastUpdatedAt
            ? `ធ្វើបច្ចុប្បន្នភាពចុងក្រោយ៖ ${lastUpdatedAt.toLocaleTimeString("km-KH")}`
            : ""}
        </p>
      </div>

      {error ? (
        <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="py-10 text-center text-sm text-text-secondary">
          កំពុងទាញទិន្នន័យសាខា...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] border-collapse border border-border">
            <thead>
              <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
                <th className="px-4">ល.រ</th>
                <th className="px-4">សាខា</th>
                <th className="px-4">តួនាទី</th>
                <th className="px-4">ចំនួនប្រតិបត្តិការ</th>
                <th className="px-4">សរុប</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => (
                <tr
                  key={row.branchId ?? index}
                  className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
                >
                  <td className="px-4 font-normal">{index + 1}</td>
                  <td className="px-4 font-medium text-text-primary">
                    {row.branchNameKm || row.branchNameEn || row.branchCode || `#${row.branchId}`}
                  </td>
                  <td className="px-4">{ROLE_LABELS[row.role] || row.role || "-"}</td>
                  <td className="px-4">{row.donationCount ?? 0}</td>
                  <td className="px-4 font-semibold text-text-primary">
                    {formatUsd(row.totalAmountUsd)}
                  </td>
                </tr>
              ))}

              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-xs font-medium text-text-secondary"
                  >
                    មិនមានទិន្នន័យ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {!loading && rows.length > 0 ? (
        <DonationTotalsCard
          title="សរុបវិភាគទានទាំងអស់សាខា"
          riel={grandTotals.riel}
          dollar={grandTotals.dollar}
          total={grandTotals.total}
        />
      ) : null}
    </div>
  );
}
