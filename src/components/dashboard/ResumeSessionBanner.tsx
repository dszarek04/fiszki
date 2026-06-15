'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Play, Trash2, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrainingSession } from '@/hooks/useTrainingSession';

export function ResumeSessionBanner() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const session = useTrainingSession();

  if (!session.isSessionLoaded || session.phase !== 'training' || !session.deckId) {
    return null;
  }

  const current = session.currentIndex;
  const total = session.cards.length;
  const progressPercent = total > 0 ? Math.round((current / total) * 100) : 0;

  const handleContinue = () => {
    router.push(`/train/${session.deckId}`);
  };

  return (
    <div className="glass mb-8 flex flex-col gap-4 rounded-2xl p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between border border-primary/20 bg-card/60 backdrop-blur-md">
      <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
        {/* Icon */}
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20 text-primary">
          <BookOpen className="h-6 w-6 animate-pulse" />
        </div>

        {/* Info & Progress */}
        <div className="space-y-1.5 flex-1">
          <h3 className="text-sm font-bold text-foreground tracking-tight">
            {t('resumeTitle')}
          </h3>
          <p className="text-xs text-muted-foreground">
            {t('resumeSubtitle', {
              name: session.deckName || '',
              current: current,
              total: total,
            })}
          </p>
          
          {/* Miniature Progress Bar */}
          <div className="flex items-center gap-2 max-w-md">
            <div className="h-1.5 w-full rounded-full bg-border/50 overflow-hidden">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-bold text-primary shrink-0">{progressPercent}%</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 sm:shrink-0">
        <Button
          onClick={session.clearSession}
          variant="ghost"
          size="sm"
          className="gap-1.5 text-xs text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-3.5 w-3.5" />
          {t('resumeDiscard')}
        </Button>
        
        <Button
          onClick={handleContinue}
          size="sm"
          className="gap-1.5 text-xs shadow-md font-semibold"
        >
          <Play className="h-3.5 w-3.5 fill-current" />
          {t('resumeButton')}
        </Button>
      </div>
    </div>
  );
}
