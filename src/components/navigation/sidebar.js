// components/navigation/Sidebar.jsx
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  FaChevronDown,
  FaUniversity,
  FaUsers,
  FaCalendarAlt,
  FaHandHoldingHeart,
  FaFileAlt,
  FaUserCircle,
} from 'react-icons/fa';
import { BarChart2 } from "lucide-react";
import { NAV_ITEMS } from '@/lib/navigation';
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

export default function Sidebar({ role = 'secretary', userName = 'ផាន វិទ្ធី', userTitle = 'លេខាធិការ', userAvatar }) {
  const pathname = usePathname();
  const visibleItems = NAV_ITEMS.filter((item) => item.roles.includes(role));

  return (
    <aside className="w-72 bg-primary-sidebar text-white min-h-screen flex flex-col justify-between">
      <div>
        {/* Header — stacked, centered */}
        <div className="px-6 pt-6 pb-5 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-white flex items-center justify-center overflow-hidden mb-3">
            <Image src="/logo.png" alt="Logo" width={56} height={56} className="object-cover" />
          </div>
          <h3 className="text-sm font-bold leading-snug">សមាគមថ្នាលយុវជនកម្ពុជា</h3>
          <p className="text-xs text-white/60 mt-1">ការគ្រប់គ្រងប្រព័ន្ធយុវជន</p>
        </div>

        {/* Branch selector — match nav item sizing */}
        <div className="px-3 mb-2">
          <button className="w-full flex items-center justify-between gap-2 bg-white/10 hover:bg-white/15 transition rounded-lg px-4 py-2.5 text-sm font-medium">
          <span className="flex items-center gap-3">
            <FaUniversity size={16} />
            ជ្រើសរើសសាខា
          </span>
          <FaChevronDown size={12} className="text-white/60" />
        </button>
        </div>

        {/* Nav items */}
        <nav className="px-3 space-y-1">
          {visibleItems.map((item) => {
            const Icon = ICON_MAP[item.icon];
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link
                key={item.id}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition ${
                  active ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

            {/* User footer */}
      <div className="px-4 py-4 border-t border-white/10">
        <button className="w-full flex items-center justify-between gap-2 hover:bg-white/5 rounded-lg px-2 py-2 transition">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image
                src={userAvatar || "secretary.jpg"}
                alt={userName}
                width={36}
                height={36}
                className="w-full h-full object-cover"
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