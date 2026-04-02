import { getAllSongMetas } from "@/lib/getSongs";
import FavouritesContent from "./FavouritesContent";
import BottomNav from "@/components/BottomNav";

export default function FavouritesPage() {
  const songs = getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <FavouritesContent songs={songs} />
      <BottomNav />
    </div>
  );
}
