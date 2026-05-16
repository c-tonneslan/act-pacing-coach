import type { Question } from "@/data/questions";

export interface Attempt {
  questionId: number;
  selected: number | null; // null = skipped
  // ms spent on this question across all visits (skips return here)
  msSpent: number;
  // true if the user marked it for review (skip queue)
  skipped: boolean;
}

export interface SessionResult {
  startedAt: number;
  finishedAt: number;
  totalMs: number;
  attempts: Attempt[];
  // Snapshot of the question bank used so the report doesn't rely on
  // the questions file being identical at read time.
  questions: Question[];
}

const KEY = "act-pacing-coach:last-session";

export function saveSession(result: SessionResult) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(KEY, JSON.stringify(result));
}

export function loadSession(): SessionResult | null {
  if (typeof window === "undefined") return null;
  const raw = sessionStorage.getItem(KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionResult;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(KEY);
}
