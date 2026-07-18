import { Suspense } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationDetailCards from "@/components/donations/eventdonation/EventDonationDetailCards";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";

export default function EventDonationDetailQueryPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <Suspense fallback={null}>
        <EventDonationDetailCards />
        <EventDonationDetailForm />
      </Suspense>
    </div>
  );
}
