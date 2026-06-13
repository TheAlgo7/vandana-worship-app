/**
 * Renders a Sacred Noir lyric/verse card to a canvas and shares it via the
 * native share sheet (Web Share API with files). Falls back to downloading
 * the PNG where file sharing isn't supported (e.g. desktop browsers).
 *
 * Built for the WhatsApp-forward culture of the Indian church — entirely
 * client-side, no external services.
 */

export interface ShareCardOptions {
  /** Main text lines (lyric section or verse). */
  lines: string[];
  /** Bold gold line at the bottom (song title / verse reference). */
  title: string;
  /** Muted line under the title (artist). */
  subtitle?: string;
  /** Use the Devanagari font for the main text. */
  isDevanagari?: boolean;
  /** Filename for the download fallback (without extension). */
  filename?: string;
}

export type ShareCardResult = "shared" | "downloaded" | "cancelled" | "failed";

const WIDTH = 1080;
const HEIGHT = 1350;
const MARGIN = 96;
const MAX_TEXT_WIDTH = WIDTH - MARGIN * 2;
const MAX_WRAPPED_LINES = 14;

function resolveFontFamily(cssVar: string, fallback: string): string {
  try {
    const probe = document.createElement("span");
    probe.style.fontFamily = `var(${cssVar})`;
    probe.style.position = "absolute";
    probe.style.visibility = "hidden";
    document.body.appendChild(probe);
    const family = getComputedStyle(probe).fontFamily;
    probe.remove();
    return family || fallback;
  } catch {
    return fallback;
  }
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  lines: string[],
  maxWidth: number,
): string[] {
  const wrapped: string[] = [];
  for (const line of lines) {
    const words = line.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      wrapped.push("");
      continue;
    }
    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth || !current) {
        current = candidate;
      } else {
        wrapped.push(current);
        current = word;
      }
    }
    if (current) wrapped.push(current);
  }
  return wrapped;
}

function drawStar(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(cx, cy - r);
  ctx.lineTo(cx + r * 0.19, cy - r * 0.19);
  ctx.lineTo(cx + r, cy);
  ctx.lineTo(cx + r * 0.19, cy + r * 0.19);
  ctx.lineTo(cx, cy + r);
  ctx.lineTo(cx - r * 0.19, cy + r * 0.19);
  ctx.lineTo(cx - r, cy);
  ctx.lineTo(cx - r * 0.19, cy - r * 0.19);
  ctx.closePath();
  ctx.strokeStyle = "rgba(196, 170, 126, 0.8)";
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.restore();
}

export async function shareCard(options: ShareCardOptions): Promise<ShareCardResult> {
  try {
    await document.fonts.ready;

    const displayFamily = resolveFontFamily("--font-display", "Georgia, serif");
    const bodyFamily = resolveFontFamily("--font-body", "system-ui, sans-serif");
    const devanagariFamily = resolveFontFamily("--font-devanagari", "sans-serif");
    const textFamily = options.isDevanagari ? devanagariFamily : displayFamily;

    const canvas = document.createElement("canvas");
    canvas.width = WIDTH;
    canvas.height = HEIGHT;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "failed";

    // ── Background ──
    ctx.fillStyle = "#0A0A0E";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Soft gold glow behind the text
    const glow = ctx.createRadialGradient(WIDTH / 2, HEIGHT * 0.42, 80, WIDTH / 2, HEIGHT * 0.42, 640);
    glow.addColorStop(0, "rgba(196, 170, 126, 0.07)");
    glow.addColorStop(1, "rgba(196, 170, 126, 0)");
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Thin inner border
    ctx.strokeStyle = "rgba(196, 170, 126, 0.30)";
    ctx.lineWidth = 2;
    ctx.strokeRect(44, 44, WIDTH - 88, HEIGHT - 88);

    // ── Star flourish ──
    drawStar(ctx, WIDTH / 2, 168, 26);

    // ── Main text (adaptive size) ──
    const source = options.lines.slice(0, 10);
    let fontSize = 56;
    let wrapped: string[] = [];
    for (const size of [56, 50, 44, 38, 32]) {
      fontSize = size;
      const style = options.isDevanagari ? "" : "italic ";
      ctx.font = `${style}${size}px ${textFamily}`;
      wrapped = wrapLines(ctx, source, MAX_TEXT_WIDTH);
      if (wrapped.length <= MAX_WRAPPED_LINES) break;
    }
    if (wrapped.length > MAX_WRAPPED_LINES) wrapped = wrapped.slice(0, MAX_WRAPPED_LINES);

    const lineHeight = fontSize * (options.isDevanagari ? 1.95 : 1.65);
    const textBlockHeight = wrapped.length * lineHeight;
    const textTop = Math.max(250, (HEIGHT - 240 - textBlockHeight) / 2 + 60);

    ctx.fillStyle = "#ECEAE4";
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";
    wrapped.forEach((line, i) => {
      ctx.fillText(line, WIDTH / 2, textTop + i * lineHeight);
    });

    // ── Footer: title, subtitle, site ──
    ctx.font = `600 40px ${options.isDevanagari ? devanagariFamily : displayFamily}`;
    ctx.fillStyle = "#C4AA7E";
    ctx.fillText(options.title, WIDTH / 2, HEIGHT - 200);

    if (options.subtitle) {
      ctx.font = `30px ${bodyFamily}`;
      ctx.fillStyle = "#87849A";
      ctx.fillText(options.subtitle, WIDTH / 2, HEIGHT - 150);
    }

    ctx.font = `26px ${bodyFamily}`;
    ctx.fillStyle = "rgba(133, 130, 148, 0.85)";
    ctx.fillText("vandanaapp.vercel.app", WIDTH / 2, HEIGHT - 84);

    // ── Export ──
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/png"),
    );
    if (!blob) return "failed";

    const filename = `${(options.filename ?? "vandana-card").replace(/[^a-z0-9-]+/gi, "-")}.png`;
    const file = new File([blob], filename, { type: "image/png" });

    if (typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: options.title });
        return "shared";
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return "cancelled";
        // fall through to download
      }
    }

    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return "downloaded";
  } catch {
    return "failed";
  }
}
