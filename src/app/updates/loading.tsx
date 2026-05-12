import BottomNav from "@/components/BottomNav";

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
        <div className="skeleton-block" style={{ width: 92, height: 22 }} />
      </header>
      <main style={{ padding: "20px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)", maxWidth: "40rem", margin: "0 auto" }}>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} style={{ background: "var(--bg-surface)", borderRadius: "var(--radius-lg)", padding: 16, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
              <div className="skeleton-block" style={{ width: "46%", height: 18 }} />
              <div className="skeleton-block" style={{ width: 54, height: 14 }} />
            </div>
            <div className="skeleton-block" style={{ width: "100%", height: 14, marginBottom: 8 }} />
            <div className="skeleton-block" style={{ width: "78%", height: 14, marginBottom: 12 }} />
            <div className="skeleton-block" style={{ width: 76, height: 22, borderRadius: "var(--radius-pill)" }} />
          </div>
        ))}
      </main>
      <BottomNav />
    </>
  );
}
