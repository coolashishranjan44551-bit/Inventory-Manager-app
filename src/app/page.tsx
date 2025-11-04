import type { ReactNode } from 'react';
import Link from 'next/link';
import { ArrowRightIcon, LineChartIcon, PackageIcon } from '../components/ui/icons';

const heroCards = [
  {
    title: 'Real-time Inventory',
    description: 'Track stock, suppliers, and purchase orders with automated low-stock alerts.',
    href: '/inventory'
  },
  {
    title: 'Offline-first POS',
    description: 'Capture dine-in and takeaway orders even without internet connectivity.',
    href: '/pos'
  },
  {
    title: 'Daily Insights',
    description: 'Generate GST-ready bills, payment breakdowns, and end-of-day Z reports.',
    href: '/reports'
  }
];

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="grid gap-10 lg:grid-cols-[2fr,1fr] lg:items-center">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-brand/10 px-3 py-1 text-sm font-semibold text-brand">
            Multi-tenant café OS
          </span>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            Stay on top of inventory and café operations wherever you are.
          </h1>
          <p className="text-lg text-slate-600">
            A single workspace for owners, managers, and staff to collaborate on stock, menu, and orders. Works offline, prints thermal receipts, and syncs with Supabase in real time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-md bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand/90"
            >
              Launch App
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
            <Link
              href="/docs/setup"
              className="inline-flex items-center gap-2 rounded-md border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-brand hover:text-brand"
            >
              Deployment Guide
            </Link>
          </div>
        </div>
        <div className="grid gap-4">
          <DashboardHighlight
            icon={<PackageIcon className="h-5 w-5 text-brand" />}
            title="Inventory Snapshot"
            description="24 SKUs below threshold, 2 pending purchase orders"
          />
          <DashboardHighlight
            icon={<LineChartIcon className="h-5 w-5 text-brand" />}
            title="Today&apos;s Revenue"
            description="₹42,180 across UPI, cash, and cards"
          />
          <DashboardHighlight
            icon={<ArrowRightIcon className="h-5 w-5 text-brand" />}
            title="Sync Status"
            description="Last offline sync 12 minutes ago"
          />
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-3">
        {heroCards.map((card) => (
          <div key={card.title} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">{card.title}</h3>
            <p className="mt-2 text-sm text-slate-600">{card.description}</p>
            <Link
              href={card.href}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-brand"
            >
              Explore
              <ArrowRightIcon className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>
    </div>
  );
}

interface DashboardHighlightProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function DashboardHighlight({ icon, title, description }: DashboardHighlightProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand/10 text-brand">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-slate-900">{title}</p>
        <p className="text-xs text-slate-600">{description}</p>
      </div>
    </div>
  );
}
