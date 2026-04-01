import SongCardSkeleton from "@/components/SongCardSkeleton";
import BottomNav from "@/components/BottomNav";

export default function Loading() {
  return (
    <>
      <div style={{ maxWidth: "40rem", margin: "0 auto", padding: "var(--space-lg) var(--space-md)" }}>
        {/* Title + subtitle */}
        <div style={{ marginBottom: "var(--space-lg)" }}>
          <div className="skeleton-block" style={{ width: "55%", height: "32px", marginBottom: "var(--space-sm)" }} />
          <div className="skeleton-block" style={{ width: "70%", height: "16px" }} />
        </div>

        {/* Search bar */}
        <div className="skeleton-block" style={{ width: "100%", height: "44px", borderRadius: "var(--radius-md)", marginBottom: "var(--space-md)" }} />

        {/* Church filter pills */}
        <div style={{ display: "flex", gap: "var(--space-xs)", marginBottom: "var(--space-lg)" }}>
          {[80, 96, 64, 72].map((w, i) => (
            <div key={i} className="skeleton-block" style={{ width: `${w}px`, height: "28px", borderRadius: "var(--radius-full)" }} />
          ))}
        </div>

        {/* Song cards */}
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-sm)" }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SongCardSkeleton key={i} />
          ))}
        </div>
      </div>

      <BottomNav />
    </>
  );
}
