# act-pacing-coach

The ACT math section is 60 questions in 60 minutes. Most kids who blow it
don't blow it because they didn't know the math, they blow it because they
sat on question 38 for four minutes and ran out of clock. Pacing is the
real skill. Khan Academy doesn't teach it, and most online practice tools
don't even time you per question.

This is a small Next.js app I built while tutoring. It runs a 20-question
half-session that ramps from easy to hard the way the real test does,
times every question individually, and gives you a report afterward that
says where you actually bled minutes.

## What you get back

- Per-question timing with a pace target for each one (easier questions
  should clock 30s, the hard trig stuff at the end gets 90-120s)
- Accuracy buckets: how often you got questions right when you spent
  under 30s, 30-60s, 60-120s, 120s+
- Difficulty band breakdown so you can see if the wheels come off in
  the back half of the section
- Topic breakdown across the six ACT math strands (pre-algebra,
  elementary algebra, intermediate algebra, coordinate geometry, plane
  geometry, trig)
- Coach notes pulled from your data ("you spent 2.1x on Q14 and still
  got it wrong, mark and move next time")
- Skip queue. Skip a question, finish the rest, come back to it. Same
  way most test-prep coaches teach you to attack the section.

## Running it

```
npm install
npm run dev
```

Then `http://localhost:3000`. State lives in `sessionStorage`, so the
report survives a refresh but not a new tab. No backend.

## Why I built it

I scored a 34 on the ACT and tutor high schoolers on the side. Every
student I've worked with has the same problem: they can do the math,
they just can't do it fast enough. Existing tools either don't time
anything or only show you total section time, which doesn't help you
find the question that ate your clock. This one does.

## Stack

Next.js 16 (App Router), TypeScript, Tailwind v4. Question bank lives
in two files: `src/data/seed.ts` is the hand-written reference set,
`src/data/generated.ts` is the LLM-generated extension (written by
the pipeline below, not edited by hand). `src/data/questions.ts`
merges them and stamps a `source` field. Analytics and recommendations
are pure functions in `src/lib/analytics.ts`, so it's easy to extend
with new sections (English, Reading, Science) or hook up a real eval
later.

## Growing the question bank

Real ACT questions are copyrighted and ACT, Inc. is aggressive about
reproductions, so the bank is grown the legal way: Claude generates
new questions from a few-shot prompt seeded with the hand-written
reference set, then a second Claude call (cheap model) independently
re-solves each candidate and rejects ones where its answer disagrees
with the marked correct choice.

```
export ANTHROPIC_API_KEY=...
npm run grow
```

That runs `scripts/grow-bank.ts`, which:

1. Walks `TARGETS` (topic + difficulty bucket counts in the script)
2. For each bucket, calls Sonnet with a few-shot prompt drawn from
   the seed bank to generate `1.5 * needed` candidates (the 50%
   slack absorbs validator rejections)
3. Validates each candidate with Haiku, accepting only ones where
   the validator's independent answer matches the marked one
4. Dedupes against seed + already-accepted prompts
5. Writes accepted entries to `src/data/generated.ts` after each
   bucket so a midway crash leaves usable partial output

Generation uses prompt caching on the system prompt and the
few-shot block, so the cost is mostly the per-question output
tokens.

## What's missing

- Only math. ACT has four sections, this covers one.
- Per-session is a 20-question half-session, not the full 60.
- No persistence across browsers. Single-user, local-only.
- Generated questions are LLM-written. Anyone using this for serious
  prep should also work through real past ACT tests (the free
  "Preparing for the ACT" PDFs on act.org are the right place to
  start).
