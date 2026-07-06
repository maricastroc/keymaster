'use client';

import Link from 'next/link';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import { useRounds } from '@/features/typing/hooks/useRounds';
import { aggregateStats, type BucketStats } from '@/utils/aggregateStats';
import { Footer } from '@/components/Footer';

function StatTile({ label, value, sub }: { label: string; value: React.ReactNode; sub?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-background px-4 py-5">
      <span className="font-mono text-2xl font-bold text-neutral-300">{value}</span>
      <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
      {sub && <span className="font-mono text-[11px] text-neutral-600">{sub}</span>}
    </div>
  );
}

function BreakdownTable({
  title,
  rows,
}: {
  title: string;
  rows: { label: string; stats: BucketStats }[];
}) {
  return (
    <div className="flex h-full flex-col gap-2">
      <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">{title}</h2>
      <div className="flex-1 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-900">
        <div className="grid grid-cols-4 gap-px bg-neutral-800 font-mono text-[11px]">
          <div className="bg-neutral-900 px-3 py-2 text-neutral-500 uppercase tracking-wider">Type</div>
          <div className="bg-neutral-900 px-3 py-2 text-right text-neutral-500 uppercase tracking-wider">Rounds</div>
          <div className="bg-neutral-900 px-3 py-2 text-right text-neutral-500 uppercase tracking-wider">Avg</div>
          <div className="bg-neutral-900 px-3 py-2 text-right text-neutral-500 uppercase tracking-wider">Best</div>
          {rows.map((row) => (
            <Row key={row.label} label={row.label} stats={row.stats} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, stats }: { label: string; stats: BucketStats }) {
  const dim = stats.count === 0;
  return (
    <>
      <div className={`bg-background px-3 py-2 capitalize ${dim ? 'text-neutral-600' : 'text-neutral-400'}`}>{label}</div>
      <div className={`bg-background px-3 py-2 text-right ${dim ? 'text-neutral-600' : 'text-neutral-400'}`}>{stats.count}</div>
      <div className={`bg-background px-3 py-2 text-right ${dim ? 'text-neutral-600' : 'text-neutral-400'}`}>{dim ? '—' : stats.avgWpm}</div>
      <div className={`bg-background px-3 py-2 text-right ${dim ? 'text-neutral-600' : 'text-yellow-500'}`}>{dim ? '—' : stats.bestWpm}</div>
    </>
  );
}

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  return `${m}m ${s}s`;
}

export default function StatsPage() {
  const { rounds, isLoading } = useRounds();
  const stats = aggregateStats(rounds);

  return (
    <div className="relative min-h-screen flex flex-col items-center px-4 py-6 md:py-10">
      <div className="w-full max-w-5xl">
        <div className="flex items-center justify-between w-full mb-10">
          <Link
            href="/"
            className="flex items-center gap-2 font-mono text-sm text-neutral-500 hover:text-neutral-300 transition-colors"
          >
            <FontAwesomeIcon icon={faArrowLeft} size="sm" />
            back to typing
          </Link>
          <h1 className="font-display text-sm font-semibold text-neutral-400 tracking-widest uppercase">
            Statistics
          </h1>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4 py-2" aria-hidden>
            {[70, 90, 60].map((w, i) => (
              <div key={i} className="h-24 rounded-lg bg-neutral-800 animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : stats.totalRounds === 0 ? (
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
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-neutral-800 rounded-lg overflow-hidden border border-neutral-800">
              <StatTile label="Rounds" value={stats.totalRounds} />
              <StatTile label="Avg WPM" value={stats.avgWpm} />
              <StatTile label="Best WPM" value={<span className="text-yellow-500">{stats.bestWpm}</span>} />
              <StatTile label="Avg Acc" value={`${stats.avgAccuracy}%`} />
              <StatTile label="Consistency" value={stats.totalRounds >= 2 ? `${stats.consistency}%` : '—'} />
              <StatTile label="Time" value={formatDuration(stats.totalTimeSec)} />
            </div>

            {stats.trend.length > 1 && (
              <div className="flex flex-col gap-3">
                <h2 className="font-mono text-xs uppercase tracking-widest text-neutral-500">WPM over time</h2>
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={stats.trend} margin={{ top: 8, right: 8, bottom: 0, left: -16 }}>
                    <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
                    <XAxis dataKey="index" stroke="var(--neutral-500)" axisLine={false} tickLine={false} fontSize={11} />
                    <YAxis stroke="var(--neutral-500)" axisLine={false} tickLine={false} fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        background: 'var(--neutral-900)',
                        border: '1px solid var(--neutral-700)',
                        borderRadius: 12,
                        fontFamily: 'var(--font-mono)',
                        fontSize: 12,
                      }}
                      labelStyle={{ color: 'var(--neutral-500)' }}
                      labelFormatter={(v) => `Round ${v}`}
                    />
                    <Line type="monotone" dataKey="wpm" stroke="var(--yellow-500)" strokeWidth={2} dot={false} name="WPM" />
                    <Line type="monotone" dataKey="accuracy" stroke="var(--blue-400)" strokeWidth={2} dot={false} name="Accuracy" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

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
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}
