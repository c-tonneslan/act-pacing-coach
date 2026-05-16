import Anthropic from "@anthropic-ai/sdk";
import { writeFileSync, mkdirSync, existsSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import {
  fewShotBlock,
  generationUserPrompt,
  SYSTEM_PROMPT,
  VALIDATOR_PROMPT,
} from "./prompts";
import { GenerationSchema, type GeneratedQuestion } from "./schema";
import { seed } from "../src/data/seed";
import type { Difficulty, Topic } from "../src/data/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const GEN_MODEL = "claude-sonnet-4-6";
const VAL_MODEL = "claude-haiku-4-5-20251001";

const client = new Anthropic();

const TOPICS: Topic[] = [
  "pre-algebra",
  "elementary-algebra",
  "intermediate-algebra",
  "coordinate-geometry",
  "plane-geometry",
  "trigonometry",
];

// Target counts per (topic, difficulty). Tuned so the final bank can support
// many distinct ramped sessions, with more breadth in the middle bands where
// the ACT has the most questions.
const TARGETS: Record<Topic, Partial<Record<Difficulty, number>>> = {
  "pre-algebra": { 1: 4, 2: 3 },
  "elementary-algebra": { 2: 3, 3: 3, 4: 2 },
  "intermediate-algebra": { 4: 3, 5: 4, 6: 2 },
  "coordinate-geometry": { 3: 2, 4: 3, 5: 3, 6: 2 },
  "plane-geometry": { 3: 2, 4: 3, 5: 2 },
  trigonometry: { 5: 3, 6: 3 },
};

function pickExamples(topic: Topic, difficulty: Difficulty, n = 3) {
  // Prefer same topic + same difficulty, fall back to same difficulty band.
  const exact = seed.filter((q) => q.topic === topic && q.difficulty === difficulty);
  if (exact.length >= n) return exact.slice(0, n);
  const sameDiff = seed.filter((q) => q.difficulty === difficulty);
  const pool = [...exact, ...sameDiff.filter((q) => !exact.includes(q))];
  if (pool.length >= n) return pool.slice(0, n);
  // Last resort: any seed question of similar difficulty range.
  return [
    ...pool,
    ...seed
      .filter((q) => Math.abs(q.difficulty - difficulty) <= 1 && !pool.includes(q))
      .slice(0, n - pool.length),
  ];
}

async function generate(topic: Topic, difficulty: Difficulty, count: number) {
  const examples = pickExamples(topic, difficulty);
  const resp = await client.messages.create({
    model: GEN_MODEL,
    max_tokens: 4000,
    system: [
      { type: "text", text: SYSTEM_PROMPT, cache_control: { type: "ephemeral" } },
      { type: "text", text: fewShotBlock(examples), cache_control: { type: "ephemeral" } },
    ],
    messages: [
      { role: "user", content: generationUserPrompt(topic, difficulty, count) },
    ],
  });
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const jsonStart = text.indexOf("{");
  const jsonEnd = text.lastIndexOf("}");
  if (jsonStart === -1 || jsonEnd === -1) {
    throw new Error(`No JSON in response for ${topic}/D${difficulty}`);
  }
  const parsed = GenerationSchema.parse(JSON.parse(text.slice(jsonStart, jsonEnd + 1)));
  // Force matching difficulty + topic so the model can't drift.
  return parsed.questions.map((q) => ({ ...q, topic, difficulty }));
}

async function validateOne(q: GeneratedQuestion): Promise<boolean> {
  const resp = await client.messages.create({
    model: VAL_MODEL,
    max_tokens: 600,
    messages: [{ role: "user", content: VALIDATOR_PROMPT(q.prompt, q.choices) }],
  });
  const text = resp.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { text: string }).text)
    .join("");
  const m = text.match(/ANSWER:\s*([A-E])/i);
  if (!m) return false;
  const letter = m[1].toUpperCase();
  const idx = letter.charCodeAt(0) - "A".charCodeAt(0);
  return idx === q.correctIndex;
}

interface AcceptedQuestion extends GeneratedQuestion {
  topic: Topic;
  difficulty: Difficulty;
}

function isDuplicate(q: GeneratedQuestion, existing: GeneratedQuestion[]): boolean {
  // Light dedupe by exact prompt match. The bank is small enough.
  const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();
  const target = norm(q.prompt);
  if (seed.some((s) => norm(s.prompt) === target)) return true;
  return existing.some((e) => norm(e.prompt) === target);
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY not set");
    process.exit(1);
  }

  const outPath = resolve(ROOT, "src/data/generated.ts");
  const accepted: AcceptedQuestion[] = [];

  for (const topic of TOPICS) {
    const buckets = TARGETS[topic];
    for (const dStr of Object.keys(buckets)) {
      const difficulty = Number(dStr) as Difficulty;
      const need = buckets[difficulty]!;
      // Ask for 50% extra to absorb validation rejections.
      const askFor = Math.ceil(need * 1.5);
      console.log(`generating ${topic} D${difficulty}: need ${need}, asking for ${askFor}`);
      let candidates: GeneratedQuestion[];
      try {
        candidates = await generate(topic, difficulty, askFor);
      } catch (e) {
        console.error(`  generation failed: ${(e as Error).message}`);
        continue;
      }
      let acceptedThisBucket = 0;
      for (const q of candidates) {
        if (acceptedThisBucket >= need) break;
        if (isDuplicate(q, accepted)) {
          console.log("  skip duplicate");
          continue;
        }
        const ok = await validateOne(q);
        if (ok) {
          accepted.push(q as AcceptedQuestion);
          acceptedThisBucket++;
          console.log(`  accepted (${acceptedThisBucket}/${need})`);
        } else {
          console.log("  rejected by validator");
        }
      }
      // Checkpoint after each bucket so a midway crash leaves partial output.
      writeOutput(outPath, accepted);
    }
  }

  console.log(`\nDone. ${accepted.length} questions accepted.`);
}

function writeOutput(outPath: string, accepted: GeneratedQuestion[]) {
  if (!existsSync(dirname(outPath))) mkdirSync(dirname(outPath), { recursive: true });
  const header = `import type { Question } from "./types";\n\n// Generator output. Written by scripts/grow-bank.ts. Do not edit by hand.\nexport const generated: Omit<Question, "source" | "id">[] = `;
  const body = JSON.stringify(accepted, null, 2);
  writeFileSync(outPath, header + body + ";\n");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
