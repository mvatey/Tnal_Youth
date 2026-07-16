import DonationTabs from "@/components/donations/DonationTabs";
import DonationCards from "@/components/donations/DonationCards";
import DonationTable from "@/components/donations/monthlydonation/DonationTable";

export default function AdminDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <DonationCards />
      <DonationTable />
    </div>
  );
}
