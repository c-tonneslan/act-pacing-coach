import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-center px-6 py-16 sm:py-24">
      <div className="text-xs uppercase tracking-[0.25em] text-zinc-500">
        ACT math · pacing
      </div>
      <h1 className="mt-3 text-4xl font-semibold leading-tight sm:text-5xl">
        The ACT isn&apos;t about what you know. It&apos;s about how fast.
      </h1>
      <p className="mt-5 max-w-xl text-lg text-zinc-600 dark:text-zinc-400">
        Every Khan Academy problem set tracks accuracy. Almost none track
        pacing, which is what actually breaks people on test day. This is a
        20-question half-session that ramps in difficulty like the real thing,
        times every question individually, and tells you where you bled minutes.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link
          href="/practice"
          className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white dark:bg-white dark:text-black"
        >
          Start a session
        </Link>
        <Link
          href="/report"
          className="rounded-md border border-zinc-300 px-5 py-2.5 text-sm dark:border-zinc-700"
        >
          View last report
        </Link>
      </div>

      <section className="mt-16 grid gap-6 sm:grid-cols-3">
        <Card title="Ramped difficulty">
          Questions are ordered easy to hard, same shape as the real ACT math
          section. You&apos;ll see where your accuracy drops off.
        </Card>
        <Card title="Per-question timing">
          Every question has a pace target. The report shows which ones ran 1.5x
          over and whether you still got them right.
        </Card>
        <Card title="Skip queue">
          Skip a problem and it lands in a review pile at the end, the way most
          test-prep coaches teach you to attack the section.
        </Card>
      </section>
    </main>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{children}</p>
    </div>
  );
}
