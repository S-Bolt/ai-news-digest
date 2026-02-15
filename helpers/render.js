import { escapeHtml } from "./utils.js";

export function renderPlainText({ title, generatedAt, sections, watch }) {
  const lines = [];
  lines.push(title);
  lines.push(`Generated: ${generatedAt}`);
  lines.push("");

  for (const sec of sections) {
    lines.push(`## ${sec.section}`);
    for (const it of sec.items) {
      lines.push(`- ${it.headline} - ${it.outlet}. ${it.why} Link: ${it.url}`);
    }
    lines.push("");
  }

  lines.push(`## ${watch.section}`);
  for (const w of watch.items) {
    lines.push(`- ${w.text}${w.url ? ` Link: ${w.url}` : ""}`);
  }
  lines.push("");

  return lines.join("\n");
}

export function renderHtmlEmail({ title, generatedAt, sections, watch }) {
  const sectionHtml = sections
    .map((sec) => {
      const items = sec.items
        .map(
          (it) => `
<li style="margin: 0 0 12px 0; line-height: 1.45;">
  <div style="font-weight: 700; margin-bottom: 2px;">
    ${escapeHtml(it.headline)}
  </div>
  <div style="color:#4b5563; font-size: 13px; margin-bottom: 5px;">
    ${escapeHtml(it.outlet)} - ${escapeHtml(it.why)}
  </div>
  ${
    it.url
      ? `<a href="${escapeHtml(it.url)}" style="color:#2563eb; text-decoration:none;">Read -></a>`
      : `<span style="color:#9ca3af;">(no link)</span>`
  }
</li>`,
        )
        .join("");

      return `
<h2 style="font-size: 16px; margin: 20px 0 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
  ${escapeHtml(sec.section)}
</h2>
<ul style="margin: 0; padding-left: 18px;">
  ${items}
</ul>`;
    })
    .join("");

  const watchHtml = watch.items
    .map(
      (w) => `
<li style="margin: 0 0 10px 0; line-height: 1.45;">
  ${escapeHtml(w.text)}
  ${
    w.url
      ? ` <a href="${escapeHtml(w.url)}" style="color:#2563eb; text-decoration:none;">Link -></a>`
      : ""
  }
</li>`,
    )
    .join("");

  return `
<div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; background:#f3f4f6; padding: 22px;">
  <div style="max-width: 760px; margin: 0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius: 14px; overflow: hidden;">
    <div style="padding: 18px 20px; background:#111827; color:#ffffff;">
      <div style="font-size: 18px; font-weight: 800;">${escapeHtml(title)}</div>
      <div style="font-size: 12px; opacity: .85; margin-top: 4px;">Generated: ${escapeHtml(
        generatedAt,
      )}</div>
    </div>

    <div style="padding: 18px 20px;">
      ${sectionHtml}

      <h2 style="font-size: 16px; margin: 24px 0 10px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb;">
        ${escapeHtml(watch.section)}
      </h2>
      <ul style="margin: 0; padding-left: 18px;">
        ${watchHtml}
      </ul>

      <div style="margin-top: 18px; font-size: 12px; color:#6b7280;">
        Built by Sam's daily digest bot. If a section feels noisy, trim its item count.
      </div>
    </div>
  </div>
</div>`;
}
