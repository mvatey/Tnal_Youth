"use client";

import { Suspense } from "react";
import { CircleDollarSign, Users } from "lucide-react";
import DonationTabs from "@/components/donations/DonationTabs";
import StatCard from "@/components/dashboard/statCard";
import EventDonationDetailForm from "@/components/donations/eventdonation/EventDonationDetailForm";
import { useLanguage } from "@/context/LanguageContext";

export default function AddEventDonationPage() {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <DonationTabs />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <StatCard
          icon={CircleDollarSign}
          label={t("donationPage.eventDonationTitle")}
          value="$0"
          iconColor="text-success"
          iconBg="bg-success-bg"
        />
        <StatCard
          icon={Users}
          label={t("donationPage.donor")}
          value={`0 ${t("donationPage.personUnit")}`}
          iconColor="text-primary"
          iconBg="bg-secondary-light"
        />
      </div>
      <Suspense fallback={null}>
        <EventDonationDetailForm />
      </Suspense>
    </div>
  );
}
