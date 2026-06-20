# Flashcard Workspace

A high-performance, offline-first flashcard training app built with Next.js 16, Tailwind CSS v4, and Dexie.js (IndexedDB). Import your own text, train with keyboard-driven 3D flip cards, and track session results — all in the browser, no backend required.

![CI](https://github.com/dszarek04/fiszki/actions/workflows/ci.yml/badge.svg)

---

## Features

| Feature | Detail |
|---|---|
| **Text import** | Paste text or upload any file. Default format: `question ; answer` per line |
| **Custom separators** | Configurable Q/A and card separators — supports `\n`, `\t`, `\r` escape sequences |
| **Multi-line cards** | Full multi-line question blocks (numbered options, etc.) |
| **Offline storage** | All data in IndexedDB via Dexie.js — works 100% offline |
| **3D flip cards** | CSS `preserve-3d` animation, keyboard-controlled |
| **Keyboard shortcuts** | `Space` flip · `←`/`A` incorrect · `→`/`D` correct |
| **Session summary** | Score ring, correct/incorrect stats, restart, review mistakes only |
| **Shuffle mode** | Optional card randomisation per session |
| **Dark / light / system** | next-themes with Tailwind v4 class-based dark mode |
| **i18n** | English + Polish, auto-detected from browser locale |
| **Global search** | Debounced real-time search across all cards |

---

## Format

Default separators: **`;`** (Q/A split) and **`\n`** (card boundary = one card per line).

```
What is the capital of France? ; Paris
What is 2 + 2? ; 4
```

For multi-line questions (e.g. multiple choice), change the card separator to `~`:

```
1. Problemy optymalizacyjne dzielimy na:

a) unimodalne i rozproszone
b) statyczne i dynamiczne
c) algebraiczne i macierzowe
d) stabilne i ewolucyjne | b) statyczne i dynamiczne ~

2. Kolejne pytanie... | odpowiedz ~
```

> **Parsing rule:** the *last* occurrence of the Q/A separator in each card block splits the question from the answer, so the separator can appear freely inside the question text.

Escape sequences are typed literally in the UI input:

| You type | Resolved to |
|---|---|
| `\n` | newline |
| `\t` | tab |
| `\r` | carriage return |
| `\\` | backslash |

---

## Getting Started

### Prerequisites

- Node.js 24+
- npm 10+

### Development

```bash
git clone https://github.com/dszarek04/fiszki.git
cd fiszki
npm install

# Start with portless — opens https://fiszki.localhost
npm run dev

# Or start without portless — opens http://localhost:3000
npm run dev:app
```

On the very first `npm run dev`, portless generates a local CA and adds it to your system trust store (may prompt for admin/sudo). After that, `https://fiszki.localhost` works in any browser — no port number needed.

> **Safari:** if `.localhost` subdomains do not resolve, run `npx portless hosts sync` once to add the entry to `/etc/hosts`.

---

## Running with Docker

The production image uses Next.js standalone output (~100 MB, Node 24 Alpine) and is configured with `restart: unless-stopped` to run 24/7 in the background.

### 1. Build and start

To start the container on the default port `3001` and automatically set up the `portless` alias:

```bash
npm run docker:up
```

#### Customizing the Port
If you want to run the container on a different host port (e.g. `4000`) instead of `3001`, you can specify it as an argument or environment variable:

```bash
# As an argument
npm run docker:up 4000

# Or using the --port flag
npm run docker:up -- --port 4000
```

Once started, you can access the application at **https://fiszki.localhost** — portless routes it to the Docker container transparently without showing any ports.

### 2. Verify

You can list the active portless routes to verify the alias is registered:

```bash
npx portless list
# https://fiszki.localhost  ->  localhost:3001  (alias)
```

### 3. Stop and clean up

To stop the container and remove the portless alias:

```bash
npm run docker:down
```

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server via portless -> `https://fiszki.localhost` |
| `npm run dev:app` | Dev server directly -> `http://localhost:3000` |
| `npm run build` | Production build |
| `npm run start` | Serve production build |
| `npm run verify` | ESLint + TypeScript `--noEmit` checks |
| `npm run docker:up` | Build/run Docker container 24/7 + register portless alias |
| `npm run docker:down` | Stop Docker container + remove portless alias |

---

## Project Structure

```
fiszki/
├── messages/                   # i18n JSON files (en.json, pl.json)
├── public/
├── src/
│   ├── app/
│   │   ├── _components/        # DashboardPage (client)
│   │   ├── train/[deckId]/
│   │   │   ├── _components/    # TrainingPage (client)
│   │   │   └── page.tsx        # Server route — awaits Promise params
│   │   ├── globals.css         # Tailwind v4 + design tokens
│   │   ├── layout.tsx          # Root layout + fonts
│   │   └── page.tsx            # Dashboard route
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ImportWizard/   # DropZone · ConfigModal · ImportWizard
│   │   │   ├── DeckCard.tsx
│   │   │   ├── DeckList.tsx
│   │   │   └── SearchBar.tsx
│   │   ├── layout/Header.tsx   # Theme + language toggle
│   │   ├── training/
│   │   │   ├── FlashCard.tsx       # 3D CSS flip card
│   │   │   ├── ProgressBar.tsx     # Segmented colour bar
│   │   │   ├── SessionControls.tsx
│   │   │   └── SummaryScreen.tsx   # Score ring + actions
│   │   └── ui/                 # shadcn/ui primitives
│   ├── hooks/
│   │   ├── useCards.ts
│   │   ├── useDecks.ts
│   │   ├── useKeyboardShortcuts.ts
│   │   ├── useSearch.ts
│   │   └── useTrainingSession.ts   # useReducer state machine
│   ├── lib/
│   │   ├── db.ts               # Dexie v4 schema + CRUD helpers
│   │   ├── textParser.ts       # Text parser + escape resolver
│   │   └── utils.ts            # cn() tailwind-merge helper
│   ├── providers/
│   │   ├── I18nProvider.tsx    # next-intl client + locale context
│   │   ├── Providers.tsx       # Combined providers root
│   │   └── ThemeProvider.tsx   # next-themes wrapper
│   └── types/index.ts          # Shared TypeScript interfaces
├── .github/workflows/ci.yml
├── .dockerignore
├── docker-compose.yml
├── Dockerfile
├── next.config.ts
└── package.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.9 (App Router, TypeScript strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Storage | Dexie.js v4 (IndexedDB, offline-first) |
| i18n | next-intl (client-side, no URL routing) |
| Themes | next-themes (class-based dark mode) |
| Dev proxy | portless (`https://fiszki.localhost`) |
| CI | GitHub Actions |
| Container | Docker multi-stage (Node 24 Alpine) |

---

## CI

GitHub Actions runs on push to `main` and all PRs:

1. `npm run verify` — ESLint + TypeScript checks
2. `npm run build` — full Next.js production build

---

## Keyboard Shortcuts

Active only during a training session, ignored when focus is inside a text input.

| Key | Action |
|---|---|
| `Space` | Flip card (reveal answer) |
| `←` or `A` | Mark incorrect |
| `→` or `D` | Mark correct |

---

## License

MIT
