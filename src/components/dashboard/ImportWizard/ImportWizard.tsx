'use client';

import { useCallback, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Plus, ClipboardPaste, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { bulkInsertCards, createDeck } from '@/lib/db';
import { parseFlashcardText, type TextParseConfig } from '@/lib/textParser';
import { DropZone } from './DropZone';
import { ConfigModal } from './ConfigModal';

// ─── Tabs ─────────────────────────────────────────────────────────────────────

type Tab = 'paste' | 'file';

// ─── ImportWizard ─────────────────────────────────────────────────────────────

export function ImportWizard() {
  const t = useTranslations('import');

  const [wizardOpen, setWizardOpen] = useState(false);
  const [configOpen, setConfigOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('paste');
  const [rawText, setRawText] = useState('');
  const [deckName, setDeckName] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  // ── Step 1: open wizard ───────────────────────────────────────────────────

  function openWizard() {
    setRawText('');
    setDeckName('');
    setActiveTab('paste');
    setWizardOpen(true);
  }

  // ── Step 2: move from input step to config step ───────────────────────────

  function proceedToConfig() {
    if (!rawText.trim()) return;
    setWizardOpen(false);
    setConfigOpen(true);
  }

  // ── Handle file drop ──────────────────────────────────────────────────────

  const handleFileReady = useCallback((text: string, name: string) => {
    setRawText(text);
    setDeckName(name);
  }, []);

  // ── Step 3: confirm import ────────────────────────────────────────────────

  async function handleImport(config: TextParseConfig, name: string) {
    setIsImporting(true);
    try {
      const { cards } = parseFlashcardText(rawText, config);
      if (cards.length === 0) return;

      const deckId = await createDeck(name);
      await bulkInsertCards(deckId, cards);

      setConfigOpen(false);
      setRawText('');
      setDeckName('');
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <>
      {/* Trigger Button */}
      <Button
        onClick={openWizard}
        id="import-csv-btn"
        className="gap-2 shadow-md"
      >
        <Plus className="h-4 w-4" />
        {t('title')}
      </Button>

      {/* Step 1: Input Wizard */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">{t('title')}</DialogTitle>
          </DialogHeader>

          {/* Tab switcher */}
          <div className="flex rounded-lg bg-muted p-1 gap-1">
            <button
              id="tab-paste"
              onClick={() => setActiveTab('paste')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-all',
                activeTab === 'paste'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <ClipboardPaste className="h-3.5 w-3.5" />
              {t('tabPaste')}
            </button>
            <button
              id="tab-file"
              onClick={() => setActiveTab('file')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-sm font-medium transition-all',
                activeTab === 'file'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Upload className="h-3.5 w-3.5" />
              {t('tabFile')}
            </button>
          </div>

          {/* Tab content */}
          <div className="min-h-[240px]">
            {activeTab === 'paste' ? (
              <div className="space-y-2">
                <Label htmlFor="paste-area">{t('pasteLabel')}</Label>
                <Textarea
                  id="paste-area"
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder={`Question 1; Answer 1\nQuestion 2; Answer 2\nQuestion 3; Answer 3`}
                  className="min-h-[200px] max-h-[300px] overflow-y-auto font-mono text-sm resize-none leading-relaxed"
                  spellCheck={false}
                />
              </div>
            ) : (
              <DropZone onTextReady={handleFileReady} />
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="ghost"
              onClick={() => setWizardOpen(false)}
            >
              {t('cancel')}
            </Button>
            <Button
              onClick={proceedToConfig}
              disabled={!rawText.trim()}
              id="proceed-to-config"
            >
              {t('continue')} →
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Step 2: Config + Preview */}
      <ConfigModal
        open={configOpen}
        rawText={rawText}
        initialDeckName={deckName}
        onConfirm={handleImport}
        onCancel={() => {
          setConfigOpen(false);
          setWizardOpen(true);
        }}
        isImporting={isImporting}
      />
    </>
  );
}
