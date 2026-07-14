'use client';

import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faChartLine, faTrophy } from '@fortawesome/free-solid-svg-icons';

type Section = '/stats' | '/leaderboard';

const SECTIONS: { href: Section; label: string; icon: typeof faChartLine }[] = [
  { href: '/stats', label: 'Statistics', icon: faChartLine },
  { href: '/leaderboard', label: 'Leaderboard', icon: faTrophy },
];

/**
 * Shared sub-navigation for the secondary pages (Statistics, Leaderboard).
 * Keeps the "back to typing" affordance and lets the user move directly between
 * the sibling sections without routing through the home screen. The active
 * section doubles as the page heading, styled in the app's segmented-control
 * language for a clear "you are here".
 */
export const PageNav = ({ current }: { current: Section }) => {
  const title = SECTIONS.find((s) => s.href === current)?.label ?? '';

  return (
    <div className="mb-10 flex w-full items-center justify-between gap-4">
      <Link
        href="/"
        className="flex items-center gap-2 font-mono text-sm text-neutral-500 transition-colors hover:text-neutral-300"
      >
        <FontAwesomeIcon icon={faArrowLeft} size="sm" />
        back to typing
      </Link>

      {/* Kept for document structure; the active tab carries it visually. */}
      <h1 className="sr-only">{title}</h1>

      <nav aria-label="Sections" className="flex items-center gap-0.5">
        {SECTIONS.map((s) => {
          const active = s.href === current;
          return (
            <Link
              key={s.href}
              href={s.href}
              aria-label={s.label}
              aria-current={active ? 'page' : undefined}
              className={`flex items-center gap-2 rounded-md px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-widest transition-colors ${
                active
                  ? 'bg-yellow-500/10 text-yellow-500'
                  : 'text-neutral-500 hover:bg-neutral-800/60 hover:text-neutral-300'
              }`}
            >
              <FontAwesomeIcon icon={s.icon} size="sm" />
              <span className="hidden sm:inline">{s.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
