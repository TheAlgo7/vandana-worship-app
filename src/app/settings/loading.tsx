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
        <div className="skeleton-block" style={{ width: 92, height: 22 }} />
      </header>
      <main style={{ padding: "24px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)", maxWidth: 560, margin: "0 auto" }}>
        {[0, 1, 2].map((item) => (
          <section key={item} style={{ marginBottom: 36 }}>
            <div className="skeleton-block" style={{ width: 120, height: 12, marginBottom: 10 }} />
            <div className="skeleton-block" style={{ width: "100%", height: item === 2 ? 156 : 74, borderRadius: "var(--radius-md)" }} />
          </section>
        ))}
      </main>
      <BottomNav />
    </>
  );
}
