// components/navigation/PageHeader.jsx
"use client";
import { usePathname } from "next/navigation";
import { FaBuilding, FaUsers, FaCalendarAlt, FaHandHoldingHeart, FaFileAlt, FaUserCircle, FaCog, FaBell} from "react-icons/fa";
import { NAV_ITEMS } from "@/lib/navigation";
import ChartIcon from "@/components/ui/icons/chartIcon";

const ICON_MAP = {
  dashboard: ChartIcon,
  building: FaBuilding,
  users: FaUsers,
  calendar: FaCalendarAlt,
  donation: FaHandHoldingHeart,
  file: FaFileAlt,
  profile: FaUserCircle,
  settings: FaCog,
  bell: FaBell,
};

export default function PageHeader() {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );

  if (!current) return null;

  const Icon = ICON_MAP[current.icon];

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 h-8 rounded-md bg-primary-light flex items-center justify-center flex-shrink-0">
        <Icon size={16} className="text-primary" />
      </div>
      <h1 className="text-base font-bold text-text-primary">{current.label}</h1>
    </div>
  );
}
