// contexts/ConfigContext.tsx
'use client';

import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

type GameMode = 'timed' | 'passage';
type Theme = 'dark' | 'light';

type Category = 'general' | 'lyrics' | 'quotes' | 'code';
type Difficulty = 'easy' | 'medium' | 'hard';

interface ConfigContextType {
  mode: GameMode;
  setMode: (mode: GameMode) => void;

  category: Category;
  setCategory: (category: Category) => void;

  difficulty: Difficulty;
  setDifficulty: (difficulty: Difficulty) => void;

  initialTime: number;
  setInitialTime: (time: number) => void;

  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useLocalStorage<GameMode>('config:mode', 'timed');
  const [category, setCategory] = useLocalStorage<Category>('config:category', 'general');
  const [difficulty, setDifficulty] = useLocalStorage<Difficulty>('config:difficulty', 'easy');
  const [initialTime, setInitialTime] = useLocalStorage<number>('config:initialTime', 60);
  const [theme, setTheme] = useLocalStorage<Theme>('config:theme', 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Stable identity (setters from useLocalStorage are memoized) so consumers of
  // useConfig don't re-render on unrelated provider renders.
  const value = useMemo(
    () => ({
      mode,
      setMode,
      category,
      setCategory,
      difficulty,
      setDifficulty,
      initialTime,
      setInitialTime,
      theme,
      setTheme,
    }),
    [
      mode,
      setMode,
      category,
      setCategory,
      difficulty,
      setDifficulty,
      initialTime,
      setInitialTime,
      theme,
      setTheme,
    ]
  );

  return (
    <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>
  );
}

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context)
    throw new Error('useConfig must be used within ConfigProvider.');
  return context;
};
