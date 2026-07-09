import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

export const metadata = {
  title: "សេចក្តីជូនដំណឹង",
};

export default function NotificationLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន់ វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      <div className="flex flex-1 flex-col">
        <Topbar title="សេចក្តីជូនដំណឹង" icon="notification" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
