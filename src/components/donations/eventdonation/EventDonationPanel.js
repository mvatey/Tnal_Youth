"use client";

import { useEffect, useMemo, useState } from "react";
import EventDonationFilters from "./EventDonationFilters";
import EventDonationTable from "./EventDonationTable";
import AddAlert from "@/components/forms/addalert";
import { downloadCsv } from "@/utils/downloadCsv";

const rowsPerPage = 12;
const parseMoney = (value) => Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

export default function EventDonationPanel({
  selectedBranch: controlledSelectedBranch,
  onBranchChange,
  // When true, the branch filter is locked to the single branch the
  // caller already scoped selectedBranch to (see
  // donation/eventdonation/page.js) — a secretary/branch_leader has no
  // "all branches" or manual-pick option here.
  branchScoped = false,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [internalSelectedBranch, setInternalSelectedBranch] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showDownloadAlert, setShowDownloadAlert] = useState(false);
  const [moneySort, setMoneySort] = useState(null);
  const [rows, setRows] = useState([]);
  const [branches, setBranches] = useState([]);
  const [organizerBranchNames, setOrganizerBranchNames] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const selectedBranch = controlledSelectedBranch ?? internalSelectedBranch;
  const setSelectedBranch = onBranchChange ?? setInternalSelectedBranch;
  const hasSelectedBranch = selectedBranch !== "all";

  function toBranchOptions(values) {
    return (Array.isArray(values) ? values : [])
      .map((branch) => ({
        value: String(branch.value ?? branch.id ?? ""),
        label:
          branch.labelKm ??
          branch.nameKm ??
          branch.labelEn ??
          branch.nameEn ??
          branch.label ??
          branch.name ??
          branch.code ??
          "",
      }))
      .filter((branch) => branch.value && branch.label);
  }

  useEffect(() => {
    let cancelled = false;
    async function loadBranches() {
      try {
        // The FILTER dropdown only ever needs to offer branches this staff
        // member can actually pick (their own/assigned branches) — this
        // stays scoped, same as before.
        //
        // The organizer-name lookup below is different: a row's activity
        // can be hosted by ANY branch in the org (that's the whole point of
        // "own + invited" — the invited-and-accepted activities keep their
        // original host, which is very likely NOT one of this viewer's own
        // branches), so it must come from the org-wide lookup, not the
        // scoped one, or hosts outside the viewer's own branches would show
        // up unresolved.
        const [branchResponse, organizerResponse] = await Promise.all([
          fetch("/api/lookups/branches", { cache: "no-store" }),
          fetch("/api/lookups/activity-invitable-branches", { cache: "no-store" }),
        ]);
        const [branchBody, organizerBody] = await Promise.all([
          branchResponse.json().catch(() => null),
          organizerResponse.json().catch(() => null),
        ]);
        if (!branchResponse.ok || branchBody?.success === false) {
          throw new Error(branchBody?.message || "Unable to load branches.");
        }
        if (cancelled) return;
        setBranches(toBranchOptions(branchBody?.data ?? branchBody));
        if (organizerResponse.ok && organizerBody?.success !== false) {
          const organizerOptions = toBranchOptions(organizerBody?.data ?? organizerBody);
          setOrganizerBranchNames(Object.fromEntries(
            organizerOptions.map((branch) => [branch.value, branch.label]),
          ));
        }
      } catch (loadError) {
        if (!cancelled) setError(loadError.message || "Unable to load branches.");
      }
    }
    loadBranches();
    return () => { cancelled = true; };
  }, []);

  // Rows are sourced from the SELECTED BRANCH's activities (own-hosted +
  // accepted co-hosting invitations), not from existing donation records —
  // an activity with zero donations recorded so far must still appear, with
  // its amounts defaulting to 0. Donation totals are then left-joined in
  // per activity. Re-runs whenever the chosen branch changes.
  useEffect(() => {
    if (!hasSelectedBranch) {
      setRows([]);
      return undefined;
    }
    let cancelled = false;
    setLoading(true);
    setError("");
    async function loadRows() {
      try {
        const [activityResponse, donationResponse] = await Promise.all([
          fetch(`/api/backend/activities?page=0&size=100&branchId=${encodeURIComponent(selectedBranch)}`, { cache: "no-store" }),
          fetch(`/api/backend/donations?page=0&size=100&branchId=${encodeURIComponent(selectedBranch)}`, { cache: "no-store" }),
        ]);
        const [activityBody, donationBody] = await Promise.all([
          activityResponse.json().catch(() => null),
          donationResponse.json().catch(() => null),
        ]);
        if (!activityResponse.ok || activityBody?.success === false) {
          throw new Error(activityBody?.message || "Unable to load activities.");
        }
        if (!donationResponse.ok || donationBody?.success === false) {
          throw new Error(donationBody?.message || "Unable to load event donations.");
        }
        if (cancelled) return;

        const activityPage = activityBody?.data ?? activityBody;
        const donationPage = donationBody?.data ?? donationBody;
        const activityItems = Array.isArray(activityPage?.content)
          ? activityPage.content
          : (Array.isArray(activityPage?.items) ? activityPage.items : []);
        const donationItems = Array.isArray(donationPage?.items)
          ? donationPage.items
          : (Array.isArray(donationPage?.content) ? donationPage.content : []);

        setRows(buildActivityDonationRows(activityItems, donationItems, selectedBranch, organizerBranchNames));
      } catch (loadError) {
        if (!cancelled) {
          setRows([]);
          setError(loadError.message || "Unable to load event donations.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadRows();
    return () => { cancelled = true; };
  }, [hasSelectedBranch, organizerBranchNames, selectedBranch]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    const query = searchQuery.trim().toLowerCase();
    if (query && !row.eventName.toLowerCase().includes(query) && !row.branch.toLowerCase().includes(query)) return false;
    if (startDate && row.startDateValue && row.startDateValue < startDate) return false;
    if (endDate && row.startDateValue && row.startDateValue > endDate) return false;
    return true;
  }), [endDate, rows, searchQuery, startDate]);

  const sortedRows = useMemo(() => {
    if (!moneySort) return filteredRows;
    return [...filteredRows].sort((a, b) => {
      const difference = parseMoney(a[moneySort.field]) - parseMoney(b[moneySort.field]);
      return moneySort.direction === "asc" ? difference : -difference;
    });
  }, [filteredRows, moneySort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / rowsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const pagedRows = sortedRows.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage).map((row, index) => ({
    ...row,
    rowNumber: (safePage - 1) * rowsPerPage + index + 1,
  }));
  const updateFilter = (setter) => (value) => { setter(value); setCurrentPage(1); };
  const handleDownload = () => {
    if (downloadCsv(sortedRows, "event-donations.csv")) setShowDownloadAlert(true);
  };

  useEffect(() => {
    if (!showDownloadAlert) return undefined;
    const timeoutId = window.setTimeout(() => setShowDownloadAlert(false), 3000);
    return () => window.clearTimeout(timeoutId);
  }, [showDownloadAlert]);

  return (
    <section className="min-h-[650px] rounded-md border border-border bg-bg-page-white px-7 py-4 shadow-sm">
      {showDownloadAlert && <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/25 pt-10"><AddAlert /></div>}
      {error ? <div className="mb-4 rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      <div className="mb-4 flex flex-col gap-4">
        <h1 className="text-base font-semibold text-secondary">វិភាគទានក្នុងកម្មវិធី</h1>
        <EventDonationFilters searchQuery={searchQuery} onSearchChange={updateFilter(setSearchQuery)} selectedBranch={selectedBranch} onBranchChange={updateFilter(setSelectedBranch)} startDate={startDate} onStartDateChange={updateFilter(setStartDate)} endDate={endDate} onEndDateChange={updateFilter(setEndDate)} branches={branches} branchScoped={branchScoped} />
      </div>
      {hasSelectedBranch ? (
        loading ? (
          <div className="py-10 text-center text-sm text-text-secondary">កំពុងទាញទិន្នន័យ...</div>
        ) : (
          <EventDonationTable rows={pagedRows} currentPage={safePage} totalPages={totalPages} onPageChange={setCurrentPage} onDownload={handleDownload} moneySort={moneySort} onMoneySort={(field) => {
            setMoneySort((current) => ({ field, direction: current?.field === field && current.direction === "asc" ? "desc" : "asc" }));
            setCurrentPage(1);
          }} />
        )
      ) : <div className="min-h-[560px] rounded-sm bg-bg-page-white" />}
    </section>
  );
}

function toDateValue(iso) {
  return iso ? String(iso).slice(0, 10) : "";
}

function sumDonationsByActivity(donations) {
  const totals = new Map();
  donations.forEach((donation) => {
    if (!donation.activityId) return;
    const key = String(donation.activityId);
    const current = totals.get(key) || { amountKhr: 0, amountUsd: 0 };
    current.amountKhr += Number(donation.amountKhr || 0);
    current.amountUsd += Number(donation.amountUsd || 0);
    totals.set(key, current);
  });
  return totals;
}

// Builds one row per ACTIVITY the selected branch had or joined (own-hosted
// or an accepted co-hosting invitation — see /api/backend/activities?
// branchId=), left-joining that branch's recorded donation totals for the
// activity. An activity with no donations yet still gets a row, defaulted
// to 0.
//
// `branchId` is the branch the staff member picked in the filter — it is
// what "owns" this donation-recording context and is what the Detail button
// carries through (so it opens that branch's member list). It is
// deliberately NOT what the "សាខា" column shows: for an own-hosted
// activity the two are the same, but for an activity reached only through
// an accepted co-hosting invitation, the activity's actual organizer is a
// DIFFERENT branch. The column always shows that real organizer (looked up
// via `organizerBranchNames`, an org-wide id->label map), so two branches
// looking at the same shared activity both see who actually ran it, rather
// than the table silently relabeling the same activity with whichever
// branch happens to be selected.
function buildActivityDonationRows(activities, donations, branchId, organizerBranchNames) {
  const totalsByActivity = sumDonationsByActivity(donations);

  return activities.map((activity) => {
    const totals = totalsByActivity.get(String(activity.id)) || { amountKhr: 0, amountUsd: 0 };
    const startDateValue = toDateValue(activity.startsAt);
    const endDateValue = toDateValue(activity.endsAt);
    const start = startDateValue ? new Date(`${startDateValue}T00:00:00`) : null;
    const end = endDateValue ? new Date(`${endDateValue}T00:00:00`) : null;
    const days = start && end
      ? Math.max(1, Math.round((end - start) / 86400000) + 1)
      : 1;
    const organizerBranchLabel =
      organizerBranchNames[String(activity.branchId)] || `#${activity.branchId}`;

    return {
      id: activity.id,
      branchId: Number(branchId),
      organizerBranchId: activity.branchId,
      activityId: activity.id,
      eventName: activity.titleKm || activity.titleEn || "-",
      branch: organizerBranchLabel,
      startDate: startDateValue || "-",
      endDate: endDateValue || "-",
      startDateValue,
      endDateValue,
      days,
      rielAmount: totals.amountKhr.toLocaleString("en-US"),
      dollarAmount: totals.amountUsd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  });
}
