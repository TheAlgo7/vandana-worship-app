import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        maxWidth: "40rem",
        margin: "0 auto",
        padding: "var(--space-lg) var(--space-md)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        paddingTop: "var(--space-xl)",
      }}
    >
      <div style={{ fontSize: "3rem", marginBottom: "var(--space-md)" }}>🎵</div>
      <h1
        style={{
          fontSize: "var(--font-size-xl)",
          fontWeight: 700,
          color: "var(--color-text)",
          marginBottom: "var(--space-sm)",
        }}
      >
        Song not found
      </h1>
      <p
        style={{
          fontSize: "var(--font-size-base)",
          color: "var(--color-text-muted)",
          marginBottom: "var(--space-lg)",
        }}
      >
        This song doesn&apos;t exist or may have been removed.
      </p>
      <Link
        href="/"
        style={{
          display: "inline-block",
          background: "var(--color-primary)",
          color: "var(--color-text-inverse)",
          padding: "var(--space-sm) var(--space-lg)",
          borderRadius: "var(--radius-md)",
          fontWeight: 600,
          fontSize: "var(--font-size-base)",
          textDecoration: "none",
        }}
      >
        ← Back to all songs
      </Link>
    </div>
  );
}
