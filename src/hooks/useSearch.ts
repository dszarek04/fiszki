'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { db, searchCards } from '@/lib/db';
import type { Card } from '@/types';

// ─── useSearch ────────────────────────────────────────────────────────────────
//
// Debounced real-time search across all cards (or within a single deck).
//

export function useSearch(deckId?: number, debounceMs = 200) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Card[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const executeSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) {
        setResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const lc = q.toLowerCase();
        let found: Card[];

        if (deckId !== undefined) {
          // Scoped to a single deck
          found = await db.cards
            .where('deckId')
            .equals(deckId)
            .filter(
              (c) =>
                c.front.toLowerCase().includes(lc) ||
                c.back.toLowerCase().includes(lc)
            )
            .toArray();
        } else {
          // Global search
          found = await searchCards(q);
        }

        setResults(found);
      } finally {
        setIsSearching(false);
      }
    },
    [deckId]
  );

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      executeSearch(query);
    }, debounceMs);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, debounceMs, executeSearch]);

  return {
    query,
    setQuery,
    results,
    isSearching,
    hasQuery: query.trim().length > 0,
  };
}
