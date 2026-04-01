export default function SongSkeleton() {
  return (
    <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "var(--space-lg) var(--space-md)" }}>
      {/* Back link placeholder */}
      <div className="skeleton-block" style={{ width: "4rem", height: "1rem", marginBottom: "var(--space-md)" }} />

      {/* Title + artist */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <div className="skeleton-block" style={{ width: "60%", height: "36px", marginBottom: "var(--space-sm)" }} />
        <div className="skeleton-block" style={{ width: "40%", height: "16px" }} />
      </div>

      {/* Language toggle bar */}
      <div className="skeleton-block" style={{ width: "100%", height: "40px", marginBottom: "var(--space-lg)" }} />

      {/* Section 1 */}
      <div style={{ marginBottom: "var(--space-lg)" }}>
        <div className="skeleton-block" style={{ width: "25%", height: "12px", marginBottom: "var(--space-sm)" }} />
        {["90%", "75%", "85%", "60%"].map((w, i) => (
          <div key={i} className="skeleton-block" style={{ width: w, height: "18px", marginBottom: "var(--space-sm)" }} />
        ))}
      </div>

      {/* Section 2 */}
      <div>
        <div className="skeleton-block" style={{ width: "25%", height: "12px", marginBottom: "var(--space-sm)" }} />
        {["85%", "70%", "80%"].map((w, i) => (
          <div key={i} className="skeleton-block" style={{ width: w, height: "18px", marginBottom: "var(--space-sm)" }} />
        ))}
      </div>
    </div>
  );
}
