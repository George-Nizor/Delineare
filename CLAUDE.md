# Delineare: project rules

A learn-to-draw web app in the Instrumenta suite. Read `README.md`, then `docs/CURRICULUM.md`, then
`docs/PRODUCT_AND_UX.md` (the original brief; the design direction chosen later is "Plate book",
recorded in Instrumenta's `docs/suite/decisions.md`).

## Shape

- React 19, TypeScript, Vite; Dexie (IndexedDB) for everything stored. No server, no account.
- `src/engine/plan.ts` holds the scheduling rules as pure functions with tests in `tests/`. Keep rules
  there, not in components.
- `public/curriculum.json` is copied from `src/data/curriculum.json` at build. The launcher's audit
  requires it in the build, with vendored fonts.
- Served by the Instrumenta launcher under a strict CSP: scripts from self only, images and searches
  only from the three museum hosts in `src/references/museums.ts`. Adding a host means changing
  Instrumenta's `electron/static-server.cjs` too. No inline scripts in `index.html`.
- Links to lessons use `target="_blank"`; the launcher opens them in the system browser.

## Hard rules

- The curriculum is data. Change it through `curriculum/` (build, then validate), never by hand in
  the JSON, and never invent resources, URLs, prices, hours or school facts.
- Never state that a resource is free, verified or live unless the data says so. Keep the labels
  (free, part free, unverified, link problem, thin coverage) visible wherever a resource appears.
- Credit the owner on every resource and every reference image. Do not copy, mirror or scrape
  lessons, images or videos. Reference images only from sources whose licence allows display, with
  the credit shown.
- Delineare's own lessons are written in our own words and say so on the page.
- Reference images and anywhere tone is judged sit on neutral grey, in both themes.
- No streaks, badges, levels, scores or praise copy. A missed session is dropped, never stacked.
- UI copy: plain, specific, sentence case, straight quotes, no em or en dashes, no emoji, no
  marketing language.

## Done means

Type-check, tests and build pass, and the build passes Instrumenta's audit
(`node -e "require('../Instrumenta/electron/static-server.cjs').auditWebBuild('dist','delineare')"`).
Click through Today, a session, a chapter and the contents at 1440 and 390 px, light and dark, once
with the keyboard only, and say plainly what was not checked.
