import updatesData from "@/data/updates.json";
import UpdatesContent from "./UpdatesContent";
import BottomNav from "@/components/BottomNav";
import { getAllSongMetas } from "@/lib/getSongs";

export default async function UpdatesPage() {
  const songs = await getAllSongMetas();

  return (
    <div style={{ minHeight: "100vh" }}>
      <UpdatesContent updates={updatesData} librarySongCount={songs.length} />
      <BottomNav />
    </div>
  );
}
