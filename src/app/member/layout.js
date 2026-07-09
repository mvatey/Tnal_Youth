import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export default function Member({ children }) {
  return (
    <div className="h-screen bg-bg-page-gray flex overflow-hidden">
      <Sidebar
        role="secretary"
        userName="ផាន វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <Topbar title="សមាជិក" />

        {/* scroll page but hide scrollbar */}
        <main className=" flex-1  min-h-0  overflow-y-auto  p-5  bg-bg-page-gray no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}