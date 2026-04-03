import { notFound } from "next/navigation";
import { getSongById, getSongIds } from "@/lib/getSongs";
import type { Metadata } from "next";
import SongView from "./SongView";

export async function generateStaticParams() {
  const ids = await getSongIds();
  return ids.map((id) => ({ id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const song = await getSongById(id);
  if (!song) return {};
  return { title: song.title, description: song.seo_description };
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await getSongById(id);
  if (!song) notFound();

  return <SongView song={song} />;
}
