import type { Metadata } from 'next';
import '../styles/globals.css';
import { ReactNode } from 'react';
import { ThemeProvider } from '../components/theme-provider';
import { QueryProvider } from '../components/query-provider';
import { SiteHeader } from '../components/site-header';
import { Toaster } from '../components/ui/toaster';

export const metadata: Metadata = {
  title: 'Inventory & Café Manager',
  description:
    'Multi-tenant inventory and POS platform for cafés with offline-ready PWA experience.'
};

interface RootLayoutProps {
  children: ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-50 font-sans">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <SiteHeader />
              <main className="container mx-auto flex-1 px-4 py-8 lg:px-8">
                {children}
              </main>
            </div>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
