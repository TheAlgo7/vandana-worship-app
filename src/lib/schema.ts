import type { Song } from "./getSongs";

const BASE_URL = "https://vandanaapp.vercel.app";

export function buildSongSchema(song: Song) {
  const hinglishLyrics = Object.values(song.lyrics.hinglish ?? {}).join("\n\n");
  const languages: string[] = [];
  if (song.languages_available.includes("hindi")) languages.push("hi");
  if (song.languages_available.includes("hinglish")) languages.push("en-IN");

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "MusicComposition",
        "@id": `${BASE_URL}/song/${song.id}#composition`,
        name: song.title,
        url: `${BASE_URL}/song/${song.id}`,
        description: song.seo_description,
        inLanguage: languages.length > 1 ? languages : languages[0] ?? "hi",
        composer: {
          "@type": "MusicGroup",
          name: song.artist,
        },
        ...(song.church ? { publisher: { "@type": "Organization", name: song.church } } : {}),
        lyrics: hinglishLyrics
          ? { "@type": "CreativeWork", text: hinglishLyrics.slice(0, 500) }
          : undefined,
        keywords: song.tags.join(", "),
        genre: "Christian Worship",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: BASE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: song.title,
            item: `${BASE_URL}/song/${song.id}`,
          },
        ],
      },
    ],
  };
}
