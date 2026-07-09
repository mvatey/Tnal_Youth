import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export default function ActivityLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      <div className="flex-1 flex flex-col min-h-0">
        <Topbar title="កម្មវិធី" />

        <main className="flex-1 overflow-y-auto p-4">{children}</main>
      </div>
    </div>
  );
}