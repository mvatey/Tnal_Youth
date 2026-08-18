import { Suspense } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationDetailTabs from "@/components/donations/eventdonation/EventDonationDetailTabs";

export default function EventDonationDetailQueryPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <Suspense fallback={null}>
        <EventDonationDetailTabs />
      </Suspense>
    </div>
  );
}
