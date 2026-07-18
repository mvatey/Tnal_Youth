"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";
import sponsorData from "@/data/donation/sponsorData.json";

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
      <SponsorDonationForm initialData={sponsor} />
    </div>
  );
}
