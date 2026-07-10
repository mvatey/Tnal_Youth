// app/donation/layout.js
import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

const PAGE_TITLE = "ការគ្រប់គ្រងហិរញ្ញវត្ថុ";

export const metadata = {
  title: PAGE_TITLE,
};

export default function DonationLayout({ children }) {
  return (
    // h-screen + overflow-hidden on the outer shell: this element itself
    // never scrolls. Sidebar and Topbar are pinned; only <main> below
    // gets its own independent scroll container.
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន់ វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      {/* min-h-0 is required here: without it, a flex child won't shrink
          below its content size, which would silently break the overflow
          scroll on <main> below (a classic flexbox gotcha). */}
      <div className="flex-1 flex flex-col min-h-0">
        <Topbar title={PAGE_TITLE} icon="donation" />

        {/* The only scrollable element on the page. flex-1 lets it fill
            the remaining height below Topbar; overflow-y-auto gives it
            its own scrollbar instead of scrolling the whole window. */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-bg-page-gray no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}// app/donation/layout.js
import Sidebar from "@/components/navigation/sidebar";
import Topbar from "@/components/navigation/topbar";

const PAGE_TITLE = "ការគ្រប់គ្រងហិរញ្ញវត្ថុ";

export const metadata = {
  title: PAGE_TITLE,
};

export default function DonationLayout({ children }) {
  return (
    // h-screen + overflow-hidden on the outer shell: this element itself
    // never scrolls. Sidebar and Topbar are pinned; only <main> below
    // gets its own independent scroll container.
    <div className="flex h-screen overflow-hidden bg-bg-page-gray">
      <Sidebar
        role="secretary"
        userName="ផាន់ វិទ្ធី"
        userTitle="លេខាធិការ"
        userAvatar="/secretary.jpg"
      />

      {/* min-h-0 is required here: without it, a flex child won't shrink
          below its content size, which would silently break the overflow
          scroll on <main> below (a classic flexbox gotcha). */}
      <div className="flex-1 flex flex-col min-h-0">
        <Topbar title={PAGE_TITLE} icon="donation" />

        {/* The only scrollable element on the page. flex-1 lets it fill
            the remaining height below Topbar; overflow-y-auto gives it
            its own scrollbar instead of scrolling the whole window. */}
        <main className="flex-1 min-h-0 overflow-y-auto p-6 bg-bg-page-gray no-scrollbar">
          {children}
        </main>
      </div>
    </div>
  );
}