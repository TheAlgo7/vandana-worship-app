import type { LyricsMap } from "@/lib/getSongs";

type SectionEntry = [string, string];

function normalizeSectionKey(key: string): string {
  return key.toLowerCase().replace(/[\s-]+/g, "_");
}

function getSectionNumber(normalizedKey: string): number {
  return Number(normalizedKey.match(/\d+/)?.[0] ?? 0);
}

function getSectionRank(key: string): number {
  const normalized = normalizeSectionKey(key);

  if (normalized.startsWith("intro")) return 0;
  if (normalized === "pre_chorus" || normalized === "prechorus") return 1;
  if (normalized === "chorus") return 2;
  if (normalized.startsWith("verse")) return 3;
  if (normalized.startsWith("bridge")) return 5;
  if (normalized.startsWith("repeat_chorus") || normalized.startsWith("chorus")) return 5;
  if (normalized.startsWith("outro")) return 6;
  return 4;
}

export function getOrderedSectionEntries(sections: LyricsMap): SectionEntry[] {
  const entries = Object.entries(sections);

  return entries
    .map((entry, index) => ({ entry, index }))
    .sort((a, b) => {
      const [keyA] = a.entry;
      const [keyB] = b.entry;
      const normalizedA = normalizeSectionKey(keyA);
      const normalizedB = normalizeSectionKey(keyB);
      const rankDiff = getSectionRank(keyA) - getSectionRank(keyB);
      if (rankDiff !== 0) return rankDiff;

      const numberDiff = getSectionNumber(normalizedA) - getSectionNumber(normalizedB);
      if (numberDiff !== 0) return numberDiff;

      return a.index - b.index;
    })
    .map(({ entry }) => entry);
}

export function formatSectionLabel(key: string): string {
  if (/^pre[-_\s]?chorus$/i.test(key)) return "Pre Chorus";

  return key
    .replace(/_/g, " ")
    .replace(/([0-9]+)/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
