"use client";

import { useSearchParams } from "next/navigation";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";

export default function EditSponsorDonationQueryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  return (
    <div className="space-y-4">
      <DonationTabs />
      <SponsorDonationForm donationId={id} />
    </div>
  );
}
