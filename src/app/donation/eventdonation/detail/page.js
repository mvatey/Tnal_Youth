import { Suspense } from "react";
import EventDonationDetailTabs from "@/components/donations/eventdonation/EventDonationDetailTabs";

// The big top-level donation-module nav (Monthly/Event/Sponsor — see
// DonationTabs) used to render here too, on top of this page's own
// Members/Branch/Sponsor switcher (EventDonationDetailTabs) -- two
// visually-similar tab bars stacked on one screen. This page is reached
// straight from a specific activity's own "ចំណូល" link, not from browsing
// the donation module itself, so that outer module nav never belonged
// here in the first place -- removed, keeping only the one tab bar that's
// actually scoped to this activity.
export default function EventDonationDetailQueryPage() {
  return (
    <div className="space-y-4">
      <Suspense fallback={null}>
        <EventDonationDetailTabs />
      </Suspense>
    </div>
  );
}
