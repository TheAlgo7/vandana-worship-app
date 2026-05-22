import { getAllSongMetasWithSource } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

export const revalidate = 3600;

const BASE_URL = "https://vandanaapp.vercel.app";

export default async function Home() {
  const library = await getAllSongMetasWithSource();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Vandana Worship Song Library",
    description: `Hindi and Hinglish Christian worship lyrics — ${library.songs.length} songs for the Indian church`,
    url: BASE_URL,
    numberOfItems: library.songs.length,
    itemListElement: library.songs.map((song, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/song/${song.id}`,
      name: song.title,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <div style={{ minHeight: "100vh" }}>
        <HomeContent songs={library.songs} librarySource={library.source} />
        <BottomNav />
      </div>

      {/* Crawler-only song directory — server-rendered static links */}
      <section
        aria-label="Song directory"
        style={{
          padding: "32px 20px 48px",
          borderTop: "1px solid var(--border-subtle)",
          maxWidth: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: 700,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "var(--text-muted)",
            marginBottom: 16,
          }}
        >
          All Songs ({library.songs.length})
        </h2>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 16px",
          }}
        >
          {library.songs.map((song) => (
            <li key={song.id}>
              <a
                href={`/song/${song.id}`}
                style={{
                  fontSize: "var(--text-xs)",
                  color: "var(--text-muted)",
                  textDecoration: "none",
                }}
              >
                {song.title}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
