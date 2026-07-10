import { notFound } from "next/navigation";
import DonationTabs from "@/components/donations/DonationTabs";
import DonorCard from "@/components/donations/DonorCard";
import SponsorCard from "@/components/donations/SponsorCard";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";
import { donationStats } from "@/data/donationData";
import { sponsorRows } from "@/data/sponsorData";

export default async function EditSponsorDonationPage({ params }) {
  const { id } = await params;
  const sponsor = sponsorRows.find((row) => String(row.id) === String(id));

  if (!sponsor) {
    notFound();
  }

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <SponsorCard />
        <DonorCard {...donationStats[1]} />
      </div>
      <SponsorDonationForm initialData={sponsor} />
    </div>
  );
}
