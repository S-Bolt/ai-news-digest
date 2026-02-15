import OpenAI from "openai";
import { safeJsonParse } from "./utils.js";

let cachedClient;

function getDefaultClient() {
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return cachedClient;
}

export async function buildSection(
  { sectionTitle, focus, itemCount },
  { responsesClient } = {},
) {
  const instructions = `
Return ONLY valid JSON. No markdown. No commentary.

Schema:
{
  "section": "${sectionTitle}",
  "items": [
    { "headline": "string", "outlet": "string", "why": "string", "url": "https://..." }
  ]
}

Rules:
- Use web search for the last 24 hours.
- Prefer primary sources (company blogs, arXiv, GitHub releases, official docs) and major outlets.
- Avoid low-quality SEO blogs and rehashed summaries.
- Ensure urls are real and directly relevant.
- Return EXACTLY ${itemCount} items.
- Keep "why" to 1-2 sentences, focused on impact.
`;

  const input = `
Section: ${sectionTitle}
Focus: ${focus}
Time window: last 24 hours
`;

  const client = responsesClient || getDefaultClient();
  const resp = await client.responses.create({
    model: "gpt-5",
    instructions,
    input,
    tools: [{ type: "web_search" }],
  });

  const json = safeJsonParse(resp.output_text || "");
  if (!json?.items || !Array.isArray(json.items)) {
    throw new Error(`Invalid JSON shape for section: ${sectionTitle}`);
  }

  return {
    section: json.section || sectionTitle,
    items: json.items.slice(0, itemCount).map((it) => ({
      headline: it.headline || "",
      outlet: it.outlet || "",
      why: it.why || "",
      url: it.url || "",
    })),
  };
}

export async function buildWatchList({ responsesClient } = {}) {
  const instructions = `
Return ONLY valid JSON.

Schema:
{
  "section": "What to watch next",
  "items": [
    { "text": "string", "url": "https://..." | "" }
  ]
}

Rules:
- Use web search if needed.
- Exactly 3 items.
- Each "text" is a single sentence describing a forward-looking signal.
- url can be "" if not applicable.
`;

  const client = responsesClient || getDefaultClient();
  const resp = await client.responses.create({
    model: "gpt-5",
    instructions,
    input: "Generate the watch list for AI/agentic/tech/dev tooling.",
    tools: [{ type: "web_search" }],
  });

  const json = safeJsonParse(resp.output_text || "");
  if (!json?.items || !Array.isArray(json.items)) {
    throw new Error("Invalid JSON shape for watch list.");
  }

  return {
    section: "What to watch next",
    items: json.items.slice(0, 3).map((it) => ({
      text: it.text || "",
      url: it.url || "",
    })),
  };
}
