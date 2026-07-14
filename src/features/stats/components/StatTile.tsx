import type { ReactNode } from 'react';

type StatTileProps = {
  label: string;
  value: ReactNode;
  sub?: string;
};

/** A single labelled metric cell used across the stats and profile grids. */
export function StatTile({ label, value, sub }: StatTileProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 bg-background px-4 py-5">
      <span className="font-mono text-2xl font-bold text-neutral-300">{value}</span>
      <span className="font-mono text-xs text-neutral-500 uppercase tracking-wider">{label}</span>
      {sub && <span className="font-mono text-[11px] text-neutral-500">{sub}</span>}
    </div>
  );
}
