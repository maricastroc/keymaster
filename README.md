# Keymaster

<img width="3204" height="1722" alt="type_speeding_preview" src="https://github.com/user-attachments/assets/906fb496-b55d-4827-9c1b-de04e37e0008" />

A full-stack typing speed test with real-time metrics, session replay, per-word heatmaps, and persistent history — built with Next.js, Prisma, and PostgreSQL.

**[Live demo →](https://keymaster.marianacastro.dev/)**

---

## Highlights

**Typing engine built from scratch** — the core engine runs as a pure reducer (`engineReducer.ts`), making every state transition testable in isolation. No third-party typing library.

**Session replay** — after each test, you can replay your typing session and watch exactly where you slowed down or made mistakes, keystroke by keystroke.

**Per-word heatmap** — words are colored by relative speed, so you can immediately see which ones cost you the most time. Uses a bucket-based scoring system (`heatmap/logic/buckets.ts`) to normalize across sessions.

**WPM smoothing** — the real-time WPM chart applies a smoothing algorithm (`smoothData.ts`) to avoid noisy spikes, giving a cleaner picture of your actual pacing.

**Persistent history with personal bests** — sign in once and every result is saved. Personal bests are tracked per mode and difficulty and highlighted in the history view.

---

## Features

- **Real-time metrics** — WPM and accuracy tracked live as you type
- **Multiple modes** — Timed (15s, 30s, 60s, 120s) and Passage mode
- **Categories** — General, Lyrics, Quotes, and Code texts
- **Difficulty levels** — texts filtered by difficulty per category
- **User authentication** — OAuth sign-in via NextAuth, synced across devices
- **Sound feedback** — customizable keystroke sounds with volume control
- **Light / Dark theme** — fully themed UI with smooth transitions

---

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 16 (Pages Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth.js |
| Charts | Recharts |
| Testing | Vitest (unit + integration) |
| Deploy | Vercel |

---

## Testing

The typing engine has extensive test coverage across multiple layers:

```
features/typing/
├── hooks/engineReducer.test.ts        # Reducer unit tests
├── logic/typing.test.ts               # Core logic unit tests
├── tests/integration/mechanics.test.ts  # Engine integration tests
├── tests/integration/sessions.test.ts   # Session flow tests
├── tests/results/basic-input.test.ts    # Results: basic scenarios
├── tests/results/corrections.test.ts    # Results: backspace handling
├── tests/results/errors-skips.test.ts   # Results: error and skip edge cases
└── tests/utils/session-validity.test.ts # Session validation
```

```bash
npm run test
```

---

## Project Structure

```
src/
├── features/
│   ├── typing/        # Engine reducer, hooks, word display, all tests
│   ├── results/       # Chart, stats, heatmap, replay
│   ├── settings/      # Config context, settings panel
│   └── sound/         # Audio context and playback
├── components/ui/     # shadcn/ui components
├── hooks/             # Shared hooks (useLocalStorage)
├── lib/               # Auth config, Prisma client, helpers
├── pages/api/
│   ├── auth/          # NextAuth handler
│   └── rounds/        # REST endpoints for round history
├── services/          # API client (roundsApi)
├── utils/             # Pure functions: calculateStats, smoothData, buildChartData
└── types/             # Shared TypeScript types
```

---

## Running Locally

**Prerequisites:** Node.js 18+, a PostgreSQL database

```bash
git clone https://github.com/maricastroc/keymaster.git
cd keymaster
npm install
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://..."
SHADOW_DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
