import { Suspense } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";

export default async function AdminEventDonationDetailPage({ searchParams }) {
  const initialQuery = (await searchParams) || {};

  return (
    <div className="space-y-4">
      <DonationTabs />
      <Suspense fallback={null}>
        <EventDonationDetailForm initialQuery={initialQuery} />
      </Suspense>
    </div>
  );
}
