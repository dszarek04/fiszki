'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { db } from '@/lib/db';
import type { Deck } from '@/types';

// ─── useSearch ────────────────────────────────────────────────────────────────
//
// Debounced real-time search across all decks (sets).
//

export function useSearch(debounceMs = 200) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Deck[]>([]);
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
        const found = await db.decks
          .filter((d) => d.name.toLowerCase().includes(lc))
          .toArray();

        setResults(found);
      } finally {
        setIsSearching(false);
      }
    },
    []
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
