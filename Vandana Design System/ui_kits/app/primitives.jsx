/* UI Kit — Vandana app components (Babel JSX)
   Exposes globals: Icon, SongCard, BottomNav, DailyVerse, LanguageToggle, FontSizeControl,
   HomeScreen, SongScreen, PresentScreen, SettingsScreen, FavouritesScreen, UpdatesScreen,
   AppShell, SAMPLE_SONGS, SAMPLE_VERSE */

const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ---------- Sample data (copied verbatim from repo JSON) ----------
const SAMPLE_SONGS = [
  { id: "vandana", title: "Vandana", artist: "Ankit Sajwan Ministries", church: "FOLJ Church",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: {
      hinglish: {
        verse1: "Teri vandana gaayein shaamon savere\nTeri ho mahima\nRaajaon ka Raja Tu mera Prabhu hai\nTeri ho mahima",
        chorus: "Yeshu mahima Teri mahima\nMere Raja Yeshua gaoon Teri mahima\nYeshu mahima Teri mahima\nMere Raja Yeshua gaoon Teri mahima",
        bridge: "Prem jo kiya hai Tune\nTyaaga na kabhi jo Tune\nKaise na karein mahima"
      },
      hindi: {
        verse1: "तेरी वंदना गाएँ शामों सवेरे\nतेरी हो महिमा\nराजाओं का राजा तू मेरा प्रभु है\nतेरी हो महिमा",
        chorus: "येशु महिमा तेरी महिमा\nमेरे राजा येशुआ गाऊँ तेरी महिमा\nयेशु महिमा तेरी महिमा\nमेरे राजा येशुआ गाऊँ तेरी महिमा",
        bridge: "प्रेम जो किया है तूने\nत्यागा ना कभी जो तूने\nकैसे ना करें महिमा"
      }
    } },
  { id: "chamka-sitara", title: "Chamka Sitara", artist: "Br. Ankur Masih & Ps. Bharat", church: "ICM",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: {
      hinglish: {
        chorus: "Chamka chamka ek sitara, janma janma Yeshu pyara\nChamka chamka ek sitara, janma janma Yeshu pyara\n\nDharti jhoome Hallelujah, ambar jhoome Hallelujah\nDharti jhoome Hallelujah, jhoome yeh jag saara",
        verse1: "Janma hai aaj Yeshu pyara pyara\nRoshan hua hai jag saara saara\n\nTum bhi nacho Hallelujah, hum bhi naache Hallelujah\nTum bhi nacho Hallelujah, naache Delhi saara"
      },
      hindi: {
        chorus: "चमका चमका एक सितारा, जन्मा जन्मा येशु प्यारा\nचमका चमका एक सितारा, जन्मा जन्मा येशु प्यारा\n\nधरती झूमे हालेलुया, अंबर झूमे हालेलुया\nधरती झूमे हालेलुया, झूमे ये जग सारा",
        verse1: "जन्मा है आज येशु प्यारा प्यारा\nरोशन हुआ है जग सारा सारा\n\nतुम भी नाचो हालेलुया, हम भी नाचे हालेलुया\nतुम भी नाचो हालेलुया, नाचे दिल्ली सारा"
      }
    } },
  { id: "kadosh-kadosh", title: "Kadosh Kadosh", artist: "ICM Church Worship Team", church: "ICM",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: { hinglish: { chorus: "Kadosh, Kadosh, Kadosh, Kadosh\nWoh Khuda ka memna sinhasan par\nKeval tu stuti ke yogya hai" },
              hindi: { chorus: "कदोश, कदोश, कदोश, कदोश\nवो ख़ुदा का मेमना सिंहासन पर\nकेवल तू स्तुति के योग्य है" } } },
  { id: "yeshua-hamashiach", title: "Yeshua Hamashiach", artist: "Sheldon Bangera", church: "Nation of Worship",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: { hinglish: { chorus: "Yeshua Hamashiach\nTu hai mera Prabhu\nYeshua Hamashiach\nTeri mahima sada" },
              hindi: { chorus: "येशुआ हमशीयाख\nतू है मेरा प्रभु\nयेशुआ हमशीयाख\nतेरी महिमा सदा" } } },
  { id: "rang-liya", title: "Rang Liya", artist: "Ankit Sajwan", church: "FOLJ Church",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: { hinglish: { chorus: "Tune mujhe rang liya\nApne prem se rang liya" },
              hindi: { chorus: "तूने मुझे रंग लिया\nअपने प्रेम से रंग लिया" } } },
  { id: "zinda-khuda", title: "Zinda Khuda", artist: "ICM Worship", church: "ICM",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: { hinglish: { chorus: "Zinda Khuda, Zinda Khuda\nTu hai Zinda Khuda" },
              hindi: { chorus: "ज़िंदा ख़ुदा, ज़िंदा ख़ुदा\nतू है ज़िंदा ख़ुदा" } } },
  { id: "haq-tala", title: "Haq Tala", artist: "Anil Kant", church: "Masihi Geet",
    language_default: "hinglish", languages_available: ["hinglish","hindi"],
    lyrics: { hinglish: { chorus: "Haq Tala, Haq Tala\nTera naam Haq Tala" },
              hindi: { chorus: "हक़ तआला, हक़ तआला\nतेरा नाम हक़ तआला" } } },
];

const SAMPLE_VERSE = {
  english: "The Lord is my shepherd; I shall not want. He maketh me to lie down in green pastures.",
  reference: "Psalm 23:1–2",
  hindi: "यहोवा मेरा चरवाहा है, मुझे कुछ घटी न होगी। वह मुझे हरी हरी चराइयों में बैठाता है।",
  reference_hindi: "भजन 23:1–2",
};

// ---------- Icon primitive (Lucide-style inline SVGs) ----------
const ICON_PATHS = {
  house: <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>,
  bell: <><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></>,
  heart: <path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.7 0-3 .5-4.5 2-1.5-1.5-2.8-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7Z"/>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></>,
  search: <><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></>,
  chevronRight: <path d="m9 18 6-6-6-6"/>,
  chevronLeft: <path d="m15 18-6-6 6-6"/>,
  share: <><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></>,
  play: <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" stroke="none"/>,
  pause: <><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></>,
  searchX: <><circle cx="11" cy="11" r="8"/><line x1="8.5" y1="8.5" x2="13.5" y2="13.5"/><line x1="13.5" y1="8.5" x2="8.5" y2="13.5"/></>,
  heartOff: <><path d="M19 14c1.5-1.5 3-3.3 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.7 0-3 .5-4.5 2-1.5-1.5-2.8-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.2 1.5 4 3 5.5l7 7Z"/><line x1="2" y1="2" x2="22" y2="22"/></>,
  x: <><path d="m6 6 12 12"/><path d="m6 18 12-12"/></>,
};
const Icon = ({ name, size = 24, stroke = 2, fill = "none", color = "currentColor", style }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color}
    strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {ICON_PATHS[name]}
  </svg>
);

// ---------- Star (brand flourish) ----------
const Star = ({ size = 14, opacity = 0.3 }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ opacity }}>
    <path d="M8 0 L9.5 6.5 L16 8 L9.5 9.5 L8 16 L6.5 9.5 L0 8 L6.5 6.5 Z" stroke="var(--accent)" strokeWidth="1" fill="none"/>
  </svg>
);

Object.assign(window, { Icon, Star, SAMPLE_SONGS, SAMPLE_VERSE });
