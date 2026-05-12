import { unstable_cache } from "next/cache";
import { getAllSongMetasWithSource } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

const getCachedSongMetas = unstable_cache(getAllSongMetasWithSource, ["song-metas"], {
  revalidate: 3600,
});

export default async function Home() {
  const library = await getCachedSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <HomeContent songs={library.songs} librarySource={library.source} />
      <BottomNav />
    </div>
  );
}
