"use client";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import { useLanguage } from "@/context/LanguageContext";

export default function ActivityLayout({ children }) {
  const { t } = useLanguage();

  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
        <Sidebar role="secretary" userName="ផាន វិទ្ធី" userTitle="លេខាធិការ" userAvatar="/secretary.jpg" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar title={t("activityPage.title")} />

          <main className="flex-1 overflow-hidden bg-bg-page-gray">
            <div className="activity-ui h-full overflow-y-auto p-5 no-scrollbar">{children}</div>
          </main>
        </div>
    </div>
  );
}
