import type { Language } from "@/lib/getSongs";

export const DEFAULT_LANGUAGE_STORAGE_KEY = "vandana-default-lang";
export const LANGUAGE_ORDER: Language[] = ["hinglish", "hindi"];

export function isLanguage(value: unknown): value is Language {
  return value === "hinglish" || value === "hindi";
}

export function getStoredDefaultLanguage(): Language {
  if (typeof window === "undefined") return "hinglish";
  const stored = window.localStorage.getItem(DEFAULT_LANGUAGE_STORAGE_KEY);
  return isLanguage(stored) ? stored : "hinglish";
}

export function getOrderedLanguages(languages: Language[]): Language[] {
  return LANGUAGE_ORDER.filter((language) => languages.includes(language));
}

export function pickPreferredLanguage(
  languages: Language[],
  preferred: Language,
  fallback?: Language,
): Language {
  if (languages.includes(preferred)) return preferred;
  if (fallback && languages.includes(fallback)) return fallback;
  return getOrderedLanguages(languages)[0] ?? languages[0] ?? "hinglish";
}
