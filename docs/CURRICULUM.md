# Delineare curriculum, version 2

The app reads one file: `src/data/curriculum.json`. It is generated; do not edit it by hand.

## What changed from version 1, and why

Version 1 had 125 modules in 10 phases. Read in phase order, the first module that taught drawing from imagination came after hundreds of hours, about 30 modules overlapped, anatomy was one 30 to 80 hour block, Drawabox-based modules ran out of Drawabox's own order, and many checks needed another person or a streak. The structure audit (`curriculum/research/01-curriculum-structure.md`) proposed a restructure, the owner approved it, and version 2 implements it from `curriculum/research/proposal.py`.

- 96 modules in 10 display phases. 57 v1 modules fold into 25 merged modules, 3 are split (drawing objects from imagination, figures from imagination, anatomy), and 3 are new (`baseline-imagination-check`, `organic-forms-contours`, `simple-3d-blockout`). Every v1 module id appears in some module's `from`.
- Phases are display groups. Each module belongs to one of three strands (`construct`, `observe`, `invent`) so the app can rotate strands instead of marching through phases.
- An essential spine of 47 modules, about 251 to 517 gate hours, plus about 75 to 190 hours of ongoing practice (box challenge, gesture ladder, memory redraws, invention play) stored separately in `ongoing_hours`.
- Drawing from imagination starts on day one (the baseline set, repeated at every benchmark) and gets structured modules early: invented objects in phase 3, mannequin figures from imagination in phase 5.
- Every module now has typed practice items (minutes, kind, timer, reference), a 3 to 10 minute revisit task, and `done_when` items classified as judgement, measured or process. Checks that needed another person or a streak were rewritten as solo, photo-based checks.
- 19 modules carry original lesson notes (see the honesty rules for when).
- Resources: link fixes and cost corrections from research pass 02, 8 new Drawabox entries, and 20 new gap resources from pass 03; 351 resources in all, 83 unverified.
- Benchmarks are remapped to the new phases, a benchmark after phase 8 is added, and each includes the baseline imagination set. Weekly templates for 3, 6 and 10 hours put about two thirds of the time on the current modules and review and one third on invention tied to them, with Tuesday and Thursday kept for short optional sessions.

## How to rebuild

From the repository root:

    python3 curriculum/build_v2.py

Standard library only. The build reads `curriculum/v1/curriculum.json`, `curriculum/research/02-resource-verification.json` and `03-gap-resources.json`, and the authored content in `curriculum/v2/`, and writes `src/data/curriculum.json`. Same inputs give the same bytes.

Authored content in `curriculum/v2/`:

- `plan.json`: the module plan ported from `proposal.py` (ids, titles, phases, strands, tiers, tracks, spine, ongoing, hours, prerequisites, `from`, and `lesson_reason` for merged modules that need notes). This is the source of truth for structure.
- `modules/p01.json` to `p10.json`: one entry per module. Merged, split and new modules carry their full text. One-to-one modules carry only what changes. Items can point at v1 text with references like `@found-warmups.p0` (v1 module, then `o`, `p`, `d` or `m` for outcome, practice, done_when or mistake, then a 0-based index). `practice_meta` sets minutes, kind, timer and reference per v1 practice item; `revisit` holds the revisit task.
- `lessons/<module id>.md`: lesson notes, one `## Heading` per section.
- `structure.json`: strands, phase titles and summaries, the short session, meta text and known gaps.
- `resources.json`: hand patches to resources and library entries, the list of timed pose sources, URL patterns that must never be linked, and notes for attached research resources.
- `benchmarks.json`, `weekly_templates.json`.

## How to validate

    python3 curriculum/validate.py

It exits non-zero and lists every problem. It checks: every prerequisite exists, the graph is acyclic, no prerequisite sits in a later phase, spine modules depend only on spine modules, every rid resolves, every v1 module is in some `from`, every module has practice, done_when and a revisit whose checks point at non-process items, lessons exist exactly where required (3 to 5 sections, 250 to 600 words), practice references are well formed (pose-site only for timed pose sources, sites are library titles or resource ids, URLs only from v1 or the research JSON), nothing is marked verified without an opened check, no banned links, no em or en dashes, curly quotes, exclamation marks or emoji in authored text, benchmarks include the imagination set, weekly templates add up and keep the split, and meta counts match. It also checks that the output stays under 1.5 MB.

## Honesty rules (labels)

- `verified` is true only where the first research pass opened the page. Nothing in version 2 sets it to true; research pass 02 set one entry back to false.
- `evidence` on every resource: `opened` (a pass opened the page; cost and contents may still be only partly confirmed, so read `free_notes`), `search-result` (seen only in search summaries on 2026-10-13), `unchecked` (no pass could confirm it).
- `link_status` keeps the v1 values and adds `unchecked` for addresses never link-checked (new entries and addresses fixed from search results). `link_note` says what changed.
- `cost` is `free`, `free-tier` or `paid`. Drawabox lessons are `free`, with official critique noted as paid. Proko single-lesson entries labelled part free carry a note that the label is unresolved.
- `free_coverage` says how well free material covers a module. A lesson is written for every new module, every module with thin coverage, and every merged module whose free material does not cover all it absorbs (the reason is in `plan.json`). Elsewhere `lesson` is null and the linked material carries the module.
- Lessons are original notes in our own words, not copied or closely paraphrased. They make no left-brain or right-brain claims, and the upside-down copy is kept only as a looking game.
- Hours are estimates. Tolerances in checks (1 cm on A4, ratios within 10 percent, and similar) were written for this curriculum; they are not a published standard.
- Links the research says not to use are never included: the Internet Archive Bargue uploads, Loomis, Nicolaides, and Harold Speed (in copyright in Australia until 2028).

## Judgement calls

1. Where the audit report and `proposal.py` disagree, `proposal.py` wins. Gate hours come from its ONGOING and TRIM tables. Four ongoing modules (life drawing routine, master copies, nature journaling, location sketching) have no ongoing-hours figure in `proposal.py`, so `ongoing_hours` is null for them and `est_hours` keeps the proposal's figure.
2. Strands are not in `proposal.py`; I assigned them using the audit's three strands (form and perspective; observation, figure and head; invention and design). Light on form, cast shadows and techniques went to `construct`; value, edges, materials and colour to `observe`.
3. Split modules repeat their v1 source in `from` (for example `persp-imagination` in both invention modules), as `proposal.py` does. `obs-sight-size-and-checks` sits in both `check-your-drawing` and the atelier module.
4. The report says photo-versus-life and food still life also feed the rendered still life; `proposal.py` maps them only to `obs-still-life-from-life`. I kept the mapping and added the food "surface swap" exercise to `light-still-life-render` as the tonal stage.
5. Lessons: 19 in total (3 new modules, 11 thin modules besides the new baseline, and 5 merged modules). `obs-seeing-and-contour` gets notes because its free material frames the exercises with hemisphere language; the others fill real coverage gaps. `figures-from-imagination-1` has strong free coverage, so it has no lesson.
6. `found-ellipses` moves from thin to partial coverage because the Proko ellipse lesson, opened and free in the first pass, is now its core. Its check accepts ellipses drawn in one pass or drawn through two or three times, because Drawabox's instruction could not be confirmed.
7. Blender: every Blender exercise now points at the app's own tools (`light`, `form`, `mannequin`, `grid`). Blender stays in the `simple-3d-blockout` module and as one optional mention in `persp-construct-primitives` (Boolean cuts, which the form viewer cannot show). Some texts assume tool features from research pass 04 (posterise, zone labels, a shadow construction overlay, ellipse axes, a long focal length, printable curvilinear grids); edit the text if the app ships less.
8. `reference.site` holds a library entry's `title` or a resource id, and `pose-site` is used only for timed pose sources (Line of Action, Quickposes, SketchDaily, Posemaniacs, Proko Timer packs, NMA daily sessions). PoseMyArt is a posable 3D tool, so it is not a pose site. Library entries keep the v1 shape.
9. The NMA Friday session (r170) was relabelled paid, pointed at the current course page, set to `verified: false` and demoted to supplementary, since research found the free session gone.
10. Of the 03 gap resources, the Commons parent category, the Part III plate and the still-life chapter landing page were not attached because they duplicate entries already linked. Research notes that described the research process ("reassignment only") were rewritten as user-facing notes.
11. The phase 7 benchmark keeps its building facade task, although buildings now live in phase 8, because the instructions were to keep the checks. The colour benchmark's Krita repeat is now "if you work digitally", since digital work is optional.
12. Weekly templates count module, review, gesture and long sessions as current-module time and invention sessions as invention; each plan lands at 65 to 67 percent and 33 to 35 percent.
13. `done_when` kinds: `process` for counts the log can compute, `measured` for checks decided by a ruler, overlay, greyscale photo, count or timer, `judgement` for the rest. Revisits only point at judgement or measured items.
14. Master copies gate at 12 copies (v1 asked for 20); the rest continues as ongoing practice.
15. Practice items that repeated across merged modules were dropped (blind contour of the hand appeared three times, ellipse tables twice, overlay checks three times). 594 practice items remain of 655.
16. List items (outcomes, checks, mistakes) lose their trailing full stop so v1 and v2 text look alike. The v1 module fields `group` and `level` are not in the version 2 schema and are dropped.
