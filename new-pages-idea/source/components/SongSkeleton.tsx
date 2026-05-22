export default function SongSkeleton() {
  return (
    <div style={{ background: "var(--bg-base)", minHeight: "100dvh" }}>
      {/* Topbar mirrors song-topbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "0 12px",
          height: 56,
          borderBottom: "1px solid var(--border)",
          background: "var(--bg-base)",
        }}
      >
        {/* Back link */}
        <div className="skeleton-block" style={{ width: 52, height: 16, borderRadius: "var(--radius-sm)" }} />
        {/* Spacer */}
        <div style={{ flex: 1 }} />
        {/* Action icons: heart, share, setlist */}
        <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: "var(--radius-pill)" }} />
        <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: "var(--radius-pill)" }} />
        <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: "var(--radius-pill)" }} />
        {/* Present pill */}
        <div className="skeleton-block" style={{ width: 72, height: 36, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Body */}
      <div style={{ padding: "24px 20px", maxWidth: "760px" }}>
        {/* Star glyph */}
        <div className="skeleton-block" style={{ width: 14, height: 14, borderRadius: 2, marginBottom: 16, opacity: 0.4 }} />

        {/* Song title */}
        <div className="skeleton-block" style={{ width: "62%", height: 34, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
        {/* Artist */}
        <div className="skeleton-block" style={{ width: "38%", height: 14, marginBottom: 20, borderRadius: "var(--radius-sm)" }} />

        {/* Divider */}
        <div style={{ height: 1, background: "var(--accent-dim)", marginBottom: 24 }} />

        {/* Controls toolbar */}
        <div className="skeleton-block" style={{ width: "100%", height: 52, borderRadius: "var(--radius-lg)", marginBottom: 28 }} />

        {/* Verse 1 */}
        <div style={{ marginBottom: 28 }}>
          <div className="skeleton-block" style={{ width: 64, height: 11, marginBottom: 14, borderRadius: "var(--radius-sm)" }} />
          {["88%", "72%", "82%", "60%"].map((w, i) => (
            <div key={i} className="skeleton-block" style={{ width: w, height: 20, marginBottom: 12, borderRadius: "var(--radius-sm)" }} />
          ))}
        </div>

        {/* Verse 2 */}
        <div style={{ marginBottom: 28 }}>
          <div className="skeleton-block" style={{ width: 64, height: 11, marginBottom: 14, borderRadius: "var(--radius-sm)" }} />
          {["80%", "68%", "76%", "90%", "58%"].map((w, i) => (
            <div key={i} className="skeleton-block" style={{ width: w, height: 20, marginBottom: 12, borderRadius: "var(--radius-sm)" }} />
          ))}
        </div>

        {/* Chorus */}
        <div>
          <div className="skeleton-block" style={{ width: 56, height: 11, marginBottom: 14, borderRadius: "var(--radius-sm)" }} />
          {["84%", "70%", "78%"].map((w, i) => (
            <div key={i} className="skeleton-block" style={{ width: w, height: 20, marginBottom: 12, borderRadius: "var(--radius-sm)" }} />
          ))}
        </div>
      </div>
    </div>
  );
}
