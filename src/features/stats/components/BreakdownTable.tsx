import type { BucketStats } from '@/utils/aggregateStats';

type BreakdownTableProps = {
  title: string;
  rows: { label: string; stats: BucketStats }[];
};

/** A small "type / rounds / avg / best" table, used for by-mode and
 * by-difficulty breakdowns on the stats and profile pages. */
export function BreakdownTable({ title, rows }: BreakdownTableProps) {
  return (
    <div className="flex h-full flex-col gap-2">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">{title}</h2>
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
