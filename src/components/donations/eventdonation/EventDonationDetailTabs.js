"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventDonationDetailCards from "./EventDonationDetailCards";
import EventDonationDetailForm from "./EventDonationDetailForm";
import EventDonationBranchTotals from "./EventDonationBranchTotals";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import useCurrentMember from "@/hooks/useCurrentMember";
import { useBranch } from "@/context/BranchContext";

const BASE_TABS = [
  { key: "members", label: "សមាជិក" },
  { key: "branch", label: "សាខា" },
];

const SPONSOR_TAB = { key: "sponsor", label: "អ្នកឧបត្ថម្ភ" };

// The event-donation detail page's sections (Members / Branch, plus
// Sponsor for the organizing branch) behind one simple tab switcher — so
// an organizer branch can see every source of income for this activity
// (its members' donations, the per-branch rollup, and its sponsors) in
// one place. The Sponsor tab is a read-only GET against the real
// /donations/sponsor data, just filtered to this activityId — no separate
// data source, and no add/edit affordances here (see readOnly on
// SponsorPanel below) since managing sponsor donations belongs to the
// main "ថវិកាឧបត្ថម្ភ" donation module, not this joined view.
export default function EventDonationDetailTabs() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");
  const activityId = searchParams.get("event");

  const { member: currentMember } = useCurrentMember();
  const { branches: accessibleBranches = [] } = useBranch();

  const [organizerBranchId, setOrganizerBranchId] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

  // "Branch organizer" = this account is a secretary/branch_leader with
  // access to the branch that actually hosts this activity — mirrors the
  // backend's own host-branch check (see
  // ActivityMediaServiceImpl#validateManagePermission). Only they get the
  // Sponsor tab; a co-hosting/invited branch, admin, or a viewer does not.
  const isBranchOrganizer =
    ["secretary", "branch_leader"].includes(currentMember?.role) &&
    organizerBranchId != null &&
    accessibleBranches.some(
      (branch) => String(branch.id) === String(organizerBranchId),
    );

  const tabs = isBranchOrganizer ? [...BASE_TABS, SPONSOR_TAB] : BASE_TABS;

  // If the organizer check flips to false after "sponsor" was already the
  // active tab (e.g. organizerBranchId only resolves after this component
  // mounts), fall back to "members" rather than leaving the switcher on a
  // now-hidden tab with nothing rendered under it.
  useEffect(() => {
    if (activeTab === "sponsor" && !isBranchOrganizer) {
      setActiveTab("members");
    }
  }, [activeTab, isBranchOrganizer]);

  useEffect(() => {
    if (!activityId) {
      setOrganizerBranchId(null);
      return undefined;
    }
    let cancelled = false;
    fetch(`/api/backend/activities/${encodeURIComponent(activityId)}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) {
          throw new Error(body?.message || "Unable to load activity.");
        }
        if (!cancelled) setOrganizerBranchId((body?.data ?? body)?.branchId ?? null);
      })
      .catch(() => {
        if (!cancelled) setOrganizerBranchId(null);
      });
    return () => { cancelled = true; };
  }, [activityId]);

  const addSponsorQuery = branchId && activityId
    ? `?branch=${encodeURIComponent(branchId)}&event=${encodeURIComponent(activityId)}`
    : "";

  return (
    <div className="space-y-4">
      <EventDonationDetailCards />

      <nav className="flex gap-2" aria-label="Event donation sections">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`h-9 rounded-lg px-4 text-sm font-medium transition ${
              activeTab === tab.key
                ? "bg-secondary text-white shadow-sm"
                : "bg-bg-page-white text-text-secondary hover:bg-bg-page-gray"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {activeTab === "members" && <EventDonationDetailForm />}

      {activeTab === "branch" && (
        <EventDonationBranchTotals activityId={activityId} organizerBranchId={organizerBranchId} />
      )}

      {activeTab === "sponsor" && isBranchOrganizer && (
        <SponsorPanel activityId={activityId} addQuery={addSponsorQuery} readOnly />
      )}
    </div>
  );
}
