export type Topic =
  | "pre-algebra"
  | "elementary-algebra"
  | "intermediate-algebra"
  | "coordinate-geometry"
  | "plane-geometry"
  | "trigonometry";

export const TOPICS: Topic[] = [
  "pre-algebra",
  "elementary-algebra",
  "intermediate-algebra",
  "coordinate-geometry",
  "plane-geometry",
  "trigonometry",
];

export type Difficulty = 1 | 2 | 3 | 4 | 5 | 6;

export const DIFFICULTIES: Difficulty[] = [1, 2, 3, 4, 5, 6];

// Pace target in seconds per difficulty band.
export const PACE_TARGET: Record<Difficulty, number> = {
  1: 30,
  2: 40,
  3: 50,
  4: 70,
  5: 90,
  6: 120,
};

export interface Question {
  id: number;
  prompt: string;
  choices: string[];
  correctIndex: number;
  difficulty: Difficulty;
  topic: Topic;
  targetSeconds: number;
  explanation: string;
  // Where this question came from. Hand-written seed, or LLM-generated +
  // validated. Surfaced in the report so the student knows the source.
  source: "seed" | "generated";
}
