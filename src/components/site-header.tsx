'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CafeIcon, LineChartIcon } from './ui/icons';
import { ThemeToggle } from './ui/theme-toggle';
import { cn } from '../utils/cn';

const routes = [
  { href: '/', label: 'Dashboard' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/pos', label: 'POS' },
  { href: '/reports', label: 'Reports' }
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
          <CafeIcon className="h-6 w-6 text-brand" />
          Inventory Café
        </Link>
        <nav className="hidden gap-4 text-sm font-medium md:flex">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                'rounded-md px-3 py-2 transition-colors hover:bg-brand/10',
                pathname === route.href ? 'bg-brand text-white' : 'text-slate-600'
              )}
            >
              {route.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/reports"
            className="hidden items-center gap-2 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:border-brand hover:text-brand lg:flex"
          >
            <LineChartIcon className="h-4 w-4" />
            Daily Z Report
          </Link>
        </div>
      </div>
    </header>
  );
}
