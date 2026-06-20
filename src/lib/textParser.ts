// ─── Text-based Flashcard Parser ─────────────────────────────────────────────
//
// Default format (one question per line, semicolon splits Q from A):
//
//   Question text; Answer text
//   Next question; Next answer
//
// Multi-line format (tilde separates cards, pipe splits Q/A):
//
//   1. Question
//   a) Option A
//   b) Option B | b) Option B ~
//   2. Next question | answer ~
//
// Both separators are user-configurable and support escape sequences
// like \n, \t, \r (typed literally in the UI input).
//

export interface ParsedCard {
  front: string;
  back: string;
}

export interface TextParseConfig {
  /** Separator between question and answer within a card (default ";") */
  qaSeparator: string;
  /** Separator between cards (default "\n" — one card per line) */
  cardSeparator: string;
}

export const DEFAULT_PARSE_CONFIG: TextParseConfig = {
  qaSeparator: ';',
  cardSeparator: '\n',
};

// ─── Escape Sequence Handling ─────────────────────────────────────────────────

const ESCAPE_MAP: Record<string, string> = {
  '\\n': '\n',
  '\\t': '\t',
  '\\r': '\r',
  '\\|': '|',
  '\\~': '~',
  '\\;': ';',
  '\\\\': '\\',
};

/**
 * Converts escape sequences typed literally by the user (e.g. the two
 * characters backslash + n) into the actual control character (\n).
 * Safe to call on already-resolved strings (double backslash stays as one).
 */
export function resolveEscapes(input: string): string {
  return input.replace(/\\[ntr|~;\\]/g, (match) => ESCAPE_MAP[match] ?? match);
}

/**
 * Converts an actual separator character back to its display form.
 * Used to show the current separator in the UI input field.
 */
export function displayEscape(raw: string): string {
  return raw
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/\t/g, '\\t')
    .replace(/\r/g, '\\r');
}

// ─── Main Parser ──────────────────────────────────────────────────────────────

export function parseFlashcardText(
  text: string,
  config: TextParseConfig = DEFAULT_PARSE_CONFIG
): { cards: ParsedCard[]; errors: string[] } {
  const errors: string[] = [];
  const cards: ParsedCard[] = [];

  // Resolve escape sequences in the separator strings
  const qaSep = resolveEscapes(config.qaSeparator);
  const cardSep = resolveEscapes(config.cardSeparator);

  if (!qaSep) {
    errors.push('Q/A separator cannot be empty.');
    return { cards, errors };
  }
  if (!cardSep) {
    errors.push('Card separator cannot be empty.');
    return { cards, errors };
  }

  // Split into individual card blocks
  const rawCards = text
    .split(cardSep)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  rawCards.forEach((rawCard, idx) => {
    // Use the LAST occurrence of the Q/A separator so that the separator
    // character can appear freely inside the question/options text.
    const lastSep = rawCard.lastIndexOf(qaSep);

    if (lastSep === -1) {
      errors.push(
        `Card ${idx + 1}: missing Q/A separator "${displayEscape(qaSep)}" — skipped.`
      );
      return;
    }

    const front = rawCard.slice(0, lastSep).trim();
    const back = rawCard.slice(lastSep + qaSep.length).trim();

    if (!front) {
      errors.push(`Card ${idx + 1}: empty front side — skipped.`);
      return;
    }
    if (!back) {
      errors.push(`Card ${idx + 1}: empty back side — skipped.`);
      return;
    }

    cards.push({ front, back });
  });

  return { cards, errors };
}

// ─── Preview ──────────────────────────────────────────────────────────────────

export interface ParsePreview {
  totalCards: number;
  samples: ParsedCard[];
  errors: string[];
}

export function previewParse(
  text: string,
  config: TextParseConfig = DEFAULT_PARSE_CONFIG
): ParsePreview {
  const { cards, errors } = parseFlashcardText(text, config);
  return {
    totalCards: cards.length,
    samples: cards.slice(0, 3),
    errors,
  };
}

// ─── File Reader ──────────────────────────────────────────────────────────────

export function readFileAsText(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) ?? '');
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file, 'UTF-8');
  });
}

// ─── LaTeX / Math Equation Tokenizer ──────────────────────────────────────────

export interface MathToken {
  type: 'text' | 'math' | 'block-math';
  content: string;
}

export function parseMathText(text: string): MathToken[] {
  if (!text) return [];

  const hasExplicitDelimiters =
    text.includes('$') ||
    (text.includes('\\(') && text.includes('\\)')) ||
    (text.includes('\\[') && text.includes('\\]'));

  const len = text.length;

  if (hasExplicitDelimiters) {
    const tokens: MathToken[] = [];
    let currentIdx = 0;

    while (currentIdx < len) {
      let foundDelim: { type: 'inline' | 'block'; start: number; end: number; delimLen: number } | null = null;
      let minStart = len;

      const doubleDollarIdx = text.indexOf('$$', currentIdx);
      if (doubleDollarIdx !== -1 && doubleDollarIdx < minStart) {
        const closeIdx = text.indexOf('$$', doubleDollarIdx + 2);
        if (closeIdx !== -1) {
          foundDelim = { type: 'block', start: doubleDollarIdx, end: closeIdx, delimLen: 2 };
          minStart = doubleDollarIdx;
        }
      }

      const singleDollarIdx = text.indexOf('$', currentIdx);
      if (singleDollarIdx !== -1 && singleDollarIdx < minStart) {
        if (text[singleDollarIdx + 1] !== '$' && (singleDollarIdx === 0 || text[singleDollarIdx - 1] !== '$')) {
          let closeIdx = -1;
          for (let i = singleDollarIdx + 1; i < len; i++) {
            if (text[i] === '$' && text[i - 1] !== '\\' && text[i + 1] !== '$') {
              closeIdx = i;
              break;
            }
          }
          if (closeIdx !== -1) {
            foundDelim = { type: 'inline', start: singleDollarIdx, end: closeIdx, delimLen: 1 };
            minStart = singleDollarIdx;
          }
        }
      }

      const inlineBraceIdx = text.indexOf('\\(', currentIdx);
      if (inlineBraceIdx !== -1 && inlineBraceIdx < minStart) {
        const closeIdx = text.indexOf('\\)', inlineBraceIdx + 2);
        if (closeIdx !== -1) {
          foundDelim = { type: 'inline', start: inlineBraceIdx, end: closeIdx, delimLen: 2 };
          minStart = inlineBraceIdx;
        }
      }

      const blockBraceIdx = text.indexOf('\\[', currentIdx);
      if (blockBraceIdx !== -1 && blockBraceIdx < minStart) {
        const closeIdx = text.indexOf('\\]', blockBraceIdx + 2);
        if (closeIdx !== -1) {
          foundDelim = { type: 'block', start: blockBraceIdx, end: closeIdx, delimLen: 2 };
          minStart = blockBraceIdx;
        }
      }

      if (foundDelim) {
        if (foundDelim.start > currentIdx) {
          tokens.push({
            type: 'text',
            content: text.substring(currentIdx, foundDelim.start),
          });
        }
        tokens.push({
          type: foundDelim.type === 'block' ? 'block-math' : 'math',
          content: text.substring(foundDelim.start + foundDelim.delimLen, foundDelim.end),
        });
        currentIdx = foundDelim.end + foundDelim.delimLen;
      } else {
        tokens.push({
          type: 'text',
          content: text.substring(currentIdx),
        });
        break;
      }
    }
    return tokens;
  }

  const tokens: MathToken[] = [];
  let currentIdx = 0;

  while (currentIdx < len) {
    const nextBackslash = text.indexOf('\\', currentIdx);
    if (nextBackslash === -1) {
      tokens.push({ type: 'text', content: text.substring(currentIdx) });
      break;
    }

    if (nextBackslash > currentIdx) {
      tokens.push({ type: 'text', content: text.substring(currentIdx, nextBackslash) });
    }

    let scanIdx = nextBackslash + 1;
    while (scanIdx < len && /[a-zA-Z]/.test(text[scanIdx])) {
      scanIdx++;
    }

    let braceCount = 0;
    let bracketCount = 0;
    let continueScanning = true;

    while (scanIdx < len && continueScanning) {
      const char = text[scanIdx];
      if (char === '{') {
        braceCount++;
        scanIdx++;
      } else if (char === '}') {
        braceCount--;
        scanIdx++;
      } else if (char === '[') {
        bracketCount++;
        scanIdx++;
      } else if (char === ']') {
        bracketCount--;
        scanIdx++;
      } else if (braceCount > 0 || bracketCount > 0) {
        scanIdx++;
      } else if (char === '_' || char === '^') {
        scanIdx++;
        if (scanIdx < len) {
          if (text[scanIdx] === '{') {
            braceCount++;
            scanIdx++;
          } else {
            scanIdx++;
          }
        }
      } else {
        continueScanning = false;
      }
    }

    const mathContent = text.substring(nextBackslash, scanIdx);
    if (mathContent.length > 1) {
      tokens.push({ type: 'math', content: mathContent });
    } else {
      tokens.push({ type: 'text', content: mathContent });
    }
    currentIdx = scanIdx;
  }

  return tokens;
}
