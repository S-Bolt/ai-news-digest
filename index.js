import "dotenv/config";
import { nowInNY, subjectLine } from "./helpers/utils.js";
import { buildSection, buildWatchList } from "./helpers/digest.js";
import { sendEmail } from "./helpers/email.js";
import { renderHtmlEmail, renderPlainText } from "./helpers/render.js";

async function main() {
  const title = "Daily Intelligence Briefing";
  const generatedAt = nowInNY();

  // Tune these however you want (this is the whole point of multi-call)
  const sectionSpecs = [
    {
      sectionTitle: "AI",
      itemCount: 5,
      focus:
        "model releases, major lab announcements, notable research papers, safety/security incidents, regulation/policy, benchmarks",
    },
    {
      sectionTitle: "Agentic",
      itemCount: 4,
      focus:
        "agents, agent frameworks, tool-use, orchestration (LangGraph/LangChain), evals, workflows, RAG improvements, MCP",
    },
    {
      sectionTitle: "Technology",
      itemCount: 4,
      focus:
        "cloud/infra, chips/compute, major product launches, outages, funding/M&A with developer impact, big platform changes",
    },
    {
      sectionTitle: "Coding & Tooling",
      itemCount: 4,
      focus:
        "JavaScript/TypeScript, React/Next, Node, Prisma, Vite, bundlers, ESLint, GitHub releases, IDE/editor tooling",
    },
  ];

  // Run sections in parallel for speed
  const sections = await Promise.all(sectionSpecs.map(buildSection));
  const watch = await buildWatchList();

  const plain = renderPlainText({ title, generatedAt, sections, watch });
  const html = renderHtmlEmail({ title, generatedAt, sections, watch });

  await sendEmail({
    subject: subjectLine(),
    text: plain,
    html,
  });

  console.log("Sent:", subjectLine());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
