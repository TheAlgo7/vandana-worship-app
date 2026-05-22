import type { Metadata } from "next";
import { getAllSongMetas } from "@/lib/getSongs";
import SetlistContent from "./SetlistContent";
import BottomNav from "@/components/BottomNav";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SetlistPage() {
  const songs = await getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <SetlistContent songs={songs} />
      <BottomNav />
    </div>
  );
}
