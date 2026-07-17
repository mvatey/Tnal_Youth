"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DonationTabs from "@/components/donations/DonationTabs";
import DonorCard from "@/components/donations/DonorCard";
import SponsorCard from "@/components/donations/SponsorCard";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";
import donationData from "@/data/donation/donationData.json";
import sponsorData from "@/data/donation/sponsorData.json";

const { donationStats } = donationData;
const { sponsorRows } = sponsorData;

const SPONSOR_CREATED_ROWS_KEY = "tnal-youth:sponsor-donation-created-rows";

export default function EditSponsorDonationQueryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [createdRows, setCreatedRows] = useState([]);

  useEffect(() => {
    const savedValue = window.localStorage.getItem(SPONSOR_CREATED_ROWS_KEY);

    if (!savedValue) return;

    try {
      setCreatedRows(JSON.parse(savedValue));
    } catch {
      setCreatedRows([]);
    }
  }, []);

  const sponsor = useMemo(
    () =>
      [...createdRows, ...sponsorRows].find(
        (row) => String(row.id) === String(id),
      ),
    [createdRows, id],
  );

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
