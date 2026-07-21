// app/donation/layout.js
import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

const PAGE_TITLE = "ការគ្រប់គ្រងហិរញ្ញវត្ថុ";

export const metadata = {
  title: PAGE_TITLE,
};

export default function DonationLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន់ វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar title={PAGE_TITLE} icon="donation" />

        <main className="donation-ui min-h-0 flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}