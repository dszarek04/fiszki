'use client';

import { useTranslations } from 'next-intl';
import { Header } from '@/components/layout/Header';
import { ImportWizard } from '@/components/dashboard/ImportWizard/ImportWizard';
import { SearchBar } from '@/components/dashboard/SearchBar';
import { DeckList } from '@/components/dashboard/DeckList';
import { ResumeSessionBanner } from '@/components/dashboard/ResumeSessionBanner';

export function DashboardPage() {
  const t = useTranslations('dashboard');

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-8 sm:px-6">
        {/* Hero section */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
              {t('title')}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t('subtitle')}</p>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar />
            <ImportWizard />
          </div>
        </div>

        {/* Resume active training session */}
        <ResumeSessionBanner />

        {/* Deck grid */}
        <DeckList />
      </main>
    </div>
  );
}
