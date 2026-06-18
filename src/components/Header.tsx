'use client';

import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClockRotateLeft, faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
import { faGithub } from '@fortawesome/free-brands-svg-icons';
import { usePersonalBest } from '@/features/typing/hooks/usePersonalBest';
import { signIn, signOut, useSession } from 'next-auth/react';
import { useState } from 'react';

type HeaderProps = {
  onOpenSettings: (value: boolean) => void;
  onOpenHistorySection: (value: boolean) => void;
};

export const Header = ({ onOpenSettings, onOpenHistorySection }: HeaderProps) => {
  const personalBest = usePersonalBest();
  const { data: session, status } = useSession();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="flex justify-between items-center w-full mb-8">
      <div className="flex items-center gap-2">
        <Image src="/assets/images/logo-small.svg" alt="Logo" width={24} height={24} className="opacity-80" />
        <span className="font-mono text-sm font-bold text-neutral-400 tracking-widest uppercase">
          speedtype
        </span>
      </div>

      <div className="flex items-center gap-4">
        {personalBest > 0 && (
          <div className="flex items-center gap-1.5 text-neutral-500 text-sm font-mono">
            <Image
              src="/assets/images/icon-personal-best.svg"
              alt="PB"
              width={14}
              height={14}
              className="opacity-50 trophy-icon"
            />
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

{status === 'authenticated' ? (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((v) => !v)}
              className="cursor-pointer flex items-center gap-2 hover:opacity-80 transition-opacity"
            >
              {session.user.image ? (
                <Image
                  src={session.user.image}
                  alt={session.user.name ?? 'User'}
                  width={24}
                  height={24}
                  className="rounded-full opacity-80"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-neutral-600 flex items-center justify-center text-xs">
                  {session.user.name?.[0] ?? '?'}
                </div>
              )}
            </button>

            {dropdownOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                <div className="absolute right-0 top-9 z-20 min-w-40 bg-neutral-800 border border-neutral-700 rounded-xl shadow-xl overflow-hidden">
                  <div className="px-4 py-3 border-b border-neutral-700">
                    <p className="text-sm font-medium text-neutral-100 truncate">{session.user.name}</p>
                    <p className="text-xs text-neutral-400 truncate">{session.user.email}</p>
                  </div>
                  <button
                    onClick={() => { setDropdownOpen(false); signOut(); }}
                    className="cursor-pointer w-full flex items-center gap-2 px-4 py-3 text-sm text-neutral-400 hover:bg-neutral-700 hover:text-white transition-colors"
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
            className="cursor-pointer flex items-center gap-1.5 text-xs font-mono text-neutral-500 hover:text-neutral-300 transition-colors border border-neutral-600 hover:border-neutral-500 px-3 py-1.5 rounded-lg"
          >
            <FontAwesomeIcon icon={faGithub} size="sm" />
            login
          </button>
        )}
      </div>
    </div>
  );
};
