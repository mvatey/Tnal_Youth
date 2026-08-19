"use client";

import EventDonationDetailCards from "./EventDonationDetailCards";
import EventDonationDetailForm from "./EventDonationDetailForm";

// This used to also render its own Members/Branch/Sponsor tab switcher
// above EventDonationDetailForm -- but EventDonationDetailForm already
// has its own Members/Branch(/Sponsor for the organizer) switcher built
// in, right below its branch+activity filters, so the two ended up
// stacked on the same page (two near-identical tab bars). Removed here;
// EventDonationDetailForm's own switcher is now the only one, and it's
// where the Sponsor tab lives (see EventDonationDetailForm.js).
export default function EventDonationDetailTabs() {
  return (
    <div className="space-y-4">
      <EventDonationDetailCards />

      <EventDonationDetailForm />
    </div>
  );
}
