import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { Providers } from '@/providers/Providers';
import 'katex/dist/katex.min.css';
import './globals.css';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Flashcard Workspace',
  description:
    'A high-performance flashcard training app. Import, organize and learn with your own flashcard decks.',
  keywords: ['flashcards', 'learning', 'study', 'fiszki'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-dvh flex flex-col antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
