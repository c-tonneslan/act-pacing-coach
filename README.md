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

Next.js 16 (App Router), TypeScript, Tailwind v4. Question bank is a
plain TS file in `src/data/questions.ts`. Analytics and recommendations
are pure functions in `src/lib/analytics.ts`, so it's easy to extend
with new sections (English, Reading, Science) or hook up a real eval
later.

## What's missing

- Only math. ACT has four sections, this covers one.
- 20 questions, not 60. Half-session.
- No persistence across browsers. Single-user, local-only.
- Question bank is hand-written, not pulled from a real test. Anyone
  using this for serious prep should also work through actual past
  ACT released tests.
