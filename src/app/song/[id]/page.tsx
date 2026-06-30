import { notFound } from "next/navigation";
import { getSongById, getSongIds } from "@/lib/getSongs";
import { buildSongSchema } from "@/lib/schema";
import { jsonLdHtml } from "@/lib/jsonLd";
import type { Metadata } from "next";
import SongView from "./SongView";

const BASE_URL = "https://vandanaapp.vercel.app";

// Lyric fixes land in Supabase between deploys. These pages are prerendered at
// build (SEO), so a deploy already refreshes every song; weekly time-based
// revalidation is just a safety net for edits made without a redeploy. Daily
// revalidation across ~3k songs was the bulk of the project's ISR writes, so
// this is weekly (604800s) — a redeploy still propagates fixes immediately.
export const revalidate = 604800;

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
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(schema) }}
      />
      <SongView song={song} />
    </>
  );
}
