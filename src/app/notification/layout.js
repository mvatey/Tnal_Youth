import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export default function NotificationLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <Topbar title="ការជូនដំណឹង" />

        <main className="min-h-0 flex-1 overflow-y-auto bg-bg-page-gray p-5 no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}