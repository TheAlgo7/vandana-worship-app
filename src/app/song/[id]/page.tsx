import { notFound } from "next/navigation";
import { getSongById, getSongIds } from "@/lib/getSongs";
import { buildSongSchema } from "@/lib/schema";
import type { Metadata } from "next";
import SongView from "./SongView";

const BASE_URL = "https://vandanaapp.vercel.app";

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
  return {
    title: `${song.title} Lyrics`,
    description: song.seo_description,
    alternates: { canonical: `${BASE_URL}/song/${id}` },
    openGraph: {
      title: `${song.title} Lyrics — Vandana`,
      description: song.seo_description,
      url: `${BASE_URL}/song/${id}`,
      type: "article",
      locale: "hi_IN",
      images: [{ url: `${BASE_URL}/icons/og-image.png`, width: 1200, height: 630 }],
    },
  };
}

export default async function SongPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await getSongById(id);
  if (!song) notFound();

  const schema = buildSongSchema(song);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <SongView song={song} />
    </>
  );
}
