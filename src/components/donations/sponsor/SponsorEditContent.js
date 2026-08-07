"use client";

import DonationTabs from "@/components/donations/DonationTabs";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";

export default function SponsorEditContent({ id = null }) {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <SponsorDonationForm donationId={id} />
    </div>
  );
}
