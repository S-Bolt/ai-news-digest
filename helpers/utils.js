export function escapeHtml(s = "") {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export function nowInNY() {
  return new Date().toLocaleString("en-US", { timeZone: "America/New_York" });
}

export function dateInNY() {
  return new Date().toLocaleDateString("en-US", {
    timeZone: "America/New_York",
  });
}

export function subjectLine() {
  return `Daily Intelligence Briefing - ${dateInNY()}`;
}

// Robust-ish JSON extraction if the model ever wraps it in text.
export function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const firstBrace = text.indexOf("{");
    const lastBrace = text.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      const maybeJson = text.slice(firstBrace, lastBrace + 1);
      return JSON.parse(maybeJson);
    }
    throw new Error("Model did not return valid JSON.");
  }
}
