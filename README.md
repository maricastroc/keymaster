# Keymaster

<img width="3204" height="1722" alt="type_speeding_preview" src="https://github.com/user-attachments/assets/906fb496-b55d-4827-9c1b-de04e37e0008" />


A full-stack typing speed test built with Next.js and Prisma, featuring real-time metrics, performance history, user authentication, customizable sounds, and theme switching.

## Features

- **Real-time metrics** — WPM, accuracy, and time tracked as you type
- **Multiple modes** — Timed (15s, 30s, 60s, 120s) and Passage mode
- **Categories** — General, Lyrics, Quotes, and Code texts
- **User authentication** — Sign in to sync your history across devices via NextAuth
- **Performance history** — Results persisted per user with personal best tracking and deletion support
- **Sound feedback** — Customizable keystroke sounds with volume control
- **Light / Dark theme** — Fully themed UI with smooth transitions
- **Results chart** — WPM and accuracy over time visualized after each test

## Tech Stack

- [Next.js 16](https://nextjs.org/) — React framework
- [TypeScript](https://www.typescriptlang.org/) — Type safety
- [Tailwind CSS v4](https://tailwindcss.com/) — Styling
- [shadcn/ui](https://ui.shadcn.com/) — Component library built on Radix UI
- [Prisma](https://www.prisma.io/) — Database ORM
- [NextAuth.js](https://next-auth.js.org/) — Authentication
- [Recharts](https://recharts.org/) — Data visualization
- [Vitest](https://vitest.dev/) — Unit and integration testing

## Getting Started

### Prerequisites

- Node.js 18+
- A database supported by Prisma (SQLite, PostgreSQL, etc.)

### Installation

```bash
git clone https://github.com/your-username/type-speeding-test.git
cd type-speeding-test
npm install
```

### Environment variables

Create a `.env` file at the root:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="http://localhost:3000"
```

### Database setup

```bash
npx prisma migrate dev
npx prisma db seed
```

### Running locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── features/
│   ├── typing/        # Engine, reducer, hooks, word display, tests
│   ├── settings/      # Config context, settings panel
│   ├── sound/         # Audio context and playback
│   └── results/       # Chart, stats, history section
├── components/
│   └── ui/            # shadcn/ui components (Button, etc.)
├── hooks/             # Shared hooks (useLocalStorage)
├── lib/               # Auth config, utility helpers
├── pages/
│   └── api/
│       ├── auth/      # NextAuth handler
│       └── rounds/    # REST endpoints for round history
├── services/          # API client (roundsApi)
├── utils/             # Pure functions (calculateStats, smoothData)
└── types/             # TypeScript types
```

## Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run test       # Run unit tests
npm run lint       # Lint the codebase
```
