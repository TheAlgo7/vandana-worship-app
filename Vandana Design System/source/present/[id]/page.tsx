import { notFound } from "next/navigation";
import { getSongById, getSongIds } from "@/lib/getSongs";
import type { Metadata } from "next";
import PresentView from "./PresentView";

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
  return { title: `${song.title} — Present` };
}

export default async function PresentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await getSongById(id);
  if (!song) notFound();

  return <PresentView song={song} />;
}
