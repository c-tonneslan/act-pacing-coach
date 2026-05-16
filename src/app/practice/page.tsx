"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { questions as bank } from "@/data/questions";
import { saveSession, type Attempt } from "@/lib/session";

// Half-session target. Real ACT math is 60 questions in 60 minutes (1 min/q
// average). 20 questions ramped to match, target 20 minutes.
const SESSION_SECONDS = 20 * 60;

interface AttemptState {
  selected: number | null;
  msSpent: number;
  skipped: boolean;
}

export default function PracticePage() {
  const router = useRouter();
  const startedAt = useRef(Date.now());
  const questionEnteredAt = useRef(Date.now());

  const [index, setIndex] = useState(0);
  const [attempts, setAttempts] = useState<AttemptState[]>(() =>
    bank.map(() => ({ selected: null, msSpent: 0, skipped: false })),
  );
  const [secondsLeft, setSecondsLeft] = useState(SESSION_SECONDS);

  // Session-wide countdown.
  useEffect(() => {
    const t = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(t);
          finish();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reset the per-question timer marker whenever the active question changes.
  useEffect(() => {
    questionEnteredAt.current = Date.now();
  }, [index]);

  const current = bank[index];
  const state = attempts[index];

  const skipQueue = useMemo(
    () =>
      attempts
        .map((a, i) => ({ a, i }))
        .filter(({ a }) => a.skipped && a.selected === null)
        .map(({ i }) => i),
    [attempts],
  );

  function recordTime() {
    const now = Date.now();
    const delta = now - questionEnteredAt.current;
    questionEnteredAt.current = now;
    setAttempts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], msSpent: next[index].msSpent + delta };
      return next;
    });
    return delta;
  }

  function chooseAnswer(choice: number) {
    setAttempts((prev) => {
      const next = [...prev];
      next[index] = {
        ...next[index],
        selected: choice,
        skipped: false,
      };
      return next;
    });
  }

  function goNext() {
    recordTime();
    if (index < bank.length - 1) {
      setIndex(index + 1);
    } else if (skipQueue.length > 0) {
      // Jump to the first skipped question for review.
      const first = skipQueue.find((i) => i !== index);
      if (first !== undefined) setIndex(first);
    } else {
      finish();
    }
  }

  function goPrev() {
    if (index === 0) return;
    recordTime();
    setIndex(index - 1);
  }

  function markSkip() {
    recordTime();
    setAttempts((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], skipped: true, selected: null };
      return next;
    });
    if (index < bank.length - 1) {
      setIndex(index + 1);
    } else {
      const first = skipQueue.find((i) => i !== index);
      if (first !== undefined) setIndex(first);
      else finish();
    }
  }

  function finish() {
    // Final time stamp for the current question.
    const now = Date.now();
    const delta = now - questionEnteredAt.current;
    const finalAttempts: Attempt[] = attempts.map((a, i) => ({
      questionId: bank[i].id,
      selected: a.selected,
      msSpent: a.msSpent + (i === index ? delta : 0),
      skipped: a.skipped,
    }));
    saveSession({
      startedAt: startedAt.current,
      finishedAt: now,
      totalMs: now - startedAt.current,
      attempts: finalAttempts,
      questions: bank,
    });
    router.push("/report");
  }

  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, "0");
  const ss = String(secondsLeft % 60).padStart(2, "0");

  const answeredCount = attempts.filter((a) => a.selected !== null).length;

  return (
    <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-4 py-8 sm:py-12">
      <header className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-500">
            Question {index + 1} of {bank.length}
          </div>
          <div className="text-sm text-zinc-600 dark:text-zinc-400">
            {current.topic.replaceAll("-", " ")} · difficulty{" "}
            {current.difficulty} · target {current.targetSeconds}s
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl tabular-nums">
            {mm}:{ss}
          </div>
          <div className="text-xs text-zinc-500">
            {answeredCount}/{bank.length} answered
          </div>
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-lg leading-relaxed">{current.prompt}</p>
        <div className="mt-6 flex flex-col gap-2">
          {current.choices.map((choice, i) => {
            const selected = state.selected === i;
            return (
              <button
                key={i}
                onClick={() => chooseAnswer(i)}
                className={`flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition ${
                  selected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-zinc-200 bg-white hover:border-zinc-400 dark:border-zinc-800 dark:bg-zinc-950 dark:hover:border-zinc-600"
                }`}
              >
                <span className="font-mono text-sm text-zinc-500">
                  {String.fromCharCode(65 + i)}.
                </span>
                <span>{choice}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="rounded-md border border-zinc-300 px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40 dark:border-zinc-700"
        >
          Back
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={markSkip}
            className="rounded-md border border-zinc-300 px-4 py-2 text-sm dark:border-zinc-700"
          >
            Skip for now
          </button>
          {index === bank.length - 1 && skipQueue.length === 0 ? (
            <button
              onClick={finish}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              Finish
            </button>
          ) : (
            <button
              onClick={goNext}
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
            >
              {index === bank.length - 1 ? "Review skipped" : "Next"}
            </button>
          )}
        </div>
      </div>

      {skipQueue.length > 0 && (
        <div className="text-sm text-zinc-500">
          Skipped: {skipQueue.map((i) => `Q${i + 1}`).join(", ")}
        </div>
      )}
    </main>
  );
}
