import type { Difficulty, Question } from "@/data/types";

// 20-question half-session distribution. Mirrors the ACT math ramp: easy at
// the front, hardest at the back. Sum is 20.
const DIST: Record<Difficulty, number> = {
  1: 3,
  2: 3,
  3: 4,
  4: 4,
  5: 4,
  6: 2,
};

function shuffle<T>(arr: T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Sample a 20-question session from the bank, respecting the ramp. Falls back
// to taking the whole pool of a difficulty if the bank is small.
export function sampleSession(bank: Question[]): Question[] {
  const out: Question[] = [];
  for (const dStr of Object.keys(DIST)) {
    const d = Number(dStr) as Difficulty;
    const pool = shuffle(bank.filter((q) => q.difficulty === d));
    out.push(...pool.slice(0, DIST[d]));
  }
  return out.sort((a, b) => a.difficulty - b.difficulty);
}
