'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, createDeck, deleteDeck, renameDeck } from '@/lib/db';
import type { Deck } from '@/types';

// ─── useDecks ─────────────────────────────────────────────────────────────────
//
// Provides real-time reactive list of all decks plus CRUD helpers.
//

export function useDecks() {
  const decks = useLiveQuery<Deck[]>(
    () => db.decks.orderBy('createdAt').reverse().toArray(),
    []
  );

  return {
    decks: decks ?? [],
    isLoading: decks === undefined,
    createDeck,
    deleteDeck,
    renameDeck,
  };
}
