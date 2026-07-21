import DonationCard from "./DonationCard";
import DonorCard from "./DonorCard";
import donationData from "@/data/donation/donationData.json";

const { donationStats } = donationData;

export default function DonationCards() {
  return (
    <div className="flex gap-[50px] xl:grid-cols-2">
      <DonationCard {...donationStats[0]} />
      <DonorCard {...donationStats[1]} />
    </div>
  );
}
