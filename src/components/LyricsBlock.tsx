"use client";

import type { CSSProperties } from "react";
import { formatLine } from "@/lib/formatLyrics";

const WRAPPED_REPEAT_RE = /\s*\(\s*(?:x|\u00d7)?\s*([0-9०-९]+)\s*\)\s*$/i;
const PREFIXED_REPEAT_RE = /\s*(?:[-\u2013]\s*)?(?:x|\u00d7)\s*([0-9०-९]+)\s*$/i;
const DASH_REPEAT_RE = /\s*[-\u2013]\s*([0-9०-९]+)\s*$/;
const BARE_REPEAT_RE = /\s+([2-9२-९])\s*$/;

function splitRepeatMark(line: string) {
  const formatted = formatLine(line);
  if (!formatted) return { lyric: "", repeat: null };

  const match =
    formatted.match(WRAPPED_REPEAT_RE) ??
    formatted.match(PREFIXED_REPEAT_RE) ??
    formatted.match(DASH_REPEAT_RE) ??
    formatted.match(BARE_REPEAT_RE);

  if (!match?.index) return { lyric: formatted, repeat: null };

  const lyric = formatted.slice(0, match.index).trimEnd();
  if (!lyric) return { lyric: formatted, repeat: null };

  return { lyric, repeat: `x${match[1]}` };
}

export default function LyricsBlock({
  text,
  className,
  style,
}: {
  text: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <p className={["lyrics-block", className].filter(Boolean).join(" ")} style={style}>
      {text.split("\n").map((line, index) => {
        const { lyric, repeat } = splitRepeatMark(line);
        const key = `${index}-${line}`;

        if (!lyric) {
          return <span key={key} aria-hidden="true" className="lyrics-line lyrics-line-empty" />;
        }

        return (
          <span key={key} className="lyrics-line">
            <span>{lyric}</span>
            {repeat && (
              <span className="lyrics-repeat-mark" aria-label={`Repeat ${repeat.slice(1)} times`}>
                {repeat}
              </span>
            )}
          </span>
        );
      })}
    </p>
  );
}
