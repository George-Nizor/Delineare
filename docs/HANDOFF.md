# Handoff

## Goal
Build a proper app for learning to draw anything (characters, scenes, objects, invented things) where the curriculum, the
teaching links and the practice all live in one place. The previous front end was a read-only catalogue page. It was
generated quickly and the user rejected the look and the interaction model. Start the front end again from nothing.

## What exists and can be trusted
`data/curriculum.json` (about 900 KB). Built by eight parallel research passes plus a sequencing pass, merged by
`scripts/merge.py`, link-checked by `scripts/check_links.py` on 2026-10-13.

- 125 modules in 10 phases. Dependency graph is a valid DAG (`prerequisites`), phase order is consistent with it.
- Module fields: id, title, phase, group, level, tier (essential, deepening, stretch, optional), track (core, play,
  optional), ongoing, summary, prerequisites, est_hours [low, high], learning_outcomes, resources [{rid, role, notes}],
  practice, done_when, common_mistakes, school_reference, free_coverage (strong, partial, thin).
- 323 resources (de-duplicated by URL): title, provider, credit, url, format, cost (free, free-tier, paid), free_notes,
  verified, last_checked, link_status (ok, blocked, dead, unreachable, error), link_note.
- 131 providers, 12 school syllabi, 8 phase benchmarks (`check`, `pass_signs`, `after_phase`), 3 weekly templates,
  54 practice-library entries (reference photo banks, museum open-access, timed-reference sites, worksheets, prompt lists,
  software, communities; each has licence and `use_for_phases`), `consensus` (how schools sequence drawing), `meta.known_gaps`.
- Totals: core path about 880 to 2,160 hours; essential tier 237 to 572 hours. Say this plainly in the product. Do not hide it.

## What is not solid
- Drawabox could not be read by the research tools. All its entries are unverified. Check it by hand.
- 54 resources are unverified. 62 links block scripts (says nothing about the page). 4 need a look: a dead NMA page,
  UNAM and RMIT certificate errors, PoseMyArt returning 5xx.
- 20 modules have thin free coverage (cast drawing, charcoal, some traditional media). Hour estimates and benchmark
  tolerances were designed by the research agents, not taken from a school.
- Non-English sources are thin. A second research pass is planned (Drawabox, OpenLearn, charcoal, atelier cast drawing,
  the NMA live session). The pipeline supports re-running it. The earlier run exhausted its search budget.

## Decisions for the user (ask early, one question at a time, with a recommendation)
1. Own written lesson notes. "All knowledge in one place" cannot be met by links alone. Recommendation: for each module
   write short original notes (the idea, the exercise, the mistakes) in our own words, embed official video players
   where the provider offers one, and link out for the full lesson. Never copy their text. This is a lot of content;
   start with phases 1 to 4.
2. Drawing capture. Options: photograph the paper drawing and upload it (recommended, matches how he will draw), a
   built-in canvas for digital practice, or both later. Photo upload plus a "compare to done-when" checklist first.
3. Stack. Recommendation: Vite, React, TypeScript, Dexie (IndexedDB), installable PWA, static hosting or run locally.
   He knows Python and SQL well and TypeScript/React lightly, so keep the code plain and well commented in the places
   that are not obvious. Choose something else if you can justify it in two sentences.

## Suggested build order
1. Data layer: typed loader and validator for `curriculum.json`, a store for progress, drawings, session logs.
2. "Today" screen and the session runner (see PRODUCT_AND_UX.md). This is the product. Build it before the catalogue.
3. Module workspace (lesson page) and the path map.
4. Reference viewer and drills (gesture timer, value study, blind contour, prompt generator).
5. Review loop: done-when self-check, phase benchmarks, spaced revisit of weak modules.
6. Library, plans, sources and gaps screens. Export and import. Link-status refresh script wired into the app data.

## Verify as you go
The Playwright Chromium in this environment is at `/opt/pw-browsers/chromium`. Take screenshots, look at them, fix what is
wrong. The earlier prototype was only checked once and still shipped a clipped caption and wrapping numbers.
