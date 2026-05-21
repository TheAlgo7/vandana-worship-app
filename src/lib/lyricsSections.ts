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
  const sectionNumber = getSectionNumber(normalized);

  if (normalized.startsWith("intro")) return 0;
  if (normalized.startsWith("verse")) return 100 + sectionNumber * 10;
  if (normalized.startsWith("pre_chorus") || normalized.startsWith("prechorus")) {
    return 100 + (sectionNumber || 1) * 10 + 1;
  }
  if (normalized === "chorus" || normalized === "chorus1") return 112;
  if (normalized.startsWith("bridge")) return 900 + sectionNumber;
  if (normalized.startsWith("final_chorus") || normalized.startsWith("repeat_chorus")) return 920 + sectionNumber;
  if (normalized.startsWith("chorus")) return 930 + sectionNumber;
  if (normalized.includes("english_chorus")) return 940;
  if (normalized.includes("chorus_additional")) return 950;
  if (normalized.startsWith("outro")) return 980 + sectionNumber;
  return 800;
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
  if (/^final[-_\s]?chorus\d*$/i.test(key)) return "Chorus";
  if (/^chorus[-_\s]?additional$/i.test(key)) return "Chorus Additional";
  if (/^english[-_\s]?chorus$/i.test(key)) return "English Chorus";
  if (/^pre[-_\s]?chorus$/i.test(key)) return "Pre Chorus";

  return key
    .replace(/_/g, " ")
    .replace(/([0-9]+)/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
