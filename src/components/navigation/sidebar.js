"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  FaChevronDown,
  FaUniversity,
  FaUsers,
  FaCalendarAlt,
  FaHandHoldingHeart,
  FaFileAlt,
  FaUserCircle,
  FaCircle,
} from "react-icons/fa";

import { NAV_ITEMS } from "@/lib/navigation";
import ChartIcon from "@/components/ui/icons/chartIcon";

const ICON_MAP = {
  dashboard: ChartIcon,
  building: FaUniversity,
  users: FaUsers,
  calendar: FaCalendarAlt,
  donation: FaHandHoldingHeart,
  file: FaFileAlt,
  profile: FaUserCircle,
};

export default function Sidebar({
  role = "secretary",
  userName = "ផាន វិទ្ធី",
  userTitle = "លេខាធិការ",
  userAvatar,
}) {
  const pathname = usePathname();

  const visibleItems = NAV_ITEMS.filter(
    (item) => Array.isArray(item.roles) && item.roles.includes(role),
  );

  return (
    <aside className="flex min-h-screen w-72 flex-col justify-between bg-primary-sidebar text-white">
      <div>
        <div className="flex flex-col items-center px-6 pb-5 pt-6 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-white">
            <Image
              src="/logo.png"
              alt="សមាគមថ្នាលយុវជនកម្ពុជា"
              width={56}
              height={56}
              className="object-cover"
            />
          </div>

          <h3 className="text-sm font-bold leading-snug">
            សមាគមថ្នាលយុវជនកម្ពុជា
          </h3>

          <p className="mt-1 text-xs text-white/60">
            ការគ្រប់គ្រងប្រព័ន្ធយុវជន
          </p>
        </div>

        <div className="mb-2 px-3">
          <button
            type="button"
            className="flex w-full items-center justify-between gap-2 rounded-lg bg-white/10 px-4 py-2.5 text-sm font-medium transition hover:bg-white/15"
          >
            <span className="flex items-center gap-3">
              <FaUniversity size={16} />
              ជ្រើសរើសសាខា
            </span>

            <FaChevronDown size={12} className="text-white/60" />
          </button>
        </div>

        <nav className="space-y-1 px-3">
          {visibleItems.map((item) => {
            const Icon = ICON_MAP[item.icon] || FaCircle;
            const href = item.hrefByRole?.[role] || item.href || "#";

            const active =
              pathname === href ||
              (href !== "/" && pathname?.startsWith(`${href}/`));

            return (
              <Link
                key={item.id || href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition ${
                  active
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon size={16} className="shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-white/10 px-4 py-4">
        <button
          type="button"
          className="flex w-full items-center justify-between gap-2 rounded-lg px-2 py-2 transition hover:bg-white/5"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10">
              <Image
                src={userAvatar || "/secretary.jpg"}
                alt={userName || "រូបភាពអ្នកប្រើប្រាស់"}
                width={36}
                height={36}
                className="h-full w-full object-cover"
              />
            </div>

            <div className="text-left">
              <div className="text-sm font-medium">{userName}</div>
              <div className="text-xs text-white/50">{userTitle}</div>
            </div>
          </div>

          <FaChevronDown size={12} className="text-white/50" />
        </button>
      </div>
    </aside>
  );
}