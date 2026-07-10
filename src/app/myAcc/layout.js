import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";
import AccountProfileContent from "@/components/account/AccountProfileContent";

export default function AccountLayout({ children }) {
  return (
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      <div className="flex min-h-0 flex-1 flex-col">
        <Topbar title="គណនីរបស់ខ្ញុំ" />

        <main className="flex-1 overflow-y-auto p-4">
          <AccountProfileContent>
            {children}
          </AccountProfileContent>
        </main>
      </div>
    </div>
  );
}