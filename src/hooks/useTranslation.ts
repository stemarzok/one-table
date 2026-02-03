import { useState, useCallback, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

type Language = 'it' | 'en' | 'es' | 'de' | 'fr' | 'nl' | 'ru';

interface TranslationCache {
  [lang: string]: {
    [key: string]: string;
  };
}

// Global cache to persist across component mounts
const globalCache: TranslationCache = {};
const pendingRequests: Map<string, Promise<Record<string, string>>> = new Map();

export const useTranslation = () => {
  const [isTranslating, setIsTranslating] = useState(false);
  const [cache, setCache] = useState<TranslationCache>(globalCache);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Load cache from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('onetable_translations');
      if (stored) {
        const parsed = JSON.parse(stored);
        Object.assign(globalCache, parsed);
        setCache({ ...globalCache });
      }
    } catch (e) {
      console.error('Failed to load translation cache:', e);
    }
  }, []);

  // Save cache to localStorage
  const saveCache = useCallback((newCache: TranslationCache) => {
    Object.assign(globalCache, newCache);
    setCache({ ...globalCache });
    try {
      localStorage.setItem('onetable_translations', JSON.stringify(globalCache));
    } catch (e) {
      console.error('Failed to save translation cache:', e);
    }
  }, []);

  const translateTexts = useCallback(async (
    texts: { key: string; value: string }[],
    targetLanguage: Language,
    sourceLanguage: Language = 'it'
  ): Promise<Record<string, string>> => {
    // Check if all texts are already cached
    const cachedLang = globalCache[targetLanguage] || {};
    const missingTexts = texts.filter(t => !(t.key in cachedLang));

    if (missingTexts.length === 0) {
      // All cached
      const result: Record<string, string> = {};
      texts.forEach(t => {
        result[t.key] = cachedLang[t.key];
      });
      return result;
    }

    // Create a unique key for this request
    const requestKey = `${targetLanguage}:${missingTexts.map(t => t.key).join(',')}`;

    // Check if there's already a pending request for this
    if (pendingRequests.has(requestKey)) {
      const pending = await pendingRequests.get(requestKey);
      const result: Record<string, string> = {};
      texts.forEach(t => {
        result[t.key] = pending?.[t.key] || cachedLang[t.key] || t.value;
      });
      return result;
    }

    setIsTranslating(true);

    const translatePromise = (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: {
            texts: missingTexts,
            targetLanguage,
            sourceLanguage,
          },
        });

        if (error) {
          console.error('Translation error:', error);
          // Return original texts on error
          const fallback: Record<string, string> = {};
          missingTexts.forEach(t => {
            fallback[t.key] = t.value;
          });
          return fallback;
        }

        const translations = data.translations || {};

        // Update cache
        const newCache = { ...globalCache };
        if (!newCache[targetLanguage]) {
          newCache[targetLanguage] = {};
        }
        Object.assign(newCache[targetLanguage], translations);
        saveCache(newCache);

        return translations;
      } finally {
        pendingRequests.delete(requestKey);
        setIsTranslating(false);
      }
    })();

    pendingRequests.set(requestKey, translatePromise);

    const newTranslations = await translatePromise;

    // Merge with cached
    const result: Record<string, string> = {};
    texts.forEach(t => {
      result[t.key] = newTranslations[t.key] || cachedLang[t.key] || t.value;
    });
    return result;
  }, [saveCache]);

  const getCachedTranslation = useCallback((key: string, language: Language): string | null => {
    return globalCache[language]?.[key] || null;
  }, []);

  const clearCache = useCallback(() => {
    Object.keys(globalCache).forEach(key => delete globalCache[key]);
    setCache({});
    localStorage.removeItem('onetable_translations');
  }, []);

  return {
    translateTexts,
    getCachedTranslation,
    clearCache,
    isTranslating,
    cache,
  };
};
