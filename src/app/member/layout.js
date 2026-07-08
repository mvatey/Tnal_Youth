// app/dashboard/layout.jsx
import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export default function Member({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-page-gray">
      <Sidebar role="secretary" userName="ផាន វិទ្ធី" userTitle="លេខាធិការ" userAvatar="/secretary.jpg" />
      <div className="flex-1 flex flex-col">
        <Topbar title="សមាជិក"/>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}