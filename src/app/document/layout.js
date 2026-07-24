"use client";

import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export default function DocumentLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <Topbar title="ឯកសារ" />

        <main className="no-scrollbar flex-1 overflow-y-auto p-5">
          {children}
        </main>
      </div>
    </div>
  );
}