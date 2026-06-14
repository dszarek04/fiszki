'use client';

import { useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Info,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DEFAULT_PARSE_CONFIG,
  displayEscape,
  previewParse,
  type TextParseConfig,
} from '@/lib/textParser';

// ─── SeparatorInput ────────────────────────────────────────────────────────────
// Shows the "display" form (e.g. \n) but stores the raw config string.

function SeparatorInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [prevValue, setPrevValue] = useState(value);
  const [display, setDisplay] = useState(displayEscape(value));

  if (value !== prevValue) {
    setPrevValue(value);
    setDisplay(displayEscape(value));
  }

  return (
    <Input
      id={id}
      value={display}
      placeholder={placeholder}
      onChange={(e) => {
        setDisplay(e.target.value);
        onChange(e.target.value); // store the display form; parser calls resolveEscapes()
      }}
      className="font-mono text-sm"
    />
  );
}

// ─── ConfigModal ──────────────────────────────────────────────────────────────

interface ConfigModalProps {
  open: boolean;
  rawText: string;
  initialDeckName: string;
  onConfirm: (
    config: TextParseConfig,
    deckName: string
  ) => void;
  onCancel: () => void;
  isImporting?: boolean;
}

export function ConfigModal({
  open,
  rawText,
  initialDeckName,
  onConfirm,
  onCancel,
  isImporting = false,
}: ConfigModalProps) {
  const t = useTranslations('import');

  const [deckName, setDeckName] = useState(initialDeckName);
  const [config, setConfig] = useState<TextParseConfig>(DEFAULT_PARSE_CONFIG);
  // Re-run preview when text or config changes
  const preview = useMemo(() => {
    if (!rawText) return null;
    return previewParse(rawText, config);
  }, [rawText, config]);

  // Sync deck name when it changes from parent
  const [prevInitialDeckName, setPrevInitialDeckName] = useState(initialDeckName);
  if (initialDeckName !== prevInitialDeckName) {
    setPrevInitialDeckName(initialDeckName);
    setDeckName(initialDeckName);
  }

  function handleConfirm() {
    onConfirm(config, deckName || 'Untitled Deck');
  }

  const canImport = (preview?.totalCards ?? 0) > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold">
            {t('configTitle')}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">{t('configSubtitle')}</p>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Deck Name */}
          <div className="space-y-1.5">
            <Label htmlFor="deck-name">{t('deckName')}</Label>
            <Input
              id="deck-name"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder={t('deckNamePlaceholder')}
              className="font-medium"
            />
          </div>

          <Separator />

          {/* Separator Config */}
          <div className="space-y-4">
            {/* Q/A Separator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="qa-separator">{t('qaSeparator')}</Label>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  default: ;
                </span>
              </div>
              <SeparatorInput
                id="qa-separator"
                value={config.qaSeparator}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, qaSeparator: v }))
                }
                placeholder=";"
              />
              <p className="text-[11px] text-muted-foreground">
                {t('qaSeparatorHint')}
              </p>
            </div>

            {/* Card Separator */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="card-separator">{t('cardSeparator')}</Label>
                <span className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
                  default: \n
                </span>
              </div>
              <SeparatorInput
                id="card-separator"
                value={config.cardSeparator}
                onChange={(v) =>
                  setConfig((c) => ({ ...c, cardSeparator: v }))
                }
                placeholder="\n"
              />
              <p className="text-[11px] text-muted-foreground">
                {t('cardSeparatorHint')}
              </p>
            </div>
          </div>

          {/* Format hint */}
          <div className="flex items-start gap-2 rounded-lg bg-muted/60 p-3">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {t('formatHint')}
            </p>
          </div>

          <Separator />

          {/* Preview */}
          {preview !== null && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  {t('preview', { count: preview.totalCards })}
                </span>
                {preview.totalCards > 0 ? (
                  <Badge
                    variant="outline"
                    className="border-correct/30 bg-correct/10 text-correct text-xs"
                  >
                    <CheckCircle2 className="mr-1 h-3 w-3" />
                    {preview.totalCards === 1 ? t('cards', { count: 1 }) : t('cardsPlural', { count: preview.totalCards })}
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-incorrect/30 bg-incorrect/10 text-incorrect text-xs"
                  >
                    <AlertCircle className="mr-1 h-3 w-3" />
                    {t('noCards')}
                  </Badge>
                )}
              </div>

              {/* Sample cards */}
              {preview.samples.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {t('previewSample')}
                  </p>
                  {preview.samples.map((card, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border/60 bg-card p-3 text-xs"
                    >
                      <div className="flex items-start gap-2">
                        <span className="shrink-0 rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                          Q
                        </span>
                        <p className="text-foreground/80 whitespace-pre-wrap line-clamp-3">
                          {card.front}
                        </p>
                      </div>
                      <div className="mt-2 flex items-start gap-2">
                        <ChevronRight className="mt-0.5 h-3 w-3 shrink-0 text-muted-foreground" />
                        <p className="text-correct font-medium">{card.back}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Warnings */}
              {preview.errors.length > 0 && (
                <div className="rounded-lg border border-incorrect/20 bg-incorrect/5 p-3 space-y-1">
                  <p className="text-xs font-semibold text-incorrect">
                    {t('parseErrors')} ({preview.errors.length})
                  </p>
                  {preview.errors.slice(0, 3).map((err, i) => (
                    <p key={i} className="text-[11px] text-muted-foreground">
                      {err}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isImporting}>
            {t('cancel')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={!canImport || isImporting}
            id="confirm-import"
            className="min-w-[140px]"
          >
            {isImporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('importing')}
              </>
            ) : (
              t('import', { count: preview?.totalCards ?? 0 })
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
