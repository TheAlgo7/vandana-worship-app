import SongCardSkeleton from "@/components/SongCardSkeleton";
import BottomNav from "@/components/BottomNav";

export default function FavouritesLoading() {
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
        <div className="skeleton-block" style={{ width: 130, height: 22 }} />
      </header>
      <main style={{ padding: "20px 20px", paddingBottom: "calc(var(--nav-clearance) + 16px)", maxWidth: "40rem", margin: "0 auto" }}>
        {Array.from({ length: 6 }).map((_, i) => (
          <SongCardSkeleton key={i} />
        ))}
      </main>
      <BottomNav />
    </>
  );
}
