import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "24px 20px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingTop: 64,
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: 16 }}>🎵</div>
      <h1
        style={{
          fontSize: "var(--text-xl)",
          fontWeight: 700,
          color: "var(--text-primary)",
          marginBottom: 8,
        }}
      >
        Song not found
      </h1>
      <p
        style={{
          fontSize: "var(--text-base)",
          color: "var(--text-muted)",
          marginBottom: 24,
        }}
      >
        This song doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/app"
        style={{
          display: "inline-block",
          background: "var(--accent)",
          color: "var(--bg-base)",
          padding: "10px 24px",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          fontSize: "var(--text-base)",
          textDecoration: "none",
        }}
      >
        ← Back to all songs
      </Link>
    </div>
  );
}
