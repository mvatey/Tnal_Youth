"use client";

import { useEffect, useState } from "react";
import DonationCard from "./DonationCard";
import DonorCard from "./DonorCard";

export default function DonationCards() {
  const [summary, setSummary] = useState({ totalUsd: 0, donors: 0 });

  useEffect(() => {
    fetch("/api/backend/donations/monthly?page=0&size=100", { cache: "no-store" })
      .then(async (response) => {
        const body = await response.json().catch(() => null);
        if (!response.ok || body?.success === false) throw new Error();
        const page = body?.data ?? body;
        const rows = Array.isArray(page?.items) ? page.items : [];
        setSummary(rows.reduce((total, row) => ({
          totalUsd: total.totalUsd + Number(row.overallTotalUsd || 0),
          donors: total.donors + Number(row.donorCount || 0),
        }), { totalUsd: 0, donors: 0 }));
      })
      .catch(() => setSummary({ totalUsd: 0, donors: 0 }));
  }, []);

  return (
    <div className="flex gap-[50px] xl:grid-cols-2">
      <DonationCard label="ថវិកាប្រចាំខែ" value={`$${summary.totalUsd.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} growth="0%" note="ក្នុងខែនេះ" />
      <DonorCard label="អ្នកបរិច្ចាគសរុប" value={`${summary.donors} នាក់`} growth="0%" note="ក្នុងខែនេះ" />
    </div>
  );
}
