// components/navigation/PageHeader.jsx
"use client";
import { usePathname } from "next/navigation";
import { FaBuilding, FaUsers, FaUserShield, FaCalendarAlt, FaHandHoldingHeart, FaFileAlt, FaUserCircle, FaCog, FaBell} from "react-icons/fa";
import { NAV_ITEMS } from "@/lib/navigation";
import ChartIcon from "@/components/ui/icons/chartIcon";
import { useLanguage } from "@/context/LanguageContext";

const ICON_MAP = {
  dashboard: ChartIcon,
  building: FaBuilding,
  users: FaUsers,
  userAccounts: FaUserShield,
  calendar: FaCalendarAlt,
  donation: FaHandHoldingHeart,
  file: FaFileAlt,
  profile: FaUserCircle,
  settings: FaCog,
  bell: FaBell,
};

export default function PageHeader() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );

  if (!current) return null;

  const Icon = ICON_MAP[current.icon];

  return (
    <div className="flex min-w-0 items-center gap-2 sm:gap-3">
      <div className="hidden h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-primary-light sm:flex">
        {Icon && <Icon size={16} className="text-primary" />}
      </div>
      <h1 className="min-w-0 truncate text-sm font-bold leading-tight text-text-primary sm:text-base">
        {t(current.labelKey, current.label)}
      </h1>
    </div>
  );
}
