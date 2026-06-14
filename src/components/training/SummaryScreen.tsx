'use client';

import { useTranslations } from 'next-intl';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, AlertCircle, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { CardResult } from '@/types';

interface SummaryScreenProps {
  totalCards: number;
  results: CardResult[];
  hasMistakes: boolean;
  onRestart: () => void;
  onReviewMistakes: () => void;
}

export function SummaryScreen({
  totalCards,
  results,
  hasMistakes,
  onRestart,
  onReviewMistakes,
}: SummaryScreenProps) {
  const t = useTranslations('summary');
  const tCommon = useTranslations('common');

  const correctCount = results.filter((r) => r.correct).length;
  const incorrectCount = results.filter((r) => !r.correct).length;
  const scorePct =
    totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;

  const grade =
    scorePct === 100 ? t('perfect') : scorePct >= 75 ? t('great') : t('keep');

  // SVG score ring
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (scorePct / 100) * circumference;

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-8 text-center mx-auto">
      {/* Score ring */}
      <div className="relative flex items-center justify-center">
        <svg width="130" height="130" aria-hidden="true">
          {/* Track */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-muted"
          />
          {/* Progress arc — rotated so it starts at top */}
          <circle
            cx="65"
            cy="65"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            transform="rotate(-90 65 65)"
            className={cn(
              'transition-all duration-1000 ease-out',
              scorePct === 100
                ? 'text-correct'
                : scorePct >= 50
                  ? 'text-primary'
                  : 'text-incorrect'
            )}
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <span className="text-2xl font-black text-foreground">{scorePct}%</span>
        </div>
      </div>

      {/* Title & grade */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-foreground">{t('title')}</h1>
        <p className="text-base text-muted-foreground">{grade}</p>
      </div>

      {/* Stats */}
      <div className="grid w-full grid-cols-2 gap-3">
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-correct/20 bg-correct/5 p-5">
          <span className="text-3xl font-black text-correct">{correctCount}</span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('correct')}
          </span>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-2xl border border-incorrect/20 bg-incorrect/5 p-5">
          <span className="text-3xl font-black text-incorrect">
            {incorrectCount}
          </span>
          <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {t('incorrect')}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex w-full flex-col gap-3">
        <Button
          id="restart-session-btn"
          onClick={onRestart}
          size="lg"
          className="w-full gap-2 py-5 text-base font-semibold"
        >
          <RotateCcw className="h-5 w-5" />
          {t('restart')}
        </Button>

        {hasMistakes ? (
          <Button
            id="review-mistakes-btn"
            onClick={onReviewMistakes}
            variant="outline"
            size="lg"
            className="w-full gap-2 border-incorrect/30 py-5 text-base font-semibold hover:border-incorrect hover:bg-incorrect/10 hover:text-incorrect transition-all"
          >
            <AlertCircle className="h-5 w-5" />
            {t('reviewMistakes')}
          </Button>
        ) : (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-correct/10 py-3 text-sm font-semibold text-correct">
            <Trophy className="h-4 w-4" />
            {t('noMistakes')}
          </div>
        )}

        <Link href="/" className="w-full">
          <Button
            variant="ghost"
            size="lg"
            className="w-full gap-2 text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>
        </Link>
      </div>
    </div>
  );
}
