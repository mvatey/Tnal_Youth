// app/dashboard/layout.jsx
import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-page-gray">
      <Sidebar role="secretary" userName="ផាន វិទ្ធី" userTitle="លេខាធិការ" userAvatar="/secretary.jpg" />
      <div className="flex-1 flex flex-col">
        <Topbar title="ផ្ទាំងគ្រប់គ្រង" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}