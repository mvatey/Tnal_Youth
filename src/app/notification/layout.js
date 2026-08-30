"use client";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import { useLanguage } from "@/context/LanguageContext";

export default function NotificationLayout({ children }) {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar title={t("notificationPage.title")} />

        <main className="min-h-0 flex-1 overflow-y-auto bg-bg-page-gray p-5 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}