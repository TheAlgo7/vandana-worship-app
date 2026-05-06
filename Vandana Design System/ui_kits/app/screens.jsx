/* Vandana UI Kit — Screens (Home, Song, Present, Settings, Favourites, Updates) */
const { useState: uS, useEffect: uE, useMemo: uM, useRef: uR } = React;

// ---------- HOME ----------
function HomeScreen({ onOpenSong, favouriteIds, onToggleFav }) {
  const [q, setQ] = uS("");
  const [church, setChurch] = uS(null);
  const churches = uM(() => Array.from(new Set(SAMPLE_SONGS.map(s => s.church).filter(Boolean))), []);
  const filtered = SAMPLE_SONGS.filter(s =>
    (s.title.toLowerCase().includes(q.toLowerCase()) || s.artist.toLowerCase().includes(q.toLowerCase()))
    && (!church || s.church === church));

  return (
    <div>
      <header style={{ padding: "14px 20px 0", maxWidth: "40rem", margin: "0 auto" }}>
        <AppTitle />
      </header>
      <DailyVerse isHindi={false} />
      <SearchBar value={q} onChange={setQ} />
      <ChurchFilter churches={churches} active={church} onChange={setChurch} />
      <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "8px 20px 96px" }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 12, padding: "48px 24px", textAlign: "center" }}>
            <Icon name="searchX" size={48} stroke={1.2} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>No songs found for “{q}”</p>
          </div>
        ) : filtered.map(s => (
          <SongCard key={s.id} song={s}
            isFavourite={favouriteIds.includes(s.id)}
            onClick={() => onOpenSong(s.id)}
            onLongPress={() => onToggleFav(s.id)} />
        ))}
      </main>
    </div>
  );
}

// ---------- SONG VIEW ----------
function SongScreen({ song, onBack, onPresent, favouriteIds, onToggleFav }) {
  const [lang, setLang] = uS(song.languages_available[0]);
  const [fontSize, setFontSize] = uS("md");
  const [copied, setCopied] = uS(false);
  const isFav = favouriteIds.includes(song.id);
  const sizes = { sm: 17, md: 20, lg: 24 };
  const lines = song.lyrics[lang] || {};
  const isHindi = lang === "hindi";
  const fontFamily = isHindi ? "var(--font-devanagari)" : "var(--font-display)";

  const labels = isHindi
    ? { verse1: "पद 1", verse2: "पद 2", chorus: "कोरस", bridge: "ब्रिज", pre_chorus: "प्री-कोरस" }
    : { verse1: "Verse 1", verse2: "Verse 2", chorus: "Chorus", bridge: "Bridge", pre_chorus: "Pre-Chorus" };

  return (
    <div style={{ padding: 20, paddingBottom: 120, minHeight: "100%" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
          fontSize: "var(--text-sm)", fontWeight: 500, fontFamily: "inherit", padding: 0 }}>
          <Icon name="chevronLeft" size={18} /> Back
        </button>
        <span style={{ flex: 1 }} />
        <button onClick={() => onToggleFav(song.id)}
          style={{ width: 44, height: 44, background: "none", border: "none", cursor: "pointer",
            color: isFav ? "var(--accent)" : "var(--text-secondary)", display: "flex",
            alignItems: "center", justifyContent: "center" }}>
          <Icon name="heart" size={20} fill={isFav ? "var(--accent)" : "none"} color={isFav ? "var(--accent)" : "currentColor"} />
        </button>
        <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          style={{ width: 44, height: 44, background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="share" size={20} />
        </button>
      </div>

      {/* Title */}
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700,
        color: "var(--text-primary)", margin: "0 0 4px 0", letterSpacing: "-0.01em" }}>
        {song.title}
      </h1>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", margin: 0 }}>
        {song.artist}
      </p>
      <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", margin: "2px 0 0 0",
        letterSpacing: "var(--tracking-widest)", textTransform: "uppercase" }}>
        {song.church}
      </p>

      {/* Controls row */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "20px 0 24px" }}>
        <LanguageToggle value={lang} options={song.languages_available} onChange={setLang} />
        <FontSizeControl value={fontSize} onChange={setFontSize} />
        <button onClick={onPresent}
          style={{ padding: "6px 14px", fontSize: "var(--text-xs)", fontWeight: 600,
            borderRadius: "var(--radius-pill)", border: "1px solid var(--accent)",
            background: "transparent", color: "var(--accent)", cursor: "pointer",
            fontFamily: "inherit", display: "inline-flex", alignItems: "center", gap: 6 }}>
          <Icon name="play" size={12} fill="var(--accent)" /> Present
        </button>
      </div>

      {/* Lyric blocks */}
      {Object.entries(lines).map(([key, content]) => (
        <div key={key} style={{ marginBottom: 28 }}>
          <p style={{ fontSize: "var(--text-xs)", fontWeight: 700,
            letterSpacing: "var(--tracking-widest)", textTransform: "uppercase",
            color: "var(--accent)", opacity: 0.7, margin: "0 0 10px 0" }}>
            {labels[key] || key}
          </p>
          <p style={{ fontFamily, fontSize: sizes[fontSize], lineHeight: "var(--leading-relaxed)",
            color: "var(--text-primary)", margin: 0, whiteSpace: "pre-line", fontWeight: 400 }}>
            {content}
          </p>
        </div>
      ))}

      {copied && (
        <div style={{ position: "absolute", bottom: 80, left: "50%", transform: "translateX(-50%)",
          background: "var(--accent)", color: "var(--bg-base)", padding: "8px 16px",
          borderRadius: "var(--radius-pill)", fontSize: "var(--text-xs)", fontWeight: 600 }}>
          Link copied
        </div>
      )}
    </div>
  );
}

// ---------- PRESENT MODE ----------
function PresentScreen({ song, onExit }) {
  const [lang, setLang] = uS(song.languages_available[0]);
  const blocks = uM(() => {
    const d = song.lyrics[lang] || {};
    return Object.entries(d).map(([k, v]) => ({ key: k, content: v }));
  }, [lang, song]);
  const [idx, setIdx] = uS(0);
  const isHindi = lang === "hindi";
  const labels = isHindi
    ? { verse1: "पद 1", verse2: "पद 2", chorus: "कोरस", bridge: "ब्रिज", pre_chorus: "प्री-कोरस" }
    : { verse1: "VERSE 1", verse2: "VERSE 2", chorus: "CHORUS", bridge: "BRIDGE", pre_chorus: "PRE-CHORUS" };

  uE(() => { setIdx(0); }, [lang]);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(blocks.length - 1, i + 1));

  const block = blocks[idx];

  return (
    <div style={{ position: "absolute", inset: 0, background: "#000",
      display: "flex", flexDirection: "column", color: "var(--text-primary)" }}>
      {/* Exit + progress */}
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 10 }}>
        <button onClick={onExit}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", display: "flex", alignItems: "center",
            justifyContent: "center", width: 36, height: 36, fontFamily: "inherit" }}>
          <Icon name="x" size={20} />
        </button>
        <div style={{ flex: 1, height: 3, background: "rgba(255,255,255,0.08)",
          borderRadius: 2, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${((idx + 1) / blocks.length) * 100}%`,
            background: "var(--accent)", transition: "width 180ms ease" }} />
        </div>
        <LanguageToggle value={lang} options={song.languages_available} onChange={setLang} />
      </div>

      {/* Lyric body */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center", padding: "0 28px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "var(--tracking-widest)",
          color: "var(--accent)", opacity: 0.6, margin: "0 0 18px 0" }}>
          {labels[block.key] || block.key}
        </p>
        <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-display)",
          fontSize: 30, fontWeight: 600, lineHeight: 1.45,
          color: "var(--text-primary)", margin: 0, whiteSpace: "pre-line" }}>
          {block.content}
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)",
          letterSpacing: "var(--tracking-wide)", marginTop: 40, textTransform: "uppercase" }}>
          {song.title} · {idx + 1} / {blocks.length}
        </p>
      </div>

      {/* Nav */}
      <div style={{ display: "flex", justifyContent: "space-between",
        padding: "12px 20px 24px", gap: 12 }}>
        <button onClick={prev} disabled={idx === 0}
          style={{ flex: 1, height: 52, background: "rgba(255,255,255,0.04)",
            border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-md)",
            color: "var(--text-secondary)", cursor: idx === 0 ? "default" : "pointer",
            opacity: idx === 0 ? 0.3 : 1, fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="chevronLeft" size={18} /> Prev
        </button>
        <button onClick={next} disabled={idx === blocks.length - 1}
          style={{ flex: 1, height: 52, background: "var(--accent)",
            border: "none", borderRadius: "var(--radius-md)",
            color: "var(--bg-base)", cursor: idx === blocks.length - 1 ? "default" : "pointer",
            opacity: idx === blocks.length - 1 ? 0.3 : 1, fontFamily: "inherit",
            fontSize: 14, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Next <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}

// ---------- SETTINGS ----------
function SettingsScreen({ defaultLang, setDefaultLang, onBack }) {
  const Row = ({ label, sub, right }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      padding: "16px 20px", borderBottom: "1px solid var(--border-subtle)" }}>
      <div>
        <div style={{ fontSize: "var(--text-base)", color: "var(--text-primary)", fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </div>
  );

  const Section = ({ title, children }) => (
    <div style={{ marginTop: 32 }}>
      <p style={{ padding: "0 20px 8px", fontSize: "var(--text-xs)", fontWeight: 600,
        letterSpacing: "var(--tracking-widest)", textTransform: "uppercase",
        color: "var(--text-muted)", margin: 0 }}>{title}</p>
      <div style={{ background: "var(--bg-surface)", borderTop: "1px solid var(--border-subtle)",
        borderBottom: "1px solid var(--border-subtle)" }}>
        {children}
      </div>
    </div>
  );

  return (
    <div style={{ paddingBottom: 80 }}>
      <header style={{ padding: "14px 20px 20px", display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4,
          fontSize: "var(--text-sm)", fontWeight: 500, fontFamily: "inherit", padding: 0 }}>
          <Icon name="chevronLeft" size={18} /> Back
        </button>
      </header>
      <div style={{ padding: "0 20px" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          color: "var(--text-primary)", margin: "0 0 2px 0" }}>Settings</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          Customize your worship experience
        </p>
      </div>

      <Section title="Language">
        <Row label="Default Lyrics Language" sub="Applies to every song when opened"
          right={<LanguageToggle value={defaultLang} options={["hinglish", "hindi"]} onChange={setDefaultLang} />} />
      </Section>

      <Section title="Appearance">
        <Row label="Theme" sub="Dark theme, always on"
          right={<span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)",
            padding: "4px 10px", background: "var(--bg-subtle)", borderRadius: "var(--radius-pill)" }}>Dark</span>} />
      </Section>

      <Section title="About">
        <Row label="Version" right={<span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>1.0.0</span>} />
        <Row label="Built with love" sub="FOLJ · ICM · Nation of Worship" />
      </Section>
    </div>
  );
}

// ---------- FAVOURITES ----------
function FavouritesScreen({ favouriteIds, onOpenSong, onToggleFav }) {
  const favs = SAMPLE_SONGS.filter(s => favouriteIds.includes(s.id));
  return (
    <div style={{ paddingBottom: 96 }}>
      <header style={{ padding: "14px 20px 8px", maxWidth: "40rem", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          color: "var(--text-primary)", margin: "0 0 2px 0" }}>Favourites</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          {favs.length} saved {favs.length === 1 ? "song" : "songs"}
        </p>
      </header>
      <main style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px" }}>
        {favs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 12, padding: "64px 24px", textAlign: "center" }}>
            <Icon name="heartOff" size={48} stroke={1.2} color="var(--text-muted)" style={{ opacity: 0.4 }} />
            <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)" }}>
              No favourites yet. Long-press any song to save it.
            </p>
          </div>
        ) : favs.map(s => (
          <SongCard key={s.id} song={s} isFavourite
            onClick={() => onOpenSong(s.id)}
            onLongPress={() => onToggleFav(s.id)} />
        ))}
      </main>
    </div>
  );
}

// ---------- UPDATES ----------
const SAMPLE_UPDATES = [
  { id: "1", date: "2026-04-18", title: "7 new songs added", body: "Added Vandana, Chamka Sitara, Kadosh Kadosh, Yeshua Hamashiach, and more from FOLJ, ICM and Nation of Worship." },
  { id: "2", date: "2026-04-10", title: "Present mode", body: "A full-screen, block-by-block lyrics view for worship leaders. Toggle between Hindi and Hinglish live." },
  { id: "3", date: "2026-03-28", title: "Long-press to favourite", body: "Any song in the list can be saved with a long press. Find them under Favourites in the bottom tab." },
];

function UpdatesScreen({ onBack }) {
  return (
    <div style={{ paddingBottom: 96 }}>
      <header style={{ padding: "14px 20px 8px", maxWidth: "40rem", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          color: "var(--text-primary)", margin: "0 0 2px 0" }}>Updates</h1>
        <p style={{ color: "var(--text-muted)", fontSize: "var(--text-sm)", margin: 0 }}>
          What&rsquo;s new in Vandana
        </p>
      </header>
      <main style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px" }}>
        {SAMPLE_UPDATES.map(u => (
          <article key={u.id} style={{ padding: "20px 0", borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "var(--tracking-widest)",
              textTransform: "uppercase", color: "var(--accent)", opacity: 0.7, margin: "0 0 6px 0" }}>
              {new Date(u.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600,
              color: "var(--text-primary)", margin: "0 0 6px 0" }}>{u.title}</h2>
            <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)",
              lineHeight: "var(--leading-relaxed)", margin: 0 }}>{u.body}</p>
          </article>
        ))}
      </main>
    </div>
  );
}

Object.assign(window, { HomeScreen, SongScreen, PresentScreen, SettingsScreen, FavouritesScreen, UpdatesScreen, SAMPLE_UPDATES });
