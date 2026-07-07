import DonationTabs from "@/components/dashboard/DonationTabs";
import DonationCards from "@/components/dashboard/DonationCards";
import DonationTable from "@/components/dashboard/DonationTable";

export default function DonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <DonationCards />
      <DonationTable />
    </div>
  );
}
