import { getAllSongMetasWithSource } from "@/lib/getSongs";
import HomeContent from "@/components/HomeContent";
import BottomNav from "@/components/BottomNav";

export const revalidate = 3600;

export default async function Home() {
  const library = await getAllSongMetasWithSource();

  return (
    <div style={{ minHeight: "100vh" }}>
      <HomeContent songs={library.songs} librarySource={library.source} />
      <BottomNav />
    </div>
  );
}
