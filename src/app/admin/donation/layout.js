import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

const PAGE_TITLE = "áž€áž¶ážšáž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž áž·ážšáž‰áŸ’áž‰ážœážáŸ’ážáž»";

export const metadata = {
  title: PAGE_TITLE,
};

export default function AdminDonationLayout({ children }) {
  return (
    <div className="flex min-h-screen bg-bg-page-gray">
      <Sidebar
        role="donation_admin"
        userName="áž¢áŸ’áž“áž€áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž€áž¶ážšáž”ážšáž·áž…áŸ’áž…áž¶áž‚"
        userTitle="áž¢áŸ’áž“áž€áž‚áŸ’ážšáž”áŸ‹áž‚áŸ’ážšáž„áž€áž¶ážšáž”ážšáž·áž…áŸ’áž…áž¶áž‚"
        userAvatar="/admin.jpg"
      />

      <div className="flex-1 flex flex-col">
        <Topbar title={PAGE_TITLE} icon="donation" />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
