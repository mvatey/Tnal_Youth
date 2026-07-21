// components/navigation/Topbar.jsx
import PageHeader from "./pageHeader";
import LanguageSwitcher from "./languageSwitcher";
import ThemeToggle from "./themeToggle";
import NotificationBell from "./notificationBell";

export default function Topbar({ title, icon }) {
  return (
    <header className="h-16 bg-white border-b border-border flex items-center justify-between px-6">
      <PageHeader title={title} icon={icon} />
      <div className="flex items-center gap-3">
        <LanguageSwitcher />
        <ThemeToggle />
        <NotificationBell />
      </div>
    </header>
  );
}
