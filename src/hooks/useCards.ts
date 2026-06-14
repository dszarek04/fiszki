'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, bulkInsertCards } from '@/lib/db';
import type { Card } from '@/types';

// ─── useCards ─────────────────────────────────────────────────────────────────
//
// Reactive card list for a specific deck.
//

export function useCards(deckId: number | undefined) {
  const cards = useLiveQuery<Card[]>(
    () =>
      deckId !== undefined
        ? db.cards.where('deckId').equals(deckId).sortBy('createdAt')
        : Promise.resolve([]),
    [deckId]
  );

  return {
    cards: cards ?? [],
    isLoading: cards === undefined,
    bulkInsertCards,
  };
}
