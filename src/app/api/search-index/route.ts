import { getLyricsSearchIndex } from "@/lib/getSongs";

// Lyric search corpus, fetched lazily by the home screen after first paint.
// ISR keeps it warm; the service worker serves it stale-while-revalidate, so
// repeat searches cost zero network.
export const revalidate = 3600;

export async function GET() {
  const entries = await getLyricsSearchIndex();
  return Response.json(entries, {
    headers: {
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
    },
  });
}
