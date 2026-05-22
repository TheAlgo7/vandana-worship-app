import BottomNav from "@/components/BottomNav";

function UpdateItemSkeleton({ showMonth }: { showMonth?: boolean }) {
  return (
    <div style={{ padding: showMonth ? "14px 16px 0" : "0 16px" }}>
      {showMonth && (
        <div className="skeleton-block" style={{ width: 72, height: 11, marginBottom: 14, borderRadius: "var(--radius-sm)" }} />
      )}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "30px 1fr",
          gap: 13,
          padding: showMonth ? "12px 0 16px" : "16px 0",
          borderBottom: "1px solid var(--border-subtle)",
        }}
      >
        {/* Icon circle */}
        <div className="skeleton-block" style={{ width: 30, height: 30, borderRadius: "var(--radius-pill)" }} />
        <div>
          {/* Type badge + date row */}
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <div className="skeleton-block" style={{ width: 48, height: 11, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: 36, height: 11, borderRadius: "var(--radius-sm)" }} />
          </div>
          {/* Title */}
          <div className="skeleton-block" style={{ width: "70%", height: 16, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
          {/* Body lines */}
          <div className="skeleton-block" style={{ width: "95%", height: 12, marginBottom: 7, borderRadius: "var(--radius-sm)" }} />
          <div className="skeleton-block" style={{ width: "78%", height: 12, marginBottom: 12, borderRadius: "var(--radius-sm)" }} />
          {/* Song chips */}
          <div style={{ display: "flex", gap: 6 }}>
            <div className="skeleton-block" style={{ width: 88, height: 24, borderRadius: "var(--radius-pill)" }} />
            <div className="skeleton-block" style={{ width: 104, height: 24, borderRadius: "var(--radius-pill)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function UpdatesLoading() {
  return (
    <>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          padding: "16px 20px",
          background: "var(--bg-base)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div className="skeleton-block" style={{ width: 80, height: 22, borderRadius: "var(--radius-sm)" }} />
      </header>

      <main style={{ padding: "24px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)", maxWidth: "40rem", margin: "0 auto" }}>
        {/* Library Notes stats card */}
        <div className="skeleton-block" style={{ width: 84, height: 11, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: 12,
            marginBottom: 28,
            padding: "14px 16px",
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
          }}
        >
          <div>
            <div className="skeleton-block" style={{ width: 72, height: 11, marginBottom: 8, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: 40, height: 22, borderRadius: "var(--radius-sm)" }} />
          </div>
          <div>
            <div className="skeleton-block" style={{ width: 80, height: 11, marginBottom: 8, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: 52, height: 22, borderRadius: "var(--radius-sm)" }} />
          </div>
        </div>

        {/* Recent Changes label */}
        <div className="skeleton-block" style={{ width: 100, height: 11, marginBottom: 14, borderRadius: "var(--radius-sm)" }} />

        {/* Update items */}
        <div
          style={{
            background: "var(--bg-surface)",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            overflow: "hidden",
          }}
        >
          <UpdateItemSkeleton showMonth />
          <UpdateItemSkeleton />
          <UpdateItemSkeleton />
        </div>
      </main>

      <BottomNav />
    </>
  );
}
