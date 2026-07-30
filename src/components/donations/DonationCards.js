import DonationCard from "./DonationCard";
import DonorCard from "./DonorCard";
import donationData from "@/data/donation/donationData.json";

const { donationRows, donationStats } = donationData;
const parseMoney = (value) =>
  Number(String(value || "").replace(/[^\d.-]/g, "")) || 0;

export default function DonationCards() {
  const monthlyTotal = donationRows.reduce(
    (total, row) => total + parseMoney(row.total),
    0,
  );

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 [&>*]:w-full">
      <DonationCard
        {...donationStats[0]}
        value={`$${monthlyTotal.toLocaleString()}`}
      />
      <DonorCard {...donationStats[1]} />
    </div>
  );
}
