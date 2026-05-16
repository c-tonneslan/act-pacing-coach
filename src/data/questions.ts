import type { Question } from "./types";
import { seed } from "./seed";
import { generated } from "./generated";

// Stamp source on the seed entries.
const seedTagged: Question[] = seed.map((q) => ({ ...q, source: "seed" }));

// Generated entries don't carry IDs in their data file; assign them here so
// IDs stay stable as the bank grows.
const generatedTagged: Question[] = generated.map((q, i) => ({
  ...q,
  id: 1000 + i,
  source: "generated",
}));

export const questions: Question[] = [...seedTagged, ...generatedTagged];

export type { Question, Topic, Difficulty } from "./types";
