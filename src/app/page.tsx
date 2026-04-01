import { getAllSongMetas } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const songs = getAllSongMetas();

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "var(--space-lg) var(--space-md)",
      }}
    >
      <header
        style={{
          maxWidth: "40rem",
          margin: "0 auto var(--space-xl)",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "var(--font-size-2xl)",
            fontWeight: 700,
            color: "var(--color-text)",
            marginBottom: "var(--space-xs)",
          }}
        >
          Vandana
        </h1>
        <p
          style={{
            fontSize: "var(--font-size-sm)",
            color: "var(--color-text-muted)",
          }}
        >
          Worship songs for your congregation
        </p>
      </header>

      <HomeContent songs={songs} />
      <BottomNav />
    </div>
  );
}
