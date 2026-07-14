import type { GetServerSideProps } from 'next';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';
import { utcDateString, formatDailyDate } from '@/features/daily/logic/dailyText';
import { getDailyChallenge, getDailyLeaderboard } from '@/features/daily/logic/dailyChallenge';
import { DailyArena } from '@/features/daily/DailyArena';
import { rankTier, TIER_COLOR } from '@/features/leaderboard/logic/tiers';
import { PageNav } from '@/components/PageNav';
import { Footer } from '@/components/Footer';
import type { DailyChallengeText, DailyEntry } from '@/types/daily';

type Props = {
  date: string;
  text: DailyChallengeText | null;
  entries: DailyEntry[];
  isLoggedIn: boolean;
};

function BoardRow({ entry }: { entry: DailyEntry }) {
  const tier = rankTier(entry.rank);
  return (
    <div
      className={`grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 px-3 py-2.5 sm:grid-cols-[1.75rem_1fr_4rem_3.5rem] ${
        entry.isMe ? 'bg-yellow-500/5' : ''
      }`}
    >
      <span
        className="w-7 text-right font-mono text-sm tabular-nums"
        style={{ color: tier ? TIER_COLOR[tier] : 'var(--color-neutral-600)', fontWeight: tier ? 700 : 400 }}
      >
        {entry.rank}
      </span>

      <Link href={`/u/${entry.userId}`} className="group flex min-w-0 items-center gap-2.5">
        {entry.image ? (
          <Image src={entry.image} alt={entry.name ?? 'Typist'} width={26} height={26} className="rounded-full opacity-90" />
        ) : (
          <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-neutral-700 font-mono text-xs text-neutral-300">
            {entry.name?.[0]?.toUpperCase() ?? '?'}
          </div>
        )}
        <span className="truncate font-mono text-sm text-neutral-300 transition-colors group-hover:text-yellow-500">
          {entry.name ?? 'anonymous'}
        </span>
        {entry.isMe && (
          <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-yellow-500">
            you
          </span>
        )}
      </Link>

      <span className="text-right font-mono text-sm font-bold tabular-nums text-yellow-500">
        {entry.wpm}
        <span className="ml-1 hidden text-[10px] font-normal text-neutral-500 sm:inline">wpm</span>
      </span>

      <span className="hidden text-right font-mono text-xs tabular-nums text-neutral-500 sm:inline">
        {entry.accuracy}%
      </span>
    </div>
  );
}

export default function DailyPage({ date, text, entries, isLoggedIn }: Props) {
  const prettyDate = formatDailyDate(date);

  return (
    <>
      <Head>
        <title>Daily Challenge · Keymaster</title>
        <meta name="description" content={`Everyone types the same text today — ${prettyDate}. Compete on the daily leaderboard.`} />
      </Head>

      <div className="relative flex min-h-screen flex-col items-center px-4 py-6 md:py-10">
        <div className="w-full max-w-3xl">
          <PageNav current="/daily" />

          <div className="mb-2 flex items-center justify-between">
            <h1 className="font-display text-lg font-semibold uppercase tracking-widest text-neutral-300">
              Daily Challenge
            </h1>
            <span className="font-mono text-xs text-neutral-500">{prettyDate}</span>
          </div>
          <p className="mb-8 font-mono text-xs text-neutral-500">
            One shared passage for everyone today. Ranked by best WPM.
          </p>

          {text ? (
            <DailyArena text={text} isLoggedIn={isLoggedIn} />
          ) : (
            <p className="py-16 text-center font-mono text-sm text-neutral-400">
              No daily challenge is available yet.
            </p>
          )}

          <section className="mt-12">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
              Today&apos;s board
            </h2>
            {entries.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-12 text-center">
                <p className="font-mono text-sm text-neutral-400">No results yet.</p>
                <p className="max-w-xs font-mono text-xs text-neutral-500">
                  Be the first to finish today&apos;s challenge and claim the top spot.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-lg border border-neutral-800">
                <div className="divide-y divide-neutral-800/70">
                  {entries.map((entry) => (
                    <BoardRow key={entry.userId} entry={entry} />
                  ))}
                </div>
              </div>
            )}
          </section>

          {!isLoggedIn && (
            <p className="mt-4 text-center font-mono text-xs text-neutral-500">
              Sign in to save your result and appear on the board.
            </p>
          )}

          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const date = utcDateString(new Date());
  const text = await getDailyChallenge(date);

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const meId = session?.user?.id ?? null;

  const entries = await getDailyLeaderboard(date, meId);

  return {
    props: {
      date,
      text,
      entries,
      isLoggedIn: !!meId,
    },
  };
};
