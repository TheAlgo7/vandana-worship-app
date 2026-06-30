import { notFound } from "next/navigation";
import { getSongById } from "@/lib/getSongs";
import type { Metadata } from "next";
import PresentView from "./PresentView";

// Lyric fixes land in Supabase between deploys — refresh daily.
export const revalidate = 86400;

// The presenter view is noindex and only opened during live worship, so there's
// no SEO reason to prerender all ~3k songs at build. Doing so wrote the entire
// catalog to Vercel's ISR cache on every deploy *and* re-revalidated all of it
// daily. Returning [] makes each page render on first open and then cache for
// `revalidate` seconds — ISR writes now scale with actual use, not catalog size.
// (dynamicParams defaults to true, so any valid id still resolves.)
export async function generateStaticParams() {
  return [];
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
    title: `${song.title}: Present`,
    robots: { index: false, follow: false },
    alternates: { canonical: `https://vandanaapp.vercel.app/song/${id}` },
  };
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
