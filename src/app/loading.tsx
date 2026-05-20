import SongCardSkeleton from "@/components/SongCardSkeleton";
import BottomNav from "@/components/BottomNav";

export default function Loading() {
  return (
    <>
      {/* AppTitle area — mobile only */}
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "14px 20px 0" }}>
        <div className="skeleton-block" style={{ width: 96, height: 28, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-block" style={{ width: 140, height: 12, marginTop: 8, borderRadius: "var(--radius-sm)" }} />
      </div>

      {/* DailyVerse placeholder */}
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "14px 20px 8px" }}>
        <div className="skeleton-block" style={{ width: 108, height: 11, marginBottom: 12, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-block" style={{ width: "92%", height: 14, marginBottom: 7, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-block" style={{ width: "80%", height: 14, marginBottom: 7, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-block" style={{ width: "55%", height: 14, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
        <div className="skeleton-block" style={{ width: 72, height: 11, borderRadius: "var(--radius-sm)" }} />
      </div>

      {/* Search bar */}
      <div style={{ maxWidth: "40rem", margin: "6px auto 0", padding: "0 20px" }}>
        <div className="skeleton-block" style={{ width: "100%", height: 52, borderRadius: "var(--radius-pill)" }} />
      </div>

      {/* Filter chips */}
      <div style={{ display: "flex", gap: 8, margin: "16px auto 0", padding: "0 20px", maxWidth: "40rem", overflow: "hidden" }}>
        {[52, 130, 118, 64].map((w, i) => (
          <div key={i} className="skeleton-block" style={{ width: w, minWidth: w, height: 44, borderRadius: "var(--radius-pill)" }} />
        ))}
      </div>

      {/* Song list */}
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "0 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)" }}>
        {Array.from({ length: 8 }).map((_, i) => (
          <SongCardSkeleton key={i} />
        ))}
      </div>

      <BottomNav />
    </>
  );
}
