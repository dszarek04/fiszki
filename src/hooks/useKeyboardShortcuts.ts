'use client';

import { useEffect } from 'react';
import type { SessionPhase } from '@/types';

interface KeyboardShortcutsConfig {
  phase: SessionPhase;
  isFlipped: boolean;
  onFlip: () => void;
  onCorrect: () => void;
  onIncorrect: () => void;
}

// ─── useKeyboardShortcuts ─────────────────────────────────────────────────────
//
// Global key listeners active only during training phase.
//   Space        → flip card (only when not yet flipped)
//   ArrowRight / D → mark correct (only when flipped)
//   ArrowLeft  / A → mark incorrect (only when flipped)
//

export function useKeyboardShortcuts({
  phase,
  isFlipped,
  onFlip,
  onCorrect,
  onIncorrect,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    if (phase !== 'training') return;

    function handleKeyDown(e: KeyboardEvent) {
      // Ignore if user is typing in an input/textarea
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;

      switch (e.key) {
        case ' ':
        case 'Spacebar':
          e.preventDefault();
          onFlip();
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          onCorrect();
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          onIncorrect();
          break;
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, isFlipped, onFlip, onCorrect, onIncorrect]);
}
