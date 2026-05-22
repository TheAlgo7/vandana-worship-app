/* Vandana UI Kit — Components (refreshed for v2.5.0)
   Floating-pill BottomNav · DesktopSidebar · SongCard w/ fav+setlist
   LyricsBlock with repeat marks · NotificationToggle */
const { useState, useEffect, useRef, useMemo } = React;

// ───────────────────── Floating pill Bottom Nav ─────────────────────
// Mirrors src/components/BottomNav.tsx + BottomNav.module.css from v2.5.0
function BottomNav({ active, onNav, hasUnread, setlistEnabled }) {
  const items = [
    { id: "home",       label: "Home",       icon: "house" },
    { id: "updates",    label: "Updates",    icon: "bell",      dot: hasUnread },
    { id: "setlist",    label: "Setlist",    icon: "listMusic", feature: "setlist" },
    { id: "favourites", label: "Saved",      icon: "heart" },
    { id: "settings",   label: "Settings",   icon: "settings" },
  ].filter(it => it.feature !== "setlist" || setlistEnabled);

  return (
    <>
      {/* Gradient fade above the floating pill */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0,
        height: "4.5rem", pointerEvents: "none", zIndex: 49,
        background: "linear-gradient(to top, var(--bg-base) 40%, transparent)" }} />

      <nav aria-label="Main navigation"
        style={{
          position: "absolute",
          bottom: "calc(14px + env(safe-area-inset-bottom))",
          left: "50%", transform: "translateX(-50%)",
          zIndex: 50,
          display: "flex", alignItems: "center", gap: 4,
          padding: 8,
          background: "var(--nav-pill-bg)",
          backdropFilter: "blur(28px) saturate(190%)",
          WebkitBackdropFilter: "blur(28px) saturate(190%)",
          border: "0.5px solid var(--nav-pill-border)",
          borderRadius: 999,
          boxShadow: "var(--nav-pill-shadow)",
        }}>
        {items.map(it => {
          const on = active === it.id;
          return (
            <button key={it.id} onClick={() => onNav(it.id)}
              aria-current={on ? "page" : undefined}
              aria-label={it.label}
              style={{
                position: "relative",
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: on ? 112 : 48, height: 44,
                borderRadius: 999, border: "none",
                background: on ? "linear-gradient(180deg, var(--nav-fill-top) 0%, var(--nav-fill-bottom) 100%)" : "transparent",
                color: on ? "var(--nav-active-text)" : "var(--nav-inactive)",
                boxShadow: on
                  ? "inset 0 1px 0 rgba(255,255,255,0.30), inset 0 -1px 0 rgba(0,0,0,0.12)"
                  : "none",
                cursor: "pointer",
                overflow: "hidden",
                transition: "width 240ms cubic-bezier(0.22,1,0.36,1), color 180ms ease, background 180ms ease",
                fontFamily: "inherit",
              }}>
              <span style={{ position: "relative", display: "inline-flex" }}>
                <Icon name={it.icon} size={20} stroke={on ? 2.1 : 1.7} />
                {it.dot && !on && (
                  <span style={{ position: "absolute", top: -2, right: -3,
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--accent)",
                    boxShadow: "0 0 0 2px var(--bg-base)" }} />
                )}
              </span>
              <span style={{
                display: "inline-block",
                maxWidth: on ? 64 : 0,
                marginLeft: on ? 7 : 0,
                opacity: on ? 1 : 0,
                overflow: "hidden", whiteSpace: "nowrap",
                fontSize: 13, fontWeight: 600,
                transition: "max-width 220ms cubic-bezier(0.22,1,0.36,1) 45ms, opacity 150ms ease 60ms, margin-left 220ms cubic-bezier(0.22,1,0.36,1) 45ms",
              }}>{it.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
}

// ───────────────────── Desktop Sidebar (≥900px) ─────────────────────
function DesktopSidebar({ active, onNav, hasUnread, setlistEnabled }) {
  const items = [
    { id: "home",       label: "Home",       icon: "house" },
    { id: "updates",    label: "Updates",    icon: "bell", dot: hasUnread },
    { id: "setlist",    label: "Setlist",    icon: "listMusic", feature: "setlist" },
    { id: "favourites", label: "Favourites", icon: "heart" },
    { id: "settings",   label: "Settings",   icon: "settings" },
  ].filter(it => it.feature !== "setlist" || setlistEnabled);

  return (
    <aside style={{
      width: 220, flexShrink: 0,
      background: "var(--bg-surface)",
      borderRight: "1px solid var(--border)",
      padding: "28px 12px 24px",
      display: "flex", flexDirection: "column", gap: 4,
      height: "100%", boxSizing: "border-box",
    }}>
      <div style={{ padding: "0 8px 32px" }}>
        <a style={{ fontFamily: "var(--font-brand)", fontSize: 24,
          color: "var(--accent)", letterSpacing: "0.04em",
          textDecoration: "none", display: "inline-block", lineHeight: 1 }}>Vandana</a>
        <span style={{ display: "block", width: 28, height: 1,
          background: "var(--accent)", opacity: 0.4, marginTop: 6 }} />
        <span style={{ display: "block", fontSize: 11,
          color: "var(--text-muted)", marginTop: 8, fontStyle: "italic",
          letterSpacing: "0.01em" }}>Worship in your language</span>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1 }}>
        {items.map(it => {
          const on = active === it.id;
          return (
            <a key={it.id} onClick={(e) => { e.preventDefault(); onNav(it.id); }}
              aria-current={on ? "page" : undefined}
              style={{
                position: "relative",
                display: "flex", alignItems: "center", gap: 10,
                height: 44, padding: "0 12px",
                borderRadius: 999,
                background: on
                  ? "linear-gradient(180deg, var(--nav-fill-top) 0%, var(--nav-fill-bottom) 100%)"
                  : "transparent",
                color: on ? "var(--nav-active-text)" : "var(--nav-inactive)",
                fontSize: "var(--text-sm)", fontWeight: 500,
                letterSpacing: "-0.01em",
                cursor: "pointer", textDecoration: "none",
                boxShadow: on
                  ? "inset 0 1px 0 rgba(255,255,255,0.20), inset 0 -1px 0 rgba(0,0,0,0.10)"
                  : "none",
                transition: "color 200ms ease, background 200ms ease",
              }}>
              <Icon name={it.icon} size={18} stroke={on ? 2.1 : 1.7} />
              <span>{it.label}</span>
              {it.dot && !on && (
                <span style={{ marginLeft: "auto", width: 6, height: 6,
                  borderRadius: "50%", background: "var(--accent)" }} />
              )}
            </a>
          );
        })}
      </nav>

      <div style={{ padding: "20px 8px 0", borderTop: "1px solid var(--border-subtle)" }}>
        <a onClick={(e) => { e.preventDefault(); onNav("about"); }}
          style={{ display: "block", fontSize: 11, color: "var(--text-muted)",
          textDecoration: "none", marginBottom: 8, cursor: "pointer" }}>About</a>
        <p style={{ fontSize: 11, color: "var(--text-muted)",
          letterSpacing: "0.06em", margin: 0 }}>v2.5.0 Public Beta</p>
      </div>
    </aside>
  );
}

// ───────────────────── Song Card ─────────────────────
// Inline favourite + setlist buttons (long-press still works for favourites)
function SongCard({ song, isFavourite, isInSetlist, onClick, onToggleFav, onToggleSetlist, onLongPress }) {
  const timer = useRef(null);
  const [badge, setBadge] = useState(null);
  const longPressed = useRef(false);

  const start = () => {
    if (!onLongPress) return;
    longPressed.current = false;
    timer.current = setTimeout(() => {
      longPressed.current = true;
      onLongPress();
      setBadge(isFavourite ? "Removed" : "Saved");
      setTimeout(() => setBadge(null), 1400);
    }, 500);
  };
  const cancel = () => { if (timer.current) clearTimeout(timer.current); };

  const handleClick = () => {
    if (longPressed.current) { longPressed.current = false; return; }
    onClick && onClick();
  };

  const iconBtn = (active, icon, alt, fn, ariaLabel) => (
    <button onClick={(e) => { e.stopPropagation(); fn(); if (icon === "heart") {
      setBadge(active ? "Removed" : "Saved");
      setTimeout(() => setBadge(null), 1400);
    } }}
      aria-pressed={!!active} aria-label={ariaLabel}
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: 44, height: 44, marginLeft: 2,
        border: "none", borderRadius: 999,
        background: active ? "var(--accent-dim)" : "transparent",
        color: active ? "var(--accent)" : "var(--text-muted)",
        cursor: "pointer", flexShrink: 0,
        transition: "color 200ms ease, background 200ms ease",
      }}>
      <Icon name={active ? icon : alt} size={19} stroke={active ? 1.8 : 1.6}
        fill={icon === "heart" && active ? "var(--accent)" : "none"} />
    </button>
  );

  return (
    <div style={{ display: "flex", alignItems: "center", minHeight: 76,
      padding: "16px 0", position: "relative", userSelect: "none",
      borderBottom: "1px solid var(--border-subtle)" }}>
      <div onClick={handleClick} onPointerDown={start} onPointerUp={cancel}
        onPointerLeave={cancel}
        style={{ display: "flex", alignItems: "center", flex: 1, minWidth: 0,
          minHeight: 44, cursor: "pointer", color: "inherit" }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 600,
            color: "var(--text-primary)", margin: 0, display: "flex",
            alignItems: "center", gap: 6, lineHeight: 1.3 }}>
            <span style={{ overflow: "hidden", textOverflow: "ellipsis",
              whiteSpace: "nowrap", minWidth: 0 }}>{song.title}</span>
            {isFavourite && (
              <Icon name="heart" size={10} stroke={0} fill="var(--accent)"
                color="var(--accent)" style={{ opacity: 0.5, flexShrink: 0 }} />
            )}
          </h2>
          <p style={{ fontSize: "var(--text-sm)", color: "var(--text-secondary)",
            marginTop: 2, margin: 0, overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap" }}>{song.artist}</p>
        </div>
        {song.church && (
          <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)",
            marginLeft: 12, flexShrink: 0, maxWidth: 100,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {song.church}
          </span>
        )}
        <span style={{ display: "flex", alignItems: "center", justifyContent: "center",
          width: 28, height: 44, marginLeft: 8, color: "var(--text-muted)",
          flexShrink: 0 }}>
          <Icon name="chevronRight" size={20} />
        </span>
      </div>

      {onToggleFav && iconBtn(isFavourite, "heart", "heart", onToggleFav,
        isFavourite ? "Remove from favourites" : "Add to favourites")}
      {onToggleSetlist && iconBtn(isInSetlist, "listX", "listPlus", onToggleSetlist,
        isInSetlist ? "Remove from setlist" : "Add to setlist")}

      {badge && (
        <div style={{ position: "absolute", right: onToggleFav ? 54 : 28,
          top: "50%", transform: "translateY(-50%)",
          background: "var(--accent)", color: "var(--bg-base)",
          padding: "4px 12px", borderRadius: 999, fontSize: 11, fontWeight: 700,
          whiteSpace: "nowrap", letterSpacing: "0.02em" }}>{badge}</div>
      )}
    </div>
  );
}

// ───────────────────── Lyrics Block (with repeat marks) ─────────────────────
// Detects (x2), x3, -2, etc. and renders as superscript-ish marks
const REPEAT_RES = [
  /\s*\(\s*(?:x|×)?\s*([0-9])\s*\)\s*$/i,
  /\s*(?:[-–]\s*)?(?:x|×)\s*([0-9])\s*$/i,
  /\s*[-–]\s*([0-9])\s*$/,
  /\s+([2-9])\s*$/,
];

function splitRepeat(line) {
  if (!line.trim()) return { lyric: "", repeat: null };
  for (const re of REPEAT_RES) {
    const m = line.match(re);
    if (m && m.index) {
      const lyric = line.slice(0, m.index).trimEnd();
      if (lyric) return { lyric, repeat: `x${m[1]}` };
    }
  }
  return { lyric: line, repeat: null };
}

function LyricsBlock({ text, hindi, style }) {
  const lines = text.split("\n");
  return (
    <p className="lyrics-block" style={{
      margin: 0,
      fontFamily: hindi ? "var(--font-devanagari)" : "var(--font-display)",
      lineHeight: hindi ? "var(--leading-hindi)" : "var(--leading-relaxed)",
      ...style,
    }}>
      {lines.map((raw, i) => {
        const { lyric, repeat } = splitRepeat(raw);
        if (!lyric) return <span key={i} style={{ display: "block", height: "0.6em" }} />;
        return (
          <span key={i} style={{ display: "block",
            position: "relative", padding: repeat ? "0 36px 0 0" : 0 }}>
            <span>{lyric}</span>
            {repeat && (
              <span style={{
                position: "absolute", right: 0, top: "0.35em",
                fontFamily: "var(--font-body)",
                fontSize: "0.6em", fontWeight: 700,
                letterSpacing: "0.04em",
                color: "var(--accent)", opacity: 0.7,
                padding: "2px 6px",
                background: "var(--accent-dim)",
                borderRadius: 999,
              }}>{repeat}</span>
            )}
          </span>
        );
      })}
    </p>
  );
}

// ───────────────────── Notification Toggle ─────────────────────
function NotificationToggle() {
  const [on, setOn] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
      gap: 14, padding: "14px 16px",
      background: "var(--bg-surface)", borderRadius: "var(--radius-md)",
      border: "1px solid var(--border)" }}>
      <div>
        <p style={{ fontSize: "var(--text-base)", fontWeight: 500, margin: 0 }}>
          Push Notifications
        </p>
        <p style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)",
          margin: "2px 0 0" }}>Daily verse alerts</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
        <span style={{ color: on ? "var(--accent)" : "var(--text-muted)",
          fontSize: 11, fontWeight: 700 }}>{on ? "On" : "Off"}</span>
        <button onClick={() => setOn(v => !v)}
          role="switch" aria-checked={on} aria-label="Toggle push notifications"
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
              transition: "left 200ms ease",
              boxShadow: "0 1px 3px rgba(0,0,0,0.18)" }} />
          </span>
        </button>
      </div>
    </div>
  );
}

// ───────────────────── Daily Verse ─────────────────────
function DailyVerse({ isHindi }) {
  const v = isHindi
    ? { label: "दिन का वचन", text: SAMPLE_VERSE.hindi, ref: SAMPLE_VERSE.reference_hindi }
    : { label: "Verse of the Day", text: SAMPLE_VERSE.english, ref: SAMPLE_VERSE.reference };
  return (
    <section style={{ padding: "12px 20px 0", maxWidth: "40rem", margin: "0 auto" }}>
      <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-body)",
        fontSize: 11, fontWeight: 600,
        letterSpacing: isHindi ? "0.05em" : "0.18em",
        color: "var(--accent)", opacity: 0.6, margin: "0 0 12px 0",
        textTransform: isHindi ? "none" : "uppercase" }}>{v.label}</p>
      <blockquote style={{ borderLeft: "2px solid color-mix(in srgb, var(--accent) 40%, transparent)",
        paddingLeft: 16, margin: 0 }}>
        <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-display)",
          fontSize: 18, fontStyle: isHindi ? "normal" : "italic",
          color: "var(--text-primary)", lineHeight: 1.6, margin: 0,
          whiteSpace: "pre-line" }}>“{v.text}”</p>
        <p style={{ fontFamily: isHindi ? "var(--font-devanagari)" : "var(--font-body)",
          fontSize: 13, color: "var(--text-muted)", marginTop: 8 }}>— {v.ref}</p>
      </blockquote>
    </section>
  );
}

// ───────────────────── Language Toggle ─────────────────────
function LanguageToggle({ value, options, onChange }) {
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-surface)",
      border: "1px solid var(--border)", borderRadius: 999, gap: 2 }}>
      {options.map(lang => {
        const on = value === lang;
        return (
          <button key={lang} onClick={() => onChange(lang)}
            style={{ padding: "6px 14px", fontSize: 11, fontWeight: 600,
              textTransform: "capitalize", borderRadius: 999, border: "none",
              cursor: "pointer", fontFamily: "inherit",
              background: on ? "var(--accent)" : "transparent",
              color: on ? "var(--bg-base)" : "var(--text-secondary)",
              boxShadow: on ? "0 2px 8px rgba(196,170,126,0.25)" : "none",
              transition: "all 200ms ease" }}>
            {lang}
          </button>
        );
      })}
    </div>
  );
}

// ───────────────────── Font Size Control ─────────────────────
function FontSizeControl({ value, onChange }) {
  const sizes = [
    { id: "sm", label: "A", size: 13 },
    { id: "md", label: "A", size: 16 },
    { id: "lg", label: "A", size: 20 },
  ];
  return (
    <div style={{ display: "inline-flex", padding: 3, background: "var(--bg-surface)",
      border: "1px solid var(--border)", borderRadius: 999, gap: 2 }}>
      {sizes.map(s => {
        const on = value === s.id;
        return (
          <button key={s.id} onClick={() => onChange(s.id)}
            style={{ width: 32, height: 28, fontSize: s.size, fontWeight: 600,
              borderRadius: 999, border: "none", cursor: "pointer", fontFamily: "inherit",
              background: on ? "var(--accent)" : "transparent",
              color: on ? "var(--bg-base)" : "var(--text-secondary)" }}>{s.label}</button>
        );
      })}
    </div>
  );
}

// ───────────────────── Church Filter row ─────────────────────
function ChurchFilter({ churches, active, onChange }) {
  const pill = (on) => ({
    flexShrink: 0, padding: "6px 16px", fontSize: 11, fontWeight: 500,
    borderRadius: 999, border: "1px solid",
    borderColor: on ? "var(--accent)" : "var(--border)",
    background: on ? "var(--accent)" : "transparent",
    color: on ? "var(--bg-base)" : "var(--text-secondary)",
    cursor: "pointer", fontFamily: "inherit", transition: "all 200ms ease",
  });
  return (
    <div style={{ display: "flex", gap: 8, margin: "16px auto 0", padding: "0 20px",
      maxWidth: "40rem", overflowX: "auto", scrollbarWidth: "none" }}>
      <button onClick={() => onChange(null)} style={pill(!active)}>All</button>
      {churches.map(c => (
        <button key={c} onClick={() => onChange(active === c ? null : c)} style={pill(active === c)}>{c}</button>
      ))}
    </div>
  );
}

// ───────────────────── App Title + Search ─────────────────────
function AppTitle() {
  return (
    <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
      <h1 style={{ fontFamily: "var(--font-brand)", fontSize: 26, fontWeight: "normal",
        color: "var(--accent)", margin: 0, letterSpacing: "0.04em", lineHeight: 1 }}>
        Vandana
      </h1>
      <span style={{ fontFamily: "var(--font-devanagari)", fontSize: 15,
        color: "var(--accent)", opacity: 0.6 }}>वंदना</span>
      <span style={{ flex: 1 }} />
      <span style={{ fontSize: 10, fontWeight: 600, letterSpacing: "0.18em",
        textTransform: "uppercase", color: "var(--text-muted)" }}>Worship</span>
    </div>
  );
}

function SearchBar({ value, onChange }) {
  const [focus, setFocus] = useState(false);
  return (
    <div style={{ maxWidth: "40rem", margin: "16px auto 0", padding: "0 20px", position: "relative" }}>
      <input type="search" placeholder="Search songs, artists…" value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocus(true)} onBlur={() => setFocus(false)}
        style={{ width: "100%", height: 52, padding: "0 16px 0 48px",
          fontSize: 13, fontFamily: "inherit",
          background: "var(--bg-surface)", color: "var(--text-primary)",
          border: "1px solid " + (focus ? "var(--accent)" : "var(--border)"),
          borderRadius: 999, outline: "none",
          boxShadow: focus ? "0 0 0 3px var(--accent-dim)"
            : "inset 0 1px 3px rgba(0,0,0,0.4)",
          transition: "all 200ms ease" }} />
      <span style={{ position: "absolute", left: 34, top: "50%",
        transform: "translateY(-50%)", color: "var(--text-muted)",
        pointerEvents: "none", display: "flex" }}>
        <Icon name="search" size={20} />
      </span>
    </div>
  );
}

Object.assign(window, {
  BottomNav, DesktopSidebar, SongCard, LyricsBlock, splitRepeat,
  NotificationToggle, DailyVerse, LanguageToggle, FontSizeControl,
  ChurchFilter, AppTitle, SearchBar,
});
