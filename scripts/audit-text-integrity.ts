import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const sourceRoots = ["src", "public"];
const extraFiles = ["DESIGN.md"];
const sourceExtensions = new Set([".css", ".json", ".ts", ".tsx"]);
const badSourcePatterns = [
  { name: "em dash", pattern: /\u2014/ },
  { name: "en dash", pattern: /\u2013/ },
  { name: "replacement character", pattern: /\uFFFD/ },
  { name: "mojibake", pattern: /(?:Â|Ã|â[^\w\s]?|à¤|à¥)/ },
];

const failures: string[] = [];

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((entry) => {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return walk(fullPath);
    return fullPath;
  });
}

function hasAllowedExtension(file: string): boolean {
  return [...sourceExtensions].some((extension) => file.endsWith(extension));
}

for (const folder of sourceRoots) {
  for (const file of walk(join(root, folder)).filter(hasAllowedExtension)) {
    const text = readFileSync(file, "utf8");
    const label = relative(root, file);

    badSourcePatterns.forEach(({ name, pattern }) => {
      if (pattern.test(text)) failures.push(`${label}: ${name}`);
    });
  }
}

for (const file of extraFiles.map((item) => join(root, item))) {
  const text = readFileSync(file, "utf8");
  const label = relative(root, file);

  badSourcePatterns.forEach(({ name, pattern }) => {
    if (pattern.test(text)) failures.push(`${label}: ${name}`);
  });
}

for (const file of walk(join(root, "src", "data", "songs")).filter((item) => item.endsWith(".json"))) {
  const song = JSON.parse(readFileSync(file, "utf8")) as {
    id?: string;
    lyrics?: Record<string, Record<string, string>>;
  };

  Object.entries(song.lyrics ?? {}).forEach(([language, sections]) => {
    Object.entries(sections).forEach(([section, text]) => {
      if (/\?{3,}/.test(text)) {
        failures.push(`${relative(root, file)} ${language}.${section}: placeholder question marks`);
      }
    });
  });
}

if (failures.length > 0) {
  console.error(`Text integrity audit failed (${failures.length} issue${failures.length === 1 ? "" : "s"}):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exit(1);
}

console.log("Text integrity audit passed.");
