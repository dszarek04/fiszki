'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Eye } from 'lucide-react';

interface SessionControlsProps {
  isFlipped: boolean;
  onFlip: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  currentIndex: number;
  totalCards: number;
}

function KbdBadge({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
      {children}
    </kbd>
  );
}

export function SessionControls({
  isFlipped,
  onFlip,
  onCorrect,
  onIncorrect,
  currentIndex,
  totalCards,
}: SessionControlsProps) {
  const t = useTranslations('training');

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Card counter */}
      <p className="text-sm font-medium text-muted-foreground">
        {t('card')}{' '}
        <span className="font-bold text-foreground">{currentIndex + 1}</span>{' '}
        {t('of')}{' '}
        <span className="font-bold text-foreground">{totalCards}</span>
      </p>

      {/* Action buttons */}
      <div className="flex w-full max-w-lg items-center gap-3">
        {!isFlipped ? (
          /* Flip button */
          <Button
            id="flip-btn"
            onClick={onFlip}
            className="w-full gap-2 py-5 text-base font-semibold shadow-md"
            size="lg"
          >
            <Eye className="h-5 w-5" />
            {t('flip')}
          </Button>
        ) : (
          /* Mark incorrect / correct */
          <>
            <Button
              id="incorrect-btn"
              onClick={onIncorrect}
              variant="outline"
              size="lg"
              className={cn(
                'flex-1 gap-2 border-incorrect/30 py-5 text-base font-semibold',
                'hover:border-incorrect hover:bg-incorrect hover:text-incorrect-fg',
                'transition-all duration-150'
              )}
            >
              <ThumbsDown className="h-5 w-5" />
              {t('incorrect')}
            </Button>
            <Button
              id="correct-btn"
              onClick={onCorrect}
              size="lg"
              className={cn(
                'flex-1 gap-2 border-correct/30 py-5 text-base font-semibold',
                'bg-correct text-correct-fg hover:opacity-90',
                'transition-all duration-150'
              )}
            >
              <ThumbsUp className="h-5 w-5" />
              {t('correct')}
            </Button>
          </>
        )}
      </div>

      {/* Keyboard hints */}
      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        {!isFlipped ? (
          <>
            <KbdBadge>Space</KbdBadge>
            <span>flip card</span>
          </>
        ) : (
          <>
            <KbdBadge>←</KbdBadge>
            <KbdBadge>A</KbdBadge>
            <span>wrong</span>
            <span className="mx-2 text-border">·</span>
            <span>correct</span>
            <KbdBadge>D</KbdBadge>
            <KbdBadge>→</KbdBadge>
          </>
        )}
      </div>
    </div>
  );
}
