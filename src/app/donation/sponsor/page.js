"use client";

import { useEffect, useMemo, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorCard from "@/components/donations/SponsorCard";
import DonorCard from "@/components/donations/DonorCard";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import MyAccountSponsorPage from "@/app/myAcc/(tabs)/sponsor/page";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";

const EMPTY_SUMMARY = {
  donorCount: 0,
  overallTotalUsd: 0,
  donationChangePercent: 0,
  donorChangePercent: 0,
};

const toDate = (value) => {
  if (!value) return null;
  const date = new Date(`${String(value).slice(0, 10)}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
};

const isSameMonth = (value, target) => {
  const date = toDate(value);
  return !!date && date.getFullYear() === target.getFullYear() && date.getMonth() === target.getMonth();
};

const percentChange = (current, previous) => {
  const now = Number(current || 0);
  const before = Number(previous || 0);
  if (before === 0) return now === 0 ? 0 : 100;
  return Number((((now - before) / before) * 100).toFixed(2));
};

const sponsorKey = (row) => {
  if (row?.memberId) return `member:${row.memberId}`;
  if (row?.sponsorId) return `sponsor:${row.sponsorId}`;
  if (row?.donorName) return `name:${String(row.donorName).trim().toLowerCase()}`;
  if (row?.name) return `name:${String(row.name).trim().toLowerCase()}`;
  return `donation:${row?.donationId ?? row?.id ?? Math.random()}`;
};

const amountUsd = (row) => {
  const storedTotal = Number(row?.totalAmountUsd);
  if (Number.isFinite(storedTotal) && storedTotal !== 0) return storedTotal;

  const usd = Number(row?.amountUsd || 0);
  const khr = Number(row?.amountKhr || 0);
  const rate = Number(row?.exchangeRateKhrPerUsd || 4000) || 4000;
  return usd + khr / rate;
};

const summarizeRows = (rows, memberMode = false) => {
  const safeRows = Array.isArray(rows) ? rows : [];

  return {
    // For a normal staff view this is the number of unique sponsors/donors
    // represented by the same rows that feed the table. In personal member
    // mode each donation row is one of the member's own records.
    donorCount: memberMode
      ? safeRows.length
      : new Set(safeRows.map(sponsorKey)).size,
    overallTotalUsd: safeRows.reduce(
      (sum, row) => sum + amountUsd(row),
      0,
    ),
    donationChangePercent: 0,
    donorChangePercent: 0,
  };
};

async function fetchAllSponsorRows(selectedBranch) {
  const makeParams = (page) => {
    const params = new URLSearchParams({ page: String(page), size: "100" });
    if (selectedBranch && selectedBranch !== "all") params.set("branchId", String(selectedBranch));
    return params;
  };

  const firstResponse = await fetch(`/api/backend/donations/sponsor?${makeParams(0)}`, {
    cache: "no-store",
    credentials: "include",
  });
  const firstBody = await firstResponse.json().catch(() => null);
  if (!firstResponse.ok || firstBody?.success === false) {
    throw new Error(firstBody?.message || "មិនអាចទាញយកសង្ខេបការបរិច្ចាកបានទេ។");
  }

  const firstPage = firstBody?.data ?? firstBody;
  const firstItems = Array.isArray(firstPage?.items) ? firstPage.items : [];
  const total = Number(firstPage?.totalElements ?? firstPage?.total ?? firstItems.length);
  const totalPages = Math.max(1, Math.ceil(total / 100));
  if (totalPages === 1) return firstItems;

  const remaining = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) => index + 1).map(async (page) => {
      const response = await fetch(`/api/backend/donations/sponsor?${makeParams(page)}`, {
        cache: "no-store",
        credentials: "include",
      });
      const body = await response.json().catch(() => null);
      if (!response.ok || body?.success === false) return [];
      const data = body?.data ?? body;
      return Array.isArray(data?.items) ? data.items : [];
    }),
  );

  return firstItems.concat(...remaining);
}

export default function SponsorPage() {
  const [summary, setSummary] = useState(EMPTY_SUMMARY);
  const { t } = useLanguage();
  const { member: currentMember, loading: currentMemberLoading } = useCurrentMember();
  const { branches: accessibleBranches = [], selectedBranch: globalSelectedBranch = "all" } = useBranch();

  const viewRole = currentMember?.effectiveRole || currentMember?.role;
  const isActualViewer = currentMember?.role === "viewer";
  const isBranchScoped = ["secretary", "branch_leader"].includes(viewRole);
  const isPersonalMember = viewRole === "member" && !isActualViewer;

  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;
    if (globalSelectedBranch && globalSelectedBranch !== "all") return String(globalSelectedBranch);
    if (accessibleBranches.length > 0) return String(accessibleBranches[0].id);
    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [isBranchScoped, globalSelectedBranch, accessibleBranches, currentMember?.branchId]);

  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const selectedBranch = isBranchScoped ? (effectiveBranchId ?? "all") : internalSelectedBranch;
  const setSelectedBranch = isBranchScoped ? () => {} : setInternalSelectedBranch;

  useEffect(() => {
    if (currentMemberLoading) return undefined;
    if (isBranchScoped && (!selectedBranch || selectedBranch === "all")) return undefined;

    let cancelled = false;
    setSummary(EMPTY_SUMMARY);

    async function loadSummary() {
      try {
        if (isPersonalMember) {
          const rows = await fetchMyAccountCollection("donations/sponsors");
          if (!cancelled) setSummary(summarizeRows(rows, true));
          return;
        }

        // Use the exact same sponsor-donation records that power the table.
        // This keeps the cards synchronized with real data instead of relying
        // on a separate summary response that can become stale or fail silently.
        const rows = await fetchAllSponsorRows(selectedBranch);
        if (!cancelled) setSummary(summarizeRows(rows, false));
      } catch {
        if (!cancelled) setSummary(EMPTY_SUMMARY);
      }
    }

    loadSummary();
    return () => { cancelled = true; };
  }, [currentMemberLoading, isBranchScoped, isPersonalMember, selectedBranch]);

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex flex-col gap-3 sm:flex-row">
        <SponsorCard
          value={`$${Number(summary.overallTotalUsd || 0).toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          growth=""
          note=""
        />
        <DonorCard
          label={isPersonalMember ? t("donationPage.myRecordCount") : t("donationPage.sponsorsTotal")}
          value={`${summary.donorCount || 0} ${isPersonalMember ? t("donationPage.timeUnit") : t("donationPage.personUnit")}`}
          growth=""
          note=""
        />
      </div>
      {isPersonalMember ? (
        // A plain member has no branch to manage -- the staff panel below
        // needs branch-management access it doesn't have (see
        // BranchServiceImpl#getAccessibleBranchOptions, ADMIN/SECRETARY/
        // BRANCH_LEADER only), so it shows their own sponsor records
        // instead, same view as their My Account sponsor tab.
        <MyAccountSponsorPage />
      ) : (
        <SponsorPanel
          selectedBranch={selectedBranch}
          onBranchChange={setSelectedBranch}
          branchScoped={isBranchScoped}
        />
      )}
    </div>
  );
}
