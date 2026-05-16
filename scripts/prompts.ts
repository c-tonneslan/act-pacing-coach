import type { Difficulty, Question, Topic } from "../src/data/types";

export const SYSTEM_PROMPT = `You are writing original ACT math practice questions for a tutoring app.

CRITICAL RULES:
- Every question must be original. Do not reproduce any real ACT or
  SAT question verbatim or near-verbatim. Vary the numbers, the names,
  the surface story, the angle.
- The math must be unambiguous. Exactly one of the five choices is
  correct. The other four are plausible wrong answers, ideally tied to
  common student mistakes (sign errors, off-by-one, dropping a step,
  picking the right operation on the wrong quantity).
- Match the difficulty rubric:
    D1 (pre-algebra): a single arithmetic step a 7th grader could do.
    D2 (elementary algebra): one-variable linear, percent, mean.
    D3: two-step algebra, basic functions, simple geometry, slope.
    D4: factoring, exponents, distance formula, area of common shapes.
    D5: quadratics, logs, systems, trig SOH-CAH-TOA, circle equations.
    D6: nontrivial trig identities, complex numbers, sequences, hard
        word problems, multi-step coordinate-geometry proofs.
- Pace targets in seconds match difficulty: D1=30, D2=40, D3=50, D4=70,
  D5=90, D6=120.
- Use plain text math. No LaTeX. Superscripts via ^ (x^2), fractions
  via /, square roots as sqrt(x). For pi use the word "pi" or 3.14
  if it matters numerically.
- The explanation field is one or two sentences that show how to
  solve it, the way a tutor would say it out loud.

OUTPUT FORMAT: a single JSON object with key "questions" whose value
is an array. No prose before or after the JSON. Each question:
{
  "prompt": "...",
  "choices": ["A text", "B text", "C text", "D text", "E text"],
  "correctIndex": 0|1|2|3|4,
  "difficulty": 1-6,
  "topic": "pre-algebra"|"elementary-algebra"|"intermediate-algebra"|"coordinate-geometry"|"plane-geometry"|"trigonometry",
  "targetSeconds": 30|40|50|70|90|120,
  "explanation": "..."
}`;

export function fewShotBlock(examples: Omit<Question, "source" | "id">[]): string {
  const sample = examples.map((q) => ({
    prompt: q.prompt,
    choices: q.choices,
    correctIndex: q.correctIndex,
    difficulty: q.difficulty,
    topic: q.topic,
    targetSeconds: q.targetSeconds,
    explanation: q.explanation,
  }));
  return `EXAMPLES (real questions from the hand-written seed bank, follow this style and shape):\n\n${JSON.stringify({ questions: sample }, null, 2)}`;
}

export function generationUserPrompt(
  topic: Topic,
  difficulty: Difficulty,
  count: number,
): string {
  return `Generate ${count} original questions on topic "${topic}" at difficulty ${difficulty}. Vary the surface stories. Return only the JSON object.`;
}

export const VALIDATOR_PROMPT = (prompt: string, choices: string[]): string => `Solve this ACT math problem. Show your work briefly, then on a final line output exactly: ANSWER: X where X is the letter (A-E) of the correct choice.

Problem:
${prompt}

Choices:
${choices.map((c, i) => `${String.fromCharCode(65 + i)}. ${c}`).join("\n")}`;
