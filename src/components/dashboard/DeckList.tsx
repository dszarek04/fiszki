'use client';

import { useTranslations } from 'next-intl';
import { Layers } from 'lucide-react';
import { DeckCard } from './DeckCard';
import { useDecks } from '@/hooks/useDecks';

export function DeckList() {
  const t = useTranslations('dashboard');
  const { decks, isLoading, deleteDeck } = useDecks();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-muted"
          />
        ))}
      </div>
    );
  }

  if (decks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border py-20 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Layers className="h-8 w-8 text-primary/60" />
        </div>
        <div className="space-y-1">
          <p className="text-base font-semibold text-foreground">
            {t('noDecks')}
          </p>
          <p className="text-sm text-muted-foreground">{t('noDecksHint')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          onDelete={deleteDeck}
        />
      ))}
    </div>
  );
}
