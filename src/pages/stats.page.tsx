'use client';

import Link from 'next/link';
import { useRounds } from '@/features/typing/hooks/useRounds';
import { aggregateStats } from '@/utils/aggregateStats';
import { useKeyProfile } from '@/features/results/keys/useKeyProfile';
import { profileToStats, selectWeakKeys, type KeyStat } from '@/features/results/keys/logic/keyStats';
import { KeyboardHeatmap } from '@/features/results/keys/KeyboardHeatmap';
import { StatTile } from '@/features/stats/components/StatTile';
import { BreakdownTable } from '@/features/stats/components/BreakdownTable';
import { WpmTrendChart } from '@/features/stats/components/WpmTrendChart';
import { formatDuration } from '@/features/stats/logic/formatDuration';
import { Footer } from '@/components/Footer';
import { PageNav } from '@/components/PageNav';

function KeyboardPanel({ keyStats }: { keyStats: KeyStat[] }) {
  if (keyStats.length === 0) return null;

  const weak = selectWeakKeys(keyStats);

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
        Keyboard — all time
      </h2>
      <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-4 py-6">
        <KeyboardHeatmap stats={keyStats} />
      </div>
      {weak.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
            weakest keys
          </span>
          {weak.map((s) => (
            <span
              key={s.key}
              title={`${s.accuracy}% accuracy${s.avgMs ? `, ${s.avgMs}ms avg` : ''}`}
              className="flex items-center gap-1 rounded-md border border-neutral-800 bg-background px-2 py-1 font-mono text-xs"
            >
              <span className="font-bold text-red-500">{s.key.toUpperCase()}</span>
              <span className="text-neutral-500">{s.accuracy}%</span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StatsPage() {
  const { rounds, isLoading } = useRounds();
  const stats = aggregateStats(rounds);

  const { profile } = useKeyProfile();
  const keyStats = profileToStats(profile);
  const hasKeyData = keyStats.length > 0;

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-6 md:py-10">
      <div className="w-full max-w-5xl">
        <PageNav current="/stats" />

        {isLoading ? (
          <div className="flex flex-col gap-4 py-2" aria-hidden>
            {[70, 90, 60].map((w, i) => (
              <div key={i} className="h-24 rounded-lg bg-neutral-800 animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : stats.totalRounds === 0 && !hasKeyData ? (
          <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
            <p className="font-mono text-sm text-neutral-400">No rounds yet.</p>
            <p className="font-mono text-xs text-neutral-500 max-w-xs">
              Complete a typing test and your stats will show up here.
            </p>
            <Link
              href="/"
              className="mt-2 rounded-lg border border-neutral-700 px-4 py-2 font-mono text-sm text-neutral-400 hover:border-neutral-500 hover:text-neutral-300 transition-colors"
            >
              Start typing
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {stats.totalRounds > 0 && (
            <>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-neutral-800 rounded-lg overflow-hidden border border-neutral-800">
              <StatTile label="Rounds" value={stats.totalRounds} />
              <StatTile label="Avg WPM" value={stats.avgWpm} />
              <StatTile label="Best WPM" value={<span className="text-yellow-500">{stats.bestWpm}</span>} />
              <StatTile label="Avg Acc" value={`${stats.avgAccuracy}%`} />
              <StatTile label="Consistency" value={stats.totalRounds >= 2 ? `${stats.consistency}%` : '—'} />
              <StatTile label="Time" value={formatDuration(stats.totalTimeSec)} />
            </div>

            {stats.trend.length > 1 && <WpmTrendChart data={stats.trend} />}

            <div className="grid gap-8 md:grid-cols-2">
              <BreakdownTable
                title="By mode"
                rows={[
                  { label: 'timed', stats: stats.byMode.timed },
                  { label: 'passage', stats: stats.byMode.passage },
                ]}
              />
              <BreakdownTable
                title="By difficulty"
                rows={[
                  { label: 'easy', stats: stats.byDifficulty.easy },
                  { label: 'medium', stats: stats.byDifficulty.medium },
                  { label: 'hard', stats: stats.byDifficulty.hard },
                ]}
              />
            </div>
            </>
            )}

            {hasKeyData && <KeyboardPanel keyStats={keyStats} />}
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
