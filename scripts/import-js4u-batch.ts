import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

type Language = "hinglish" | "hindi";
type LyricsSections = Record<string, string>;

interface Candidate {
  id: string;
  file: string;
  sourceTitle: string;
  title: string;
  artist: string;
  sourceUrl: string | null;
  lyrics: Record<Language, LyricsSections>;
  confidence: number;
  warnings: string[];
  score: number;
}

interface ExistingSong {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  album: string | null;
  language_default: Language;
  languages_available: Language[];
  lyrics_hinglish: LyricsSections | null;
  lyrics_hindi: LyricsSections | null;
  link_youtube: string | null;
  link_spotify: string | null;
  link_apple_music: string | null;
  tags: string[] | null;
  seo_description: string | null;
  added_by: string | null;
}

interface ImportReport {
  sourceDir: string;
  totalFiles: number;
  parsedFiles: number;
  duplicateGroups: number;
  selectedCandidates: number;
  inserted: string[];
  updated: string[];
  skipped: Array<{ title: string; file?: string; reason: string }>;
  review: Array<{ title: string; file: string; confidence: number; warnings: string[] }>;
  unknownArtists: string[];
}

const root = path.resolve(__dirname, "..");
const songsDir = path.join(root, "src", "data", "songs");
const reportDir = path.join(root, ".song-import");
const sourceDir = path.resolve(process.argv[2] ?? "");
const shouldPublish = process.argv.includes("--publish");
const allowUnknownArtist = process.argv.includes("--allow-unknown-artist");
const deriveHinglish = process.argv.includes("--derive-hinglish");
const minConfidence = Number(process.argv.find((arg) => arg.startsWith("--min-confidence="))?.split("=")[1] ?? 72);

dotenv.config({ path: path.join(root, ".env.local") });

const knownArtists = [
  "5Gen Worship",
  "Amit Kamble",
  "Ankur Masih",
  "Anugrah Ministries India",
  "Anugrah Prasad",
  "Anil Kant",
  "Anish Masih",
  "Adina Grace",
  "Arpit Karsael",
  "Ashu Melodies",
  "Ashley Joseph",
  "Benison Matthew",
  "Benson Thomas",
  "Bridge Music",
  "Carmel Community Church",
  "Crossover YFC Delhi",
  "Darpan Dua",
  "Deepak Masih",
  "Deborah Lazres",
  "Deepika Kotecha",
  "Devin D'Souza",
  "Elevation Worship",
  "Emmanuel Gollar",
  "Filadelfia Music",
  "Friends of God Ministries",
  "Gopal Masih",
  "Glory To God India",
  "Jaago Music",
  "Jaswant Jassa",
  "Jessy Robin",
  "Joseph Raj Allam",
  "Joshua Generation India",
  "Joshua Jacob John",
  "Iyob Mavchi",
  "Justin John",
  "KR Records",
  "Maria Kolady",
  "Merlyn Salvadi",
  "Mrutyunjay Ministries",
  "Nations of Worship",
  "Natasha Datt",
  "New Life City Church",
  "Nysa Prashant Pangi",
  "One Tribe Productions",
  "Pastor Joy Gill",
  "Pastor Vishal Samuel",
  "Persis John",
  "Prakruthi Angelina",
  "Praise Jesus Ministries",
  "Pramod Lokhande",
  "Prashant Thorat",
  "Prince Robinson",
  "Rahul Masih",
  "Rahul Noel Massey",
  "Rajat Rubina",
  "Ranjit J Abraham",
  "Reena Kant",
  "Robinson Shalu",
  "Roney Maben",
  "Rubina BK",
  "Rutuja Bandelu",
  "Samarth Shukla",
  "Sekel Jeet",
  "Shalom Ministries",
  "Sheldon Bangera",
  "Sheenu Mariyam",
  "Sheenu Mariam",
  "Shelley Reddy",
  "Sofia Shalu",
  "Sam Alex Pasula",
  "Tabernacle ABC Aliganj",
  "Thanga Selvam",
  "Tiffany Hudson",
  "Vipin Massey",
  "Vijay Veerappa",
  "William Massey",
  "Worship Warriors",
  "Worship Waves Studio",
  "Youth Revival Ministries",
  "Yeshua Ministries",
].sort((a, b) => b.length - a.length);

const artistAliases: Array<[RegExp, string]> = [
  [/\bpr\s*wilson george\b/i, "P. R. Wilson George"],
  [/\bprwilson george\b/i, "P. R. Wilson George"],
  [/\bps anil reena and shreya kant\b/i, "Anil Kant"],
  [/\bseket jeet\b/i, "Sekel Jeet"],
  [/\baelaan yeshu ka\b/i, "Aelaan Yeshu Ka"],
  [/\babhishek das\b/i, "Abhishek Das"],
  [/\banshul dawar\b/i, "Anshul Dawar"],
  [/\bakshay mathews\b/i, "Akshay Mathews"],
  [/\babishek darnal\b/i, "Abishek Darnal"],
];

const primaryArtistNames = new Set([
  "Bridge Music",
  "Filadelfia Music",
  "Glory To God India",
  "Jaago Music",
  "One Tribe Productions",
  "Praise Jesus Ministries",
  "Yeshua Ministries",
]);

function normalizeForCompare(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function normalizeLooseTitle(value: string): string {
  return normalizeForCompare(value)
    .replace(/\bye?eshu\b/g, "yeshu")
    .replace(/\byishu\b/g, "yeshu")
    .replace(/\byeasu\b/g, "yeshu")
    .replace(/\bmasiha\b/g, "masih")
    .replace(/\bmasihaa\b/g, "masih")
    .replace(/\bmuzako\b/g, "mujhko")
    .replace(/\bmuze\b/g, "mujhe")
    .replace(/\btuzako\b/g, "tujhko")
    .replace(/\btuze\b/g, "tujhe")
    .replace(/\bjinda\b/g, "zinda")
    .replace(/\bhe\b/g, "hai")
    .replace(/\bhu\b/g, "hoon")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value: string): string {
  return normalizeLooseTitle(value).replace(/\s+/g, "-");
}

function normalizeText(value: string): string {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/\u00a0/g, " ")
    .replace(/[“”]/g, "\"")
    .replace(/[‘’]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/[ \t]+$/gm, "")
    .trim();
}

function stripDevanagari(value: string): string {
  return value.replace(/[\u0900-\u097F]+/g, " ");
}

function stripGujarati(value: string): string {
  return value.replace(/[\u0A80-\u0AFF]+/g, " ");
}

function titleCase(value: string): string {
  const sacred = new Set(["yeshu", "yeshua", "masih", "prabhu", "yahweh", "hallelujah", "halleluyaah"]);
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(/\s+/)
    .map((word) => {
      if (/^x\d+$/i.test(word)) return word.toLowerCase();
      return word
        .split("-")
        .map((part) => {
          const lowered = part.toLowerCase();
          if (lowered === "i") return "I";
          if (sacred.has(lowered)) return lowered.charAt(0).toUpperCase() + lowered.slice(1);
          return lowered.replace(/(^|[([{'"\/\-\u2013\u2014\u2026])([a-z])/g, (_match, prefix: string, letter: string) => prefix + letter.toUpperCase());
        })
        .join("-");
    })
    .join(" ")
    .replace(/\bFt\b/g, "ft")
    .replace(/\bft\./gi, "ft.")
    .replace(/\be\./g, "E.");
}

function extractArtist(sourceTitle: string, fileName: string): string {
  const title = normalizeText(sourceTitle);
  const haystack = normalizeText(`${sourceTitle} ${fileName.replace(/[-_]+/g, " ")}`);
  const byMatch = title.match(/\bby\s+([^|,[\]()/-]+)/i);
  if (byMatch?.[1]) return titleCase(byMatch[1].trim());

  for (const [alias, artist] of artistAliases) {
    if (alias.test(haystack)) return artist;
  }

  for (const artist of primaryArtistNames) {
    const re = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(haystack)) return artist;
  }

  for (const artist of knownArtists) {
    const re = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
    if (re.test(haystack)) return artist;
  }

  const ftMatch = title.match(/\b(?:ft\.?|feat\.?|featuring)\s+([^|[\]()]+)/i);
  if (ftMatch?.[1]) return titleCase(ftMatch[1].trim());

  const bracketArtist = title.match(/\[\s*([^[\]]{4,80})\s*\]\s*$/);
  if (bracketArtist?.[1] && !/lyrics|song|worship|christian/i.test(bracketArtist[1])) {
    return titleCase(bracketArtist[1]);
  }

  const parenArtist = title.match(/\(\s*([A-Za-z][^)]+?)\s*\)\s*(?:Hindi|Christian|Song|Lyrics|$)/i);
  if (parenArtist?.[1] && !/lyrics|song|worship|christian|new|hindi/i.test(parenArtist[1])) {
    return titleCase(parenArtist[1]);
  }

  return "Unknown Artist";
}

function cleanTitle(sourceTitle: string): string {
  let title = normalizeText(sourceTitle)
    .replace(/https?:\/\/\S+/gi, " ")
    .replace(/\([^)]*[\u0900-\u097F][^)]*\)/g, " ")
    .replace(/\([^)]*[\u0A80-\u0AFF][^)]*\)/g, " ")
    .replace(/\[[^\]]*[\u0900-\u097F][^\]]*\]/g, " ")
    .replace(/\[[^\]]*[\u0A80-\u0AFF][^\]]*\]/g, " ");

  title = stripGujarati(stripDevanagari(title));

  const separators = title
    .split(/\s*(?:\/\/|\||,)\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);
  if (separators.length > 1) {
    const latinSegments = separators.filter((part) => /[A-Za-z]{3}/.test(part));
    title = (latinSegments[0] ?? separators[0]).trim();
  }

  title = title
    .replace(/\[[^\]]+\]/g, " ")
    .replace(/\([^)]*\b(?:ft\.?|feat\.?|by|lyrics|song|hindi|christian|worship|official|video)\b[^)]*\)/gi, " ")
    .replace(/\(\s*[A-Za-z][^)]+\s*\)\s*$/g, " ")
    .replace(/\b(?:new|latest|official|video|with lyrics|lyrical|lyric video|chords?|chrods?|ppt|version|versions?|2nd)\b/gi, " ")
    .replace(/\b(?:hindi|christian|jesus|worship|song|songs|lyrics|lyric|chrsitian|chritian|gospel)\b/gi, " ")
    .replace(/\b(?:20[0-9]{2}|19[0-9]{2})\b/g, " ")
    .replace(/\b(?:ft\.?|feat\.?|featuring|by)\b.*$/i, " ")
    .replace(/\b'?s\b$/i, " ")
    .replace(/\s+-\s+.*$/g, " ")
    .replace(/[^A-Za-z0-9' ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  for (const artist of knownArtists) {
    const re = new RegExp(`\\b${artist.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b\\s*$`, "i");
    title = title.replace(re, "").trim();
  }

  for (const [alias] of artistAliases) {
    title = title.replace(alias, "").trim();
  }

  title = title
    .replace(/\b(?:christmas|easter)\b$/i, " ")
    .replace(/\bibadatkaro\b$/i, " ")
    .replace(/\b(?:gamit|gavit|mavchi|vasava)\b$/i, " ")
    .replace(/\b'?s\b$/i, " ")
    .replace(/'/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (/^new\s+/i.test(title)) title = title.replace(/^new\s+/i, "");
  title = collapseRepeatedTitle(title);
  return titleCase(title);
}

function collapseRepeatedTitle(title: string): string {
  const words = title.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length % 2 !== 0) return title;
  const midpoint = words.length / 2;
  const first = words.slice(0, midpoint).join(" ").toLowerCase();
  const second = words.slice(midpoint).join(" ").toLowerCase();
  return first === second ? words.slice(0, midpoint).join(" ") : title;
}

function parseSectionHeading(line: string): string | null {
  const normalized = line
    .replace(/^\[/, "")
    .replace(/\]$/, "")
    .replace(/:$/, "")
    .trim()
    .toLowerCase();

  if (/^verse\s*\d*$/.test(normalized)) {
    const number = normalized.match(/\d+/)?.[0];
    return number ? `verse${number}` : "verse";
  }
  if (/^repeat\s+pre[-\s]?chorus$/.test(normalized)) return "repeat_pre_chorus";
  if (/^repeat\s+chorus$/.test(normalized)) return "repeat_chorus";
  if (/^chorus\s*\d*$/.test(normalized)) return "chorus";
  if (/^pre[-\s]?chorus$/.test(normalized)) return "pre_chorus";
  if (/^bridge\s*\d*$/.test(normalized)) return "bridge";
  if (/^intro\s*\d*$/.test(normalized)) return "intro";
  if (/^outro\s*\d*$/.test(normalized)) return "outro";
  return null;
}

function stripInlineChords(line: string): string {
  return line
    .replace(/\[[A-G][#b]?(?:m|maj|min|sus|dim|aug|add)?\d*(?:\/[A-G][#b]?)?\]/g, "")
    .replace(/[ \t]{2,}/g, " ")
    .trimEnd();
}

function isBoilerplateLine(line: string, title: string): boolean {
  const normalized = normalizeForCompare(line);
  const normalizedTitle = normalizeForCompare(title);
  if (!normalized) return true;
  if (/^[-_]+$/.test(line.trim())) return true;
  if (/^\[(?:version|hindi|english|lyrics)[^\]]*\]$/i.test(line.trim())) return true;
  if (/https?:\/\/|www\.|jesussongs4u|christsquare|subscribe|youtube|facebook|instagram/i.test(line)) return true;
  if (/^(hindi|hinglish)\s+lyrics$/i.test(line.trim())) return true;
  if (normalizedTitle && normalized.includes(normalizedTitle) && /lyrics|song|christian|worship|official/i.test(line)) return true;
  if (/^(lyrics|song|song lyrics:?|lyrics:?|hindi song lyrics:?|hindi christian song|christian song|show english lyrics|show english transliteration)$/i.test(line.trim())) return true;
  return false;
}

function parseLyricsBlock(block: string, title: string): LyricsSections {
  const sections: LyricsSections = {};
  const lines = normalizeText(block)
    .split("\n")
    .map((line) => stripInlineChords(line.trim()));
  let currentKey = "verse1";
  let verseCount = 1;
  let buffer: string[] = [];
  let hasCollectedLyrics = false;

  const makeUniqueKey = (baseKey: string): string => {
    if (!sections[baseKey]) return baseKey;
    let index = 2;
    while (sections[`${baseKey}${index}`]) index += 1;
    return `${baseKey}${index}`;
  };

  const flush = () => {
    const text = buffer.join("\n").trim();
    if (text) sections[currentKey] = text;
    buffer = [];
  };

  for (const line of lines) {
    if (isPageJunkBoundary(line, title) && hasCollectedLyrics) break;
    if (isBoilerplateLine(line, title) || isPageJunkBoundary(line, title)) continue;
    const heading = parseSectionHeading(line);
    if (heading) {
      flush();
      if (heading === "repeat_chorus" && sections.chorus) {
        const key = makeUniqueKey("repeat_chorus");
        sections[key] = sections.chorus;
        currentKey = key;
        continue;
      }
      currentKey = makeUniqueKey(heading === "verse" ? `verse${verseCount++}` : heading);
      continue;
    }
    buffer.push(line);
    hasCollectedLyrics = true;
  }

  flush();
  return sections;
}

function isPageJunkBoundary(line: string, title = ""): boolean {
  if (/^NA DAROONGA\s*\(/i.test(line) && !/na daroonga/i.test(title)) return true;
  if (/^Changa\s*\(/i.test(line) && !/^changa$/i.test(title)) return true;
  if (/^Magan\s*\(/i.test(line) && !/^magan$/i.test(title)) return true;
  if (/^Zindagi Ke Safar/i.test(line) && !/zindagi ke safar/i.test(title)) return true;
  if (/^Pyaare Pita/i.test(line) && !/pyaare pita/i.test(title)) return true;
  return /Read the full lyrics|Responsive Styling|@media|lyrics-container|lyrics-box|toggle-area|toggle-button|document\.getElementById|function\s+\w+|const\s+\w+\s*=|var\s+\w+\s*=|Song Details|Songs Credit Details|Click Here|Top Tunes|Trending Worship Songs|relatedPostConfig|BlogPosting|Media Partner|Production:|Mix & Master|Vocal Record|Shoot & Edit|Credit:|^\s*::|^\s*Album\s*:|^\s*Tittle\s*:|^\s*Title\s*:|^\s*Singers?\s*:|^\s*Music\s*:/i.test(line);
}

function extractBlock(text: string, startLabel: string, endLabel?: string): string {
  const start = text.search(new RegExp(`^${startLabel}\\s*$`, "im"));
  if (start < 0) return "";
  const contentStart = text.indexOf("\n", start);
  const end = endLabel ? text.search(new RegExp(`^${endLabel}\\s*$`, "im")) : -1;
  return text.slice(contentStart + 1, end > contentStart ? end : undefined).trim();
}

function textLength(sections: LyricsSections | null | undefined): number {
  return Object.values(sections ?? {}).join("\n").replace(/\s+/g, "").length;
}

function hasDevanagari(sections: LyricsSections): boolean {
  return /[\u0900-\u097F]/.test(Object.values(sections).join("\n"));
}

function hasGujaratiText(text: string): boolean {
  return /[\u0A80-\u0AFF]/.test(text);
}

function hasPageJunk(sections: LyricsSections): boolean {
  const text = Object.values(sections).join("\n");
  return /@media|function\s+\w+|document\.getElementById|const\s+\w+\s*=|var\s+\w+\s*=|lyrics-container|toggle-button|data:image|BlogPosting|Song Details|Song Name|Click Here|Top Tunes|Trending Worship Songs|Read the full lyrics/i.test(text);
}

const independentVowels: Record<string, string> = {
  अ: "a",
  आ: "aa",
  इ: "i",
  ई: "ee",
  उ: "u",
  ऊ: "oo",
  ऋ: "ri",
  ए: "e",
  ऐ: "ai",
  ओ: "o",
  औ: "au",
};

const vowelMarks: Record<string, string> = {
  "ा": "aa",
  "ि": "i",
  "ी": "ee",
  "ु": "u",
  "ू": "oo",
  "ृ": "ri",
  "े": "e",
  "ै": "ai",
  "ो": "o",
  "ौ": "au",
};

const consonants: Record<string, string> = {
  क: "k",
  ख: "kh",
  ग: "g",
  घ: "gh",
  ङ: "ng",
  च: "ch",
  छ: "chh",
  ज: "j",
  झ: "jh",
  ञ: "ny",
  ट: "t",
  ठ: "th",
  ड: "d",
  ढ: "dh",
  ण: "n",
  त: "t",
  थ: "th",
  द: "d",
  ध: "dh",
  न: "n",
  प: "p",
  फ: "ph",
  ब: "b",
  भ: "bh",
  म: "m",
  य: "y",
  र: "r",
  ल: "l",
  व: "v",
  श: "sh",
  ष: "sh",
  स: "s",
  ह: "h",
  क्ष: "ksh",
  त्र: "tr",
  ज्ञ: "gy",
  क़: "q",
  ख़: "kh",
  ग़: "gh",
  ज़: "z",
 ड़: "d",
 ढ़: "dh",
  फ़: "f",
};

function transliterateHindiText(value: string): string {
  let output = "";
  for (let index = 0; index < value.length; index += 1) {
    const current = value[index];
    const next = value[index + 1];
    const cluster = value.slice(index, index + 3);
    if (consonants[cluster]) {
      output += consonants[cluster] + "a";
      index += 2;
      continue;
    }
    if (independentVowels[current]) {
      output += independentVowels[current];
      continue;
    }
    if (consonants[current]) {
      if (next === "्") {
        output += consonants[current];
        index += 1;
      } else if (next && vowelMarks[next]) {
        output += consonants[current] + vowelMarks[next];
        index += 1;
      } else {
        output += consonants[current] + "a";
      }
      continue;
    }
    if (current === "ं" || current === "ँ") {
      output += "n";
      continue;
    }
    if (current === "ः") {
      output += "h";
      continue;
    }
    if (current === "़" || current === "्") continue;
    output += current;
  }
  return output
    .split("\n")
    .map((line) => line.replace(/a\b/g, "").replace(/[ \t]+/g, " ").trim())
    .join("\n")
    .trim();
}

function transliterateSections(sections: LyricsSections): LyricsSections {
  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, transliterateHindiText(value)])
  );
}

function parseFile(filePath: string): Candidate | null {
  const file = path.basename(filePath);
  const text = normalizeText(fs.readFileSync(filePath, "utf8"));
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean);
  const sourceTitle = lines[0] ?? "";
  const sourceUrl = lines.find((line) => /^https?:\/\//.test(line)) ?? null;
  const title = cleanTitle(sourceTitle);
  const artist = extractArtist(sourceTitle, file);
  const warnings: string[] = [];

  if (!sourceTitle || !title) return null;
  if (/bible verses|depression|hopelessness|article|prayer points|counsel(?:ing|ling)|services online|top\s+\d+/i.test(sourceTitle)) warnings.push("non-song-looking title");
  if (hasGujaratiText(file + "\n" + sourceTitle)) warnings.push("unsupported script in title/file");
  if (title.length < 4) warnings.push("title too short after cleanup");
  if (/\s[A-Za-z]$/.test(title)) warnings.push("title has one-letter tail");
  if (knownArtists.some((artist) => normalizeForCompare(title) === normalizeForCompare(artist.split(/\s+/).at(-1) ?? ""))) {
    warnings.push("title looks like artist surname only");
  }
  if (title.split(/\s+/).length > 7) warnings.push("title still noisy after cleanup");
  if (/lyrics|song|christian|worship|official|video|chords?|chrods?|ppt|version/i.test(title)) warnings.push("title still has boilerplate");

  const hindiBlock = extractBlock(text, "Hindi Lyrics", "Hinglish Lyrics");
  const hinglishBlock = extractBlock(text, "Hinglish Lyrics");
  const hindiSections = parseLyricsBlock(hindiBlock, title);
  const hinglishSections = parseLyricsBlock(hinglishBlock, title);

  if (textLength(hindiSections) > 0 && !hasDevanagari(hindiSections)) {
    if (textLength(hinglishSections) === 0) {
      Object.assign(hinglishSections, hindiSections);
    }
    for (const key of Object.keys(hindiSections)) delete hindiSections[key];
    warnings.push("Hindi block was romanized; stored as Hinglish");
  }

  if (deriveHinglish && textLength(hinglishSections) === 0 && hasDevanagari(hindiSections)) {
    Object.assign(hinglishSections, transliterateSections(hindiSections));
  }

  const hindiLength = textLength(hindiSections);
  const hinglishLength = textLength(hinglishSections);
  const totalLength = hindiLength + hinglishLength;
  const sourceLooksRegional = /\b(?:gamit|gavit|mavchi|vasava|telugu|tamil|malayalam|kannada|vonay)\b/i.test(file + "\n" + sourceTitle);
  if (sourceLooksRegional) warnings.push("regional-language source needs manual review");
  if (totalLength < 180) warnings.push("lyrics too short");
  if (hindiLength > 0 && hindiLength < 90) warnings.push("Hindi lyrics very short");
  if (hinglishLength > 0 && hinglishLength < 90) warnings.push("Hinglish lyrics very short");
  if (hindiLength === 0 && hinglishLength === 0) warnings.push("missing usable lyrics");
  if (hasPageJunk(hindiSections) || hasPageJunk(hinglishSections)) warnings.push("page junk in lyrics");
  if (artist === "Unknown Artist") warnings.push("artist unknown");

  let confidence = 100;
  for (const warning of warnings) {
    if (warning === "artist unknown") confidence -= 5;
    else if (warning.includes("short")) confidence -= 20;
    else if (warning.includes("unsupported script")) confidence -= 15;
    else if (warning.includes("romanized")) confidence -= 3;
    else if (warning.includes("page junk")) confidence -= 45;
    else confidence -= 25;
  }
  confidence = Math.max(0, Math.min(100, confidence));

  return {
    id: slugify(title),
    file,
    sourceTitle,
    title,
    artist,
    sourceUrl,
    lyrics: {
      hinglish: hinglishSections,
      hindi: hindiSections,
    },
    confidence,
    warnings,
    score: confidence + Math.min(totalLength / 60, 30) + (hindiLength > 0 && hinglishLength > 0 ? 20 : 0),
  };
}

function selectBestCandidates(candidates: Candidate[]) {
  const byTitle = new Map<string, Candidate[]>();
  for (const candidate of candidates) {
    const key = normalizeLooseTitle(candidate.title);
    const group = byTitle.get(key) ?? [];
    group.push(candidate);
    byTitle.set(key, group);
  }

  const selected: Candidate[] = [];
  const duplicateGroups = [...byTitle.values()].filter((group) => group.length > 1).length;
  for (const group of byTitle.values()) {
    selected.push(group.sort((a, b) => b.score - a.score)[0]);
  }

  return { selected: selected.sort((a, b) => a.title.localeCompare(b.title)), duplicateGroups };
}

function shouldUpdate(existing: ExistingSong, incoming: Candidate): boolean {
  if (incoming.confidence < minConfidence) return false;
  if (existing.artist === "Unknown Artist" && incoming.artist !== "Unknown Artist") return true;
  if (
    incoming.artist !== "Unknown Artist" &&
    existing.artist !== incoming.artist &&
    primaryArtistNames.has(incoming.artist)
  ) {
    return true;
  }
  if (
    incoming.artist !== "Unknown Artist" &&
    existing.artist !== incoming.artist &&
    !knownArtists.some((artist) => normalizeForCompare(existing.artist).includes(normalizeForCompare(artist)))
  ) {
    return true;
  }
  if (!existing.lyrics_hindi && textLength(incoming.lyrics.hindi) > 0) return true;
  if (!existing.lyrics_hinglish && textLength(incoming.lyrics.hinglish) > 0) return true;
  if (textLength(incoming.lyrics.hindi) > textLength(existing.lyrics_hindi) + 120) return true;
  if (textLength(incoming.lyrics.hinglish) > textLength(existing.lyrics_hinglish) + 120) return true;
  return false;
}

function hasBlockingWarnings(song: Candidate): boolean {
  return song.warnings.some((warning) => {
    if (allowUnknownArtist && warning === "artist unknown") return false;
    if (warning === "Hindi block was romanized; stored as Hinglish") return false;
    return true;
  });
}

function toSupabaseRow(song: Candidate, existing?: ExistingSong) {
  const hasHinglish = textLength(song.lyrics.hinglish) > 0;
  const hasHindi = textLength(song.lyrics.hindi) > 0;
  const keepsExistingHinglish = !hasHinglish && textLength(existing?.lyrics_hinglish) > 0;
  const keepsExistingHindi = !hasHindi && textLength(existing?.lyrics_hindi) > 0;
  const languages = [
    ...(hasHinglish || keepsExistingHinglish ? ["hinglish"] as const : []),
    ...(hasHindi || keepsExistingHindi ? ["hindi"] as const : []),
  ];
  const artist = song.artist !== "Unknown Artist" ? song.artist : existing?.artist ?? song.artist;
  const sourceTag = song.sourceUrl?.includes("christsquare.com") ? "christsquare" : "jesussongs4u";
  const tags = Array.from(new Set([...(existing?.tags ?? []), "worship", ...languages, sourceTag]));

  return {
    id: existing?.id ?? song.id,
    title: existing?.title ?? song.title,
    artist,
    church: existing?.church ?? null,
    album: existing?.album ?? null,
    language_default: languages.includes("hinglish") ? "hinglish" : "hindi",
    languages_available: languages,
    lyrics_hinglish: hasHinglish ? song.lyrics.hinglish : existing?.lyrics_hinglish ?? null,
    lyrics_hindi: hasHindi ? song.lyrics.hindi : existing?.lyrics_hindi ?? null,
    link_youtube: existing?.link_youtube ?? null,
    link_spotify: existing?.link_spotify ?? null,
    link_apple_music: existing?.link_apple_music ?? null,
    tags,
    seo_description: `${existing?.title ?? song.title} lyrics in ${languages.join(" and ")} by ${artist}`,
    added_by: existing?.added_by ?? "Gaurav | Vandana",
  };
}

function updateLocalIfExists(song: Candidate, existing?: ExistingSong) {
  const localPath = path.join(songsDir, `${existing?.id ?? song.id}.json`);
  if (!fs.existsSync(localPath)) return;

  const local = JSON.parse(fs.readFileSync(localPath, "utf8"));
  if (!local.artist || local.artist === "Unknown Artist") {
    local.artist = song.artist !== "Unknown Artist" ? song.artist : local.artist;
  }
  const localHinglishLength = textLength(local.lyrics?.hinglish);
  const localHindiLength = textLength(local.lyrics?.hindi);
  local.lyrics = {
    ...local.lyrics,
    hinglish:
      localHinglishLength === 0 && textLength(song.lyrics.hinglish) > 0
        ? song.lyrics.hinglish
        : local.lyrics?.hinglish,
    hindi:
      localHindiLength === 0 && textLength(song.lyrics.hindi) > 0
        ? song.lyrics.hindi
        : local.lyrics?.hindi,
  };
  local.languages_available = [
    ...(local.lyrics?.hinglish ? ["hinglish"] as const : []),
    ...(local.lyrics?.hindi ? ["hindi"] as const : []),
  ];
  local.source_url = local.source_url ?? song.sourceUrl;
  fs.writeFileSync(localPath, `${JSON.stringify(local, null, 2)}\n`, "utf8");
}

async function main() {
  if (!sourceDir || !fs.existsSync(sourceDir)) {
    throw new Error(`Batch folder not found: ${sourceDir || "(missing)"}`);
  }

  const files = fs.readdirSync(sourceDir).filter((file) => file.endsWith(".txt")).sort();
  const parsed = files
    .map((file) => parseFile(path.join(sourceDir, file)))
    .filter((candidate): candidate is Candidate => Boolean(candidate));
  const { selected, duplicateGroups } = selectBestCandidates(parsed);

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  const { data, error } = await supabase.from("songs").select("*");
  if (error || !data) throw new Error(error?.message ?? "Could not read existing songs.");

  const existingRows = data as ExistingSong[];
  const byId = new Map(existingRows.map((song) => [song.id, song]));
  const byTitle = new Map(existingRows.map((song) => [normalizeForCompare(song.title), song]));
  const byLooseTitle = new Map(existingRows.map((song) => [normalizeLooseTitle(song.title), song]));
  const report: ImportReport = {
    sourceDir,
    totalFiles: files.length,
    parsedFiles: parsed.length,
    duplicateGroups,
    selectedCandidates: selected.length,
    inserted: [],
    updated: [],
    skipped: [],
    review: [],
    unknownArtists: [],
  };

  for (const song of selected) {
    const existing = byId.get(song.id) ?? byTitle.get(normalizeForCompare(song.title)) ?? byLooseTitle.get(normalizeLooseTitle(song.title));
    if (song.artist === "Unknown Artist") report.unknownArtists.push(song.title);

    if (song.confidence < minConfidence || hasBlockingWarnings(song)) {
      report.review.push({ title: song.title, file: song.file, confidence: song.confidence, warnings: song.warnings });
      continue;
    }

    if (existing && !shouldUpdate(existing, song)) {
      report.skipped.push({ title: existing.title, file: song.file, reason: "existing version is already complete enough" });
      continue;
    }

    if (shouldPublish) {
      const row = toSupabaseRow(song, existing);
      const { error: upsertError } = await supabase.from("songs").upsert(row, { onConflict: "id" });
      if (upsertError) throw new Error(`${song.title}: ${upsertError.message}`);
      updateLocalIfExists(song, existing);
    }

    if (existing) report.updated.push(existing.title);
    else report.inserted.push(song.title);
  }

  fs.mkdirSync(reportDir, { recursive: true });
  const reportPath = path.join(reportDir, `js4u-${path.basename(sourceDir)}-report.json`);
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  console.log(`${shouldPublish ? "Published" : "Dry run"} ${files.length} files from ${sourceDir}`);
  console.log(`Parsed files: ${report.parsedFiles}`);
  console.log(`Duplicate title groups: ${report.duplicateGroups}`);
  console.log(`Selected candidates: ${report.selectedCandidates}`);
  console.log(`Inserted: ${report.inserted.length}`);
  console.log(`Updated: ${report.updated.length}`);
  console.log(`Skipped: ${report.skipped.length}`);
  console.log(`Needs review: ${report.review.length}`);
  console.log(`Unknown artists: ${report.unknownArtists.length}`);
  console.log(`Report: ${path.relative(root, reportPath)}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
