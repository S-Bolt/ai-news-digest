import "dotenv/config";
import OpenAI from "openai";
import nodemailer from "nodemailer";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
console.log("hi");

// 1) Get AI news digest (agent uses web_search tool)
async function buildDigest() {
  const instructions = `
Every run: search the web for today's most important AI news from the last 24 hours.
Return 5-10 bullets with: headline, outlet, why it matters, and link.
Include a 3-bullet "What to watch next" section.
Prefer primary sources (company blogs, arXiv, major outlets).
Be concise. No fluff.
`;

  const input = `
Date: ${new Date().toISOString()}
Topic: AI news (last 24 hours). Focus on model releases, major research, policy/regulation, big product launches, security incidents, and notable funding/M&A.
`;

  const response = await client.responses.create({
    model: "gpt-5",
    instructions,
    input,
    tools: [{ type: "web_search" }], // built-in web search tool
  });

  return response.output_text;
}

// 2) Email it
async function sendEmail({ subject, text }) {
  const port = Number(process.env.SMTP_PORT || 587);
  const secure = process.env.SMTP_SECURE
    ? process.env.SMTP_SECURE.toLowerCase() === "true"
    : port === 465;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject,
    text,
  });
}

async function main() {
  const digest = await buildDigest();
  const subject = `AI News Digest - ${new Date().toLocaleDateString("en-US")}`;

  await sendEmail({ subject, text: digest });
  console.log("Sent:", subject);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
