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
        <main className="no-scrollbar min-h-0 flex-1 overflow-y-auto bg-bg-page-gray p-3 sm:p-4 lg:p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
