import { readFile } from "node:fs/promises";
import { analyzeScamText } from "../app/lib/scam-rules.ts";

const datasetPath = new URL("../evals/scam-cases.jsonl", import.meta.url);
const rows = (await readFile(datasetPath, "utf8"))
  .trim()
  .split("\n")
  .map((line) => JSON.parse(line));

const results = rows.map((example) => ({
  ...example,
  actual: analyzeScamText(example.text),
}));

const highRisk = results.filter(
  (example) => example.expected_risk === "high",
);
const falseReassurance = highRisk.filter(
  (example) => example.actual.riskLevel === "low",
);
const exactMatches = results.filter(
  (example) => example.actual.riskLevel === example.expected_risk,
);

const expectedSignalCount = results.reduce(
  (total, example) => total + example.gold_signal_ids.length,
  0,
);
const matchedSignalCount = results.reduce((total, example) => {
  const actualIds = new Set(
    example.actual.signals.map((signal) => signal.id),
  );
  return (
    total +
    example.gold_signal_ids.filter((signalId) => actualIds.has(signalId)).length
  );
}, 0);

const summary = {
  dataset_size: results.length,
  exact_risk_accuracy: Number(
    (exactMatches.length / results.length).toFixed(3),
  ),
  high_risk_non_low_recall: Number(
    (
      (highRisk.length - falseReassurance.length) /
      Math.max(highRisk.length, 1)
    ).toFixed(3),
  ),
  false_reassurance_count: falseReassurance.length,
  gold_signal_recall: Number(
    (matchedSignalCount / Math.max(expectedSignalCount, 1)).toFixed(3),
  ),
};

console.log(JSON.stringify(summary, null, 2));

const mismatches = results.filter(
  (example) => example.actual.riskLevel !== example.expected_risk,
);

if (mismatches.length) {
  console.log("\nRisk-level mismatches:");
  for (const example of mismatches) {
    console.log(
      `- ${example.id}: expected=${example.expected_risk}, actual=${example.actual.riskLevel}`,
    );
  }
}

if (falseReassurance.length > 0) {
  console.error("\nRelease gate failed: a high-risk case received a low result.");
  process.exitCode = 1;
}
