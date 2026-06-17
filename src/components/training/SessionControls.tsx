'use client';

import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThumbsUp, ThumbsDown, Eye, Undo2 } from 'lucide-react';

interface SessionControlsProps {
  isFlipped: boolean;
  onFlip: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
  canGoBack: boolean;
  onGoBack: () => void;
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
  canGoBack,
  onGoBack,
}: SessionControlsProps) {
  const t = useTranslations('training');

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* Action buttons */}
      <div className="relative flex w-full max-w-lg items-center justify-center">
        {canGoBack && (
          <Button
            id="back-btn"
            onClick={onGoBack}
            variant="outline"
            className="absolute left-0 gap-2 border-border/60 py-5 w-[54px] shrink-0 shadow-md flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Previous card"
          >
            <Undo2 className="h-5 w-5" />
          </Button>
        )}
        <div className={cn("flex w-full items-center gap-3", canGoBack ? "pl-[66px]" : "")}>
          {!isFlipped ? (
            /* Reveal button */
            <Button
              id="flip-btn"
              onClick={onFlip}
              className={cn(
                "w-full gap-2 py-5 text-base font-semibold shadow-md",
                canGoBack && "pr-[66px]"
              )}
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
      </div>

      {/* Keyboard hints */}
      <div className="flex flex-wrap items-center justify-center gap-y-1.5 gap-x-1.5 text-[11px] text-muted-foreground">
        {canGoBack && (
          <>
            <KbdBadge>Backspace</KbdBadge>
            <KbdBadge>B</KbdBadge>
            <span>{t('backHint')}</span>
            <span className="mx-1 text-border">·</span>
          </>
        )}
        <KbdBadge>Space</KbdBadge>
        <span>{t('spaceHint')}</span>
        <span className="mx-1 text-border">·</span>
        <KbdBadge>←</KbdBadge>
        <KbdBadge>A</KbdBadge>
        <span>{t('wrongHint')}</span>
        <span className="mx-1 text-border">·</span>
        <span>{t('correctHint')}</span>
        <KbdBadge>D</KbdBadge>
        <KbdBadge>→</KbdBadge>
      </div>
    </div>
  );
}
