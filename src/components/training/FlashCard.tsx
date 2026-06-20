'use client';

import { useState, useRef, useImperativeHandle, forwardRef } from 'react';
import { useTranslations } from 'next-intl';
import { cn } from '@/lib/utils';
import type { Card } from '@/types';
import { Check, X } from 'lucide-react';
import { MathRenderer } from '@/components/ui/MathRenderer';

export interface FlashCardHandle {
  swipeLeft: () => void;
  swipeRight: () => void;
}

interface FlashCardProps {
  card: Card;
  isFlipped: boolean;
  onFlip: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

function CardSwipeOverlay({ x }: { x: number }) {
  if (x === 0) return null;

  const opacity = Math.min(Math.abs(x) / 140, 0.9);
  const isRight = x > 0;

  return (
    <div
      className={cn(
        "absolute inset-0 z-50 flex items-center justify-center rounded-2xl pointer-events-none transition-opacity duration-75",
        isRight 
          ? "bg-correct/15 border-2 border-correct/40" 
          : "bg-incorrect/15 border-2 border-incorrect/40"
      )}
      style={{ opacity }}
    >
      <div
        className={cn(
          "flex items-center justify-center rounded-full p-6 shadow-2xl transition-transform duration-100",
          isRight ? "bg-correct text-correct-fg" : "bg-incorrect text-incorrect-fg"
        )}
        style={{
          transform: `scale(${0.7 + Math.min(Math.abs(x) / 300, 0.3)})`,
        }}
      >
        {isRight ? (
          <Check className="h-12 w-12 stroke-[3.5]" />
        ) : (
          <X className="h-12 w-12 stroke-[3.5]" />
        )}
      </div>
    </div>
  );
}

const getFontSizeClass = (text: string) => {
  const len = text.length;
  if (len > 350) return 'text-xs sm:text-xs leading-tight';
  if (len > 220) return 'text-sm sm:text-sm leading-normal';
  if (len > 120) return 'text-base sm:text-base leading-relaxed';
  return 'text-lg sm:text-xl leading-relaxed';
};

export const FlashCard = forwardRef<FlashCardHandle, FlashCardProps>(
  ({ card, isFlipped, onFlip, onSwipeLeft, onSwipeRight }, ref) => {
    const t = useTranslations('training');

    const [x, setX] = useState(0);
    const [y, setY] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    const startXRef = useRef(0);
    const startYRef = useRef(0);
    const hasDraggedRef = useRef(false);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
      if (isAnimatingOut) return;
      if (e.button !== 0) return; // Only drag with primary mouse button
      
      setIsDragging(true);
      hasDraggedRef.current = false;
      startXRef.current = e.clientX;
      startYRef.current = e.clientY;
      
      e.currentTarget.setPointerCapture(e.pointerId);
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || isAnimatingOut) return;
      
      const deltaX = e.clientX - startXRef.current;
      const deltaY = e.clientY - startYRef.current;
      
      if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
        hasDraggedRef.current = true;
      }
      
      setX(deltaX);
      setY(deltaY);
    };

    const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || isAnimatingOut) return;
      
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      
      const threshold = 120;
      if (x > threshold) {
        triggerSwipeOut('right');
      } else if (x < -threshold) {
        triggerSwipeOut('left');
      } else {
        setX(0);
        setY(0);
      }
    };

    const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || isAnimatingOut) return;
      setIsDragging(false);
      e.currentTarget.releasePointerCapture(e.pointerId);
      setX(0);
      setY(0);
    };

    const triggerSwipeOut = (direction: 'left' | 'right') => {
      setIsAnimatingOut(true);
      const targetX = direction === 'right' ? 800 : -800;
      setX(targetX);
      setY(0);

      const callback = direction === 'right' ? onSwipeRight : onSwipeLeft;
      setTimeout(() => {
        callback?.();
      }, 500);
    };

    useImperativeHandle(ref, () => ({
      swipeLeft: () => {
        if (!isAnimatingOut) triggerSwipeOut('left');
      },
      swipeRight: () => {
        if (!isAnimatingOut) triggerSwipeOut('right');
      },
    }));

    const handleFlip = () => {
      if (hasDraggedRef.current || isAnimatingOut) return;
      onFlip();
    };

    return (
      <>
        <div
          className="card-flip-scene w-full touch-none select-none cursor-grab active:cursor-grabbing"
          style={{
            height: 'clamp(420px, 60vh, 580px)',
            transform: `translate3d(${x}px, ${y}px, 0) rotate(${x * 0.02}deg)`,
            opacity: Math.max(1 - Math.abs(x) / 700, 0),
            transition: isDragging
              ? 'none'
              : isAnimatingOut
              ? 'transform 500ms cubic-bezier(0.25, 1, 0.5, 1), opacity 500ms ease-out'
              : 'transform 400ms cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 400ms ease-out',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <div
            className={cn('card-flip-inner', isFlipped && 'flipped')}
            onClick={handleFlip}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleFlip()}
            aria-label={isFlipped ? 'Hide answer' : 'Reveal answer'}
          >
            {/* Front Face */}
            <div
              className="card-face flex flex-col items-center justify-center rounded-2xl border border-border/60 bg-card p-8 shadow-lg hover:border-primary/40 hover:shadow-primary/10"
            >
              <CardSwipeOverlay x={x} />
              <div className="absolute top-4 left-4 rounded-lg bg-primary/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                {t('question')}
              </div>

              <div className="w-full max-w-2xl flex flex-col items-center gap-5 overflow-y-auto max-h-[90%] py-1">
                {card.image && (
                  <div className="relative w-full shrink-0 flex justify-center max-h-[200px] sm:max-h-[280px] overflow-hidden rounded-xl border border-border/40 bg-muted/20">
                    <img
                      src={card.image}
                      alt="Card graphic"
                      className="w-full h-auto max-h-[200px] sm:max-h-[280px] object-contain cursor-zoom-in transition-transform duration-200 hover:scale-[1.02]"
                      onClick={(e) => {
                        e.stopPropagation(); // Avoid flip!
                        setSelectedImage(card.image || null);
                      }}
                    />
                  </div>
                )}
                <div className={cn(
                  "whitespace-pre-wrap break-words text-center font-sans font-semibold text-foreground w-full",
                  getFontSizeClass(card.front)
                )}>
                  <MathRenderer text={card.front} />
                </div>
              </div>

              {!isFlipped && (
                <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                    {t('space')}
                  </span>
                  <span>{t('toReveal')}</span>
                </div>
              )}
            </div>

            {/* Back Face */}
            <div
              className="card-face card-face-back flex flex-col items-center justify-center rounded-2xl border border-correct/30 bg-card p-8 shadow-lg hover:border-correct/50 hover:shadow-correct/5"
            >
              <CardSwipeOverlay x={x} />
              <div className="absolute top-4 left-4 rounded-lg bg-correct/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-widest text-correct">
                {t('answer')}
              </div>

              <div className="w-full max-w-2xl overflow-y-auto max-h-[90%] py-1">
                <div className="whitespace-pre-wrap break-words text-center font-sans text-xl font-bold leading-relaxed text-correct sm:text-2xl w-full">
                  <MathRenderer text={card.back} />
                </div>
              </div>

              {isFlipped && (
                <div className="absolute bottom-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="rounded border border-border px-1.5 py-0.5 font-mono text-[10px]">
                    {t('space')}
                  </span>
                  <span>{t('toHide')}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lightbox zoom modal */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-xs p-4 animate-in fade-in duration-200"
            onClick={() => setSelectedImage(null)}
          >
            <button
              className="absolute top-4 right-4 rounded-full bg-black/40 p-2 text-white hover:bg-black/60 transition-colors"
              onClick={() => setSelectedImage(null)}
              aria-label="Close image zoom"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="relative max-h-[90vh] max-w-[90vw]" onClick={(e) => e.stopPropagation()}>
              <img
                src={selectedImage}
                alt="Enlarged graphic"
                className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl animate-in zoom-in-95 duration-200"
              />
            </div>
          </div>
        )}
      </>
    );
  }
);

FlashCard.displayName = 'FlashCard';
