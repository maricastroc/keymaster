'use client';

import { useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react';
import { useConfig } from '@/features/settings/context/ConfigContext';
import useRequest from '@/features/typing/hooks/useRequest';
import { TextResponse } from '@/types/textResponse';
import { api } from '@/lib/axios';

/**
 * Owns the "which text are we typing" concern: the current text + id, the SWR
 * fetch driven by category/difficulty, and the imperative Randomize / Next /
 * custom-text / retry actions.
 *
 * It deliberately does NOT touch the typing engine. The consumer resets the
 * engine reactively when `currentText` changes, which keeps this hook and the
 * engine decoupled (the engine needs `currentText`; wiring reset in here would
 * make them mutually dependent).
 *
 * `hasInteractedRef` is shared with the consumer: once the user has engaged,
 * text loads should land ready-to-type rather than re-showing the Start overlay.
 *
 * In practice mode the text source flips entirely: the database fetch is
 * disabled and every text-producing action (initial load, Randomize, Next)
 * yields a freshly generated weak-key drill via `makeDrill`.
 */
export function useTextLoader(
  hasInteractedRef: MutableRefObject<boolean>,
  practice: boolean,
  makeDrill: () => string,
) {
  const { category, setCategory, difficulty } = useConfig();

  const [currentText, setCurrentText] = useState('');
  const [currentTextId, setCurrentTextId] = useState<string | null>(null);
  const [isNextLoading, setIsNextLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const isRandomizingRef = useRef(false);
  const skipNextSWREffectRef = useRef(false);

  // Always call the latest generator (it closes over weak keys, which change as
  // rounds complete) without making the practice effect depend on its identity.
  const makeDrillRef = useRef(makeDrill);
  useEffect(() => {
    makeDrillRef.current = makeDrill;
  });

  const requestConfig = useMemo(() => {
    // Disable the DB fetch entirely in practice mode so it can't clobber a drill.
    if (isRandomizingRef.current || practice) return null;
    return {
      url: '/texts/random',
      method: 'GET',
      params: { category, difficulty },
    };
  }, [category, difficulty, practice]);

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

    // A manual Randomize/Next already set the text and changed the category,
    // which triggers this revalidation — skip it so we don't clobber the pick.
    if (skipNextSWREffectRef.current) {
      skipNextSWREffectRef.current = false;
      return;
    }

    setCurrentText(data.content);
    setCurrentTextId(data.id ?? null);
  }, [data]);

  // Imperatively pull a fresh DB text for the current filters. Used when leaving
  // practice mode, where SWR would otherwise return its (unchanged) cached text
  // without re-running the effect above.
  const loadFromDb = async () => {
    setIsNextLoading(true);
    setLoadError(null);
    try {
      const res = await api.get<TextResponse>('/texts/random', {
        params: { category, difficulty },
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

  // React to entering/leaving practice mode. The first run only establishes the
  // baseline: a non-practice mount is handled by SWR, but a mount that's already
  // in practice needs its first drill generated here.
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
    // Only the practice flag should drive this; makeDrill is read via ref.
  }, [practice]);

  const randomize = async () => {
    // In practice mode, "randomize" just rolls a new weak-key drill.
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
        params: { category: 'any', difficulty, excludeId: currentTextId },
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
      // Must always reset: while true, requestConfig stays null and SWR is
      // permanently disabled, so leaving it set on error would freeze loading.
      isRandomizingRef.current = false;
    }
  };

  const next = async () => {
    // In practice mode, "next" generates the next weak-key drill.
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

    // The API returns 404 (axios rejects) when a filter bucket is empty, so
    // treat any failure as "no text here".
    const fetchText = async (cat: string) => {
      try {
        const res = await api.get<TextResponse>('/texts/random', {
          params: { category: cat, difficulty, excludeId: currentTextId },
        });
        return res.data?.content ? res.data : null;
      } catch {
        return null;
      }
    };

    try {
      // Prefer another text in the current category; if that bucket is exhausted
      // at this difficulty, fall back to any category so "Next" never dead-ends.
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
