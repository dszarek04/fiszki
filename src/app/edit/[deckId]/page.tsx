import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { EditDeckPage } from './_components/EditDeckPage';

interface Props {
  params: Promise<{ deckId: string }>;
}

export const metadata: Metadata = {
  title: 'Edit Deck | Flashcard Workspace',
};

export default async function Page({ params }: Props) {
  const { deckId } = await params;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <EditDeckPage deckId={Number(deckId)} />
    </div>
  );
}
