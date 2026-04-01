import { ImageResponse } from "next/og";

export const runtime = "nodejs";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0c0a09",
          color: "#d4a853",
          fontSize: 110,
          fontWeight: 700,
          letterSpacing: -4,
          border: "10px solid #d4a853",
          borderRadius: 36,
        }}
      >
        V
      </div>
    ),
    {
      width: 192,
      height: 192,
    },
  );
}