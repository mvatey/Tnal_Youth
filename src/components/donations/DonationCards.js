"use client";

import { useEffect, useState } from "react";
import DonationCard from "./DonationCard";
import DonorCard from "./DonorCard";
import useCurrentMember from "@/hooks/useCurrentMember";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";

export default function DonationCards() {
  const { member: currentMember, loading: currentMemberLoading } = useCurrentMember();
  const isBranchScoped = ["secretary", "branch_leader"].includes(currentMember?.role);
  const isMemberScoped = currentMember?.role === "member";
  const scopedBranchId = isBranchScoped ? currentMember?.branchId : null;

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
          setSummary({
            totalUsd: rows.reduce((total, row) => total + Number(row.totalAmountUsd || row.amountUsd || 0), 0),
            donors: rows.length,
          });
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
        setSummary(rows.reduce((total, row) => ({
          totalUsd: total.totalUsd + Number(row.overallTotalUsd || 0),
          donors: total.donors + Number(row.donorCount || 0),
        }), { totalUsd: 0, donors: 0 }));
      })
      .catch(() => {
        if (!cancelled) setSummary({ totalUsd: 0, donors: 0 });
      });

    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, isMemberScoped, scopedBranchId]);

  return (
    <div className="flex gap-[50px] xl:grid-cols-2">
      <DonationCard label="ថវិកាប្រចាំខែ" value={`$${summary.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="0%" note="ក្នុងខែនេះ" />
      <DonorCard
        label={isMemberScoped ? "ចំនួនកំណត់ត្រា" : "អ្នកបរិច្ចាគសរុប"}
        value={`${summary.donors} នាក់`}
        growth="0%"
        note="ក្នុងខែនេះ"
      />
    </div>
  );
}
