import type { Metadata } from "next";
import { getAllSongMetas } from "@/lib/getSongs";
import FavouritesContent from "./FavouritesContent";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Pick up newly added songs without a redeploy.
export const revalidate = 3600;

export default async function FavouritesPage() {
  const songs = await getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <FavouritesContent songs={songs} />
      <BottomNav />
    </div>
  );
}
