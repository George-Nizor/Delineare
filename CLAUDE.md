# Delineare: project rules

A learn-to-draw app in the Instrumenta suite: a 34-lesson course with a practice library beside it.
Before changing anything, read `docs/rebuild/PLAN.md` (the product), `docs/rebuild/COURSE.md` (the
lessons) and `docs/rebuild/WRITING.md` (how every word is written). `docs/rebuild/research/` holds
the reports the plan rests on; `docs/rebuild/sources/` holds verified source notes for lessons.

## Shape

- React 19, TypeScript, Vite; Dexie (IndexedDB, database `delineare-2`) for everything stored. No
  server, no account. Hash routes in `src/router.ts`.
- Content lives in `content/` as files a person can read: `course.yaml` (every lesson's title and
  summary), `lessons/NN-slug/lesson.md` plus `practice.yaml` and `diagrams/*.mjs`, `resources.yaml` plus
  `resources/*.yaml`, and `prompts.yaml`. `scripts/build-content.mjs` validates all of it and writes
  `public/content.json`; it refuses anything that breaks the lesson format, a word budget or the
  copy rules.
- Diagrams are scripts that return SVG from real geometry, using `content/diagrams/lib.mjs`. Colours
  are CSS classes (`d-ink`, `d-guide`, `d-mark`, `d-bad`, `d-paper`), so they follow the theme.
- Scheduling rules are pure functions in `src/engine/` with tests in `tests/`.
- Served by the Instrumenta launcher under a strict content policy: scripts from self only, images
  from self and three museum hosts, frames only from `www.youtube-nocookie.com` (lesson videos,
  loaded as credentialless frames). Adding a host means changing Instrumenta's
  `electron/static-server.cjs` too. No inline scripts in `index.html`.
- Links use `target="_blank"`; the launcher opens them in the system browser.

## Hard rules

- Writing follows `docs/rebuild/WRITING.md`. Run the `humanizer` skill on every lesson draft.
  `npm run lint:copy` must pass.
- Every method, number and check in a lesson comes from a source a learner can open, named in the
  lesson's front matter `sources:` and credited in the lesson text. Never invent one.
- Only link a resource someone has opened and that teaches the lesson. Show it as one line. Never
  show research labels ("unverified", "estimate", "thin coverage") in the app.
- No AI-generated images. Figure examples come from public-domain plates and open-access museum
  drawings, credited.
- Reference images and anywhere tone is judged sit on neutral grey, in both themes.
- No streaks, badges, levels, scores or praise. Nothing is ever shown as overdue or missed.
- The lesson format (title, introduction, Steps, Common mistake, Checking your page) was agreed by
  the owner on 2026-10-14, after the design review; all 34 lessons use it. Lessons 4 to 34 have no
  diagrams yet.
- Lesson writers follow `docs/rebuild/AGENT-BRIEF.md`.

## Done means

`npm run lint:copy`, `npm test` and `npm run build` pass, and the build passes Instrumenta's audit
(`node -e "require('../Instrumenta/electron/static-server.cjs').auditWebBuild('dist','delineare')"`).
`npm run e2e` passes (it serves the build through Instrumenta's static server and drives the whole
flow), and someone has looked at its screenshots in `test-results/e2e/` at 1440 and 390 px, light
and dark. Say plainly what was not checked.
