import AddDonationForm from "@/components/donations/AddDonationForm";
import DonationCards from "@/components/donations/DonationCards";
import DonationTabs from "@/components/donations/DonationTabs";

export default function AddDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <DonationCards />
      <AddDonationForm />
    </div>
  );
}
