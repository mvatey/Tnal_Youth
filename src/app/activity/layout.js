import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import { BranchProvider } from "@/context/BranchContext";

const userBranches = ["ភ្នំពេញ", "កណ្ដាល"];

export default function ActivityLayout({ children }) {
  return (
    <BranchProvider branches={userBranches}>
      <div className="flex h-screen overflow-hidden bg-bg-page-gray">
        <Sidebar role="secretary" userName="ផាន វិទ្ធី" userTitle="លេខាធិការ" userAvatar="/secretary.jpg" />

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <Topbar title="កម្មវិធី" />

          <main className="flex-1 overflow-hidden bg-bg-page-gray">
            <div className="h-full overflow-y-auto p-5 no-scrollbar">{children}</div>
          </main>
        </div>
      </div>
    </BranchProvider>
  );
}