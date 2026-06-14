// ─── Database Entities ────────────────────────────────────────────────────────

export interface Deck {
  id?: number;
  name: string;
  createdAt: Date;
  cardCount: number;
}

export interface Card {
  id?: number;
  deckId: number;
  front: string;
  back: string;
  createdAt: Date;
}

// ─── Training Session ─────────────────────────────────────────────────────────

export type SessionPhase = 'idle' | 'training' | 'summary';

export interface CardResult {
  cardId: number;
  correct: boolean;
}

export interface TrainingSession {
  cards: Card[];
  originalCards: Card[];
  currentIndex: number;
  results: CardResult[];
  isFlipped: boolean;
  phase: SessionPhase;
}

// ─── Text Import ─────────────────────────────────────────────────────────────

export interface TextParseConfig {
  /** Separator between question and answer within a card (default "|") */
  qaSeparator: string;
  /** Separator between cards (default "~") */
  cardSeparator: string;
}

export type ImportInputMode = 'paste' | 'file';

// ─── i18n ─────────────────────────────────────────────────────────────────────

export type Locale = 'en' | 'pl';
