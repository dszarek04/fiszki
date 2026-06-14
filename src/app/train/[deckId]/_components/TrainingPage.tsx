'use client';

import { useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { FlashCard } from '@/components/training/FlashCard';
import { ProgressBar } from '@/components/training/ProgressBar';
import { SessionControls } from '@/components/training/SessionControls';
import { SummaryScreen } from '@/components/training/SummaryScreen';
import { useCards } from '@/hooks/useCards';
import { useTrainingSession } from '@/hooks/useTrainingSession';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

interface TrainingPageProps {
  deckId: number;
  shuffle: boolean;
}

export function TrainingPage({ deckId, shuffle }: TrainingPageProps) {
  const t = useTranslations('training');
  const router = useRouter();

  const { cards, isLoading } = useCards(deckId);
  const session = useTrainingSession();

  // Start session once cards are loaded
  useEffect(() => {
    if (!isLoading && cards.length > 0 && session.phase === 'idle') {
      session.startSession(cards, shuffle);
    }
  }, [isLoading, cards, shuffle]); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard shortcuts
  useKeyboardShortcuts({
    phase: session.phase,
    isFlipped: session.isFlipped,
    onFlip: session.flip,
    onCorrect: session.markCorrect,
    onIncorrect: session.markIncorrect,
  });

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading || session.phase === 'idle') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">{t('loading')}</p>
      </div>
    );
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  if (session.phase === 'summary') {
    return (
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-12">
        <SummaryScreen
          totalCards={session.cards.length}
          results={session.results}
          hasMistakes={session.hasMistakes}
          onRestart={session.restart}
          onReviewMistakes={session.reviewMistakes}
        />
      </main>
    );
  }

  // ── Training ───────────────────────────────────────────────────────────────

  return (
    <main className="flex flex-1 flex-col">
      {/* Top bar */}
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </Link>
        <ProgressBar
          totalCards={session.cards.length}
          results={session.results}
          currentIndex={session.currentIndex}
        />
      </div>

      {/* Card area */}
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center gap-8 px-4 py-6">
        {session.currentCard && (
          <FlashCard
            card={session.currentCard}
            isFlipped={session.isFlipped}
            onFlip={session.flip}
          />
        )}

        <SessionControls
          isFlipped={session.isFlipped}
          onFlip={session.flip}
          onCorrect={session.markCorrect}
          onIncorrect={session.markIncorrect}
          currentIndex={session.currentIndex}
          totalCards={session.cards.length}
        />
      </div>
    </main>
  );
}
