"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import EventDonationDetailCards from "./EventDonationDetailCards";
import EventDonationDetailForm from "./EventDonationDetailForm";
import EventDonationBranchTotals from "./EventDonationBranchTotals";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";

const TABS = [
  { key: "members", label: "សមាជិក" },
  { key: "branch", label: "សាខា" },
  { key: "sponsor", label: "អ្នកឧបត្ថម្ភ" },
];

// The event-donation detail page's three sections (Members / Branch /
// Sponsor) behind one simple tab switcher, always all three — so an
// organizer branch can see every source of income for this activity
// (its members' donations, the per-branch rollup, and its sponsors) in
// one place. The Sponsor tab is literally the same SponsorPanel/GET
// /donations/sponsor the main "ថវិកាឧបត្ថម្ភ" donation tab uses, just
// scoped to this activityId — no separate data source.
export default function EventDonationDetailTabs() {
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch");
  const activityId = searchParams.get("event");

  const [organizerBranchId, setOrganizerBranchId] = useState(null);
  const [activeTab, setActiveTab] = useState("members");

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
        {TABS.map((tab) => (
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

      {activeTab === "sponsor" && (
        <SponsorPanel activityId={activityId} addQuery={addSponsorQuery} />
      )}
    </div>
  );
}
