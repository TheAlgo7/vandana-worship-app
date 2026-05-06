import { getAllSongMetas } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

export default async function Home() {
  const songs = await getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <HomeContent songs={songs} />
      <BottomNav />
    </div>
  );
}
