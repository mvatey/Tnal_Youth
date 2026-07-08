// components/navigation/PageHeader.jsx
"use client";
import { usePathname } from "next/navigation";
import { FaBuilding, FaUsers, FaCalendarAlt, FaHandHoldingHeart, FaFileAlt, FaUserCircle, FaCog } from "react-icons/fa";
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
};

export default function PageHeader({ title, icon }) {
  const pathname = usePathname();
  const current = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname?.startsWith(item.href + "/")
  );

  const headerTitle = title || current?.label;
  const headerIcon = icon || current?.icon;

  if (!headerTitle) return null;

  const Icon = ICON_MAP[headerIcon];

  return (
    <div className="flex items-center gap-3">
      {Icon && (
        <Icon size={22} className="shrink-0 text-primary" />
      )}
      <h1 className="text-base font-bold text-text-primary">{headerTitle}</h1>
    </div>
  );
}
