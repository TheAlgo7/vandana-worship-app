import type { Metadata } from "next";
import updatesData from "@/data/updates.json";
import UpdatesContent from "./UpdatesContent";
import BottomNav from "@/components/BottomNav";
import { getAllSongMetas } from "@/lib/getSongs";

export const metadata: Metadata = {
  title: "Updates",
  description: "New songs, fixes, and improvements to the Vandana worship lyrics library.",
};

export default async function UpdatesPage() {
  const songs = await getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <UpdatesContent updates={updatesData} librarySongCount={songs.length} />
      <BottomNav />
    </div>
  );
}
