'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';

import { useLeaderboard } from '@/features/leaderboard/useLeaderboard';
import { rankTier, TIER_COLOR } from '@/features/leaderboard/logic/tiers';
import type { LeaderboardEntry, LeaderboardPeriod } from '@/types/leaderboard';
import { Footer } from '@/components/Footer';
import { PageNav } from '@/components/PageNav';
import { Pills } from '@/components/ui/pills';

function RankBadge({ rank }: { rank: number }) {
  const tier = rankTier(rank);
  return (
    <span
      className="w-7 text-right font-mono text-sm tabular-nums"
      style={{ color: tier ? TIER_COLOR[tier] : 'var(--color-neutral-600)', fontWeight: tier ? 700 : 400 }}
    >
      {rank}
    </span>
  );
}

function Avatar({ entry }: { entry: LeaderboardEntry }) {
  if (entry.image) {
    return (
      <Image
        src={entry.image}
        alt={entry.name ?? 'Typist'}
        width={26}
        height={26}
        className="rounded-full opacity-90"
      />
    );
  }
  return (
    <div className="flex h-[26px] w-[26px] items-center justify-center rounded-full bg-neutral-700 font-mono text-xs text-neutral-300">
      {entry.name?.[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

function Row({ entry }: { entry: LeaderboardEntry }) {
  return (
    <div
      className={`grid grid-cols-[1.75rem_1fr_auto] items-center gap-3 px-3 py-2.5 sm:grid-cols-[1.75rem_1fr_4rem_3.5rem_7rem] ${
        entry.isMe ? 'bg-yellow-500/5' : ''
      }`}
    >
      <RankBadge rank={entry.rank} />

      <div className="flex min-w-0 items-center gap-2.5">
        <Avatar entry={entry} />
        <span className="truncate font-mono text-sm text-neutral-300">
          {entry.name ?? 'anonymous'}
        </span>
        {entry.isMe && (
          <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-yellow-500">
            you
          </span>
        )}
      </div>

      <span className="text-right font-mono text-sm font-bold tabular-nums text-yellow-500">
        {entry.wpm}
        <span className="ml-1 hidden text-[10px] font-normal text-neutral-500 sm:inline">wpm</span>
      </span>

      <span className="hidden text-right font-mono text-xs tabular-nums text-neutral-500 sm:inline">
        {entry.accuracy}%
      </span>

      <span className="hidden text-right font-mono text-[11px] text-neutral-500 sm:inline">
        {entry.mode} · {entry.difficulty}
      </span>
    </div>
  );
}

const PERIODS: { label: string; value: LeaderboardPeriod }[] = [
  { label: 'all time', value: 'all' },
  { label: 'this week', value: 'week' },
];

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<LeaderboardPeriod>('all');
  const { entries, me, isLoading, error } = useLeaderboard(period);
  const { status } = useSession();

  const meInList = me ? entries.some((e) => e.userId === me.userId) : false;
  const showPinnedMe = !!me && !meInList;

  return (
    <div className="relative flex min-h-screen flex-col items-center px-4 py-6 md:py-10">
      <div className="w-full max-w-3xl">
        <PageNav current="/leaderboard" />

        <div className="mb-6 flex items-center justify-between">
          <p className="font-mono text-xs text-neutral-500">Ranked by best WPM</p>
          <Pills
            label="Leaderboard period"
            options={PERIODS}
            value={period}
            onChange={setPeriod}
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-2 py-2" aria-hidden>
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-11 animate-pulse rounded-lg bg-neutral-800" />
            ))}
          </div>
        ) : error ? (
          <p role="alert" className="py-24 text-center font-mono text-sm text-red-500">
            Couldn&apos;t load the leaderboard.
          </p>
        ) : entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="font-mono text-sm text-neutral-400">No entries yet.</p>
            <p className="max-w-xs font-mono text-xs text-neutral-500">
              Be the first — finish a signed-in typing test and claim the top spot.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-lg border border-neutral-700 px-4 py-2 font-mono text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-300"
            >
              Start typing
            </Link>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-neutral-800">
            <div className="divide-y divide-neutral-800/70">
              {entries.map((entry) => (
                <Row key={entry.userId} entry={entry} />
              ))}
            </div>

            {showPinnedMe && me && (
              <div className="border-t border-neutral-700">
                <p className="bg-neutral-900 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-neutral-500">
                  your position
                </p>
                <Row entry={me} />
              </div>
            )}
          </div>
        )}

        {status === 'unauthenticated' && entries.length > 0 && (
          <p className="mt-4 text-center font-mono text-xs text-neutral-500">
            Sign in to appear on the leaderboard.
          </p>
        )}

        <Footer />
      </div>
    </div>
  );
}
