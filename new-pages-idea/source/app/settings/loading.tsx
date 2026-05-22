import BottomNav from "@/components/BottomNav";

export default function SettingsLoading() {
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
        <div className="skeleton-block" style={{ width: 72, height: 22, borderRadius: "var(--radius-sm)" }} />
      </header>

      <main style={{ padding: "24px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)" }}>
        {/* Appearance */}
        <section style={{ marginBottom: 36 }}>
          <div className="skeleton-block" style={{ width: 88, height: 11, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
          <div className="skeleton-block" style={{ width: "100%", height: 52, borderRadius: "var(--radius-md)" }} />
        </section>

        {/* Default Language */}
        <section style={{ marginBottom: 36 }}>
          <div className="skeleton-block" style={{ width: 120, height: 11, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
          <div style={{ display: "flex", gap: 10 }}>
            <div className="skeleton-block" style={{ flex: 1, height: 48, borderRadius: "var(--radius-md)" }} />
            <div className="skeleton-block" style={{ flex: 1, height: 48, borderRadius: "var(--radius-md)" }} />
          </div>
        </section>

        {/* About */}
        <section>
          <div className="skeleton-block" style={{ width: 48, height: 11, marginBottom: 10, borderRadius: "var(--radius-sm)" }} />
          <div
            style={{
              padding: 16,
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-md)",
              border: "1px solid var(--border)",
            }}
          >
            <div className="skeleton-block" style={{ width: 80, height: 16, marginBottom: 8, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: 140, height: 11, marginBottom: 16, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: "95%", height: 12, marginBottom: 7, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: "88%", height: 12, marginBottom: 7, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: "70%", height: 12, marginBottom: 16, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: "80%", height: 12, marginBottom: 7, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: "60%", height: 12, marginBottom: 20, borderRadius: "var(--radius-sm)" }} />
            <div className="skeleton-block" style={{ width: 160, height: 12, borderRadius: "var(--radius-sm)", margin: "0 auto" }} />
          </div>
        </section>
      </main>

      <BottomNav />
    </>
  );
}
