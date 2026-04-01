export default function SongCardSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        height: 72,
        padding: "0 20px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="skeleton-block" style={{ width: "55%", height: 14, marginBottom: 6 }} />
        <div className="skeleton-block" style={{ width: "30%", height: 11 }} />
      </div>
      <div className="skeleton-block" style={{ width: 20, height: 20, borderRadius: "var(--radius-pill)", flexShrink: 0 }} />
    </div>
  );
}
