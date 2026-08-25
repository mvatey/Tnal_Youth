"use client";

import { useEffect, useMemo, useState } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import EventDonationPanel from "@/components/donations/eventdonation/EventDonationPanel";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import MemberCard from "@/components/donations/eventdonation/membercard";
import NumberSponsorCard from "@/components/donations/eventdonation/sponsorcard";
import useCurrentMember from "@/hooks/useCurrentMember";
import { fetchMyAccountCollection } from "@/lib/myAccountCollections";
import { useBranch } from "@/context/BranchContext";

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

async function fetchAllActivityDonationRows(branchId) {
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
      throw new Error(body?.message || "Unable to load activity donations.");
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

  return firstItems
    .concat(
      ...remainingPages.map((page) =>
        Array.isArray(page?.items) ? page.items : [],
      ),
    )
    .filter(
      (row) =>
        String(row?.typeCode || "").toUpperCase() ===
          "ACTIVITY_DONATION" ||
        // Compatibility fallback for older rows/API versions where typeCode
        // was not exposed yet. Activity donations always carry activityId.
        (!row?.typeCode && row?.activityId),
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
  const { member: currentMember, loading: currentMemberLoading } = useCurrentMember();
  const viewRole = currentMember?.effectiveRole || currentMember?.role;
  const isMemberScoped = viewRole === "member";
  // Only entry staff (secretary / branch_leader) may open the bulk "record
  // donations for members" flow — admin/viewer are view-only.
  const canManage = !currentMember?.isViewer && ["secretary", "branch_leader"].includes(currentMember?.role);
  // Branch-scoping is a broader set than canManage: a viewer/secretary or
  // viewer/branch_leader (viewRole resolves their viewerScope through
  // effectiveRole) is just as much locked to one branch as the real role —
  // they just can't write. Using canManage here left those two accounts
  // looking unscoped, so their branch filter stayed on the empty "choose a
  // branch" placeholder instead of locking to the one branch they actually
  // have.
  const isBranchScoped = ["secretary", "branch_leader"].includes(viewRole);
  const { branches: accessibleBranches = [], selectedBranch: globalSelectedBranch = "all" } = useBranch();
  const effectiveBranchId = useMemo(() => {
    if (!isBranchScoped) return null;
    if (globalSelectedBranch && globalSelectedBranch !== "all") return String(globalSelectedBranch);
    if (accessibleBranches.length > 0) return String(accessibleBranches[0].id);
    return currentMember?.branchId ? String(currentMember.branchId) : null;
  }, [isBranchScoped, globalSelectedBranch, accessibleBranches, currentMember?.branchId]);

  const [selectedPeopleCard, setSelectedPeopleCard] = useState(null);
  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const selectedBranch = isBranchScoped ? (effectiveBranchId ?? "all") : internalSelectedBranch;
  const [rows, setRows] = useState([]);
  const [myRows, setMyRows] = useState([]);
  const [error, setError] = useState("");

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
    fetchAllActivityDonationRows(
      isBranchScoped ? effectiveBranchId : null,
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
  ]);

  const branchRows = useMemo(() => rows.filter((row) =>
    selectedBranch === "all" || String(row.branchId) === String(selectedBranch),
  ), [rows, selectedBranch]);
  const memberCount = new Set(branchRows.filter((row) => row.memberId).map((row) => row.memberId)).size;
  const sponsorCount = new Set(branchRows.filter((row) => !row.memberId).map((row) => `${row.sponsorId || row.donorName || row.id}`)).size;
  const totalDollar = branchRows.reduce((total, row) => {
    const storedTotal = Number(row.totalAmountUsd);
    if (Number.isFinite(storedTotal)) return total + storedTotal;
    return total + Number(row.amountUsd || 0) + Number(row.amountKhr || 0) / Number(row.exchangeRateKhrPerUsd || 4000);
  }, 0);
  const myTotalDollar = myRows.reduce((total, row) => total + parseMoney(row.dollarAmount), 0);

  const handleBranchChange = (branch) => {
    // A secretary/branch_leader has no branch to pick here anymore — the
    // sidebar's global dropdown is the only thing that changes it (see
    // effectiveBranchId above); the panels below are rendered with their
    // own branch filter locked (branchScoped) for this role.
    if (!isBranchScoped) setInternalSelectedBranch(branch);
    setSelectedPeopleCard(null);
  };

  if (isMemberScoped) {
    return (
      <div className="space-y-4">
        <DonationTabs />
        {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
        <div className="flex gap-[50px] xl:grid-cols-2">
          <EventDonationSummaryCard
            label="វិភាគទានក្នុងកម្មវិធីរបស់ខ្ញុំ"
            value={`$${myTotalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
            growth=""
            note=""
          />
          <DonorCard label="ចំនួនកំណត់ត្រា" value={`${myRows.length} លើក`} growth="" note="" />
        </div>
        <MyEventDonationsTable rows={myRows} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <DonationTabs />
      {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <div className="flex gap-[50px] xl:grid-cols-2">
        <EventDonationSummaryCard value={`$${totalDollar.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="" note="" />
        <DonorCard label="អ្នកវិភាគទានសរុប" value={`${memberCount + sponsorCount} នាក់`} growth="" note="" />
        <MemberCard
          value={`${memberCount} នាក់`}
          growth=""
          note=""
          selected={selectedPeopleCard === "members"}
          disabled={selectedBranch === "all" || !canManage}
          onClick={() => setSelectedPeopleCard("members")}
        />
        <NumberSponsorCard
          value={`${sponsorCount} នាក់`}
          growth=""
          note=""
          selected={selectedPeopleCard === "sponsors"}
          disabled={selectedBranch === "all"}
          onClick={() => setSelectedPeopleCard("sponsors")}
        />
      </div>
      {selectedPeopleCard === "members" && canManage ? (
        <EventDonationDetailForm initialQuery={{ branch: selectedBranch }} onCancel={() => setSelectedPeopleCard(null)} />
      ) : selectedPeopleCard === "sponsors" ? (
        <SponsorPanel
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          showAddButton={false}
          branchScoped={isBranchScoped}
        />
      ) : (
        <EventDonationPanel
          selectedBranch={selectedBranch}
          onBranchChange={handleBranchChange}
          branchScoped={isBranchScoped}
        />
      )}
    </div>
  );
}
