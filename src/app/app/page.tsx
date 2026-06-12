import { getAllSongMetasWithSource } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";
import type { Metadata } from "next";
import { jsonLdHtml } from "@/lib/jsonLd";

export const revalidate = 3600;

const BASE_URL = "https://vandanaapp.vercel.app";

export const metadata: Metadata = {
  title: "Song Library",
  description:
    "Browse 2,800+ Hindi and Hinglish Christian worship songs. Search by title, filter by language, and open any song to read lyrics in Devanagari or Roman script.",
  alternates: { canonical: `${BASE_URL}/app` },
};

export default async function AppHome() {
  const library = await getAllSongMetasWithSource();

  // Song discovery happens via sitemap.xml — no need to inline thousands of
  // ListItems (it added ~450KB of HTML on every visit).
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Vandana Worship Song Library",
    description: `Hindi and Hinglish Christian worship lyrics — ${library.songs.length} songs for the Indian church`,
    url: `${BASE_URL}/app`,
    mainEntity: {
      "@type": "ItemList",
      name: "Worship songs",
      numberOfItems: library.songs.length,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(collectionSchema) }}
      />
      <div style={{ minHeight: "100vh" }}>
        <HomeContent songs={library.songs} librarySource={library.source} />
        <BottomNav />
      </div>
    </>
  );
}
