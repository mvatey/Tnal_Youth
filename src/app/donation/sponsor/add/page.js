import DonationTabs from "@/components/donations/DonationTabs";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";

export default function AddSponsorDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <SponsorDonationForm />
    </div>
  );
}
