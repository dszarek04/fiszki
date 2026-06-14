import type { Metadata } from 'next';
import { Header } from '@/components/layout/Header';
import { TrainingPage } from './_components/TrainingPage';

interface Props {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ shuffle?: string }>;
}

export const metadata: Metadata = {
  title: 'Training Session | Flashcard Workspace',
};

export default async function Page({ params, searchParams }: Props) {
  const { deckId } = await params;
  const { shuffle } = await searchParams;

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      <Header />
      <TrainingPage
        deckId={Number(deckId)}
        shuffle={shuffle === '1'}
      />
    </div>
  );
}
