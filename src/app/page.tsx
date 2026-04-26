import { unstable_cache } from "next/cache";
import { getAllSongMetas } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

const getCachedSongMetas = unstable_cache(getAllSongMetas, ["song-metas"], {
  revalidate: 3600,
});

export default async function Home() {
  const songs = await getCachedSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <HomeContent songs={songs} />
      <BottomNav />
    </div>
  );
}
