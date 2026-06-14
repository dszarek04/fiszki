'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import {
  BookOpen,
  Calendar,
  MoreVertical,
  Play,
  Settings,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import type { Deck } from '@/types';

interface DeckCardProps {
  deck: Deck;
  onDelete: (id: number) => void;
}

export function DeckCard({ deck, onDelete }: DeckCardProps) {
  const t = useTranslations('dashboard');
  const tSettings = useTranslations('settings');
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shuffle, setShuffle] = useState(false);

  const formattedDate = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(deck.createdAt);

  function handleStartTraining() {
    const url = `/train/${deck.id}${shuffle ? '?shuffle=1' : ''}`;
    router.push(url);
    setSettingsOpen(false);
  }

  return (
    <>
      <article className="group relative flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
            <BookOpen className="h-5 w-5 text-primary" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Deck options"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSettingsOpen(true)}>
                <Settings className="mr-2 h-3.5 w-3.5" />
                {tSettings('title')}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => setDeleteOpen(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-3.5 w-3.5" />
                {t('deleteDeck')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Title */}
        <div className="mt-3 flex-1">
          <h2 className="text-base font-bold leading-tight text-foreground line-clamp-2">
            {deck.name}
          </h2>
          <div className="mt-2 flex items-center gap-3">
            <Badge
              variant="secondary"
              className="text-xs font-medium"
            >
              {deck.cardCount === 1 ? t('cards', { count: 1 }) : t('cardsPlural', { count: deck.cardCount })}
            </Badge>
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Calendar className="h-3 w-3" />
              {formattedDate}
            </span>
          </div>
        </div>

        {/* Start button */}
        <div className="mt-4 pt-4 border-t border-border/50">
          <Button
            id={`start-training-${deck.id}`}
            onClick={() => setSettingsOpen(true)}
            className="w-full gap-2 text-sm"
            size="sm"
          >
            <Play className="h-3.5 w-3.5" />
            {t('startTraining')}
          </Button>
        </div>
      </article>

      {/* Session Settings Modal */}
      <Dialog open={settingsOpen} onOpenChange={setSettingsOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{tSettings('title')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between rounded-xl border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor={`shuffle-${deck.id}`} className="text-sm font-medium">
                  {tSettings('shuffle')}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {tSettings('shuffleHint')}
                </p>
              </div>
              <Switch
                id={`shuffle-${deck.id}`}
                checked={shuffle}
                onCheckedChange={setShuffle}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setSettingsOpen(false)}>
              {tSettings('cancel')}
            </Button>
            <Button
              onClick={handleStartTraining}
              id={`confirm-start-${deck.id}`}
              className="gap-2"
            >
              <Play className="h-3.5 w-3.5" />
              {tSettings('start')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm Modal */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteDeck')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            {t('confirmDelete', { name: deck.name, count: deck.cardCount })}
          </p>
          <DialogFooter className="gap-2">
            <Button variant="ghost" onClick={() => setDeleteOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                if (deck.id) {
                  onDelete(deck.id);
                }
                setDeleteOpen(false);
              }}
              id={`confirm-delete-${deck.id}`}
            >
              {t('confirm')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
