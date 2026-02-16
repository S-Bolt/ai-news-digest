import "dotenv/config";
import { nowInNY, subjectLine } from "./helpers/utils.js";
import { buildDigest } from "./helpers/digest.js";
import { sendEmail } from "./helpers/email.js";
import { renderHtmlEmail, renderPlainText } from "./helpers/render.js";

function estimateUsdFromUsage(usage) {
  const inRate = Number(process.env.OPENAI_INPUT_COST_PER_1M || 0);
  const outRate = Number(process.env.OPENAI_OUTPUT_COST_PER_1M || 0);
  if (!inRate && !outRate) {
    return null;
  }

  const inputTokens = usage?.inputTokens || 0;
  const outputTokens = usage?.outputTokens || 0;
  return (inputTokens / 1_000_000) * inRate + (outputTokens / 1_000_000) * outRate;
}

function logUsageTelemetry({ usage, responseId, modelUsed }) {
  const estimatedUsd = estimateUsdFromUsage(usage);
  const payload = {
    responseId,
    model: modelUsed,
    usage,
    estimatedUsd: estimatedUsd == null ? null : Number(estimatedUsd.toFixed(6)),
  };
  console.log("[📊 OpenAI Usage]", JSON.stringify(payload));
}

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
  ];

  const { sections, watch, usage, responseId, modelUsed } = await buildDigest({
    sectionSpecs,
    watchItemCount: 3,
  });
  logUsageTelemetry({ usage, responseId, modelUsed });

  const plain = renderPlainText({ title, generatedAt, sections, watch });
  const html = renderHtmlEmail({ title, generatedAt, sections, watch });

  await sendEmail({
    subject: subjectLine(),
    text: plain,
    html,
  });

  console.log("✅ Sent:", subjectLine());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
