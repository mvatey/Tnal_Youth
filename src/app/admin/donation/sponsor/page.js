import DonationTabs from "@/components/donations/DonationTabs";
import SponsorCard from "@/components/donations/SponsorCard";
import DonorCard from "@/components/donations/DonorCard";
import SponsorPanel from "@/components/donations/sponsor/SponsorPanel";
import donationData from "@/data/donation/donationData.json";

const { donationStats } = donationData;

export default function AdminSponsorPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <SponsorCard />
        <DonorCard {...donationStats[1]} />
      </div>
      <SponsorPanel />
    </div>
  );
}
