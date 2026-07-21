//donation/add 
import { Suspense } from "react";
import AddDonationForm from "@/components/donations/monthlydonation/AddDonationForm";
import DonationTabs from "@/components/donations/DonationTabs";

export default function AddDonationPage() {
  return (
    <div className="space-y-4">
      <DonationTabs />
      <Suspense fallback={null}>
        <AddDonationForm />
      </Suspense>
    </div>
  );
}
