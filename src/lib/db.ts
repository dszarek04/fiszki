import Dexie, { type EntityTable } from 'dexie';
import type { Deck, Card } from '@/types';

// ─── Database Definition ──────────────────────────────────────────────────────

class FiszkiDatabase extends Dexie {
  decks!: EntityTable<Deck, 'id'>;
  cards!: EntityTable<Card, 'id'>;

  constructor() {
    super('FiszkiDB');
    this.version(1).stores({
      decks: '++id, name, createdAt',
      cards: '++id, deckId, front, back, createdAt',
    });
  }
}

export const db = new FiszkiDatabase();

// ─── Deck Operations ──────────────────────────────────────────────────────────

export async function createDeck(name: string): Promise<number> {
  const id = await db.decks.add({ name, createdAt: new Date(), cardCount: 0 });
  return id as number;
}

export async function updateDeckCardCount(deckId: number): Promise<void> {
  const count = await db.cards.where('deckId').equals(deckId).count();
  await db.decks.update(deckId, { cardCount: count });
}

export async function deleteDeck(deckId: number): Promise<void> {
  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.cards.where('deckId').equals(deckId).delete();
    await db.decks.delete(deckId);
  });
}

export async function renameDeck(deckId: number, name: string): Promise<void> {
  await db.decks.update(deckId, { name });
}

// ─── Card Operations ──────────────────────────────────────────────────────────

export async function bulkInsertCards(
  deckId: number,
  pairs: Array<{ front: string; back: string }>
): Promise<void> {
  const now = new Date();
  const cards: Card[] = pairs.map(({ front, back }) => ({
    deckId,
    front: front.trim(),
    back: back.trim(),
    createdAt: now,
  }));

  await db.transaction('rw', db.cards, db.decks, async () => {
    await db.cards.bulkAdd(cards);
    await updateDeckCardCount(deckId);
  });
}

export async function getCardsByDeck(deckId: number): Promise<Card[]> {
  return db.cards.where('deckId').equals(deckId).toArray();
}

export async function searchCards(query: string): Promise<Card[]> {
  const lc = query.toLowerCase();
  return db.cards
    .filter(
      (card) =>
        card.front.toLowerCase().includes(lc) ||
        card.back.toLowerCase().includes(lc)
    )
    .toArray();
}

export async function deleteCard(cardId: number): Promise<void> {
  const card = await db.cards.get(cardId);
  if (!card) return;
  await db.cards.delete(cardId);
  await updateDeckCardCount(card.deckId);
}
