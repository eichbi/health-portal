'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { href: '/', label: 'Hoy' },
  { href: '/semana', label: 'Semana' },
  { href: '/tendencias', label: 'Tendencias' },
  { href: '/labs', label: 'Labs' },
  { href: '/config', label: 'Config' },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="no-print fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur">
      <ul className="mx-auto flex max-w-2xl pb-[env(safe-area-inset-bottom)]">
        {ITEMS.map((item) => {
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`tap flex flex-col items-center gap-0.5 py-2.5 text-[13px] font-semibold ${
                  active ? 'text-brand' : 'text-ink-faint'
                }`}
              >
                <span
                  aria-hidden
                  className={`h-1 w-8 rounded-full ${active ? 'bg-brand' : 'bg-transparent'}`}
                />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
