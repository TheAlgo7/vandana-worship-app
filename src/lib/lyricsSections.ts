import type { LyricsMap } from "@/lib/getSongs";

type SectionEntry = [string, string];

function normalizeSectionKey(key: string): string {
  return key.toLowerCase().replace(/[\s-]+/g, "_");
}

function isBridge(key: string): boolean {
  return normalizeSectionKey(key).startsWith("bridge");
}

function isChorus(key: string): boolean {
  const normalized = normalizeSectionKey(key);

  return normalized.startsWith("chorus") || normalized.startsWith("repeat_chorus");
}

export function getOrderedSectionEntries(sections: LyricsMap): SectionEntry[] {
  const entries = Object.entries(sections);
  const firstChorusIndex = entries.findIndex(([key]) => isChorus(key));

  if (firstChorusIndex === -1) return entries;

  const hasEarlyBridge = entries.some(
    ([key], index) => isBridge(key) && index < firstChorusIndex,
  );

  if (!hasEarlyBridge) return entries;

  const earlyBridges: SectionEntry[] = [];
  const orderedEntries: SectionEntry[] = [];

  entries.forEach((entry, index) => {
    const [key] = entry;

    if (isBridge(key) && index < firstChorusIndex) {
      earlyBridges.push(entry);
      return;
    }

    orderedEntries.push(entry);
  });

  const chorusIndex = orderedEntries.findIndex(([key]) => isChorus(key));

  return [
    ...orderedEntries.slice(0, chorusIndex + 1),
    ...earlyBridges,
    ...orderedEntries.slice(chorusIndex + 1),
  ];
}

export function formatSectionLabel(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/([0-9]+)/g, " $1")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
}
