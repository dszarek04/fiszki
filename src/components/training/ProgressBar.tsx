'use client';

import { cn } from '@/lib/utils';
import type { CardResult } from '@/types';

interface ProgressBarProps {
  totalCards: number;
  results: CardResult[];
  currentIndex: number;
}

export function ProgressBar({
  totalCards,
  results,
  currentIndex,
}: ProgressBarProps) {
  const answered = results.length;
  const remaining = totalCards - answered;

  return (
    <div className="w-full space-y-2" role="progressbar" aria-valuenow={answered} aria-valuemax={totalCards}>
      {/* Segmented bar */}
      <div className="flex h-2.5 w-full gap-0.5 overflow-hidden rounded-full bg-muted">
        {Array.from({ length: totalCards }).map((_, i) => {
          const result = results[i];
          const isCurrent = i === currentIndex && !result;
          return (
            <div
              key={i}
              className={cn(
                'flex-1 rounded-full transition-all duration-300',
                result
                  ? result.correct
                    ? 'bg-correct'
                    : 'bg-incorrect'
                  : isCurrent
                    ? 'bg-primary/40 animate-pulse'
                    : 'bg-border'
              )}
            />
          );
        })}
      </div>

      {/* Stats row */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          {results.filter((r) => r.correct).length > 0 && (
            <span className="flex items-center gap-1 text-correct font-medium">
              <span className="h-2 w-2 rounded-full bg-correct" />
              {results.filter((r) => r.correct).length} correct
            </span>
          )}
          {results.filter((r) => !r.correct).length > 0 && (
            <span className="flex items-center gap-1 text-incorrect font-medium">
              <span className="h-2 w-2 rounded-full bg-incorrect" />
              {results.filter((r) => !r.correct).length} incorrect
            </span>
          )}
        </div>
        <span>
          {answered} / {totalCards}
        </span>
      </div>
    </div>
  );
}
