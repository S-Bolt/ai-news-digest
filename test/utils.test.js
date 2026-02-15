import test from "node:test";
import assert from "node:assert/strict";
import { escapeHtml, safeJsonParse, subjectLine } from "../helpers/utils.js";

test("escapeHtml escapes reserved HTML characters", () => {
  const input = `<script>alert("x") & 'y'</script>`;
  const escaped = escapeHtml(input);

  assert.equal(
    escaped,
    "&lt;script&gt;alert(&quot;x&quot;) &amp; &#039;y&#039;&lt;/script&gt;",
  );
});

test("safeJsonParse parses plain JSON", () => {
  const parsed = safeJsonParse('{"ok":true,"count":2}');
  assert.deepEqual(parsed, { ok: true, count: 2 });
});

test("safeJsonParse parses JSON wrapped in extra text", () => {
  const parsed = safeJsonParse('prefix {"name":"sam"} suffix');
  assert.deepEqual(parsed, { name: "sam" });
});

test("safeJsonParse throws on invalid payload", () => {
  assert.throws(
    () => safeJsonParse("not json"),
    /Model did not return valid JSON\./,
  );
});

test("subjectLine uses expected prefix", () => {
  assert.match(subjectLine(), /^Daily Intelligence Briefing - /);
});
