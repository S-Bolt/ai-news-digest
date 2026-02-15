import test from "node:test";
import assert from "node:assert/strict";
import { renderPlainText, renderHtmlEmail } from "../helpers/render.js";

const fixture = {
  title: "Daily Intelligence Briefing",
  generatedAt: "2/15/2026, 9:00:00 AM",
  sections: [
    {
      section: "AI",
      items: [
        {
          headline: `<b>Headline</b>`,
          outlet: "Outlet",
          why: `Reason with "quotes" & symbols`,
          url: "https://example.com/ai",
        },
      ],
    },
  ],
  watch: {
    section: "What to watch next",
    items: [{ text: `<script>alert("x")</script>`, url: "" }],
  },
};

test("renderPlainText includes sections and links", () => {
  const text = renderPlainText(fixture);
  assert.match(text, /## AI/);
  assert.match(text, /Link: https:\/\/example\.com\/ai/);
  assert.match(text, /## What to watch next/);
});

test("renderHtmlEmail escapes user-provided content", () => {
  const html = renderHtmlEmail(fixture);
  assert.match(html, /&lt;b&gt;Headline&lt;\/b&gt;/);
  assert.match(html, /&lt;script&gt;alert\(&quot;x&quot;\)&lt;\/script&gt;/);
  assert.doesNotMatch(html, /<script>alert\("x"\)<\/script>/);
});

test("renderHtmlEmail includes article link when url is present", () => {
  const html = renderHtmlEmail(fixture);
  assert.match(html, /href="https:\/\/example\.com\/ai"/);
});
