/**
 * Serialize an object for safe embedding inside a <script type="application/ld+json">
 * tag via dangerouslySetInnerHTML.
 *
 * JSON.stringify does NOT escape `<`, `>`, or `&`, so a value containing
 * `</script>` would break out of the script element — a stored-XSS sink if the
 * serialized data is ever attacker-influenced. We escape those three characters
 * to their unicode escapes, which any JSON parser reads identically. (Inside an
 * ld+json block the body is parsed as JSON, so no other escaping is required.)
 */
const JSONLD_UNSAFE: Record<string, string> = {
  "<": "\\u003c",
  ">": "\\u003e",
  "&": "\\u0026",
};

export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/[<>&]/g, (ch) => JSONLD_UNSAFE[ch]);
}
