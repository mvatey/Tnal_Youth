import DonationTabs from "@/components/donations/DonationTabs";
import DonorCard from "@/components/donations/DonorCard";
import SponsorCard from "@/components/donations/SponsorCard";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";
import { donationStats } from "@/data/donationData";

export default function AddSponsorDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <SponsorCard />
        <DonorCard {...donationStats[1]} />
      </div>
      <SponsorDonationForm />
    </div>
  );
}
