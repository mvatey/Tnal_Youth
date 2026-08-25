"use client";

import { useEffect, useMemo, useState } from "react";
import DonationTotalsCard from "@/components/donations/DonationTotalsCard";
import { useLanguage } from "@/context/LanguageContext";

async function fetchJson(url) {
  const response = await fetch(url, {
    cache: "no-store",
    credentials: "include",
  });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}

/**
 * Branch totals for one activity.
 *
 * IMPORTANT for a multi-branch SECRETARY:
 * do NOT fetch the generic /donations collection without branchId. That
 * request is intentionally rejected by the backend. Use the dedicated
 * activity branch-totals endpoint instead, then narrow it to the branch
 * selected in the global sidebar.
 */
export default function EventDonationBranchTotals({
  activityId,
  selectedBranchId = "all",
}) {
  const { t } = useLanguage();
  const [allRows, setAllRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activityId) return undefined;

    let cancelled = false;
    setLoading(true);
    setError("");

    fetchJson(
      `/api/backend/donations/activity/${encodeURIComponent(activityId)}/branch-totals`,
    )
      .then((rows) => {
        if (cancelled) return;
        setAllRows(Array.isArray(rows) ? rows : []);
      })
      .catch((loadError) => {
        if (!cancelled) {
          setAllRows([]);
          setError(loadError.message || t("donationPage.branchTotalsLoadFailed"));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activityId]);

  const rows = useMemo(() => {
    const scoped =
      selectedBranchId && selectedBranchId !== "all"
        ? allRows.filter(
            (row) => String(row.branchId) === String(selectedBranchId),
          )
        : allRows;

    return scoped.map((row) => {
      const role = String(row.role || "").toUpperCase();
      return {
        branchId: row.branchId,
        label:
          row.branchNameKm ||
          row.branchNameEn ||
          row.branchCode ||
          "-",
        roleLabel:
          role === "ORGANIZER" ? t("donationPage.organizerBranch") : t("donationPage.invitedBranch"),
        count: Number(row.donationCount || 0),
        amountKhr: Number(row.amountKhr || 0),
        amountUsd: Number(row.amountUsd || 0),
        totalAmountUsd: Number(row.totalAmountUsd || 0),
      };
    });
  }, [allRows, selectedBranchId, t]);

  const headers = [
    t("donationPage.no"),
    t("donationPage.branch"),
    t("memberPage.role"),
    t("donationPage.donor"),
    t("donationPage.amountKhrPlain"),
    t("donationPage.amountUsdPlain"),
  ];

  const totals = useMemo(
    () =>
      rows.reduce(
        (sum, row) => ({
          riel: sum.riel + row.amountKhr,
          dollar: sum.dollar + row.amountUsd,
          total: sum.total + row.totalAmountUsd,
        }),
        { riel: 0, dollar: 0, total: 0 },
      ),
    [rows],
  );

  if (loading) {
    return (
      <div className="py-10 text-center text-sm text-text-secondary">
        {t("donationPage.loadingBranches")}
      </div>
    );
  }

  return (
    <section className="min-h-[300px] rounded-md border border-border bg-bg-page-white p-6">
      {error ? (
        <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
              {headers.map((header) => (
                <th key={header} className="px-4">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.branchId}
                className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0"
              >
                <td className="px-4">{index + 1}</td>
                <td className="px-4">{row.label}</td>
                <td className="px-4">{row.roleLabel}</td>
                <td className="px-4">{row.count}</td>
                <td className="px-4">{row.amountKhr.toLocaleString()}</td>
                <td className="px-4">
                  {row.amountUsd.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </td>
              </tr>
            ))}
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={headers.length}
                  className="px-4 py-8 text-center text-xs font-medium text-text-secondary"
                >
                  {t("donationPage.noData")}
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {rows.length > 0 ? (
        <DonationTotalsCard
          title={t("donationPage.contributionTotal")}
          riel={totals.riel}
          dollar={totals.dollar}
          total={totals.total}
        />
      ) : null}
    </section>
  );
}
