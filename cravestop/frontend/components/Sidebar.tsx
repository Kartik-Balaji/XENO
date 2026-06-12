'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';

const navItems = [
  { href: '/', label: 'Growth Kitchen', icon: '✦' },
  { href: '/campaigns', label: 'Campaigns', icon: '▤' },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[220px] min-h-screen border-r border-zinc-800 bg-[#111111] flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 pt-6 pb-4 border-b border-zinc-800">
        <div className="text-base font-bold tracking-tight text-zinc-50">
          Crave<span className="text-orange-500">Stop</span>
        </div>
        <div className="text-xs text-zinc-500 mt-0.5 font-medium">UrbanBite Platform</div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 pt-4 space-y-0.5">
        {navItems.map((item) => {
          const isActive =
            item.href === '/'
              ? pathname === '/'
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors duration-150',
                isActive
                  ? 'bg-zinc-800 text-zinc-50 border-l-2 border-orange-500 rounded-l-none pl-[10px]'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
              )}
            >
              <span className={clsx('text-xs', isActive ? 'text-orange-500' : 'text-zinc-600')}>
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-5 py-4 border-t border-zinc-800">
        <div className="text-xs text-zinc-600">Growth Kitchen v1.0</div>
      </div>
    </aside>
  );
}
