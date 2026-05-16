import type { Question } from "@/data/questions";
import type { Attempt, SessionResult } from "./session";

export interface PerQuestion {
  q: Question;
  a: Attempt;
  seconds: number;
  correct: boolean;
  answered: boolean;
  // Ratio of actual time to target. >1 means slow, <1 means ahead of pace.
  paceRatio: number;
}

export function perQuestion(result: SessionResult): PerQuestion[] {
  return result.questions.map((q) => {
    const a = result.attempts.find((x) => x.questionId === q.id)!;
    const seconds = a.msSpent / 1000;
    const answered = a.selected !== null;
    const correct = answered && a.selected === q.correctIndex;
    return {
      q,
      a,
      seconds,
      correct,
      answered,
      paceRatio: seconds / q.targetSeconds,
    };
  });
}

export interface BandStats {
  band: string;
  count: number;
  correct: number;
  avgSeconds: number;
}

// Bucket questions by difficulty so the report can show accuracy by ramp position.
export function difficultyBands(rows: PerQuestion[]): BandStats[] {
  const bands: { name: string; match: (d: number) => boolean }[] = [
    { name: "Easy (D1-2)", match: (d) => d <= 2 },
    { name: "Medium (D3-4)", match: (d) => d === 3 || d === 4 },
    { name: "Hard (D5-6)", match: (d) => d >= 5 },
  ];
  return bands.map(({ name, match }) => {
    const subset = rows.filter((r) => match(r.q.difficulty));
    const correct = subset.filter((r) => r.correct).length;
    const avgSeconds =
      subset.length === 0
        ? 0
        : subset.reduce((s, r) => s + r.seconds, 0) / subset.length;
    return { band: name, count: subset.length, correct, avgSeconds };
  });
}

export interface TimeBucket {
  label: string;
  count: number;
  correct: number;
}

// Bucket questions by how much time the user spent on them.
// Shows the classic "spent too long on one I still got wrong" pattern.
export function timeBuckets(rows: PerQuestion[]): TimeBucket[] {
  const buckets: { label: string; max: number }[] = [
    { label: "< 30s", max: 30 },
    { label: "30-60s", max: 60 },
    { label: "60-120s", max: 120 },
    { label: "120s+", max: Infinity },
  ];
  return buckets.map(({ label, max }, i) => {
    const prevMax = i === 0 ? 0 : buckets[i - 1].max;
    const subset = rows.filter((r) => r.seconds > prevMax && r.seconds <= max);
    const correct = subset.filter((r) => r.correct).length;
    return { label, count: subset.length, correct };
  });
}

export interface TopicStats {
  topic: string;
  count: number;
  correct: number;
  avgSeconds: number;
}

export function byTopic(rows: PerQuestion[]): TopicStats[] {
  const topics = new Map<string, PerQuestion[]>();
  for (const r of rows) {
    const list = topics.get(r.q.topic) ?? [];
    list.push(r);
    topics.set(r.q.topic, list);
  }
  return Array.from(topics.entries())
    .map(([topic, list]) => ({
      topic,
      count: list.length,
      correct: list.filter((r) => r.correct).length,
      avgSeconds: list.reduce((s, r) => s + r.seconds, 0) / list.length,
    }))
    .sort((a, b) => b.count - a.count);
}

// One-line takeaways the coach should surface to the student.
export function recommendations(rows: PerQuestion[]): string[] {
  const tips: string[] = [];

  const wrong = rows.filter((r) => r.answered && !r.correct);
  const slowAndWrong = wrong.filter((r) => r.paceRatio > 1.2);
  if (slowAndWrong.length >= 2) {
    const ids = slowAndWrong.map((r) => r.q.id).join(", ");
    tips.push(
      `You spent extra time on ${slowAndWrong.length} questions and still missed them (Q${ids}). When a problem feels stuck after 1.5x its pace target, mark and move on.`,
    );
  }

  const skipped = rows.filter((r) => !r.answered);
  if (skipped.length > 0) {
    tips.push(
      `${skipped.length} question${skipped.length === 1 ? "" : "s"} left blank. On the real test, guess on everything — there's no wrong-answer penalty.`,
    );
  }

  const easy = rows.filter((r) => r.q.difficulty <= 2);
  const easyCorrect = easy.filter((r) => r.correct).length;
  if (easy.length > 0 && easyCorrect / easy.length < 0.9) {
    tips.push(
      `Missed ${easy.length - easyCorrect} of ${easy.length} easy questions. The first third of the section is where you bank points — slow down by 5-10 seconds and double-check.`,
    );
  }

  const hard = rows.filter((r) => r.q.difficulty >= 5);
  const hardFast = hard.filter((r) => r.paceRatio < 0.5);
  if (hardFast.length >= 2) {
    tips.push(
      `Moved through ${hardFast.length} hard questions in under half their target time. If you're not stuck, double-check — hard problems usually have a tempting trap answer.`,
    );
  }

  const totalSeconds = rows.reduce((s, r) => s + r.seconds, 0);
  const targetTotal = rows.reduce((s, r) => s + r.q.targetSeconds, 0);
  if (totalSeconds > targetTotal * 1.1) {
    tips.push(
      `Total session ran ${Math.round((totalSeconds / targetTotal - 1) * 100)}% over pace. On a real 60-question section, that's the difference between finishing and running out of time on the last 5 questions.`,
    );
  }

  if (tips.length === 0) {
    tips.push("Solid pacing across the session. Keep this rhythm.");
  }

  return tips;
}
