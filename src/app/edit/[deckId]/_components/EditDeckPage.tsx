'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, updateDeckCardCount } from '@/lib/db';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Image as ImageIcon,
  Clipboard,
  Loader2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MathRenderer } from '@/components/ui/MathRenderer';
import { compressImage } from '@/lib/utils';

interface EditDeckPageProps {
  deckId: number;
}

export function EditDeckPage({ deckId }: EditDeckPageProps) {
  const t = useTranslations('dashboard');
  const tEditor = useTranslations('editor');
  const tCommon = useTranslations('common');
  const router = useRouter();

  // Queries
  const deck = useLiveQuery(() => db.decks.get(deckId), [deckId]);
  const cards = useLiveQuery(() => db.cards.where('deckId').equals(deckId).toArray(), [deckId]);

  // States
  const [deckName, setDeckName] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const [frontText, setFrontText] = useState('');
  const [backText, setBackText] = useState('');
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [clipboardError, setClipboardError] = useState<string | null>(null);

  // Sync deck name
  useEffect(() => {
    if (deck) {
      const name = deck.name;
      setTimeout(() => {
        setDeckName(name);
      }, 0);
    }
  }, [deck]);

  // Safe active card getter
  const activeCard = useMemo(() => {
    if (!cards || cards.length === 0) return null;
    if (activeIndex >= cards.length) {
      return cards[cards.length - 1];
    }
    return cards[activeIndex];
  }, [cards, activeIndex]);

  // Sync inputs on active card change
  useEffect(() => {
    if (activeCard) {
      const f = activeCard.front;
      const b = activeCard.back;
      const img = activeCard.image || null;
      setTimeout(() => {
        setFrontText(f);
        setBackText(b);
        setImageSrc(img);
      }, 0);
    } else {
      setTimeout(() => {
        setFrontText('');
        setBackText('');
        setImageSrc(null);
      }, 0);
    }
  }, [activeCard?.id, activeCard]);

  // Debounced auto-save for Deck Name
  useEffect(() => {
    if (!deck || deckName === deck.name || !deckName.trim()) return;

    const timer = setTimeout(async () => {
      setSaving(true);
      try {
        await db.decks.update(deckId, { name: deckName });
      } catch (e) {
        console.error('Failed to rename deck:', e);
      } finally {
        setSaving(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [deckName, deckId, deck]);

  // Debounced auto-save for Card (Front, Back, Image)
  useEffect(() => {
    if (!activeCard) return;

    // Check if anything actually changed to prevent redundant updates
    if (
      frontText === activeCard.front &&
      backText === activeCard.back &&
      imageSrc === (activeCard.image || null)
    ) {
      return;
    }

    setTimeout(() => {
      setSaving(true);
    }, 0);
    const timer = setTimeout(async () => {
      try {
        await db.cards.update(activeCard.id!, {
          front: frontText.trim(),
          back: backText.trim(),
          image: imageSrc || undefined,
        });
      } catch (e) {
        console.error('Failed to update card:', e);
      } finally {
        setSaving(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [frontText, backText, imageSrc, activeCard]);

  // Immediate save before switching cards or adding cards
  const saveActiveCardImmediately = async () => {
    if (!activeCard) return;
    if (
      frontText === activeCard.front &&
      backText === activeCard.back &&
      imageSrc === (activeCard.image || null)
    ) {
      return;
    }

    setSaving(true);
    try {
      await db.cards.update(activeCard.id!, {
        front: frontText.trim(),
        back: backText.trim(),
        image: imageSrc || undefined,
      });
    } catch (e) {
      console.error('Failed to save card immediately:', e);
    } finally {
      setSaving(false);
    }
  };

  // Select card handler
  const handleSelectCard = async (index: number) => {
    await saveActiveCardImmediately();
    setActiveIndex(index);
  };

  // Add Card
  const handleAddCard = async () => {
    await saveActiveCardImmediately();
    setSaving(true);
    try {
      await db.cards.add({
        deckId,
        front: '',
        back: '',
        createdAt: new Date(),
      });
      await updateDeckCardCount(deckId);
      if (cards) {
        setActiveIndex(cards.length); // go to the new card
      }
    } catch (e) {
      console.error('Failed to add card:', e);
    } finally {
      setSaving(false);
    }
  };

  // Delete Card
  const handleDeleteCard = async (cardId: number, index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm(tEditor('confirmDeleteCard'))) {
      setSaving(true);
      try {
        await db.cards.delete(cardId);
        await updateDeckCardCount(deckId);
        if (index === activeIndex) {
          setActiveIndex(Math.max(0, index - 1));
        } else if (index < activeIndex) {
          setActiveIndex(activeIndex - 1);
        }
      } catch (e) {
        console.error('Failed to delete card:', e);
      } finally {
        setSaving(false);
      }
    }
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      setSaving(true);
      try {
        const compressed = await compressImage(base64);
        setImageSrc(compressed);
      } catch (err) {
        console.error('Compression failed:', err);
        setImageSrc(base64);
      } finally {
        setSaving(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Clipboard Paste handler (for button)
  const handlePasteFromClipboard = async () => {
    setClipboardError(null);
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageTypes = item.types.filter((t) => t.startsWith('image/'));
        if (imageTypes.length > 0) {
          const type = imageTypes[0];
          const blob = await item.getType(type);
          
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            setSaving(true);
            try {
              const compressed = await compressImage(base64);
              setImageSrc(compressed);
            } catch (err) {
              console.error('Compression failed:', err);
              setImageSrc(base64);
            } finally {
              setSaving(false);
            }
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      setClipboardError(tEditor('noImageInClipboard'));
    } catch (err) {
      console.error('Failed to read clipboard:', err);
      setClipboardError(tEditor('clipboardPermissionError'));
    }
  };

  // Clipboard Paste handler (for Ctrl+V on editor textareas)
  const handleTextareaPaste = async (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          e.preventDefault(); // prevent pasting image binary data/strings into text field
          const reader = new FileReader();
          reader.onloadend = async () => {
            const base64 = reader.result as string;
            setSaving(true);
            try {
              const compressed = await compressImage(base64);
              setImageSrc(compressed);
            } catch {
              setImageSrc(base64);
            } finally {
              setSaving(false);
            }
          };
          reader.readAsDataURL(file);
          return;
        }
      }
    }
  };

  const handleNext = async () => {
    if (cards && activeIndex < cards.length - 1) {
      await handleSelectCard(activeIndex + 1);
    }
  };

  const handlePrev = async () => {
    if (activeIndex > 0) {
      await handleSelectCard(activeIndex - 1);
    }
  };

  if (!deck || !cards) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col px-4 py-6 sm:px-6">
      {/* Editor Header */}
      <div className="mb-6 flex flex-col gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={async () => {
              await saveActiveCardImmediately();
              router.push('/');
            }}
            className="h-9 px-3 gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            {tCommon('back')}
          </Button>

          <div className="flex items-center gap-2">
            <Input
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder={t('deckNamePlaceholder')}
              className="h-9 w-60 border-none bg-transparent text-lg font-bold outline-none ring-0 focus-visible:ring-1 focus-visible:ring-primary/45 focus:bg-card px-2"
            />
          </div>
        </div>

        {/* Save Status Indicator */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground self-end sm:self-auto">
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>{tEditor('saving')}</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {tEditor('saved')}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Editor Body Split-Layout */}
      <div className="grid flex-1 grid-cols-1 md:grid-cols-12 gap-6 items-stretch min-h-0">
        
        {/* Left Column - Card Thumbnails List */}
        <section className="md:col-span-4 flex flex-col rounded-2xl border border-border/60 bg-card p-4 shadow-sm min-h-[300px] md:max-h-[70vh] overflow-hidden">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-bold text-foreground">
              {tEditor('cardsInDeck', { count: cards.length })}
            </h2>
            <Button size="sm" onClick={handleAddCard} className="h-8 gap-1 text-xs">
              <Plus className="h-3.5 w-3.5" />
              {tEditor('addCard')}
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto pr-1 space-y-2">
            {cards.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                {tEditor('emptyDeck')}
              </div>
            ) : (
              cards.map((c, i) => (
                <div
                  key={c.id}
                  onClick={() => handleSelectCard(i)}
                  className={`group relative flex items-center justify-between rounded-xl border p-3 cursor-pointer transition-all ${
                    i === activeIndex
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-border/50 bg-card hover:bg-muted/30'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-6">
                    <p className="text-xs font-bold text-muted-foreground mb-0.5">
                      {tEditor('cardNum', { number: i + 1 })}
                    </p>
                    <p className="text-sm text-foreground font-medium truncate">
                      {c.front || <span className="text-muted-foreground italic">{tEditor('emptyQuestion')}</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate mt-0.5">
                      → {c.back || <span className="italic">{tEditor('emptyAnswer')}</span>}
                    </p>
                    {c.image && (
                      <span className="inline-flex mt-1 items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground">
                        <ImageIcon className="h-3 w-3" />
                        {tEditor('image')}
                      </span>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => handleDeleteCard(c.id!, i, e)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 self-start opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Usuń fiszkę ${i + 1}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Right Column - Editor Panel */}
        <section className="md:col-span-8 flex flex-col rounded-2xl border border-border/60 bg-card p-5 shadow-sm overflow-y-auto md:max-h-[70vh]">
          {activeCard ? (
            <div className="flex flex-col flex-1 gap-5">
              
              {/* Question / Front Editor */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="front-input" className="text-sm font-bold">
                    {tEditor('question')}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {tEditor('mathHint')}
                  </span>
                </div>
                <Textarea
                  id="front-input"
                  value={frontText}
                  onChange={(e) => setFrontText(e.target.value)}
                  onPaste={handleTextareaPaste}
                  placeholder={tEditor('questionPlaceholder')}
                  className="min-h-[100px] resize-y"
                />

                {/* Picture Section */}
                <div className="pt-1">
                  {imageSrc ? (
                    <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-muted/10 p-3">
                      <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-lg border border-border/40 bg-card">
                        <img
                          src={imageSrc}
                          alt="Front graphic preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-semibold">{tEditor('attachedImage')}</p>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setImageSrc(null)}
                          className="mt-2 h-7 px-3 text-xs"
                        >
                          {tEditor('removeImage')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-wrap items-center gap-3">
                      <input
                        type="file"
                        accept="image/*"
                        id="image-upload"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Label htmlFor="image-upload" className="inline-flex cursor-pointer">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3.5 py-2 text-xs font-semibold hover:bg-muted/50 transition-colors">
                          <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                          {tEditor('addImageDisk')}
                        </span>
                      </Label>

                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handlePasteFromClipboard}
                        className="h-8 gap-1.5 text-xs font-semibold"
                      >
                        <Clipboard className="h-3.5 w-3.5" />
                        {tEditor('pasteClipboard')}
                      </Button>

                      {clipboardError && (
                        <p className="text-xs text-destructive w-full mt-1 font-medium">
                          {clipboardError}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Answer / Back Editor */}
              <div className="space-y-2">
                <Label htmlFor="back-input" className="text-sm font-bold">
                  {tEditor('answer')}
                </Label>
                <Textarea
                  id="back-input"
                  value={backText}
                  onChange={(e) => setBackText(e.target.value)}
                  onPaste={handleTextareaPaste}
                  placeholder={tEditor('answerPlaceholder')}
                  className="min-h-[100px] resize-y"
                />
              </div>

              {/* Real-time Card Preview */}
              <div className="border-t border-border/50 pt-5 mt-2">
                <div className="mb-3 flex items-center gap-1.5 text-xs font-bold text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  {tEditor('livePreview')}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Front Preview */}
                  <div className="rounded-xl border border-border/60 bg-muted/5 p-4 flex flex-col items-center justify-center min-h-[140px] relative text-center">
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded">
                      {tEditor('question').split(' ')[0]}
                    </span>
                    <div className="flex flex-col items-center gap-3 w-full py-2">
                      {imageSrc && (
                        <div className="max-h-[80px] overflow-hidden rounded border border-border bg-card">
                          <img src={imageSrc} className="max-h-[80px] object-contain" alt="preview" />
                        </div>
                      )}
                      <div className="text-sm font-semibold whitespace-pre-wrap break-words max-w-full">
                        <MathRenderer text={frontText || tEditor('emptyQuestion')} />
                      </div>
                    </div>
                  </div>

                  {/* Back Preview */}
                  <div className="rounded-xl border border-border/60 bg-muted/5 p-4 flex flex-col items-center justify-center min-h-[140px] relative text-center">
                    <span className="absolute top-2 left-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-1.5 py-0.5 rounded">
                      {tEditor('answer').split(' ')[0]}
                    </span>
                    <div className="text-sm font-bold text-correct whitespace-pre-wrap break-words max-w-full">
                      <MathRenderer text={backText || tEditor('emptyAnswer')} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Pagination / Navigation */}
              {cards.length > 1 && (
                <div className="flex items-center justify-between border-t border-border/50 pt-4 mt-auto">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    disabled={activeIndex === 0}
                    className="gap-1 text-xs"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    {tEditor('prev')}
                  </Button>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {tEditor('cardOf', { current: activeIndex + 1, total: cards.length })}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleNext}
                    disabled={activeIndex === cards.length - 1}
                    className="gap-1 text-xs"
                  >
                    {tEditor('next')}
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col flex-1 items-center justify-center text-center p-8">
              <ImageIcon className="h-12 w-12 text-muted-foreground/30 mb-3" />
              <h3 className="text-base font-bold text-foreground mb-1">
                {tEditor('noCards')}
              </h3>
              <p className="text-sm text-muted-foreground max-w-xs mb-4">
                {tEditor('noCardsHint')}
              </p>
              <Button onClick={handleAddCard} className="gap-1.5 text-sm">
                <Plus className="h-4 w-4" />
                {tEditor('addFirstCard')}
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

