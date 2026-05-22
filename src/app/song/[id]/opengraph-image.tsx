import { ImageResponse } from "next/og";
import { getSongById } from "@/lib/getSongs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const song = await getSongById(id);

  const title = song?.title ?? "Worship Lyrics";
  const artist =
    song?.artist && song.artist !== "Unknown Artist" ? song.artist : null;
  const langs = song?.languages_available ?? ["hinglish"];

  const titleSize = title.length > 35 ? 60 : title.length > 22 ? 72 : 84;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "64px 72px",
          background: "#0A0A0E",
          position: "relative",
        }}
      >
        {/* Gold top bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "#C9A22A",
          }}
        />

        {/* Vandana wordmark */}
        <div
          style={{
            position: "absolute",
            top: 48,
            left: 72,
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "#C9A22A",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            Vandana
          </span>
          <span
            style={{
              fontSize: 16,
              color: "#4A4A5A",
              letterSpacing: "0.02em",
            }}
          >
            Worship Lyrics
          </span>
        </div>

        {/* Song title */}
        <div
          style={{
            fontSize: titleSize,
            fontWeight: 700,
            color: "#F5F0E8",
            lineHeight: 1.1,
            marginBottom: 20,
            maxWidth: "88%",
          }}
        >
          {title}
        </div>

        {/* Artist */}
        {artist && (
          <div
            style={{
              fontSize: 28,
              color: "#8A8A9A",
              marginBottom: 16,
              fontWeight: 500,
            }}
          >
            {artist}
          </div>
        )}

        {/* Language chips */}
        <div style={{ display: "flex", gap: 8 }}>
          {langs.map((lang) => (
            <div
              key={lang}
              style={{
                fontSize: 15,
                fontWeight: 600,
                color: "#C9A22A",
                background: "rgba(201, 162, 42, 0.12)",
                border: "1px solid rgba(201, 162, 42, 0.3)",
                padding: "5px 16px",
                borderRadius: 999,
                letterSpacing: "0.04em",
              }}
            >
              {lang === "hindi" ? "Hindi" : "Hinglish"}
            </div>
          ))}
        </div>
      </div>
    ),
    { ...size },
  );
}
