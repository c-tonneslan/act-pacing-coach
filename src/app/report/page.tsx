"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  byTopic,
  difficultyBands,
  perQuestion,
  recommendations,
  timeBuckets,
  type PerQuestion,
} from "@/lib/analytics";
import { loadSession, type SessionResult } from "@/lib/session";

export default function ReportPage() {
  const [result, setResult] = useState<SessionResult | null>(null);

  useEffect(() => {
    setResult(loadSession());
  }, []);

  if (result === null) {
    return (
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center gap-4 px-4 py-12 text-center">
        <p className="text-lg">No session yet.</p>
        <Link
          href="/practice"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Start a practice session
        </Link>
      </main>
    );
  }

  const rows = perQuestion(result);
  const bands = difficultyBands(rows);
  const buckets = timeBuckets(rows);
  const topics = byTopic(rows);
  const tips = recommendations(rows);

  const total = rows.length;
  const correct = rows.filter((r) => r.correct).length;
  const answered = rows.filter((r) => r.answered).length;
  const totalSeconds = Math.round(result.totalMs / 1000);
  const mm = Math.floor(totalSeconds / 60);
  const ss = totalSeconds % 60;

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-8 sm:py-12">
      <header className="flex items-baseline justify-between">
        <h1 className="text-2xl font-semibold">Session report</h1>
        <Link
          href="/practice"
          className="rounded-md bg-black px-3 py-1.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Run another session
        </Link>
      </header>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Stat label="Score" value={`${correct}/${total}`} />
        <Stat
          label="Accuracy"
          value={`${Math.round((correct / total) * 100)}%`}
        />
        <Stat label="Time" value={`${mm}:${String(ss).padStart(2, "0")}`} />
        <Stat label="Answered" value={`${answered}/${total}`} />
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Coach notes
        </h2>
        <ul className="flex flex-col gap-2">
          {tips.map((t, i) => (
            <li
              key={i}
              className="rounded-lg border border-zinc-200 bg-white p-3 text-sm leading-relaxed dark:border-zinc-800 dark:bg-zinc-950"
            >
              {t}
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Time per question
        </h2>
        <PaceChart rows={rows} />
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Difficulty bands
          </h2>
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="pb-1 font-normal">Band</th>
                <th className="pb-1 font-normal">Correct</th>
                <th className="pb-1 font-normal">Avg time</th>
              </tr>
            </thead>
            <tbody>
              {bands.map((b) => (
                <tr key={b.band} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="py-1.5">{b.band}</td>
                  <td className="py-1.5">
                    {b.correct}/{b.count}
                  </td>
                  <td className="py-1.5">{b.avgSeconds.toFixed(0)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
            Accuracy by time spent
          </h2>
          <table className="w-full text-sm">
            <thead className="text-left text-zinc-500">
              <tr>
                <th className="pb-1 font-normal">Bucket</th>
                <th className="pb-1 font-normal">Count</th>
                <th className="pb-1 font-normal">Correct</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.label} className="border-t border-zinc-200 dark:border-zinc-800">
                  <td className="py-1.5">{b.label}</td>
                  <td className="py-1.5">{b.count}</td>
                  <td className="py-1.5">{b.correct}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          By topic
        </h2>
        <table className="w-full text-sm">
          <thead className="text-left text-zinc-500">
            <tr>
              <th className="pb-1 font-normal">Topic</th>
              <th className="pb-1 font-normal">Correct</th>
              <th className="pb-1 font-normal">Avg time</th>
            </tr>
          </thead>
          <tbody>
            {topics.map((t) => (
              <tr key={t.topic} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="py-1.5">{t.topic.replaceAll("-", " ")}</td>
                <td className="py-1.5">
                  {t.correct}/{t.count}
                </td>
                <td className="py-1.5">{t.avgSeconds.toFixed(0)}s</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-zinc-500">
          Question-by-question
        </h2>
        <div className="flex flex-col gap-2">
          {rows.map((r) => (
            <QuestionRow key={r.q.id} row={r} />
          ))}
        </div>
      </section>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-xs uppercase tracking-wider text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tabular-nums">{value}</div>
    </div>
  );
}

function PaceChart({ rows }: { rows: PerQuestion[] }) {
  const max = Math.max(...rows.map((r) => Math.max(r.seconds, r.q.targetSeconds)));
  return (
    <div className="flex h-40 items-end gap-1">
      {rows.map((r) => {
        const h = Math.max(2, (r.seconds / max) * 100);
        const target = (r.q.targetSeconds / max) * 100;
        const color = !r.answered
          ? "bg-zinc-300 dark:bg-zinc-700"
          : r.correct
            ? "bg-emerald-500"
            : "bg-rose-500";
        return (
          <div
            key={r.q.id}
            className="relative flex-1"
            style={{ height: "100%" }}
            title={`Q${r.q.id}: ${r.seconds.toFixed(0)}s (target ${r.q.targetSeconds}s) · ${
              r.answered ? (r.correct ? "correct" : "wrong") : "skipped"
            }`}
          >
            <div className={`absolute bottom-0 w-full ${color}`} style={{ height: `${h}%` }} />
            <div
              className="absolute w-full border-t border-dashed border-zinc-500"
              style={{ bottom: `${target}%` }}
            />
          </div>
        );
      })}
    </div>
  );
}

function QuestionRow({ row }: { row: PerQuestion }) {
  const status = !row.answered
    ? { text: "skipped", color: "text-zinc-500" }
    : row.correct
      ? { text: "correct", color: "text-emerald-600 dark:text-emerald-400" }
      : { text: "wrong", color: "text-rose-600 dark:text-rose-400" };
  const paceLabel =
    row.paceRatio > 1.2
      ? `${row.paceRatio.toFixed(1)}x target`
      : row.paceRatio < 0.5 && row.answered
        ? `${row.paceRatio.toFixed(1)}x target (rushed?)`
        : `${row.paceRatio.toFixed(1)}x target`;
  return (
    <details className="rounded-lg border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950">
      <summary className="flex cursor-pointer items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-zinc-500">Q{row.q.id}</span>
          <span className={`font-medium ${status.color}`}>{status.text}</span>
          <span className="text-zinc-500">
            {row.seconds.toFixed(0)}s · {paceLabel}
          </span>
        </div>
        <span className="text-xs text-zinc-500">
          {row.q.topic.replaceAll("-", " ")} · D{row.q.difficulty}
        </span>
      </summary>
      <div className="mt-3 space-y-2 text-sm">
        <p>{row.q.prompt}</p>
        <p>
          <span className="text-zinc-500">Correct:</span>{" "}
          {String.fromCharCode(65 + row.q.correctIndex)}.{" "}
          {row.q.choices[row.q.correctIndex]}
        </p>
        {row.answered && row.a.selected !== row.q.correctIndex && (
          <p>
            <span className="text-zinc-500">You picked:</span>{" "}
            {String.fromCharCode(65 + row.a.selected!)}.{" "}
            {row.q.choices[row.a.selected!]}
          </p>
        )}
        <p className="text-zinc-600 dark:text-zinc-400">{row.q.explanation}</p>
      </div>
    </details>
  );
}
