import type { GetServerSideProps } from 'next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';
import { getServerSession } from 'next-auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faTrophy } from '@fortawesome/free-solid-svg-icons';

import { authOptions } from '@/lib/auth';
import { getPublicProfile, type PublicProfileData } from '@/features/profile/logic/publicProfile';
import { rankTier, TIER_COLOR } from '@/features/leaderboard/logic/tiers';
import { StatTile } from '@/features/stats/components/StatTile';
import { BreakdownTable } from '@/features/stats/components/BreakdownTable';
import { formatDuration } from '@/features/stats/logic/formatDuration';
import { Footer } from '@/components/Footer';

const WpmTrendChart = dynamic(
  () => import('@/features/stats/components/WpmTrendChart').then((m) => m.WpmTrendChart),
  { ssr: false, loading: () => <div className="h-66" aria-hidden /> }
);

type Props = {
  data: PublicProfileData;
  isViewerOwner: boolean;
};

function Avatar({ name, image }: { name: string; image: string | null }) {
  if (image) {
    return (
      <Image
        src={image}
        alt={name}
        width={72}
        height={72}
        className="rounded-full opacity-90"
      />
    );
  }
  return (
    <div className="flex h-[72px] w-[72px] items-center justify-center rounded-full bg-neutral-700 font-mono text-2xl text-neutral-300">
      {name[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function ProfilePage({ data, isViewerOwner }: Props) {
  const { profile, stats, rank } = data;

  const name = profile.name ?? 'Anonymous typist';
  const tier = rank ? rankTier(rank) : null;
  const hasRounds = stats.totalRounds > 0;
  const memberSince = new Date(profile.memberSince).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
  });
  const description = hasRounds
    ? `${stats.bestWpm} WPM best across ${stats.totalRounds} rounds on Keymaster.`
    : `${name} on Keymaster.`;
  const title = `${name} · Keymaster`;

  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="profile" />
        {profile.image && <meta property="og:image" content={profile.image} />}
        <meta name="twitter:card" content="summary" />
      </Head>

      <div className="relative flex min-h-screen flex-col items-center px-4 py-6 md:py-10">
        <div className="w-full max-w-5xl">
          <div className="mb-10 flex items-center justify-between gap-4">
            <Link
              href="/"
              className="flex items-center gap-2 font-mono text-sm text-neutral-500 transition-colors hover:text-neutral-300"
            >
              <FontAwesomeIcon icon={faArrowLeft} size="sm" />
              back to typing
            </Link>
            <Link
              href="/leaderboard"
              aria-label="Leaderboard"
              className="flex items-center gap-2 rounded-md px-2.5 py-1 font-display text-xs font-semibold uppercase tracking-widest text-neutral-500 transition-colors hover:bg-neutral-800/60 hover:text-neutral-300"
            >
              <FontAwesomeIcon icon={faTrophy} size="sm" />
              <span className="hidden sm:inline">Leaderboard</span>
            </Link>
          </div>

          <header className="flex flex-col items-center gap-4 text-center sm:flex-row sm:gap-6 sm:text-left">
            <Avatar name={name} image={profile.image} />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-center gap-3 sm:justify-start">
                <h1 className="font-mono text-2xl font-bold text-neutral-200">{name}</h1>
                {isViewerOwner && (
                  <span className="rounded bg-yellow-500/15 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-yellow-500">
                    you
                  </span>
                )}
              </div>
              <p className="font-mono text-xs text-neutral-500">Typing since {memberSince}</p>
              {rank && (
                <div className="mt-1 flex items-center justify-center gap-1.5 sm:justify-start">
                  <span
                    className="font-mono text-sm font-bold tabular-nums"
                    style={{ color: tier ? TIER_COLOR[tier] : 'var(--color-neutral-400)' }}
                  >
                    #{rank}
                  </span>
                  <span className="font-mono text-xs text-neutral-500">all-time by best WPM</span>
                </div>
              )}
            </div>

            {hasRounds && (
              <div className="flex flex-col items-center sm:ml-auto">
                <span className="font-mono text-4xl font-bold tabular-nums text-yellow-500">
                  {stats.bestWpm}
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-neutral-500">
                  best wpm
                </span>
              </div>
            )}
          </header>

          {!hasRounds ? (
            <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
              <p className="font-mono text-sm text-neutral-400">No public rounds yet.</p>
              <p className="max-w-xs font-mono text-xs text-neutral-500">
                This typist hasn&apos;t completed any signed-in tests.
              </p>
            </div>
          ) : (
            <div className="mt-10 flex flex-col gap-10">
              <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-neutral-800 bg-neutral-800 sm:grid-cols-3 lg:grid-cols-6">
                <StatTile label="Rounds" value={stats.totalRounds} />
                <StatTile label="Avg WPM" value={stats.avgWpm} />
                <StatTile label="Best WPM" value={<span className="text-yellow-500">{stats.bestWpm}</span>} />
                <StatTile label="Avg Acc" value={`${stats.avgAccuracy}%`} />
                <StatTile
                  label="Consistency"
                  value={stats.totalRounds >= 2 ? `${stats.consistency}%` : '—'}
                />
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

              {isViewerOwner && (
                <Link
                  href="/stats"
                  className="mx-auto rounded-lg border border-neutral-700 px-4 py-2 font-mono text-sm text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-300"
                >
                  View your detailed stats &amp; key heatmap →
                </Link>
              )}
            </div>
          )}

          <Footer />
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<Props> = async (ctx) => {
  const userId = ctx.params?.userId;
  if (typeof userId !== 'string') return { notFound: true };

  const data = await getPublicProfile(userId);
  if (!data) return { notFound: true };

  const session = await getServerSession(ctx.req, ctx.res, authOptions);
  const isViewerOwner = session?.user?.id === data.profile.id;

  return { props: { data, isViewerOwner } };
};
