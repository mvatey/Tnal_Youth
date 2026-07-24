import PageHeader from "./pageHeader";
import LanguageSwitcher from "./languageSwitcher";
import ThemeToggle from "./themeToggle";
import NotificationBell from "./notificationBell";

export default function Topbar({ title }) {
  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-6">
      <PageHeader title={title} />

      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}