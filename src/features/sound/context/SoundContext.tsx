/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, {
  createContext,
  useContext,
  useRef,
  useCallback,
  useMemo,
} from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export type SoundOption =
  | 'none'
  | 'punch'
  | 'click'
  | 'beep'
  | 'creamy'
  | 'hitmarker'
  | 'osu'
  | 'pop'
  | 'typewriter'
  | 'error';

interface SoundContextType {
  soundName: SoundOption;
  setSoundName: (name: SoundOption) => void;
  volume: number;
  setVolume: (volume: number) => void;
  playKeystroke: () => void;
  playErrorSound: () => void;
  playPreview: () => void;
  preload: () => void;
}

const SoundContext = createContext<SoundContextType | undefined>(undefined);

const SOUND_FILES_COUNT: Record<string, number> = {
  punch: 8,
  click: 3,
  beep: 3,
  error: 5,
  creamy: 12,
  hitmarker: 6,
  osu: 6,
  pop: 3,
  typewriter: 12,
};

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundName, setSoundName] = useLocalStorage<SoundOption>('sound:name', 'creamy');
  const [volume, setVolume] = useLocalStorage<number>('sound:volume', 0.4);

  const audioCtxRef = useRef<AudioContext | null>(null);

  const bufferCache = useRef<Map<string, AudioBuffer[]>>(new Map());

  const getAudioCtx = () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
    }
    return audioCtxRef.current;
  };

  const loadBuffers = useCallback(async (name: string) => {
    const cached = bufferCache.current.get(name);
    if (cached) return cached;

    const ctx = getAudioCtx();
    const count = SOUND_FILES_COUNT[name] || 1;
    const buffers = await Promise.all(
      Array.from({ length: count }).map((_, i) =>
        fetch(`/assets/sounds/${name}/${name}${i + 1}.wav`)
          .then((res) => {
            if (!res.ok) throw new Error(`Failed to load ${name}${i + 1}.wav`);
            return res.arrayBuffer();
          })
          .then((data) => ctx.decodeAudioData(data))
      )
    );

    bufferCache.current.set(name, buffers);
    return buffers;
  }, []);

  const playSample = useCallback(
    async (name: SoundOption) => {
      if (name === 'none') return;

      const ctx = getAudioCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      let buffers: AudioBuffer[];
      try {
        buffers = await loadBuffers(name);
      } catch {
        return;
      }
      if (!buffers.length) return;

      const source = ctx.createBufferSource();
      source.buffer = buffers[Math.floor(Math.random() * buffers.length)];
      source.playbackRate.value = 0.95 + Math.random() * 0.1;

      const gainNode = ctx.createGain();
      gainNode.gain.value = volume;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);
      source.start(0);
    },
    [loadBuffers, volume]
  );

  const playKeystroke = useCallback(() => playSample(soundName), [playSample, soundName]);

  const playErrorSound = useCallback(async () => {
    const ctx = getAudioCtx();
    if (ctx.state === 'suspended') await ctx.resume();

    let buffers: AudioBuffer[];
    try {
      buffers = await loadBuffers('error');
    } catch {
      return;
    }
    if (!buffers.length) return;

    const source = ctx.createBufferSource();
    source.buffer = buffers[0];

    const gainNode = ctx.createGain();
    gainNode.gain.value = 0.3;

    source.connect(gainNode);
    gainNode.connect(ctx.destination);
    source.start(0);
  }, [loadBuffers]);

  const preload = useCallback(() => {
    if (soundName !== 'none') void loadBuffers(soundName).catch(() => {});
    void loadBuffers('error').catch(() => {});
  }, [soundName, loadBuffers]);

  const value = useMemo(
    () => ({
      playKeystroke,
      playErrorSound,
      playPreview: playKeystroke,
      preload,
      setSoundName,
      soundName,
      volume,
      setVolume,
    }),
    [playKeystroke, playErrorSound, preload, setSoundName, soundName, volume, setVolume]
  );

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>;
}

export const useSound = () => {
  const context = useContext(SoundContext);
  if (!context) throw new Error('useSound must be used within SoundProvider');
  return context;
};
