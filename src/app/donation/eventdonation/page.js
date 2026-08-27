"use client";

import { useEffect, useMemo, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import EventDonationPanel from "@/components/donations/eventdonation/EventDonationPanel";
import MemberCard from "@/components/donations/eventdonation/membercard";
import NumberSponsorCard from "@/components/donations/eventdonation/sponsorcard";
import useCurrentMember from "@/hooks/useCurrentMember";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { useBranch } from "@/context/BranchContext";
import { useLanguage } from "@/context/LanguageContext";

const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

function mapMyEventRow(row) {
  return {
    id: row.id,
    activityId: row.activity?.id ?? null,
    eventName: row.activity?.titleKm || row.activity?.titleEn || "-",
    branch: row.branch?.nameKm || row.branch?.nameEn || "-",
    date: row.paidAt ? new Date(row.paidAt).toLocaleDateString("en-GB") : "-",
    rielAmount: Number(row.amountKhr || 0).toLocaleString(),
    dollarAmount: Number(row.amountUsd || row.totalAmountUsd || 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
  };
}

/**
 * Every donation row for this branch scope, unfiltered by type -- callers
 * derive whichever subset they need (activity-typed rows, sponsor rows
 * earmarked for an activity, etc.) so the same paginated fetch isn't
 * repeated per subset.
 */
async function fetchAllDonationRows(branchId, fallbackMessage) {
  const makeParams = (page) => {
    const params = new URLSearchParams({
      page: String(page),
      size: "100",
    });
    if (branchId) params.set("branchId", String(branchId));
    return params;
  };

  const loadPage = async (page) => {
    const response = await fetch(
      `/api/backend/donations?${makeParams(page)}`,
      { cache: "no-store", credentials: "include" },
    );
    const body = await response.json().catch(() => null);
    if (!response.ok || body?.success === false) {
      throw new Error(body?.message || fallbackMessage);
    }
    return body?.data ?? body;
  };

  const firstPage = await loadPage(0);
  const firstItems = Array.isArray(firstPage?.items) ? firstPage.items : [];
  const totalElements = Number(firstPage?.total ?? firstPage?.totalElements ?? firstItems.length);
  const totalPages = Math.max(1, Math.ceil(totalElements / 100));

  const remainingPages = totalPages > 1
    ? await Promise.all(
        Array.from({ length: totalPages - 1 }, (_, index) =>
          loadPage(index + 1),
        ),
      )
    : [];

  return firstItems.concat(
    ...remainingPages.map((page) =>
      Array.isArray(page?.items) ? page.items : [],
    ),
  );
}

function isActivityDonationRow(row) {
  return (
    String(row?.typeCode || "").toUpperCase() === "ACTIVITY_DONATION" ||
    // Compatibility fallback for older rows/API versions where typeCode
    // was not exposed yet. Activity donations always carry activityId.
    (!row?.typeCode && row?.activityId)
  );
}

// A sponsor can also earmark their donation for a specific activity -- that
// row is typed SPONSOR_DONATION (not ACTIVITY_DONATION), so it's excluded
// from isActivityDonationRow() above and from the sponsor tab's own count
// unless that tab separately filters for it. It's still just one row in the
// donations table either way (see the dashboard-total explanation): this
// helper exists only so the "sponsor funds in activities" assurance card
// can show which slice of sponsor money already sits inside the activity
// total above -- never to be added a second time on top of it.
function isSponsorDonationForActivityRow(row) {
  return (
    String(row?.typeCode || "").toUpperCase() === "SPONSOR_DONATION" &&
    Boolean(row?.activityId)
  );
}

function MyEventDonationsTable({ rows }) {
  if (!rows.length) {
    return (
      <section className="min-h-[200px] rounded-md border border-border bg-bg-page-white px-7 py-8 text-center text-xs font-medium text-text-secondary shadow-sm">
        មិនមានទិន្នន័យវិភាគទាននៅឡើយទេ
      </section>
    );
  }

  return (
    <section className="overflow-x-auto rounded-md border border-border bg-bg-page-white px-7 py-4 shadow-sm">
      <table className="w-full min-w-[760px] border-collapse border border-border">
        <thead>
          <tr className="h-12 border-b border-border bg-bg-page-gray text-center text-xs font-medium text-text-secondary">
            <th className="px-4">ល.រ</th>
            <th className="px-4">កម្មវិធី</th>
            <th className="px-4">សាខា</th>
            <th className="px-4">ថ្ងៃខែឆ្នាំ</th>
            <th className="px-4">ចំនួនប្រាក់រៀល</th>
            <th className="px-4">ចំនួនប្រាក់ដុល្លារ</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id} className="h-11 border-b border-border text-center text-sm text-text-secondary last:border-b-0">
              <td className="px-4">{index + 1}</td>
              <td className="px-4">{row.eventName}</td>
              <td className="px-4">{row.branch}</td>
              <td className="whitespace-nowrap px-4">{row.date}</td>
              <td className="px-4">{row.rielAmount}</td>
              <td className="px-4">{row.dollarAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}

export default function EventDonationPage() {
  const { t } = useLanguage();
  const { member: currentMember, loading: currentMemberLoading } = useCurrentMember();
  const viewRole = currentMember?.effectiveRole || currentMember?.role;
  const isMemberScoped = viewRole === "member";
  // A viewer/secretary or viewer/branch_leader (viewRole resolves their
  // viewerScope through effectiveRole) is just as locked to one branch as
  // the real role, even though they can't write — so this checks viewRole,
  // not the raw (write-capable-only) role.
  const isBranchScoped = ["secretary", "branch_leader"].includes(viewRole);
  const { branches: accessibleBranches = [], selectedBranch: globalSelectedBranch = "all" } = useBranch();
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;
    if (globalSelectedBranch && globalSelectedBranch !== "all") return String(globalSelectedBranch);
    if (accessibleBranches.length > 0) return String(accessibleBranches[0].id);
    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [isBranchScoped, globalSelectedBranch, accessibleBranches, currentMember?.branchId]);

  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const selectedBranch = isBranchScoped ? (effectiveBranchId ?? "all") : internalSelectedBranch;
  const [rows, setRows] = useState([]);
  const [myRows, setMyRows] = useState([]);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const refresh = () => setRefreshKey((value) => value + 1);
    window.addEventListener("tnal-youth:donations-updated", refresh);
    return () => window.removeEventListener("tnal-youth:donations-updated", refresh);
  }, []);

  useEffect(() => {
    if (currentMemberLoading) return undefined;
    let cancelled = false;

    if (isMemberScoped) {
      fetchMyAccountCollection("donations/events")
        .then((items) => {
          if (cancelled) return;

          // MEMBER view must show exactly ONE current row per activity.
          // Old/test duplicate donation rows can exist in the database, so
          // de-duplicate defensively in the UI by activity id. The API is
          // ordered newest-first, therefore the first row wins.
          const oneRowPerActivity = new Map();
          for (const item of items) {
            const mapped = mapMyEventRow(item);
            const key = mapped.activityId != null
              ? `activity:${mapped.activityId}`
              : `fallback:${mapped.eventName}|${mapped.branch}`;
            if (!oneRowPerActivity.has(key)) {
              oneRowPerActivity.set(key, mapped);
            }
          }

          setMyRows(Array.from(oneRowPerActivity.values()));
        })
        .catch((loadError) => { if (!cancelled) setError(loadError.message); });
      return () => { cancelled = true; };
    }

    // A multi-branch secretary must never request the unscoped donation
    // collection. The backend intentionally rejects that because it cannot
    // guess which assigned branch is currently active. Always carry the
    // sidebar-selected branch into this summary request.
    if (isBranchScoped && !effectiveBranchId) return undefined;

    setRows([]);
    fetchAllDonationRows(
      isBranchScoped ? effectiveBranchId : null,
      t("donationPage.loadEventDonationsFailed"),
    )
      .then((items) => {
        if (!cancelled) setRows(items);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError.message);
      });
    return () => { cancelled = true; };
  }, [
    currentMemberLoading,
    isMemberScoped,
    isBranchScoped,
    effectiveBranchId,
    refreshKey,
  ]);

  const branchRows = useMemo(() => rows.filter((row) =>
    selectedBranch === "all" || String(row.branchId) === String(selectedBranch),
  ), [rows, selectedBranch]);
  const activityDonationRows = branchRows.filter(isActivityDonationRow);
  const sponsorInActivityRows = branchRows.filter(isSponsorDonationForActivityRow);
  const memberCount = new Set(activityDonationRows.filter((row) => row.memberId).map((row) => row.memberId)).size;
  const sponsorCount = new Set(activityDonationRows.filter((row) => !row.memberId).map((row) => `${row.sponsorId || row.donorName || row.id}`)).size;
  const sumTotalDollar = (donationRows) => donationRows.reduce((total, row) => {
    const storedTotal = Number(row.totalAmountUsd);
    if (Number.isFinite(storedTotal)) return total + storedTotal;
    return total + Number(row.amountUsd || 0) + Number(row.amountKhr || 0) / Number(row.exchangeRateKhrPerUsd || 4000);
  }, 0);
  const totalDollar = sumTotalDollar(activityDonationRows);
  // Assurance figure only -- this money is already part of totalDollar
  // above (a sponsor-for-activity row is still one row, counted once).
  // Never add this on top of totalDollar; it exists so a tester can see
  // which slice of it came specifically from sponsors.
  const sponsorInActivityDollar = sumTotalDollar(sponsorInActivityRows);
  const myTotalDollar = myRows.reduce((total, row) => total + parseMoney(row.dollarAmount), 0);

  const handleBranchChange = (branch) => {
    // A secretary/branch_leader has no branch to pick here anymore — the
    // sidebar's global dropdown is the only thing that changes it (see
    // effectiveBranchId above); the panels below are rendered with their
    // own branch filter locked (branchScoped) for this role.
    if (!isBranchScoped) setInternalSelectedBranch(branch);
  };

  if (isMemberScoped) {
    return (
      <div className="space-y-4">
        <DonationTabs />
        {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <EventDonationSummaryCard
            label={t("donationPage.myEventDonations")}
            value={`$${myTotalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            growth=""
            note=""
          />
          <DonorCard label={t("donationPage.recordCount")} value={`${myRows.length} ${t("donationPage.timeUnit")}`} growth="" note="" />
        </div>
        <MyEventDonationsTable rows={myRows} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DonationTabs />
      {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <EventDonationSummaryCard label={t("donationPage.eventDonationTitle")} value={`$${totalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="" note="" />
        <DonorCard label={t("donationPage.donorsTotal")} value={`${memberCount + sponsorCount} ${t("donationPage.personUnit")}`} growth="" note="" />
        <MemberCard
          label={t("donationPage.member")}
          value={`${memberCount} ${t("donationPage.personUnit")}`}
          growth=""
          note=""
        />
        <NumberSponsorCard
          label={t("memberPage.tabSponsor")}
          value={`${sponsorCount} ${t("donationPage.personUnit")}`}
          growth=""
          note=""
        />
        <NumberSponsorCard
          label={t("donationPage.sponsorAmountInActivities")}
          value={`$${sponsorInActivityDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          growth=""
          note=""
        />
      </div>
      <EventDonationPanel
        selectedBranch={selectedBranch}
        onBranchChange={handleBranchChange}
        branchScoped={isBranchScoped}
      />
    </div>
  );
}
