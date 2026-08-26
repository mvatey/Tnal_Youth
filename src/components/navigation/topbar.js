import PageHeader from "./pageHeader";
import LanguageSwitcher from "./languageSwitcher";
import ThemeToggle from "./themeToggle";
import NotificationBell from "./notificationBell";

export default function Topbar({ title }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-bg-page-white px-3 pl-16 sm:gap-3 sm:px-6 lg:pl-6">
      <PageHeader title={title} />

      <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
