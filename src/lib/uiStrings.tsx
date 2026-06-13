"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

/**
 * App-chrome language (navigation, headers, buttons, empty states).
 * Separate from the lyrics language preference — a Devanagari reader may
 * still prefer English UI, and vice versa.
 */
export type UILanguage = "en" | "hi";

export const UI_LANGUAGE_STORAGE_KEY = "vandana-ui-lang";
const UI_LANGUAGE_EVENT = "vandana-ui-lang-change";

const EN = {
  // Navigation
  navHome: "Home",
  navUpdates: "Updates",
  navSetlist: "Setlist",
  navFavourites: "Favourites",
  navSaved: "Saved",
  navSettings: "Settings",

  // Home
  searchPlaceholder: "Search songs, lyrics...",
  searchAriaLabel: "Search songs, artists, and lyrics",
  filterAll: "All",
  sectionSongs: "Songs",
  sectionMoreResults: "More Results",
  recentlyViewed: "Recently viewed",
  showMoreSongs: "Show more songs",
  showMoreResults: "Show more results",
  searchingLyrics: "Searching inside lyrics…",
  searchingLyricsTitle: "Searching lyrics…",
  noMatchingSongs: "No matching songs",
  noSongsInFilter: "No songs in this filter",
  clearFilters: "Clear filters",
  libraryLabel: "Library",
  songsWord: "songs",
  songWord: "song",
  clear: "Clear",
  longPressHint: "Tip: hold any song to save it to favourites",
  dismissHint: "Dismiss tip",
  browseByLetter: "Browse by first letter",
  emptySearchDesc: 'Try a shorter lyric phrase, artist name, or clear filters for "{query}". Fuzzy search catches close spellings too.',
  emptyFilterDesc: "No songs are available for this filter yet.",
  emptyNoSongsTitle: "No songs yet.",
  emptyNoSongsDesc: "The bundled library did not return songs.",
  offlineLibrary: "Using offline library",

  // Song page
  back: "Back",
  present: "Present",
  linkCopied: "Link copied!",
  imageShared: "Image ready to share",
  shareLink: "Share link",
  shareImage: "Share as image",
  reportMistake: "Spotted a lyric mistake? Tell us",

  // Setlist
  setlistTitle: "Setlist",
  presentSetlist: "Present setlist",
  setlistEmptyTitle: "Build tonight's flow",
  setlistEmptyBody: "Add songs from the library, then present them in order during worship.",
  browseSongs: "Browse songs",
  moveUp: "Move up",
  moveDown: "Move down",
  clearSetlist: "Clear setlist",

  // Favourites
  favouritesTitle: "Favourites",
  favouritesEmptyTitle: "No favourites yet",
  favouritesEmptyBody: "Tap the heart beside any song to keep it ready for worship.",

  // Settings
  settingsTitle: "Settings",
  appearance: "Appearance",
  themeDark: "Dark",
  themeLight: "Light",
  themeAuto: "Auto",
  themeAutoHint: "Auto follows your device's light or dark setting.",
  appLanguage: "App Language",
  defaultLanguage: "Default Lyrics Language",
  lyricsFontSize: "Lyrics Font Size",
  lyricsFontSizeHint: "Default size for all songs",
};

export type UIStrings = typeof EN;

const HI: UIStrings = {
  navHome: "होम",
  navUpdates: "अपडेट्स",
  navSetlist: "सेटलिस्ट",
  navFavourites: "पसंदीदा",
  navSaved: "पसंदीदा",
  navSettings: "सेटिंग्स",

  searchPlaceholder: "गीत या बोल खोजें...",
  searchAriaLabel: "गीत, गायक और बोल खोजें",
  filterAll: "सभी",
  sectionSongs: "गीत",
  sectionMoreResults: "अन्य परिणाम",
  recentlyViewed: "हाल में देखे गए",
  showMoreSongs: "और गीत दिखाएं",
  showMoreResults: "और परिणाम दिखाएं",
  searchingLyrics: "बोल में खोज जारी है…",
  searchingLyricsTitle: "बोल में खोज रहे हैं…",
  noMatchingSongs: "कोई गीत नहीं मिला",
  noSongsInFilter: "इस फ़िल्टर में कोई गीत नहीं",
  clearFilters: "फ़िल्टर हटाएं",
  libraryLabel: "लाइब्रेरी",
  songsWord: "गीत",
  songWord: "गीत",
  clear: "हटाएं",
  longPressHint: "सुझाव: किसी गीत को देर तक दबाकर पसंदीदा में जोड़ें",
  dismissHint: "सुझाव हटाएं",
  browseByLetter: "पहले अक्षर से ब्राउज़ करें",
  emptySearchDesc: 'छोटा बोल-वाक्य या गायक का नाम आज़माएं, या "{query}" के लिए फ़िल्टर हटाएं। मिलती-जुलती स्पेलिंग भी खोज में आ जाती है।',
  emptyFilterDesc: "इस फ़िल्टर के लिए अभी कोई गीत उपलब्ध नहीं है।",
  emptyNoSongsTitle: "अभी कोई गीत नहीं।",
  emptyNoSongsDesc: "लाइब्रेरी से गीत नहीं मिल पाए।",
  offlineLibrary: "ऑफ़लाइन लाइब्रेरी चालू है",

  back: "वापस",
  present: "प्रस्तुत करें",
  linkCopied: "लिंक कॉपी हो गया!",
  imageShared: "इमेज शेयर के लिए तैयार",
  shareLink: "लिंक शेयर करें",
  shareImage: "इमेज शेयर करें",
  reportMistake: "बोल में गलती दिखी? हमें बताएं",

  setlistTitle: "सेटलिस्ट",
  presentSetlist: "सेटलिस्ट प्रस्तुत करें",
  setlistEmptyTitle: "आज की आराधना तैयार करें",
  setlistEmptyBody: "लाइब्रेरी से गीत जोड़ें, फिर आराधना में क्रम से प्रस्तुत करें।",
  browseSongs: "गीत देखें",
  moveUp: "ऊपर ले जाएं",
  moveDown: "नीचे ले जाएं",
  clearSetlist: "सेटलिस्ट खाली करें",

  favouritesTitle: "पसंदीदा",
  favouritesEmptyTitle: "अभी कोई पसंदीदा नहीं",
  favouritesEmptyBody: "किसी भी गीत के पास दिल पर टैप करें और उसे आराधना के लिए तैयार रखें।",

  settingsTitle: "सेटिंग्स",
  appearance: "थीम",
  themeDark: "डार्क",
  themeLight: "लाइट",
  themeAuto: "ऑटो",
  themeAutoHint: "ऑटो आपके फ़ोन की लाइट/डार्क सेटिंग के अनुसार चलता है।",
  appLanguage: "ऐप की भाषा",
  defaultLanguage: "बोल की डिफ़ॉल्ट भाषा",
  lyricsFontSize: "बोल का आकार",
  lyricsFontSizeHint: "सभी गीतों के लिए डिफ़ॉल्ट आकार",
};

const STRINGS: Record<UILanguage, UIStrings> = { en: EN, hi: HI };

function getStoredUILanguage(): UILanguage {
  if (typeof window === "undefined") return "en";
  const stored = window.localStorage.getItem(UI_LANGUAGE_STORAGE_KEY);
  return stored === "hi" ? "hi" : "en";
}

interface UILanguageCtx {
  uiLang: UILanguage;
  setUILang: (lang: UILanguage) => void;
  t: UIStrings;
}

const UILanguageContext = createContext<UILanguageCtx>({
  uiLang: "en",
  setUILang: () => {},
  t: EN,
});

export function UILanguageProvider({ children }: { children: ReactNode }) {
  // SSR always renders English; the stored preference applies after
  // hydration (same pattern as the theme) to keep markup in sync.
  const [uiLang, setUILangState] = useState<UILanguage>("en");

  useEffect(() => {
    setUILangState(getStoredUILanguage());
  }, []);

  const setUILang = useCallback((lang: UILanguage) => {
    setUILangState(lang);
    try {
      localStorage.setItem(UI_LANGUAGE_STORAGE_KEY, lang);
      window.dispatchEvent(new CustomEvent(UI_LANGUAGE_EVENT));
    } catch {
      /* ignore */
    }
  }, []);

  return (
    <UILanguageContext.Provider value={{ uiLang, setUILang, t: STRINGS[uiLang] }}>
      {children}
    </UILanguageContext.Provider>
  );
}

export function useUIStrings() {
  return useContext(UILanguageContext);
}

/**
 * For components rendered outside the Providers tree (e.g. DesktopNav in the
 * root layout). Reads the stored preference and follows changes via events.
 */
export function useUIStringsStandalone(): { uiLang: UILanguage; t: UIStrings } {
  const [uiLang, setUILangState] = useState<UILanguage>("en");

  useEffect(() => {
    const sync = () => setUILangState(getStoredUILanguage());
    sync();
    window.addEventListener(UI_LANGUAGE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(UI_LANGUAGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return { uiLang, t: STRINGS[uiLang] };
}
