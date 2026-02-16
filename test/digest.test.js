import test from "node:test";
import assert from "node:assert/strict";
import { buildDigest } from "../helpers/digest.js";

function makeClientReturning(response) {
  return {
    responses: {
      create: async () => response,
    },
  };
}

test("buildDigest normalizes sections/watch and captures usage", async () => {
  const fakeClient = makeClientReturning({
    id: "resp_123",
    model: "gpt-5",
    usage: {
      input_tokens: 1000,
      output_tokens: 250,
      total_tokens: 1250,
      output_tokens_details: { reasoning_tokens: 10 },
    },
    output_text: JSON.stringify({
      sections: [
        {
          section: "AI",
          items: [
            { headline: "h1", outlet: "o1", why: "w1", url: "u1" },
            { headline: "h2" },
            { headline: "h3", outlet: "o3", why: "w3", url: "u3" },
          ],
        },
        {
          section: "Agentic",
          items: [{ headline: "a1", outlet: "ao1", why: "aw1", url: "au1" }],
        },
      ],
      watch: {
        section: "What to watch next",
        items: [
          { text: "w1", url: "wu1" },
          { text: "w2" },
          { text: "w3", url: "wu3" },
          { text: "w4", url: "wu4" },
        ],
      },
    }),
  });

  const sectionSpecs = [
    { sectionTitle: "AI", focus: "focus", itemCount: 2 },
    { sectionTitle: "Agentic", focus: "focus", itemCount: 1 },
  ];
  const result = await buildDigest(
    { sectionSpecs, watchItemCount: 3 },
    { responsesClient: fakeClient },
  );

  assert.equal(result.sections.length, 2);
  assert.equal(result.sections[0].section, "AI");
  assert.equal(result.sections[0].items.length, 2);
  assert.deepEqual(result.sections[0].items[1], {
    headline: "h2",
    outlet: "",
    why: "",
    url: "",
  });

  assert.equal(result.sections[1].section, "Agentic");
  assert.equal(result.sections[1].items.length, 1);

  assert.equal(result.watch.section, "What to watch next");
  assert.equal(result.watch.items.length, 3);
  assert.deepEqual(result.watch.items[1], { text: "w2", url: "" });

  assert.equal(result.responseId, "resp_123");
  assert.equal(result.modelUsed, "gpt-5");
  assert.deepEqual(result.usage, {
    inputTokens: 1000,
    outputTokens: 250,
    totalTokens: 1250,
    reasoningTokens: 10,
  });
});

test("buildDigest throws for invalid JSON shape", async () => {
  const fakeClient = makeClientReturning({
    output_text: JSON.stringify({ nope: true }),
  });

  await assert.rejects(
    buildDigest(
      {
        sectionSpecs: [{ sectionTitle: "AI", focus: "focus", itemCount: 2 }],
      },
      { responsesClient: fakeClient },
    ),
    /Invalid JSON shape for digest/,
  );
});

test("buildDigest validates sectionSpecs", async () => {
  await assert.rejects(
    buildDigest({ sectionSpecs: [] }, { responsesClient: makeClientReturning({}) }),
    /sectionSpecs is required and must be a non-empty array/,
  );
});
