import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

const PAGE_TITLE = "ការគ្រប់គ្រងហិរញ្ញវត្ថុ";

export const metadata = {
  title: PAGE_TITLE,
};

export default function AdminDonationLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-page-gray">
      <Sidebar
        role="donation_admin"
        userName="ថាវរី វតី"
        userTitle="Admin"
        userAvatar="/admin.jpg"
      />

      <div className="flex-1 flex flex-col">
        <Topbar title={PAGE_TITLE} icon="donation" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
