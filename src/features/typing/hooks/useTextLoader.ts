'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useConfig } from '@/features/settings/context/ConfigContext';
import useRequest from '@/features/typing/hooks/useRequest';
import { TextResponse } from '@/types/textResponse';
import { api } from '@/lib/axios';

export function useTextLoader(
  hasInteractedRef: MutableRefObject<boolean>,
  practice: boolean,
  makeDrill: () => string,
) {
  const { category, setCategory, difficulty, language } = useConfig();

  const [currentText, setCurrentText] = useState('');
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isRandomizingRef = useRef(false);
  const skipNextSWREffectRef = useRef(false);

  const makeDrillRef = useRef(makeDrill);
  useEffect(() => {
    makeDrillRef.current = makeDrill;
  });

  const requestConfig = useMemo(() => {
    if (isRandomizingRef.current || practice) return null;
    return {
      url: '/texts/random',
      method: 'GET',
      params: { category, difficulty, language },
    };
  }, [category, difficulty, language, practice]);

  const { data, isValidating, error, mutate } = useRequest<TextResponse>(
    requestConfig,
    {
      revalidateOnMount: true,
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
    }
  );

  useEffect(() => {
    if (!data?.content) return;
    setLoadError(null);

    if (skipNextSWREffectRef.current) {
      skipNextSWREffectRef.current = false;
      return;
    }

    setCurrentText(data.content);
    setCurrentTextId(data.id ?? null);
  }, [data]);

  const loadFromDb = async () => {
    setIsNextLoading(true);
    setLoadError(null);
    try {
      const res = await api.get<TextResponse>('/texts/random', {
        params: { category, difficulty, language },
      });
      if (res.data?.content) {
        setCurrentText(res.data.content);
        setCurrentTextId(res.data.id ?? null);
      } else {
        setLoadError('No texts available for these settings.');
      }
    } catch {
      setLoadError('Could not load a new text. Please try again.');
    } finally {
      setIsNextLoading(false);
    }
  };

  const practiceInitRef = useRef(false);
  useEffect(() => {
    if (!practiceInitRef.current) {
      practiceInitRef.current = true;
      if (practice) {
        setCurrentTextId(null);
        setCurrentText(makeDrillRef.current());
      }
      return;
    }

    hasInteractedRef.current = true;
    if (practice) {
      setLoadError(null);
      setCurrentTextId(null);
      setCurrentText(makeDrillRef.current());
    } else {
      void loadFromDb();
    }
  }, [practice]);

  const randomize = async () => {
    if (practice) {
      hasInteractedRef.current = true;
      setLoadError(null);
      setCurrentTextId(null);
      setCurrentText(makeDrillRef.current());
      return;
    }

    isRandomizingRef.current = true;
    hasInteractedRef.current = true;
    setLoadError(null);

    try {
      const response = await api.get<TextResponse>('/texts/random', {
        params: { category: 'any', difficulty, language, excludeId: currentTextId },
      });

      if (response.data) {
        skipNextSWREffectRef.current = true;
        setCategory(response.data.category);
        setCurrentText(response.data.content);
        setCurrentTextId(response.data.id);
      }
    } catch {
      setLoadError('Could not load a new text. Please try again.');
    } finally {
      isRandomizingRef.current = false;
    }
  };

  const next = async () => {
    if (practice) {
      hasInteractedRef.current = true;
      setLoadError(null);
      setCurrentTextId(null);
      setCurrentText(makeDrillRef.current());
      return;
    }

    setIsNextLoading(true);
    setLoadError(null);
    hasInteractedRef.current = true;

    const fetchText = async (cat: string) => {
      try {
        const res = await api.get<TextResponse>('/texts/random', {
          params: { category: cat, difficulty, language, excludeId: currentTextId },
        });
        return res.data?.content ? res.data : null;
      } catch {
        return null;
      }
    };

    try {
      let picked = await fetchText(category);
      if (!picked) picked = await fetchText('any');

      if (picked) {
        if (picked.category && picked.category !== category) {
          skipNextSWREffectRef.current = true;
          setCategory(picked.category);
        }
        setCurrentText(picked.content);
        setCurrentTextId(picked.id ?? null);
      } else {
        setLoadError('No other texts available for these settings.');
      }
    } finally {
      setIsNextLoading(false);
    }
  };

  const setCustomText = (text: string) => {
    hasInteractedRef.current = true;
    setLoadError(null);
    setCurrentTextId(null);
    setCurrentText(text);
  };

  const retry = () => {
    setLoadError(null);
    mutate();
  };

  return {
    currentText,
    isNextLoading,
    isValidating,
    error,
    loadError,
    randomize,
    next,
    setCustomText,
    retry,
  };
}
