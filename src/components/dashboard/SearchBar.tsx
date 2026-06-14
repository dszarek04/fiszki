'use client';

import { Search, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useSearch } from '@/hooks/useSearch';

interface SearchBarProps {
  onResults?: (query: string) => void;
}

export function SearchBar({ onResults }: SearchBarProps) {
  const t = useTranslations('dashboard');
  const { query, setQuery, results, isSearching, hasQuery } = useSearch();

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const q = e.target.value;
    setQuery(q);
    onResults?.(q);
  }

  return (
    <div className="relative w-full max-w-sm">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <input
        id="search-bar"
        type="text"
        value={query}
        onChange={handleChange}
        placeholder={t('search')}
        className="w-full rounded-lg border border-border bg-card py-2 pl-9 pr-9 text-sm outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-1 focus:ring-primary/30"
        aria-label="Search flashcards"
      />
      {hasQuery && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}

      {/* Search results dropdown */}
      {hasQuery && results.length > 0 && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
          <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border">
            {results.length === 1 ? t('searchResults', { count: 1 }) : t('searchResultsPlural', { count: results.length })}
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {results.slice(0, 8).map((card) => (
              <li
                key={card.id}
                className="px-3 py-2.5 hover:bg-accent/50 transition-colors cursor-default"
              >
                <p className="text-sm font-medium text-foreground truncate">
                  {card.front.split('\n')[0]}
                </p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">
                  → {card.back}
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasQuery && !isSearching && results.length === 0 && (
        <div className="absolute top-full mt-1 w-full z-50 rounded-xl border border-border bg-popover shadow-lg px-3 py-4 text-center">
          <p className="text-sm text-muted-foreground">{t('emptySearch')}</p>
        </div>
      )}
    </div>
  );
}
