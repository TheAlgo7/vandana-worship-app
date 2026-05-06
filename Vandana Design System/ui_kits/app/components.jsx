/* Vandana UI Kit — Components (screens + reusable pieces) */
const { useState, useEffect, useRef, useMemo } = React;

// ---------- Song Card (list row) ----------
function SongCard({ song, isFavourite, onClick, onLongPress }) {
  const timer = useRef(null);
  const [badge, setBadge] = useState(null);
  const start = () => {
    if (!onLongPress) return;
    timer.current = setTimeout(() => {
      onLongPress();
      setBadge(isFavourite ? "♡ Removed" : "♡ Saved");
      setTimeout(() => setBadge(null), 1400);
    }, 500);
  };
  const cancel = () => { if (timer.current) clearTimeout(timer.current); };

  return (
    <div onClick={onClick} onPointerDown={start} onPointerUp={cancel} onPointerLeave={cancel}
      style={{ display: "flex", alignItems: "center", minHeight: 76, padding: "16px 0", cursor: "pointer",
        position: "relative", userSelect: "none", borderBottom: "1px solid var(--border-subtle)" }}>
      <div style={{ width: 3, height: 28, borderRadius: 2, background: "var(--accent)", opacity: 0.45, marginRight: 14, flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600,
          color: "var(--text-primary)", margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
          {song.title}
          {isFavourite && <Icon name="heart" size={10} stroke={0} fill="var(--accent)" color="var(--accent)" style={{ opacity: 0.5 }} />}
        </h2>
        <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)", marginTop: 2, margin: 0 }}>{song.artist}</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginLeft: 12, flexShrink: 0 }}>
        {song.church && <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{song.church}</span>}
        <Icon name="chevronRight" size={20} color="var(--text-muted)" />
      </div>
      {badge && (
        <div style={{ position: "absolute", right: 28, top: "50%", transform: "translateY(-50%)",
          background: "var(--accent)", color: "var(--bg-base)", padding: "4px 12px",
          borderRadius: "var(--radius-pill)", fontSize: 11, fontWeight: 700, whiteSpace: "nowrap" }}>
          {badge}
        </div>
      )}
    </div>
  );
}

// ---------- Daily Verse ----------
function DailyVerse({ isHindi }) {
  const v = isHindi
    ? { label: "दिन का वचन", text: SAMPLE_VERSE.hindi, ref: SAMPLE_VERSE.reference_hindi }
    : { label: "Verse of the Day", text: SAMPLE_VERSE.english, ref: SAMPLE_VERSE.reference };
  return (
    <section style={{ padding: "12px 20px 0", maxWidth: "40rem", margin: "0 auto" }}>
      <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-body)",
        fontSize: "var(--text-xs)", fontWeight: 600, letterSpacing: isHindi ? "0.05em" : "var(--tracking-widest)",
        color: "var(--accent)", opacity: 0.6, margin: "0 0 12px 0",
        textTransform: isHindi ? "none" : "uppercase" }}>
        {v.label}
      </p>
      <blockquote style={{ borderLeft: "2px solid color-mix(in srgb, var(--accent) 40%, transparent)",
        paddingLeft: 16, margin: 0 }}>
        <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-display)",
          fontSize: "var(--text-lg)", fontStyle: isHindi ? "normal" : "italic",
          color: "var(--text-primary)", lineHeight: "var(--leading-normal)", margin: 0, whiteSpace: "pre-line" }}>
          “{v.text}”
        </p>
        <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-body)",
          fontSize: "var(--text-sm)", color: "var(--text-muted)", marginTop: 8 }}>
          — {v.ref}
        </p>
      </blockquote>
    </section>
  );
}

// ---------- Bottom Nav ----------
function BottomNav({ active, onNav, hasUnread }) {
  const items = [
    { id: "home", label: "Home", icon: "house" },
    { id: "updates", label: "Updates", icon: "bell", dot: hasUnread },
    { id: "favourites", label: "Favourites", icon: "heart" },
    { id: "settings", label: "Settings", icon: "settings" },
  ];
  return (
    <>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "5.5rem",
        pointerEvents: "none", zIndex: 49,
        background: "linear-gradient(to top, var(--bg-base) 56px, transparent)" }} />
      <nav style={{ position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 50, height: 56,
        background: "var(--bg-overlay)", borderTop: "1px solid var(--border-subtle)",
        backdropFilter: "blur(24px) saturate(180%)", WebkitBackdropFilter: "blur(24px) saturate(180%)",
        display: "flex", justifyContent: "space-around", alignItems: "center" }}>
        {items.map(it => {
          const on = active === it.id;
          const color = on ? "var(--accent)" : "var(--text-muted)";
          return (
            <button key={it.id} onClick={() => onNav(it.id)}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
                background: "none", border: "none", cursor: "pointer", color,
                fontSize: "var(--text-xs)", fontWeight: 500, fontFamily: "inherit" }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon name={it.icon} size={24} color={color} fill={on ? "var(--accent)" : "none"} />
                {it.dot && <span style={{ position: "absolute", top: 0, right: 0,
                  width: 6, height: 6, borderRadius: "50%", background: "var(--accent)" }} />}
              </span>
              {it.label}
            </button>
          );
        })}
      </nav>
    </>
  );
}

// ---------- Language Toggle ----------
function LanguageToggle({ value, options, onChange }) {
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-surface)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", gap: 2 }}>
      {options.map(lang => {
        const on = value === lang;
        return (
          <button key={lang} onClick={() => onChange(lang)}
            style={{ padding: "6px 14px", fontSize: "var(--text-xs)", fontWeight: 600,
              textTransform: "capitalize", borderRadius: "var(--radius-pill)", border: "none",
              cursor: "pointer", fontFamily: "inherit",
              background: on ? "var(--accent)" : "transparent",
              color: on ? "var(--bg-base)" : "var(--text-secondary)",
              transition: "all var(--transition-fast)" }}>
            {lang}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Font Size Control ----------
function FontSizeControl({ value, onChange }) {
  const sizes = [
    { id: "sm", label: "A", size: 13 },
    { id: "md", label: "A", size: 16 },
    { id: "lg", label: "A", size: 20 },
  ];
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-surface)",
      border: "1px solid var(--border)", borderRadius: "var(--radius-pill)", gap: 2 }}>
      {sizes.map(s => {
        const on = value === s.id;
        return (
          <button key={s.id} onClick={() => onChange(s.id)}
            style={{ width: 32, height: 28, fontSize: s.size, fontWeight: 600,
              borderRadius: "var(--radius-pill)", border: "none", cursor: "pointer", fontFamily: "inherit",
              background: on ? "var(--accent)" : "transparent",
              color: on ? "var(--bg-base)" : "var(--text-secondary)" }}>
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

// ---------- Pill Filter Row ----------
function ChurchFilter({ churches, active, onChange }) {
  const pillStyle = (on) => ({
    flexShrink: 0, padding: "6px 16px", fontSize: "var(--text-xs)", fontWeight: 500,
    borderRadius: "var(--radius-pill)", border: "1px solid",
    borderColor: on ? "var(--accent)" : "var(--border)",
    background: on ? "var(--accent)" : "transparent",
    color: on ? "var(--bg-base)" : "var(--text-secondary)",
    cursor: "pointer", fontFamily: "inherit", transition: "all var(--transition-fast)",
  });
  return (
    <div style={{ display: "flex", gap: 8, margin: "16px auto 0", padding: "0 20px",
      maxWidth: "40rem", overflowX: "auto", scrollbarWidth: "none" }}>
      <button onClick={() => onChange(null)} style={pillStyle(!active)}>All</button>
      {churches.map(c => (
        <button key={c} onClick={() => onChange(active === c ? null : c)} style={pillStyle(active === c)}>{c}</button>
      ))}
    </div>
  );
}

// ---------- App Title (wordmark at top of home) ----------
function AppTitle() {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700,
        color: "var(--text-primary)", margin: 0, letterSpacing: "-0.01em" }}>
        Vandana
      </h1>
      <span style={{ fontFamily: "var(--font-devanagari)", fontSize: 15,
        color: "var(--accent)", opacity: 0.6 }}>वंदना</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "var(--tracking-widest)",
        textTransform: "uppercase", color: "var(--text-muted)" }}>Worship</span>
    </div>
  );
}

// ---------- Search Bar ----------
function SearchBar({ value, onChange }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px", position: "relative" }}>
      <input type="search" placeholder="Search songs, artists…" value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: "100%", height: 52, padding: "0 16px 0 48px", fontSize: "var(--text-sm)",
          fontFamily: "inherit", background: "var(--bg-surface)", color: "var(--text-primary)",
          border: "1px solid " + (focus ? "var(--accent)" : "var(--border)"),
          borderRadius: "var(--radius-pill)", outline: "none",
          boxShadow: focus ? "0 0 0 3px var(--accent-dim)" : "inset 0 1px 3px rgba(0,0,0,0.4)",
          transition: "all var(--transition-fast)" }} />
      <span style={{ position: "absolute", left: 34, top: "50%", transform: "translateY(-50%)",
        color: "var(--text-muted)", pointerEvents: "none", display: "flex" }}>
        <Icon name="search" size={20} />
      </span>
    </div>
  );
}

Object.assign(window, { SongCard, DailyVerse, BottomNav, LanguageToggle, FontSizeControl, ChurchFilter, AppTitle, SearchBar });
