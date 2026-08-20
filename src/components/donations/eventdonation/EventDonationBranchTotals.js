"use client";

import { useEffect, useMemo, useState } from "react";
import tableHeaders from "@/data/donation/tableHeaders.json";
import DonationTotalsCard from "@/components/donations/DonationTotalsCard";
import useUsdKhrExchangeRate from "@/lib/useUsdKhrExchangeRate";

const { eventBranchTotalHeaders: headers } = tableHeaders;


async function fetchJson(url) {
  const response = await fetch(url, { cache: "no-store" });
  const body = await response.json().catch(() => null);
  if (!response.ok || body?.success === false) {
    throw new Error(body?.message || `Request failed (${response.status})`);
  }
  return body?.data ?? body;
}

function toBranchNameMap(values) {
  const map = {};
  (Array.isArray(values) ? values : []).forEach((branch) => {
    const id = String(branch.value ?? branch.id ?? "");
    if (!id) return;
    map[id] =
      branch.labelKm ??
      branch.nameKm ??
      branch.labelEn ??
      branch.nameEn ??
      branch.label ??
      branch.name ??
      branch.code ??
      `#${id}`;
  });
  return map;
}

// Totals are computed client-side from the SAME donation records already
// used by the Members tab / summary cards (GET /donations?activityId=),
// rather than a dedicated aggregate endpoint — a donation carries the
// branchId it was recorded under (the organizer's own branch, or an
// invited/co-hosting branch once that branch records its own members'
// donations), so grouping by branchId here is exactly "each branch's
// total for this activity." Eligible branches (the organizer branch plus
// any branch with an ACCEPTED invitation) are always listed even when
// their total is still zero, so an invited branch that hasn't recorded
// anything yet doesn't just silently disappear from this view.
export default function EventDonationBranchTotals({ activityId, organizerBranchId }) {
  const exchangeRateKhrPerUsd = useUsdKhrExchangeRate();
  const [invitedBranches, setInvitedBranches] = useState([]);
  const [branchNames, setBranchNames] = useState({});
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!activityId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError("");
    Promise.all([
      fetchJson(`/api/backend/activities/${encodeURIComponent(activityId)}/invited-branches`).catch(() => []),
      fetchJson("/api/lookups/activity-invitable-branches").catch(() => []),
      fetchJson(`/api/backend/donations?page=0&size=1000&activityId=${encodeURIComponent(activityId)}`),
    ])
      .then(([invitations, branchOptions, donationPage]) => {
        if (cancelled) return;
        setInvitedBranches(Array.isArray(invitations) ? invitations : []);
        setBranchNames(toBranchNameMap(branchOptions));
        const items = Array.isArray(donationPage?.items)
          ? donationPage.items
          : (Array.isArray(donationPage?.content) ? donationPage.content : []);
        setDonations(items.filter((item) => String(item.activityId) === String(activityId)));
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message || "Unable to load branch totals.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [activityId]);

  const rows = useMemo(() => {
    const eligible = new Map();
    if (organizerBranchId != null) {
      eligible.set(String(organizerBranchId), "organizer");
    }
    invitedBranches.forEach((invitation) => {
      const branchId = invitation.branchId ?? invitation.branch_id;
      const status = String(invitation.invitationStatus ?? invitation.invitation_status ?? "").toUpperCase();
      if (branchId == null || status !== "ACCEPTED") return;
      const key = String(branchId);
      if (!eligible.has(key)) eligible.set(key, "invited");
    });

    const totalsByBranch = new Map();
    donations.forEach((donation) => {
      const branchId = donation.branchId;
      if (branchId == null) return;
      const key = String(branchId);
      const current = totalsByBranch.get(key) || { count: 0, amountKhr: 0, amountUsd: 0 };
      current.count += 1;
      current.amountKhr += Number(donation.amountKhr || 0);
      current.amountUsd += Number(donation.amountUsd || 0);
      totalsByBranch.set(key, current);
    });

    return Array.from(eligible.entries()).map(([branchId, role]) => {
      const totals = totalsByBranch.get(branchId) || { count: 0, amountKhr: 0, amountUsd: 0 };
      return {
        branchId,
        label: branchNames[branchId] || `#${branchId}`,
        role,
        roleLabel: role === "organizer" ? "សាខាចម្បង" : "សាខាដែលបានអញ្ជើញ",
        count: totals.count,
        amountKhr: totals.amountKhr,
        amountUsd: totals.amountUsd,
      };
    }).sort((a, b) => (a.role === b.role ? 0 : a.role === "organizer" ? -1 : 1));
  }, [branchNames, donations, invitedBranches, organizerBranchId]);

  // Grand total across every branch row above — every donation for this
  // activity, organizer and invited branches alike.
  const totals = useMemo(() => {
    const riel = rows.reduce((sum, row) => sum + (row.amountKhr || 0), 0);
    const dollar = rows.reduce((sum, row) => sum + (row.amountUsd || 0), 0);
    return { riel, dollar, total: dollar + riel / (exchangeRateKhrPerUsd || 4000) };
  }, [rows]);

  if (loading) {
    return <div className="py-10 text-center text-sm text-text-secondary">កំពុងទាញទិន្នន័យសាខា...</div>;
  }

  return (
    <section className="min-h-[300px] rounded-md border border-border bg-bg-page-white p-6">
      {error ? <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse border border-border">
          <thead>
            <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
              {headers.map((header) => (
                <th key={header} className="px-4">{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={row.branchId} className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0">
                <td className="px-4">{index + 1}</td>
                <td className="px-4">{row.label}</td>
                <td className="px-4">{row.roleLabel}</td>
                <td className="px-4">{row.count}</td>
                <td className="px-4">{row.amountKhr.toLocaleString()}</td>
                <td className="px-4">{row.amountUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-4 py-8 text-center text-xs font-medium text-text-secondary">
                  មិនមានទិន្នន័យ
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {rows.length > 0 && (
        <DonationTotalsCard
          title="សរុបវិភាគទាន"
          riel={totals.riel}
          dollar={totals.dollar}
          total={totals.total}
        />
      )}
    </section>
  );
}
