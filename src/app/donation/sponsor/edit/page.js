"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import DonationTabs from "@/components/donations/DonationTabs";
import SponsorDonationForm from "@/components/donations/sponsor/SponsorDonationForm";

const DONOR_KIND_LABELS = {
  INDIVIDUAL: "បុគ្គល",
  INSTITUTION: "ស្ថាប័ន",
  MEMBER: "សមាជិក",
};

function mapSponsor(record) {
  if (!record) return null;
  return {
    id: record.donationId,
    memberId: record.memberId,
    sponsorId: record.sponsorId,
    type: DONOR_KIND_LABELS[record.donorKind] || record.donorKind,
    name: record.name,
    phone: record.phone,
    email: record.email,
    address: record.address,
    branchId: record.branchId,
    activityId: record.activityId,
    dateValue: record.paidAt?.slice(0, 10),
    rielAmount: record.amountKhr,
    dollarAmount: record.amountUsd,
    method: record.paymentMethodCode,
    equipment: record.materialCategory ? "សម្ភារៈ" : "",
    equipmentType: record.materialCategory,
    equipmentCount: record.materialQuantity,
    equipmentUnit: record.materialQuantityType,
    note: record.note,
  };
}

export default function EditSponsorDonationQueryPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");
  const [sponsor, setSponsor] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    fetch(`/api/backend/donations/sponsor/${encodeURIComponent(id)}`, { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error(body?.message || "Unable to load sponsor donation.");
        if (!cancelled) setSponsor(mapSponsor(body?.data ?? body));
      })
      .catch((loadError) => { if (!cancelled) setError(loadError.message || "Unable to load sponsor donation."); });
    return () => { cancelled = true; };
  }, [id]);

  return (
    <div className="space-y-4">
      <DonationTabs />
      {error ? <div className="rounded-md border border-error/30 bg-error-bg px-4 py-3 text-sm text-error">{error}</div> : null}
      {sponsor ? <SponsorDonationForm initialData={sponsor} /> : null}
    </div>
  );
}
