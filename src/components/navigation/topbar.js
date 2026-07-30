import PageHeader from "./pageHeader";
import LanguageSwitcher from "./languageSwitcher";
import ThemeToggle from "./themeToggle";
import NotificationBell from "./notificationBell";

export default function Topbar({ title }) {
  return (
    <header className="flex min-h-16 shrink-0 items-center justify-between gap-2 border-b border-border bg-white px-3 py-2 sm:px-4 lg:px-6">
      <PageHeader title={title} />

      <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
