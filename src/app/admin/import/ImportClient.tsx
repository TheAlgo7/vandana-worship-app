"use client";

import { useMemo, useState } from "react";

interface ReportEntry {
  title: string;
  id: string;
  status: "drafted" | "duplicate" | "invalid" | "published";
  reason?: string;
  duplicateOf?: string;
  file?: string;
}

interface DraftSong {
  id: string;
  title: string;
  artist: string;
  church: string | null;
  languages_available: string[];
}

const exampleInput = JSON.stringify([
  {
    title: "Example Worship Song",
    artist: "Example Artist",
    church: "Example Church",
    source_url: "https://example.com/source-page",
    tags: ["example"],
    lyrics_hinglish: "[Verse 1]\nPaste Hinglish lyrics here\n\n[Chorus]\nPaste chorus here",
    lyrics_hindi: "[Verse 1]\nयहां हिंदी गीत पेस्ट करें\n\n[Chorus]\nयहां कोरस पेस्ट करें",
  },
], null, 2);

export default function ImportClient() {
  const [input, setInput] = useState(exampleInput);
  const [report, setReport] = useState<ReportEntry[]>([]);
  const [drafts, setDrafts] = useState<DraftSong[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  async function generateDrafts() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/song-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "draft", input }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Draft generation failed");
      setReport(data.report ?? []);
      setDrafts(data.drafts ?? []);
      setSelected(new Set((data.drafts ?? []).map((draft: DraftSong) => draft.id)));
      setMessage(`Generated ${(data.drafts ?? []).length} drafts.`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Draft generation failed");
    } finally {
      setBusy(false);
    }
  }

  async function publishSelected() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/song-import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "publish", ids: selectedIds }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Publish failed");
      setReport(data.report ?? []);
      setMessage(data.supabase ? "Published locally and to Supabase." : "Published locally. Supabase service key was not available.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <main style={{ minHeight: "100dvh", padding: "24px 20px 64px", maxWidth: 960, margin: "0 auto" }}>
      <header style={{ marginBottom: 24 }}>
        <p className="section-label">Admin</p>
        <h1 style={{ fontFamily: "var(--font-display)", fontSize: "var(--text-2xl)", marginBottom: 8 }}>
          Song Import
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "var(--text-sm)", lineHeight: 1.6, maxWidth: 640 }}>
          Paste a JSON batch, generate review drafts, then publish selected songs. This route is local/dev only and does not scrape websites.
        </p>
      </header>

      <section style={{ display: "grid", gap: 16 }}>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          spellCheck={false}
          style={{
            width: "100%",
            minHeight: 360,
            padding: 16,
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--border)",
            background: "var(--bg-surface)",
            color: "var(--text-primary)",
            fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
            fontSize: 13,
            lineHeight: 1.6,
            outline: "none",
          }}
        />

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button type="button" onClick={generateDrafts} disabled={busy} style={primaryButtonStyle}>
            Generate drafts
          </button>
          <button type="button" onClick={publishSelected} disabled={busy || selectedIds.length === 0} style={secondaryButtonStyle}>
            Publish selected ({selectedIds.length})
          </button>
        </div>

        {message && (
          <p style={{ color: "var(--accent)", fontSize: "var(--text-sm)", fontWeight: 600 }}>
            {message}
          </p>
        )}
      </section>

      {drafts.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <p className="section-label">Drafts</p>
          <div style={{ display: "grid", gap: 8 }}>
            {drafts.map((draft) => (
              <label
                key={draft.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  padding: 12,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                }}
              >
                <input type="checkbox" checked={selected.has(draft.id)} onChange={() => toggle(draft.id)} />
                <span style={{ flex: 1 }}>
                  <strong>{draft.title}</strong>
                  <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
                    {draft.artist} · {draft.languages_available.join(", ")}
                  </span>
                </span>
              </label>
            ))}
          </div>
        </section>
      )}

      {report.length > 0 && (
        <section style={{ marginTop: 28 }}>
          <p className="section-label">Report</p>
          <div style={{ display: "grid", gap: 8 }}>
            {report.map((entry) => (
              <div
                key={`${entry.id}-${entry.status}-${entry.duplicateOf ?? entry.reason ?? ""}`}
                style={{
                  padding: 12,
                  borderRadius: "var(--radius-md)",
                  border: "1px solid var(--border)",
                  background: "var(--bg-surface)",
                  color: "var(--text-secondary)",
                  fontSize: "var(--text-sm)",
                }}
              >
                <strong style={{ color: "var(--text-primary)" }}>{entry.title}</strong>
                <span style={{ marginLeft: 8, color: entry.status === "invalid" ? "#d38f8f" : "var(--accent)" }}>
                  {entry.status}
                </span>
                {(entry.duplicateOf || entry.reason || entry.file) && (
                  <span style={{ marginLeft: 8 }}>
                    {entry.duplicateOf ?? entry.reason ?? entry.file}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const primaryButtonStyle = {
  minHeight: 44,
  padding: "0 18px",
  borderRadius: "var(--radius-pill)",
  border: "none",
  background: "var(--accent)",
  color: "var(--bg-base)",
  fontSize: "var(--text-sm)",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  ...primaryButtonStyle,
  border: "1px solid var(--border)",
  background: "var(--bg-surface)",
  color: "var(--text-primary)",
};
