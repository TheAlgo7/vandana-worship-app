import { getAllSongMetas } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

export default function Home() {
  const songs = getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <HomeContent songs={songs} />
      <BottomNav />
    </div>
  );
}
