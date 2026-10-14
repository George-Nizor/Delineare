# Brief for finishing Delineare lessons

Lessons 4 to 34 are written and released, but the owner wants them finished, with nothing left
thin. For each lesson you own, do the four jobs below. Read `docs/rebuild/AGENT-BRIEF.md` first;
everything in it still applies. Work only in your own lesson folders, your own
`content/references/<your file>.yaml`, `content/resources/<your file>.yaml` and
`public/reference/<lesson folder>/`. Do not run git.

Lessons 1 to 3 are the standard: look at their `lesson.md`, `practice.yaml` and `diagrams/` before
you start.

## 1. Diagrams

Every lesson gets diagrams like lessons 1 to 3:

- an **example** right after the introduction (`![what it shows](example)`), showing a finished
  page or the result the lesson is aiming for;
- one diagram for **each step** where a picture helps, normally three or more per lesson;
- a **wrong-and-right pair** in Common mistake (see `01-confident-lines/diagrams/mistake.mjs`).

Each is a script in `diagrams/<name>.mjs` that returns SVG from `content/diagrams/lib.mjs`
helpers (line, path, smooth, ellipse, handEllipse, wobblyLine, arcArrow, arrowhead, dot, rect,
text, tag, group). Use the theme classes only: `d-ink` for the drawing, `d-guide` for construction
lines, `d-mark` for what to notice, `d-bad` for the wrong version, `d-paper` for the page. Put any
helper you need inside your own file; do not edit `lib.mjs`. Build shapes from real geometry: a
box in perspective converges to real vanishing points, an ellipse on a cylinder sits square to its
axis, a figure's proportions match the lesson's numbers. Labels are short and lower case, as in
lesson 1 ("turn the page", "missed: leave it").

Look at every diagram you make. Render a lesson with
`LD_LIBRARY_PATH=/tmp/claude-1000/-workspace-dev-projects-master--PersonalProjects-Instrumenta/54c3a000-a42b-4363-95b0-474b4d41f231/scratchpad/libs/usr/lib/x86_64-linux-gnu node scripts/diagram-sheet.mjs <lesson folder>`
and open `test-results/diagrams-light-<lesson folder>.png` and `...dark...png` with the Read tool.
Fix anything that is wrong, cramped, unclear or ugly. A diagram that teaches nothing is worse than
none: cut it.

Image lines need alt text that says what the diagram shows, as in lesson 1.

## 2. Reference pictures

An exercise that asks the learner to draw from a photo or a drawing must show one in the app. Check
every `practice.yaml` item you own. Where it says "a photo of", "photos of people", "a horse",
"a face", "a master drawing", or anything the learner would otherwise have to go and find, supply
the pictures:

```yaml
reference:
  prompt: "Optional line shown above the picture"
  images: [06-gesture/franco-sketches.jpg, 06-gesture/muybridge-walking.jpg]
timer:
  rounds:
    - { label: "Four poses at 30 seconds", seconds: 120, pose: 30 }   # pose: seconds per picture
```

- Files go in `public/reference/<lesson folder>/`, JPEG, longest side at most 1200 px, under
  250 KB each (resize with Python's PIL).
- Every file gets an entry in your `content/references/<your file>.yaml`:
  `{ file, credit, alt, source, licence }`. `credit` is "Artist, Title, date". `source` is the https
  page you took it from. `licence` is `public domain` or `CC0`.
- Only public-domain or CC0 pictures. Good sources: Art Institute of Chicago API
  (`https://api.artic.edu/api/v1/artworks/search?q=...&query[term][is_public_domain]=true&fields=id,title,artist_title,date_display,image_id`,
  images at `https://www.artic.edu/iiif/2/<image_id>/full/843,/0/default.jpg`; use curl `-g`),
  the Met Open Access API (`collectionapi.metmuseum.org`, `isPublicDomain: true`), National Gallery
  of Art open access, Rijksmuseum, and Wikimedia Commons files marked public domain (Muybridge's
  Animal Locomotion plates, for example).
- Pose sessions need enough different pictures for the whole session (count the poses). Prefer
  clothed figures. No pictures of real people taken recently.
- Look at every picture you keep. It must clearly show what the exercise needs.
- An exercise that uses something on the learner's desk, their own hand or a lamp setup does not
  need pictures. Leave those as prompts.

## 3. Sources for every method, number and check

Go through each lesson and practice item. Every method, measurement and check must come from a
source you opened, named in `sources:` and credited in the text. Exercise lengths and how many
drawings to do are the course's own and need no source.

- If a step, number or check came from your own judgement or only from a video's title or
  description, find a written source that teaches it (a teacher's page, an open textbook, a
  public-domain drawing manual on Project Gutenberg or the Internet Archive: Loomis, Bridgman,
  Ruskin, Speed's "The Practice and Science of Drawing", Vanderpoel, Norton's "Freehand
  Perspective"), or rewrite the item so it says only what your sources support.
- Do not delete a lesson's substance to dodge the rule; find the source.
- Update `sources:` with every page you used, its URL and "read 2026-10-14".

## 4. Humanizer

Run the `humanizer` skill (`~/.claude/skills/humanizer/SKILL.md`) over each lesson's prose and
practice text, then `stop-slop`. Apply what they find. Then reread every heading, title and step
title on its own: if one sounds like an advert or a slogan, rewrite it.

## Checking your work

`node scripts/build-content.mjs --check` must report nothing for your folders and files (ignore
other people's folders while they work). When you finish, report in a few lines: diagrams added per
lesson, pictures added and where from, and any source you replaced.
