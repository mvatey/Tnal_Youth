import { Suspense } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";

export default function AddSponsorDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <Suspense fallback={null}>
        <SponsorDonationForm />
      </Suspense>
    </div>
  );
}
