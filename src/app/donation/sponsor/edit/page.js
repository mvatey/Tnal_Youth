import { Suspense } from "react";
import SponsorEditContent from "@/components/donations/sponsor/SponsorEditContent";

export default async function EditSponsorDonationPage({ searchParams }) {
  const { id = null } = (await searchParams) || {};

  return (
    <Suspense fallback={null}>
      <SponsorEditContent id={id} />
    </Suspense>
  );
}
