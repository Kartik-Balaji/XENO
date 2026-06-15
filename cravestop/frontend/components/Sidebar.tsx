'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/kitchen', label: 'Kitchen', icon: 'auto_awesome' },
  { href: '/campaigns', label: 'Campaigns', icon: 'send' },
  { href: '/monitor', label: 'Monitor', icon: 'vital_signs' },
  { href: '/analytics', label: 'Analytics', icon: 'bar_chart_4_bars' },
];

export function Sidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-white border-r border-[#E8E0D0] flex flex-col z-20">
      {/* Logo */}
      <div className="px-6 pt-7 pb-6">
        <div className="text-2xl font-bold text-[#D95F2B] tracking-tight">CraveStop</div>
        <div className="text-xs font-medium text-[#A89880] uppercase tracking-widest mt-1">Growth Kitchen • AI Copilot</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 space-y-0.5">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
              isActive(item.href)
                ? 'bg-[#F5E6DC] text-[#D95F2B] border-l-2 border-[#D95F2B]'
                : 'text-[#6B5D52] hover:bg-[#F5F0E8] hover:text-[#1A1410] border-l-2 border-transparent'
            }`}
          >
            <span
              className="material-symbols-outlined text-[18px]"
              style={isActive(item.href) ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* Bottom CTA */}
      <div className="p-4 border-t border-[#E8E0D0]">
        <Link
          href="/kitchen"
          className="flex items-center justify-center gap-2 w-full bg-[#D95F2B] hover:bg-[#C4501F] text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors shadow-sm"
        >
          <span className="material-symbols-outlined text-[16px]">rocket_launch</span>
          Launch New Play
        </Link>
      </div>
    </aside>
  );
}
