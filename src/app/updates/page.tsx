import type { Metadata } from "next";
import updatesData from "@/data/updates.json";
import UpdatesContent from "./UpdatesContent";
import BottomNav from "@/components/BottomNav";
import { getAllSongMetas } from "@/lib/getSongs";

export const metadata: Metadata = {
  title: "Updates",
  description: "New songs, fixes, and improvements to the Vandana worship lyrics library.",
};

// Pick up newly added songs without a redeploy.
export const revalidate = 3600;

function normalizeSongName(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export default async function UpdatesPage() {
  const songs = await getAllSongMetas();
  const updateSongNames = new Set(
    updatesData.flatMap((update) => update.song_names).map(normalizeSongName),
  );
  const songLinks = Object.fromEntries(
    songs
      .filter((song) => updateSongNames.has(normalizeSongName(song.title)))
      .map((song) => [normalizeSongName(song.title), song.id]),
  );

  return (
    <div style={{ minHeight: "100vh" }}>
      <UpdatesContent updates={updatesData} librarySongCount={songs.length} songLinks={songLinks} />
      <BottomNav />
    </div>
  );
}
