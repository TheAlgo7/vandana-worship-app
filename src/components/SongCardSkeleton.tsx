export default function SongCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--color-surface)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-md)",
        padding: "var(--space-lg)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="skeleton-block" style={{ width: "65%", height: "18px", marginBottom: "var(--space-xs)" }} />
      <div className="skeleton-block" style={{ width: "40%", height: "14px", marginBottom: "var(--space-sm)" }} />
      <div style={{ display: "flex", gap: "var(--space-xs)" }}>
        <div className="skeleton-block" style={{ width: "60px", height: "20px", borderRadius: "var(--radius-full)" }} />
        <div className="skeleton-block" style={{ width: "50px", height: "20px", borderRadius: "var(--radius-full)" }} />
      </div>
    </div>
  );
}
