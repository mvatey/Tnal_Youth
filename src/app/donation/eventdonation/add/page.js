import { Suspense } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";

export default function AddEventDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <EventDonationSummaryCard value="$0" growth="" note="" />
        <DonorCard label="អ្នកវិភាគទាន" value="0 នាក់" growth="" note="" />
      </div>
      <Suspense fallback={null}>
        <EventDonationDetailForm />
      </Suspense>
    </div>
  );
}
