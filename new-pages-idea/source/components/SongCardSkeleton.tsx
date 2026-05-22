export default function SongCardSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        minHeight: 76,
        padding: "16px 0",
        borderBottom: "1px solid var(--border-subtle)",
        gap: 8,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="skeleton-block" style={{ width: "56%", height: 16, marginBottom: 8, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-block" style={{ width: "33%", height: 12, borderRadius: "var(--radius-sm)" }} />
      </div>
      <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: "var(--radius-pill)", flexShrink: 0 }} />
      <div className="skeleton-block" style={{ width: 36, height: 36, borderRadius: "var(--radius-pill)", flexShrink: 0 }} />
    </div>
  );
}
