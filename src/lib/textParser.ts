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
