export default function SongSkeleton() {
  return (
    <div style={{ maxWidth: "720px", margin: "0 auto", padding: "24px 20px" }}>
      {/* Back link placeholder */}
      <div className="skeleton-block" style={{ width: "4rem", height: "1rem", marginBottom: 16 }} />

      {/* Title + artist */}
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton-block" style={{ width: "60%", height: 36, marginBottom: 10 }} />
        <div className="skeleton-block" style={{ width: "40%", height: 16 }} />
      </div>

      {/* Controls toolbar */}
      <div className="skeleton-block" style={{ width: "100%", height: 40, marginBottom: 24, borderRadius: "var(--radius-md)" }} />

      {/* Section 1 */}
      <div style={{ marginBottom: 24 }}>
        <div className="skeleton-block" style={{ width: "25%", height: 12, marginBottom: 10 }} />
        {["90%", "75%", "85%", "60%"].map((w, i) => (
          <div key={i} className="skeleton-block" style={{ width: w, height: 18, marginBottom: 10 }} />
        ))}
      </div>

      {/* Section 2 */}
      <div>
        <div className="skeleton-block" style={{ width: "25%", height: 12, marginBottom: 10 }} />
        {["85%", "70%", "80%"].map((w, i) => (
          <div key={i} className="skeleton-block" style={{ width: w, height: 18, marginBottom: 10 }} />
        ))}
      </div>
    </div>
  );
}
