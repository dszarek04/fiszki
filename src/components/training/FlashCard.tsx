'use client';

import { cn } from '@/lib/utils';
import type { Card } from '@/types';

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
}

export function FlashCard({ card, isFlipped, onFlip }: FlashCardProps) {
  return (
    <div
      className="card-flip-scene w-full"
      style={{ height: 'clamp(280px, 40vh, 420px)' }}
    >
      <div
        className={cn('card-flip-inner', isFlipped && 'flipped')}
        onClick={onFlip}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onFlip()}
        aria-label={isFlipped ? 'Hide answer' : 'Reveal answer'}
      >
        {/* Front Face */}
        <div
          className="card-face flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-8 shadow-lg cursor-pointer hover:border-primary/40 hover:shadow-primary/10"
        >
          <div className="absolute top-4 left-4 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
            Question
          </div>

          <div className="w-full max-w-2xl">
            <pre className="whitespace-pre-wrap break-words text-center font-sans text-lg font-semibold leading-relaxed text-foreground sm:text-xl">
              {card.front}
            </pre>
          </div>

          {!isFlipped && (
            <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                Space
              </span>
              <span>to reveal</span>
            </div>
          )}
        </div>

        {/* Back Face */}
        <div
          className="card-face card-face-back flex flex-col items-center justify-center rounded-2xl border border-correct/30 bg-card p-8 shadow-lg cursor-pointer hover:border-correct/50 hover:shadow-correct/5"
        >
          <div className="absolute top-4 left-4 rounded-lg bg-correct/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-correct">
            Answer
          </div>

          <div className="w-full max-w-2xl">
            <pre className="whitespace-pre-wrap break-words text-center font-sans text-xl font-bold leading-relaxed text-correct sm:text-2xl">
              {card.back}
            </pre>
          </div>

          {isFlipped && (
            <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                Space
              </span>
              <span>to hide</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
