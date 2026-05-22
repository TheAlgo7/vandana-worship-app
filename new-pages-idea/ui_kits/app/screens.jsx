/* Vandana UI Kit — Screens v2.5.0
   Home · Song · Present · Setlist · Favourites · Updates · Settings · About · Ministry */
const { useState: uS, useEffect: uE, useMemo: uM } = React;

const SECTION_LABELS_EN = {
  verse1: "Verse 1", verse2: "Verse 2", verse3: "Verse 3",
  chorus: "Chorus", bridge: "Bridge", pre_chorus: "Pre-Chorus", outro: "Outro",
};
const SECTION_LABELS_HI = {
  verse1: "पद 1", verse2: "पद 2", verse3: "पद 3",
  chorus: "कोरस", bridge: "ब्रिज", pre_chorus: "प्री-कोरस", outro: "आउट्रो",
};
const sectionLabel = (key, hindi) =>
  (hindi ? SECTION_LABELS_HI : SECTION_LABELS_EN)[key] || key.replace(/_/g, " ");

// ─────────────────── HOME ───────────────────
function HomeScreen({ onOpenSong, onOpenMinistry, favouriteIds, setlistIds, onToggleFav, onToggleSetlist }) {
  const [q, setQ] = uS("");
  const [church, setChurch] = uS(null);
  const churches = uM(() => Array.from(new Set(SAMPLE_SONGS.map(s => s.church).filter(Boolean))), []);
  const filtered = SAMPLE_SONGS.filter(s =>
    (s.title.toLowerCase().includes(q.toLowerCase()) ||
      s.artist.toLowerCase().includes(q.toLowerCase()))
    && (!church || s.church === church));

  return (
    <div>
      <header style={{ padding: "14px 20px 0", maxWidth: "40rem", margin: "0 auto" }}>
        <AppTitle />
      </header>
      <DailyVerse isHindi={false} />
      <SearchBar value={q} onChange={setQ} />
      <ChurchFilter churches={churches} active={church} onChange={setChurch} />

      <main style={{ maxWidth: "40rem", margin: "0 auto", padding: "8px 20px 120px" }}>
        {filtered.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 12, padding: "48px 24px", textAlign: "center" }}>
            <Icon name="searchX" size={48} stroke={1.2} color="var(--text-muted)"
              style={{ opacity: 0.4 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>No songs found for “{q}”</p>
          </div>
        ) : filtered.map(s => (
          <SongCard key={s.id} song={s}
            isFavourite={favouriteIds.includes(s.id)}
            isInSetlist={setlistIds.includes(s.id)}
            onClick={() => onOpenSong(s.id)}
            onToggleFav={() => onToggleFav(s.id)}
            onToggleSetlist={() => onToggleSetlist(s.id)}
            onLongPress={() => onToggleFav(s.id)} />
        ))}
      </main>
    </div>
  );
}

// ─────────────────── SONG VIEW ───────────────────
function SongScreen({ song, onBack, onPresent, favouriteIds, onToggleFav,
                       isInSetlist, onToggleSetlist }) {
  const [lang, setLang] = uS(song.languages_available[0]);
  const [fontSize, setFontSize] = uS("md");
  const [copied, setCopied] = uS(false);
  const isFav = favouriteIds.includes(song.id);
  const sizes = { sm: 17, md: 20, lg: 24 };
  const sections = song.lyrics[lang] || {};
  const isHindi = lang === "hindi";

  return (
    <div style={{ padding: 20, paddingBottom: 140, minHeight: "100%", position: "relative" }}>
      {/* Top bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
        <button onClick={onBack} style={{ display: "flex", alignItems: "center", gap: 4,
          background: "none", border: "none", cursor: "pointer", color: "var(--text-secondary)",
          fontSize: 13, fontWeight: 500, fontFamily: "inherit", padding: 0 }}>
          <Icon name="chevronLeft" size={18} /> Back
        </button>
        <span style={{ flex: 1 }} />
        <button onClick={() => onToggleSetlist(song.id)}
          aria-label={isInSetlist ? "Remove from setlist" : "Add to setlist"}
          style={{ width: 44, height: 44, background: isInSetlist ? "var(--accent-dim)" : "none",
            border: "none", borderRadius: 999, cursor: "pointer",
            color: isInSetlist ? "var(--accent)" : "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name={isInSetlist ? "listX" : "listPlus"} size={20} stroke={1.7} />
        </button>
        <button onClick={() => onToggleFav(song.id)}
          aria-label={isFav ? "Remove from favourites" : "Add to favourites"}
          style={{ width: 44, height: 44, background: isFav ? "var(--accent-dim)" : "none",
            border: "none", borderRadius: 999, cursor: "pointer",
            color: isFav ? "var(--accent)" : "var(--text-secondary)",
            display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Icon name="heart" size={20} fill={isFav ? "var(--accent)" : "none"}
            color={isFav ? "var(--accent)" : "currentColor"} />
        </button>
        <button onClick={() => { setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          aria-label="Share song"
          style={{ width: 44, height: 44, background: "none", border: "none", cursor: "pointer",
            color: "var(--text-secondary)", display: "flex", alignItems: "center",
            justifyContent: "center" }}>
          <Icon name="share" size={20} />
        </button>
      </div>

      {/* Star + title */}
      <Star size={14} opacity={0.3} />
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700,
        color: "var(--text-primary)", margin: "8px 0 4px 0", letterSpacing: "-0.03em",
        lineHeight: 1.15 }}>
        {song.title}
      </h1>
      <p style={{ fontSize: 14, color: "var(--text-muted)", margin: 0 }}>
        {song.artist}{song.church ? ` · ${song.church}` : ""}
      </p>
      <hr style={{ border: "none", borderTop: "1px solid var(--accent-dim)",
        marginTop: 16, marginBottom: 0 }} />

      {/* Controls toolbar (neumorphic) */}
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", margin: "20px 0 24px",
        background: "var(--bg-surface)", borderRadius: "var(--radius-lg)",
        padding: "8px 12px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.2), 0 1px 0 rgba(255,255,255,0.04) inset" }}>
        <LanguageToggle value={lang} options={song.languages_available} onChange={setLang} />
        <FontSizeControl value={fontSize} onChange={setFontSize} />
        <button onClick={onPresent}
          style={{ marginLeft: "auto", padding: "6px 14px", fontSize: 11, fontWeight: 600,
            borderRadius: 999, border: "none",
            background: "var(--accent)", color: "var(--bg-base)",
            cursor: "pointer", fontFamily: "inherit",
            display: "inline-flex", alignItems: "center", gap: 6,
            boxShadow: "0 2px 8px rgba(196,170,126,0.25)" }}>
          <Icon name="play" size={11} fill="currentColor" stroke={0} /> Present
        </button>
      </div>

      {/* Lyric blocks */}
      {Object.entries(sections).map(([key, content]) => (
        <div key={key} style={{ marginBottom: 32 }}>
          <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
            textTransform: isHindi ? "none" : "uppercase",
            color: "var(--accent)", opacity: 0.7, margin: "0 0 10px 0" }}>
            {sectionLabel(key, isHindi)}
          </p>
          <LyricsBlock text={content} hindi={isHindi}
            style={{ fontSize: sizes[fontSize], color: "var(--text-primary)" }} />
        </div>
      ))}

      {copied && (
        <div style={{ position: "absolute", bottom: 100, left: "50%",
          transform: "translateX(-50%)", background: "var(--accent)",
          color: "var(--bg-base)", padding: "8px 16px", borderRadius: 999,
          fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" }}>Link copied</div>
      )}
    </div>
  );
}

// ─────────────────── PRESENT MODE ───────────────────
function PresentScreen({ song, onExit }) {
  const [lang, setLang] = uS(song.languages_available[0]);
  const blocks = uM(() => Object.entries(song.lyrics[lang] || {})
    .map(([k, v]) => ({ key: k, content: v })), [lang, song]);
  const [idx, setIdx] = uS(0);
  const isHindi = lang === "hindi";

  uE(() => { setIdx(0); }, [lang]);

  const prev = () => setIdx(i => Math.max(0, i - 1));
  const next = () => setIdx(i => Math.min(blocks.length - 1, i + 1));
  const block = blocks[idx];

  return (
    <div style={{ position: "absolute", inset: 0, background: "var(--present-bg)",
      display: "flex", flexDirection: "column", color: "var(--present-text)", zIndex: 100 }}>
      <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", gap: 10 }}>
        <button onClick={onExit}
          style={{ background: "none", border: "none", cursor: "pointer",
            color: "var(--present-control-muted)", display: "flex", alignItems: "center",
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

      <div style={{ flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        padding: "0 28px", textAlign: "center" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          color: "var(--accent)", opacity: 0.6, margin: "0 0 18px 0",
          textTransform: isHindi ? "none" : "uppercase" }}>
          {sectionLabel(block.key, isHindi)}
        </p>
        <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-display)",
          fontSize: 28, fontWeight: 600, lineHeight: 1.45,
          margin: 0, whiteSpace: "pre-line" }}>{block.content}</p>
        <p style={{ fontSize: 11, color: "var(--present-control-muted)",
          letterSpacing: "0.06em", marginTop: 40, textTransform: "uppercase" }}>
          {song.title} · {idx + 1} / {blocks.length}
        </p>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between",
        padding: "12px 20px 24px", gap: 12 }}>
        <button onClick={prev} disabled={idx === 0}
          style={{ flex: 1, height: 52, background: "var(--present-control-bg)",
            border: "1px solid var(--present-control-border)",
            borderRadius: "var(--radius-md)", color: "var(--text-secondary)",
            cursor: idx === 0 ? "default" : "pointer", opacity: idx === 0 ? 0.3 : 1,
            fontFamily: "inherit", fontSize: 14, fontWeight: 600,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          <Icon name="chevronLeft" size={18} /> Prev
        </button>
        <button onClick={next} disabled={idx === blocks.length - 1}
          style={{ flex: 1, height: 52, background: "var(--accent)", border: "none",
            borderRadius: "var(--radius-md)", color: "var(--bg-base)",
            cursor: idx === blocks.length - 1 ? "default" : "pointer",
            opacity: idx === blocks.length - 1 ? 0.3 : 1,
            fontFamily: "inherit", fontSize: 14, fontWeight: 700,
            display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          Next <Icon name="chevronRight" size={18} />
        </button>
      </div>
    </div>
  );
}

// ─────────────────── SETLIST ───────────────────
function SetlistScreen({ setlistIds, onOpenSong, onToggleFav, onToggleSetlist,
                          favouriteIds, onPresent, onClear }) {
  const setlistSongs = setlistIds
    .map(id => SAMPLE_SONGS.find(s => s.id === id))
    .filter(Boolean);

  if (setlistSongs.length === 0) {
    return (
      <div>
        <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10,
          background: "var(--bg-base)", borderBottom: "1px solid var(--border)" }}>
          <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Setlist</h1>
        </header>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
          justifyContent: "center", minHeight: "60vh", padding: "0 24px", textAlign: "center" }}>
          <Icon name="listMusic" size={42} stroke={1.4} color="var(--accent)"
            style={{ opacity: 0.45 }} />
          <p style={{ fontFamily: "var(--font-display)", fontSize: 22,
            color: "var(--text-primary)", marginTop: 16, fontWeight: 600 }}>
            Build tonight&rsquo;s flow
          </p>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 8,
            lineHeight: 1.55, maxWidth: 300 }}>
            Add songs from the library, then present them in order during worship.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <header style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 10,
        background: "var(--bg-base)", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Setlist</h1>
        <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
          {setlistSongs.length} {setlistSongs.length === 1 ? "song" : "songs"}
        </span>
      </header>

      <main style={{ padding: "20px 20px 120px", maxWidth: "40rem", margin: "0 auto" }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
          <button onClick={() => onPresent(setlistSongs[0].id)}
            style={{ flex: 1, height: 44, borderRadius: 999, border: "none",
              background: "var(--accent)", color: "var(--bg-base)", fontSize: 13,
              fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
              display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
              boxShadow: "0 2px 8px rgba(196,170,126,0.25)" }}>
            <Icon name="play" size={16} fill="currentColor" stroke={0} /> Present setlist
          </button>
          <button onClick={onClear} aria-label="Clear setlist"
            style={{ width: 44, height: 44, borderRadius: 999,
              border: "1px solid var(--border)", background: "transparent",
              color: "var(--text-secondary)", cursor: "pointer",
              display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
            <Icon name="trash" size={17} />
          </button>
        </div>

        {setlistSongs.map(s => (
          <SongCard key={s.id} song={s}
            isFavourite={favouriteIds.includes(s.id)}
            isInSetlist
            onClick={() => onOpenSong(s.id)}
            onToggleFav={() => onToggleFav(s.id)}
            onToggleSetlist={() => onToggleSetlist(s.id)} />
        ))}
      </main>
    </div>
  );
}

// ─────────────────── FAVOURITES ───────────────────
function FavouritesScreen({ favouriteIds, setlistIds, onOpenSong,
                              onToggleFav, onToggleSetlist }) {
  const favs = SAMPLE_SONGS.filter(s => favouriteIds.includes(s.id));
  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "14px 20px 8px", maxWidth: "40rem", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          color: "var(--text-primary)", margin: "0 0 2px 0",
          letterSpacing: "-0.02em" }}>Favourites</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
          {favs.length} saved {favs.length === 1 ? "song" : "songs"}
        </p>
      </header>
      <main style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px" }}>
        {favs.length === 0 ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center",
            gap: 12, padding: "64px 24px", textAlign: "center" }}>
            <Icon name="heartOff" size={48} stroke={1.2} color="var(--text-muted)"
              style={{ opacity: 0.4 }} />
            <p style={{ color: "var(--text-muted)", fontSize: 13 }}>
              No favourites yet. Long-press any song to save it.
            </p>
          </div>
        ) : favs.map(s => (
          <SongCard key={s.id} song={s} isFavourite
            isInSetlist={setlistIds.includes(s.id)}
            onClick={() => onOpenSong(s.id)}
            onToggleFav={() => onToggleFav(s.id)}
            onToggleSetlist={() => onToggleSetlist(s.id)} />
        ))}
      </main>
    </div>
  );
}

// ─────────────────── UPDATES ───────────────────
const SAMPLE_UPDATES = [
  { id: "1", date: "2026-05-22", title: "v2.5.0 Public Beta", body: "Setlist builder, ministry pages, push notifications, and a brand-new desktop layout with a sidebar at ≥900px." },
  { id: "2", date: "2026-05-12", title: "45 new songs added", body: "Imported the Indian Christian Lyrics catalogue. The library is now over 80 songs across ICM, FOLJ, Bridge Music, Nations of Worship and more." },
  { id: "3", date: "2026-04-18", title: "Repeat markers on lyrics", body: "Lines ending with (x2) or — x3 now render the repeat as a small gold pill at the end of the line." },
];

function UpdatesScreen() {
  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "14px 20px 8px", maxWidth: "40rem", margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          color: "var(--text-primary)", margin: "0 0 2px 0",
          letterSpacing: "-0.02em" }}>Updates</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 13, margin: 0 }}>
          What&rsquo;s new in Vandana
        </p>
      </header>
      <main style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px" }}>
        {SAMPLE_UPDATES.map(u => (
          <article key={u.id} style={{ padding: "20px 0",
            borderBottom: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
              textTransform: "uppercase", color: "var(--accent)",
              opacity: 0.7, margin: "0 0 6px 0" }}>
              {new Date(u.date).toLocaleDateString("en-US",
                { month: "short", day: "numeric", year: "numeric" })}
            </p>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 600,
              color: "var(--text-primary)", margin: "0 0 6px 0" }}>{u.title}</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)",
              lineHeight: 1.7, margin: 0 }}>{u.body}</p>
          </article>
        ))}
      </main>
    </div>
  );
}

// ─────────────────── SETTINGS ───────────────────
function SettingsScreen({ defaultLang, setDefaultLang, setlistEnabled, setSetlistEnabled,
                            onAbout }) {
  const Section = ({ title, children }) => (
    <div style={{ marginTop: 28 }}>
      <p style={{ padding: "0 4px 8px", fontSize: 11, fontWeight: 600,
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "var(--text-muted)", margin: 0 }}>{title}</p>
      {children}
    </div>
  );
  const Row = ({ label, sub, right, last }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 14, padding: "14px 16px",
      background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)", marginBottom: last ? 0 : 8 }}>
      <div>
        <p style={{ fontSize: 15, color: "var(--text-primary)", margin: 0, fontWeight: 500 }}>{label}</p>
        {sub && <p style={{ fontSize: 11, color: "var(--text-muted)",
          margin: "2px 0 0" }}>{sub}</p>}
      </div>
      {right}
    </div>
  );
  const Toggle = ({ on, onChange }) => (
    <button onClick={() => onChange(!on)} role="switch" aria-checked={on}
      style={{ display: "flex", alignItems: "center", justifyContent: "center",
        width: 48, minHeight: 44, background: "none", border: "none",
        cursor: "pointer", padding: 0 }}>
      <span style={{ position: "relative", display: "block",
        width: 48, height: 28, borderRadius: 999,
        background: on ? "var(--accent)" : "var(--border)",
        transition: "background 200ms ease" }}>
        <span style={{ position: "absolute", top: 3, left: on ? 23 : 3,
          width: 22, height: 22, borderRadius: "50%",
          background: on ? "var(--bg-base)" : "var(--bg-surface)",
          transition: "left 200ms ease", boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }} />
      </span>
    </button>
  );

  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Settings</h1>
      </header>

      <div style={{ padding: "8px 20px", maxWidth: "40rem", margin: "0 auto" }}>
        <Section title="Language">
          <Row label="Default Lyrics Language"
            sub="Applies to every song when opened"
            right={<LanguageToggle value={defaultLang}
              options={["hinglish", "hindi"]} onChange={setDefaultLang} />} last />
        </Section>

        <Section title="Features">
          <Row label="Worship Setlist"
            sub="Build a service playlist with present-in-order mode"
            right={<Toggle on={setlistEnabled} onChange={setSetlistEnabled} />} last />
        </Section>

        <Section title="Notifications">
          <NotificationToggle />
        </Section>

        <Section title="Appearance">
          <Row label="Theme" sub="Dark, always"
            right={<span style={{ fontSize: 11, color: "var(--text-muted)",
              padding: "4px 10px", background: "var(--bg-elevated)",
              borderRadius: 999, letterSpacing: "0.04em" }}>Dark</span>} last />
        </Section>

        <Section title="About">
          <Row label="About Vandana" sub="ICM · Built by Gaurav — The Algothrim"
            right={<button onClick={onAbout} style={{ background: "none", border: "none",
              cursor: "pointer", color: "var(--accent)", fontFamily: "inherit",
              fontSize: 13, fontWeight: 600 }}>Open →</button>} last />
        </Section>

        <p style={{ textAlign: "center", color: "var(--text-muted)", fontSize: 11,
          marginTop: 24, letterSpacing: "0.06em" }}>v2.5.0 Public Beta</p>
      </div>
    </div>
  );
}

// ─────────────────── ABOUT ───────────────────
function AboutScreen({ onBack }) {
  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "14px 20px 20px", display: "flex",
        alignItems: "center", gap: 6 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", cursor: "pointer",
          color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: 4,
          fontSize: 13, fontWeight: 500, fontFamily: "inherit", padding: 0 }}>
          <Icon name="chevronLeft" size={18} /> Back
        </button>
      </header>

      <main style={{ padding: "0 20px", maxWidth: "40rem", margin: "0 auto" }}>
        <Star size={16} opacity={0.5} />
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700,
          letterSpacing: "-0.03em", margin: "12px 0 4px 0" }}>About Vandana</h1>
        <p style={{ fontFamily: "var(--font-devanagari)", fontSize: 15,
          color: "var(--text-muted)", fontStyle: "italic", margin: "0 0 24px 0" }}>
          वंदना — to worship, to praise
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16,
          fontSize: 14, lineHeight: 1.7, color: "var(--text-secondary)" }}>
          <p>Vandana exists because the Indian church deserved better than a mobile
            website with bad fonts and missing songs.</p>
          <p>Every lyric lives in two forms — <b style={{ color: "var(--text-primary)" }}>Hinglish</b> for the
            generation that grew up on Roman script, and <b style={{ color: "var(--text-primary)" }}>Hindi</b> in
            Devanagari for those who learned to read in it. One tap to switch.</p>
          <p>Built by <a style={{ color: "var(--accent)", textDecoration: "none" }}
            href="https://thealgothrim.com" target="_blank" rel="noopener">Gaurav Kumar (The Algothrim)</a> with
            the blessing of <b style={{ color: "var(--text-primary)" }}>Isus Christos Ministries (ICM)</b>,
            led by Ps. Arul Thomas and Dr. Mahima John Arul.</p>
          <p>No ads, no tracking, no App Store. Free, forever — a personal offering
            to the Indian worship community.</p>
        </div>

        <div style={{ marginTop: 32, padding: 16,
          background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
          border: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.18em",
            textTransform: "uppercase", color: "var(--accent)", opacity: 0.7,
            margin: "0 0 12px 0" }}>Ministries featured</p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {MINISTRIES.slice(0, 7).map(m => (
              <span key={m.slug}
                style={{ padding: "5px 12px", borderRadius: 999,
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border-subtle)",
                  fontSize: 11, color: "var(--text-secondary)" }}>{m.short}</span>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}

// ─────────────────── MINISTRY DETAIL ───────────────────
function MinistryScreen({ ministry, onBack, onOpenSong, favouriteIds, setlistIds,
                            onToggleFav, onToggleSetlist }) {
  const songs = SAMPLE_SONGS.filter(s =>
    ministry.filterBy === "church" ? s.church === ministry.filterValue
                                    : s.artist === ministry.filterValue);
  return (
    <div style={{ paddingBottom: 120 }}>
      <header style={{ padding: "14px 20px 8px", display: "flex",
        alignItems: "center", gap: 6 }}>
        <button onClick={onBack} style={{ background: "none", border: "none",
          cursor: "pointer", color: "var(--text-secondary)",
          display: "flex", alignItems: "center", gap: 4,
          fontSize: 13, fontWeight: 500, fontFamily: "inherit", padding: 0 }}>
          <Icon name="chevronLeft" size={18} /> Back
        </button>
      </header>

      <main style={{ padding: "0 20px", maxWidth: "40rem", margin: "0 auto" }}>
        <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em",
          textTransform: "uppercase", color: "var(--accent)", opacity: 0.7,
          margin: "8px 0 6px 0" }}>Ministry</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 700,
          margin: "0 0 12px 0", letterSpacing: "-0.02em",
          lineHeight: 1.15 }}>{ministry.name}</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)",
          lineHeight: 1.7, margin: 0 }}>
          {songs.length} {songs.length === 1 ? "song" : "songs"} from this ministry.
        </p>

        <div style={{ marginTop: 24 }}>
          {songs.length === 0 ? (
            <p style={{ color: "var(--text-muted)", fontSize: 13, padding: "32px 0",
              textAlign: "center" }}>
              No bundled songs from this ministry — try opening the live app.
            </p>
          ) : songs.map(s => (
            <SongCard key={s.id} song={s}
              isFavourite={favouriteIds.includes(s.id)}
              isInSetlist={setlistIds.includes(s.id)}
              onClick={() => onOpenSong(s.id)}
              onToggleFav={() => onToggleFav(s.id)}
              onToggleSetlist={() => onToggleSetlist(s.id)} />
          ))}
        </div>
      </main>
    </div>
  );
}

Object.assign(window, {
  HomeScreen, SongScreen, PresentScreen, SetlistScreen, FavouritesScreen,
  UpdatesScreen, SettingsScreen, AboutScreen, MinistryScreen, SAMPLE_UPDATES,
});
