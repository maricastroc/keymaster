'use client';

import Image from 'next/image';
import { useState, useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft, faRightFromBracket, faSun, faMoon, faVolumeHigh, faVolumeXmark, faPlay } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { usePersonalBest } from '@/features/typing/hooks/usePersonalBest';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useConfig } from '@/features/settings/context/ConfigContext';
import { useSound } from '@/features/sound/context/SoundContext';
import type { SoundOption } from '@/features/sound/context/SoundContext';

type HeaderProps = {
  onOpenHistorySection: (value: boolean) => void;
};

const SOUND_OPTIONS: { id: SoundOption; label: string }[] = [
  { id: 'creamy', label: 'Creamy' },
  { id: 'beep', label: 'Beep' },
  { id: 'osu', label: 'Osu' },
  { id: 'pop', label: 'Pop' },
  { id: 'punch', label: 'Punch' },
  { id: 'typewriter', label: 'Typewriter' },
  { id: 'click', label: 'Click' },
  { id: 'hitmarker', label: 'Hitmarker' },
  { id: 'none', label: 'Off' },
];

export const Header = ({ onOpenHistorySection }: HeaderProps) => {
  const personalBest = usePersonalBest();
  const { data: session, status } = useSession();
  const { theme, setTheme } = useConfig();
  const { soundName, setSoundName, volume, setVolume, playPreview } = useSound();

  const [userDropdown, setUserDropdown] = useState(false);
  const [soundPopover, setSoundPopover] = useState(false);
  const soundRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (soundRef.current && !soundRef.current.contains(e.target as Node)) {
        setSoundPopover(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="flex justify-between items-center w-full mb-8">
      <div className="flex items-center gap-2.5">
        <Image src="/assets/images/logo-keymaster.svg" alt="Keymaster logo" width={28} height={28} />
        <div className="flex flex-col gap-0">
          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-sm font-medium text-neutral-400 tracking-widest uppercase leading-none">
            keymaster
          </span>
          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }} className="text-[10px] text-neutral-600 tracking-wide leading-none mt-0.5 hidden md:block">
            master your keystrokes
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {personalBest > 0 && (
          <div className="flex items-center gap-1.5 text-neutral-500 text-sm font-mono">
            <Image src="/assets/images/icon-personal-best.svg" alt="PB" width={14} height={14} className="opacity-50 trophy-icon" />
            <span className="text-yellow-500 font-bold">{personalBest}</span>
            <span className="text-xs">wpm</span>
          </div>
        )}

        <button
          onClick={() => onOpenHistorySection(true)}
          className="cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          title="History"
        >
          <FontAwesomeIcon icon={faClockRotateLeft} size="sm" />
        </button>

        {/* Sound popover */}
        <div ref={soundRef} className="relative">
          <button
            onClick={() => setSoundPopover((v) => !v)}
            className="cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors p-1"
            title="Sound"
          >
            <FontAwesomeIcon icon={soundName === 'none' ? faVolumeXmark : faVolumeHigh} size="sm" />
          </button>

          {soundPopover && (
            <div className="absolute right-0 top-9 z-20 w-52 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl p-3 flex flex-col gap-3">
              <div className="flex flex-col gap-0.5">
                {SOUND_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSoundName(opt.id)}
                    className={`cursor-pointer text-left font-mono text-xs px-2.5 py-1.5 rounded transition-colors ${
                      soundName === opt.id ? 'text-yellow-500' : 'text-neutral-500 hover:text-neutral-300'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="border-t border-neutral-800 pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0" max="1" step="0.05"
                    value={volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="flex-1 h-1 rounded-full accent-yellow-500 cursor-pointer"
                  />
                  <span className="text-neutral-500 font-mono text-xs w-8 text-right tabular-nums">
                    {Math.round(volume * 100)}%
                  </span>
                </div>
                <button
                  onClick={playPreview}
                  className="cursor-pointer flex items-center gap-2 text-xs font-mono text-neutral-500 hover:text-yellow-500 transition-colors"
                >
                  <FontAwesomeIcon icon={faPlay} size="xs" />
                  preview
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="cursor-pointer text-neutral-500 hover:text-neutral-300 transition-colors p-1"
          title="Toggle theme"
        >
          <FontAwesomeIcon icon={theme === 'dark' ? faSun : faMoon} size="sm" />
        </button>

        {/* User */}
        {status === 'authenticated' ? (
          <div className="relative">
            <button
              onClick={() => setUserDropdown((v) => !v)}
              className="cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {session.user.image ? (
                <Image src={session.user.image} alt={session.user.name ?? 'User'} width={24} height={24} className="rounded-full opacity-80" />
              ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-600 flex items-center justify-center text-xs">
                  {session.user.name?.[0] ?? '?'}
                </div>
              )}
            </button>
            {userDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setUserDropdown(false)} />
                <div className="absolute right-0 top-9 z-20 min-w-40 bg-neutral-900 border border-neutral-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-700">
                    <p className="text-sm font-medium text-neutral-100 truncate">{session.user.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => { setUserDropdown(false); signOut(); }}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors"
                  >
                    <FontAwesomeIcon icon={faRightFromBracket} size="sm" />
                    Sign out
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="cursor-pointer flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors border border-neutral-700 hover:border-neutral-500 px-3 py-1.5 rounded-lg"
          >
            <FontAwesomeIcon icon={faGithub} size="sm" />
            login
          </button>
        )}
      </div>
    </div>
  );
};
