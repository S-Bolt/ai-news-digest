import OpenAI from "openai";
import { safeJsonParse } from "./utils.js";

let cachedClient;

function getDefaultClient() {
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return cachedClient;
}

function extractUsage(response) {
  const usage = response?.usage || {};
  const outputDetails = usage?.output_tokens_details || {};
  return {
    inputTokens: usage.input_tokens ?? null,
    outputTokens: usage.output_tokens ?? null,
    totalTokens: usage.total_tokens ?? null,
    reasoningTokens: outputDetails.reasoning_tokens ?? null,
  };
}

function normalizeSection(items, itemCount) {
  if (!Array.isArray(items)) {
    return [];
  }
  return items.slice(0, itemCount).map((it) => ({
    headline: it?.headline || "",
    outlet: it?.outlet || "",
    why: it?.why || "",
    url: it?.url || "",
  }));
}

export async function buildDigest(
  { sectionSpecs, watchItemCount = 3 },
  { responsesClient, model = "gpt-5" } = {},
) {
  if (!Array.isArray(sectionSpecs) || sectionSpecs.length === 0) {
    throw new Error("sectionSpecs is required and must be a non-empty array.");
  }

  const sectionSchema = sectionSpecs
    .map(
      (spec) => `
    {
      "section": "${spec.sectionTitle}",
      "items": [
        { "headline": "string", "outlet": "string", "why": "string", "url": "https://..." }
      ]
    }`,
    )
    .join(",");

  const instructions = `
Return ONLY valid JSON. No markdown. No commentary.

Schema:
{
  "sections": [${sectionSchema}
  ],
  "watch": {
    "section": "What to watch next",
    "items": [
      { "text": "string", "url": "https://..." | "" }
    ]
  }
}

Rules:
- Use web search for the last 24 hours.
- Prefer primary sources (company blogs, arXiv, GitHub releases, official docs) and major outlets.
- Avoid low-quality SEO blogs and rehashed summaries.
- Ensure urls are real and directly relevant.
- Return EXACTLY the requested itemCount for each section.
- Keep "why" to 1-2 sentences, focused on impact.
- Return sections in the same order as requested.
- Watch list must contain EXACTLY ${watchItemCount} items.
- Each watch item must be one sentence and forward-looking.
`;

  const sectionInput = sectionSpecs
    .map(
      (spec, idx) =>
        `${idx + 1}. sectionTitle="${spec.sectionTitle}" | itemCount=${spec.itemCount} | focus="${spec.focus}"`,
    )
    .join("\n");

  const input = `
Date: ${new Date().toISOString()}
Time window: last 24 hours
Sections:
${sectionInput}
`;

  const client = responsesClient || getDefaultClient();
  const response = await client.responses.create({
    model,
    instructions,
    input,
    tools: [{ type: "web_search" }],
  });

  const json = safeJsonParse(response.output_text || "");
  if (!Array.isArray(json?.sections) || !json?.watch) {
    throw new Error("Invalid JSON shape for digest.");
  }

  const sections = sectionSpecs.map((spec) => {
    const section = json.sections.find((s) => s?.section === spec.sectionTitle);
    return {
      section: spec.sectionTitle,
      items: normalizeSection(section?.items, spec.itemCount),
    };
  });

  const watchItems = Array.isArray(json.watch.items)
    ? json.watch.items.slice(0, watchItemCount).map((it) => ({
        text: it?.text || "",
        url: it?.url || "",
      }))
    : [];

  return {
    sections,
    watch: {
      section: json.watch.section || "What to watch next",
      items: watchItems,
    },
    usage: extractUsage(response),
    responseId: response.id || null,
    modelUsed: response.model || model,
  };
}
