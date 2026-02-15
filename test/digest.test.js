import test from "node:test";
import assert from "node:assert/strict";
import { buildSection, buildWatchList } from "../helpers/digest.js";

function makeClientReturning(outputText) {
  return {
    responses: {
      create: async () => ({ output_text: outputText }),
    },
  };
}

test("buildSection normalizes and truncates items", async () => {
  const fakeClient = makeClientReturning(
    JSON.stringify({
      section: "AI",
      items: [
        { headline: "h1", outlet: "o1", why: "w1", url: "u1" },
        { headline: "h2" },
        { headline: "h3", outlet: "o3", why: "w3", url: "u3" },
      ],
    }),
  );

  const result = await buildSection(
    { sectionTitle: "AI", focus: "focus", itemCount: 2 },
    { responsesClient: fakeClient },
  );

  assert.equal(result.section, "AI");
  assert.equal(result.items.length, 2);
  assert.deepEqual(result.items[1], {
    headline: "h2",
    outlet: "",
    why: "",
    url: "",
  });
});

test("buildSection throws for invalid JSON shape", async () => {
  const fakeClient = makeClientReturning(JSON.stringify({ nope: true }));

  await assert.rejects(
    buildSection(
      { sectionTitle: "AI", focus: "focus", itemCount: 2 },
      { responsesClient: fakeClient },
    ),
    /Invalid JSON shape for section: AI/,
  );
});

test("buildWatchList normalizes and truncates items", async () => {
  const fakeClient = makeClientReturning(
    JSON.stringify({
      items: [
        { text: "one", url: "u1" },
        { text: "two" },
        { text: "three", url: "u3" },
        { text: "four", url: "u4" },
      ],
    }),
  );

  const result = await buildWatchList({ responsesClient: fakeClient });
  assert.equal(result.section, "What to watch next");
  assert.equal(result.items.length, 3);
  assert.deepEqual(result.items[1], { text: "two", url: "" });
});
