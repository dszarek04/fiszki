'use client';

import { useCallback, useReducer, useEffect, useState } from 'react';
import type { Card, CardResult, SessionPhase } from '@/types';

const LOCAL_STORAGE_KEY = 'fiszki_training_session';

// ─── State ────────────────────────────────────────────────────────────────────

interface TrainingState {
  deckId?: number;
  deckName?: string;
  cards: Card[];
  originalCards: Card[];
  currentIndex: number;
  results: CardResult[];
  isFlipped: boolean;
  phase: SessionPhase;
}

const initialState: TrainingState = {
  cards: [],
  originalCards: [],
  currentIndex: 0,
  results: [],
  isFlipped: false,
  phase: 'idle',
};

// ─── Actions ──────────────────────────────────────────────────────────────────

type Action =
  | { type: 'START'; cards: Card[]; deckId?: number; deckName?: string }
  | { type: 'FLIP' }
  | { type: 'MARK'; correct: boolean }
  | { type: 'BACK' }
  | { type: 'RESTART' }
  | { type: 'REVIEW_MISTAKES' }
  | { type: 'RESTORE'; session: TrainingState }
  | { type: 'CLEAR' };

// ─── Helpers ──────────────────────────────────────────────────────────────────

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

function reducer(state: TrainingState, action: Action): TrainingState {
  switch (action.type) {
    case 'START': {
      return {
        ...state,
        deckId: action.deckId,
        deckName: action.deckName,
        cards: action.cards,
        originalCards: action.cards,
        currentIndex: 0,
        results: [],
        isFlipped: false,
        phase: 'training',
      };
    }

    case 'FLIP': {
      if (state.phase !== 'training') return state;
      return { ...state, isFlipped: !state.isFlipped };
    }

    case 'MARK': {
      if (state.phase !== 'training') return state;

      const currentCard = state.cards[state.currentIndex];
      if (!currentCard?.id) return state;

      const newResults: CardResult[] = [
        ...state.results,
        { cardId: currentCard.id, correct: action.correct },
      ];

      const nextIndex = state.currentIndex + 1;
      const isLast = nextIndex >= state.cards.length;

      return {
        ...state,
        results: newResults,
        currentIndex: isLast ? state.currentIndex : nextIndex,
        isFlipped: false,
        phase: isLast ? 'summary' : 'training',
      };
    }

    case 'BACK': {
      if (state.phase !== 'training' || state.currentIndex === 0) return state;
      return {
        ...state,
        currentIndex: state.currentIndex - 1,
        results: state.results.slice(0, -1),
        isFlipped: false,
      };
    }

    case 'RESTART': {
      return {
        ...state,
        currentIndex: 0,
        results: [],
        isFlipped: false,
        phase: 'training',
      };
    }

    case 'REVIEW_MISTAKES': {
      const incorrectIds = new Set(
        state.results.filter((r) => !r.correct).map((r) => r.cardId)
      );
      const mistakeCards = state.originalCards.filter(
        (c) => c.id !== undefined && incorrectIds.has(c.id)
      );

      if (mistakeCards.length === 0) return state;

      return {
        ...state,
        cards: mistakeCards,
        currentIndex: 0,
        results: [],
        isFlipped: false,
        phase: 'training',
      };
    }

    case 'RESTORE': {
      return action.session;
    }

    case 'CLEAR': {
      return initialState;
    }

    default:
      return state;
  }
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useTrainingSession(currentDeckId?: number) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isSessionLoaded, setIsSessionLoaded] = useState(false);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          typeof parsed === 'object' &&
          parsed.phase === 'training' &&
          (currentDeckId === undefined || parsed.deckId === currentDeckId)
        ) {
          dispatch({ type: 'RESTORE', session: parsed });
        }
      }
    } catch (e) {
      console.error('Failed to load session from localStorage', e);
    } finally {
      setIsSessionLoaded(true);
    }
  }, [currentDeckId]);

  // Persist session to localStorage on changes
  useEffect(() => {
    if (!isSessionLoaded) return;
    if (state.phase === 'training') {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(state));
    } else if (state.phase === 'summary' || state.phase === 'idle') {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    }
  }, [state, isSessionLoaded]);

  const startSession = useCallback(
    (cards: Card[], shuffleCards = false, deckName?: string) => {
      const orderedCards = shuffleCards ? shuffle(cards) : cards;
      dispatch({ type: 'START', cards: orderedCards, deckId: currentDeckId, deckName });
    },
    [currentDeckId]
  );

  const flip = useCallback(() => {
    dispatch({ type: 'FLIP' });
  }, []);

  const markCorrect = useCallback(() => {
    dispatch({ type: 'MARK', correct: true });
  }, []);

  const markIncorrect = useCallback(() => {
    dispatch({ type: 'MARK', correct: false });
  }, []);

  const goBack = useCallback(() => {
    dispatch({ type: 'BACK' });
  }, []);

  const restart = useCallback(() => {
    dispatch({ type: 'RESTART' });
  }, []);

  const reviewMistakes = useCallback(() => {
    dispatch({ type: 'REVIEW_MISTAKES' });
  }, []);

  const clearSession = useCallback(() => {
    dispatch({ type: 'CLEAR' });
    localStorage.removeItem(LOCAL_STORAGE_KEY);
  }, []);

  const currentCard = state.cards[state.currentIndex] ?? null;
  const correctCount = state.results.filter((r) => r.correct).length;
  const incorrectCount = state.results.filter((r) => !r.correct).length;
  const hasMistakes = incorrectCount > 0;
  const canGoBack = state.phase === 'training' && state.currentIndex > 0;

  return {
    ...state,
    currentCard,
    correctCount,
    incorrectCount,
    hasMistakes,
    canGoBack,
    isSessionLoaded,
    startSession,
    flip,
    markCorrect,
    markIncorrect,
    goBack,
    restart,
    reviewMistakes,
    clearSession,
  };
}
