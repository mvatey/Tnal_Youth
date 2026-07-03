'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { FaChevronDown, FaChartBar, FaUsers, FaCalendar, FaHandshake, FaFile } from 'react-icons/fa';

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { id: 'dashboard', label: 'ជ្រើសរើសសាខា', href: '/', icon: FaChevronDown },
    { id: 'members', label: 'ផ្ទាំងគ្រប់គ្រង', href: '/members', icon: FaChartBar },
    { id: 'donation', label: 'សមាជិក', href: '/donation', icon: FaUsers },
    { id: 'reports', label: 'កម្មវិធី', href: '/reports', icon: FaCalendar },
    { id: 'settings', label: 'វិភាគទាន', href: '/settings', icon: FaHandshake },
    { id: 'document', label: 'ឯកសារ', href: '/document', icon: FaFile },
    { id: 'profile', label: 'ប្រវត្តិរូប', href: '/profile', icon: FaUsers },
  ];

  return (
    <aside className="w-64 bg-[#1f2340] text-white min-h-screen flex flex-col justify-between">
      <div>
        <div className="px-6 pt-6 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
              <Image 
                src="/logo.jpg" 
                alt="Logo" 
                width={48} 
                height={48}
                className="w-12 h-12 rounded-full object-cover"
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold">សមាគមថ្នាលយុវជនកម្ពុជា</h3>
              <p className="text-xs text-white/70">ការគ្រប់គ្រងប្រព័ន្ធយុវជន</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            return (
              <Link key={item.id} href={item.href} className={`flex items-center gap-3 px-6 py-3 hover:bg-white/5 transition ${active ? 'bg-white/5 border-l-4 border-purple-500' : ''}`}>
                <IconComponent className="w-5 h-5" />
                <div className="text-sm font-medium">{item.label}</div>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="p-6 border-t border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">👤</div>
          <div>
            <div className="text-sm font-medium">ផាន់ រិទ្ធី</div>
            <div className="text-xs text-white/60">លេខាធិការ</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
