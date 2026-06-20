'use client';

import { useLiveQuery } from 'dexie-react-hooks';
import { db, createDeck, deleteDeck, renameDeck } from '@/lib/db';
import type { Deck } from '@/types';

// ─── useDecks ─────────────────────────────────────────────────────────────────
//
// Provides real-time reactive list of all decks plus CRUD helpers.
//

export function useDecks(searchQuery?: string) {
  const decks = useLiveQuery<Deck[]>(
    () => {
      if (searchQuery && searchQuery.trim()) {
        const lc = searchQuery.toLowerCase();
        return db.decks
          .filter((d) => d.name.toLowerCase().includes(lc))
          .toArray()
          .then((arr) => 
            arr.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          );
      }
      return db.decks.orderBy('createdAt').reverse().toArray();
    },
    [searchQuery]
  );

  return {
    decks: decks ?? [],
    isLoading: decks === undefined,
    createDeck,
    deleteDeck,
    renameDeck,
  };
}
