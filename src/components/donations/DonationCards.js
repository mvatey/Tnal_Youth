"use client";

import { useEffect, useMemo, useState } from "react";
import DonationCard from "./DonationCard";
import DonorCard from "./DonorCard";
import useCurrentMember from "@/hooks/useCurrentMember";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { useBranch } from "@/context/BranchContext";

const toNumber = (value) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const summarizeMonthlyGroups = (rows) =>
  rows.reduce(
    (summary, row) => ({
      totalUsd:
        summary.totalUsd +
        toNumber(
          row?.overallTotalUsd ??
            row?.totalAmountUsd ??
            row?.amountUsd,
        ),
      donors:
        summary.donors +
        toNumber(row?.donorCount ?? 1),
    }),
    { totalUsd: 0, donors: 0 },
  );

export default function DonationCards() {
  const { member: currentMember, loading: currentMemberLoading } = useCurrentMember();
  const effectiveRole = currentMember?.effectiveRole || currentMember?.role;
  const isBranchScoped = ["secretary", "branch_leader"].includes(effectiveRole);
  const isMemberScoped = effectiveRole === "member";
  const {
    branches: accessibleBranches = [],
    selectedBranch: globalSelectedBranch = "all",
  } = useBranch();

  // IMPORTANT: for SECRETARY/BRANCH_LEADER the sidebar selection is the
  // single source of truth. currentMember.branchId is only the home branch
  // and must never override a branch the secretary actively selected.
  const scopedBranchId = useMemo(() => {
    if (!isBranchScoped) return null;

    if (globalSelectedBranch && globalSelectedBranch !== "all") {
      return String(globalSelectedBranch);
    }

    if (accessibleBranches.length > 0) {
      return String(accessibleBranches[0].id);
    }

    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [
    isBranchScoped,
    globalSelectedBranch,
    accessibleBranches,
    currentMember?.branchId,
  ]);

  const [summary, setSummary] = useState({ totalUsd: 0, donors: 0 });

  useEffect(() => {
    // Wait for the current member to resolve so a branch-scoped user
    // (secretary/branch_leader) doesn't briefly fetch org-wide totals
    // before their branch is known.
    if (currentMemberLoading) return undefined;
    if (isBranchScoped && !scopedBranchId) return undefined;

    let cancelled = false;

    if (isMemberScoped) {
      fetchMyAccountCollection("donations/monthly")
        .then((rows) => {
          if (cancelled) return;
          // The summary cards represent everything shown by this donation
          // section, not only the current calendar month. A member's self-
          // service endpoint returns one donation row per record, so each row
          // contributes one record to the count.
          setSummary(
            rows.reduce(
              (summary, row) => ({
                totalUsd:
                  summary.totalUsd +
                  toNumber(
                    row?.totalAmountUsd ??
                      row?.overallTotalUsd ??
                      row?.amountUsd,
                  ),
                donors: summary.donors + 1,
              }),
              { totalUsd: 0, donors: 0 },
            ),
          );
        })
        .catch(() => { if (!cancelled) setSummary({ totalUsd: 0, donors: 0 }); });
      return () => { cancelled = true; };
    }

    const query = new URLSearchParams({ page: "0", size: "100" });
    if (isBranchScoped) query.set("branchId", String(scopedBranchId));

    fetch(`/api/backend/donations/monthly?${query}`, { cache: "no-store", credentials: "include" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error();
        const page = body?.data ?? body;
        const rows = Array.isArray(page?.items) ? page.items : [];
        if (cancelled) return;

        // MonthlyDonationController groups rows by branch + donation period.
        // Sum every returned group so an older donation (for example June or
        // July while the current month is August) still appears in the cards.
        setSummary(summarizeMonthlyGroups(rows));
      })
      .catch(() => {
        if (!cancelled) setSummary({ totalUsd: 0, donors: 0 });
      });

    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, isMemberScoped, scopedBranchId]);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <DonationCard label="ថវិកាសរុប" value={`$${summary.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="" note="" />
      <DonorCard
        label={isMemberScoped ? "ចំនួនកំណត់ត្រា" : "អ្នកបរិច្ចាគសរុប"}
        value={`${summary.donors} ${isMemberScoped ? "លើក" : "នាក់"}`}
        growth=""
        note=""
      />
    </div>
  );
}
