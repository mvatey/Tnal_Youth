"use client";

import { Suspense } from "react";
import DonationTabs from "@/components/donations/DonationTabs";
import EventDonationSummaryCard from "@/components/donations/EventDonationSummaryCard";
import DonorCard from "@/components/donations/DonorCard";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";
import { useLanguage } from "@/context/LanguageContext";

export default function AddEventDonationPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="flex gap-[50px] xl:grid-cols-2">
        <EventDonationSummaryCard label={t("donationPage.eventDonationTitle")} value="$0" growth="" note="" />
        <DonorCard label={t("donationPage.donor")} value={`0 ${t("donationPage.personUnit")}`} growth="" note="" />
      </div>
      <Suspense fallback={null}>
        <EventDonationDetailForm />
      </Suspense>
    </div>
  );
}
