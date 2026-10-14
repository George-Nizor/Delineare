# Brief for writing Delineare lessons

You are writing lessons for Delineare, a learn-to-draw app. The owner reads every word and has
rejected two drafts for sounding like marketing copy. Plain, clear writing is the whole job.

## Read first

- `content/lessons/01-confident-lines/lesson.md` and `practice.yaml`: the model lesson. The owner
  approved its tone. Match it.
- `docs/rebuild/WRITING.md`: the rules and word budgets.
- `docs/rebuild/COURSE.md`: each lesson's exercise and the resource it leans on.
- `docs/rebuild/sources/videos.md`: YouTube videos already checked (title, channel, embeddable).
- `content/resources.yaml`: the resource format.
- `~/.claude/skills/humanizer/SKILL.md` and `~/.claude/skills/stop-slop/SKILL.md`: apply both to
  every draft before you finish.

## The lesson format (checked by `node scripts/build-content.mjs --check`)

```
content/lessons/NN-slug/lesson.md      NN is the lesson number from course.yaml, slug its slug
content/lessons/NN-slug/practice.yaml  the lesson's exercise (main: true) plus one or two more
```

`lesson.md`:

1. Front matter: `needs` (earlier slugs only), `exercise` (id of the main practice item), `watch`
   (one or two resource ids), `sources` (where every method, number and check comes from, with the
   URL and "read 2026-10-14").
2. `# Title`, exactly as in `course.yaml`.
3. The introduction: one short paragraph, at most 70 words, in the voice of a teacher speaking to
   one student: "Drawing well starts with confident lines. In this lesson you'll learn to...". Say
   what the lesson teaches and why it is useful. Nothing about where it sits in the course.
4. `## Steps`: a numbered list of 3 to 6 steps, each starting with a bold title ("**Plan.**"),
   at most 40 words each. Define a new word in the step that uses it. One short note after the list
   may credit the teacher whose method this is.
5. `## Common mistake` (optional but wanted): the most common mistake, why it happens, what to do
   instead. At most 50 words.
6. `## Checking your page`: one line of introduction, then a numbered list of 3 to 5 things to look
   for, at most 15 words each, then at most one short note.

No diagrams are needed. Do not add image lines. Do not add any other section.

`practice.yaml`: copy the shape from lesson 1. Kinds: drill, warm-up, timed, memory, life,
imagination, location, master-copy, retest. Every item needs `timer`. Non-main items need one to
three `check` lines. `reference: { prompt: "..." }` shows a short text prompt beside the timer;
leave `reference` out when there is nothing to show. Quote any value that has a comma or colon.

Resources: add new ones to your own file `content/resources/<your file>.yaml` (named in your task),
never to `content/resources.yaml`. Format as in `content/resources.yaml`. Only add a resource you
have opened. For a YouTube video, fetch `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=<id>&format=json`
and confirm the title and channel match the lesson's subject; record the id in `youtube`. Prefer
videos already in `docs/rebuild/sources/videos.md`. If you cannot verify a video, link the
teacher's written page instead, without `youtube`. Never guess an id.

## Writing rules that the owner enforces

- Write like a person explaining something to a friend at a desk. Contractions and "you" are fine.
- No slogans, taglines, rhetorical questions, "not X but Y", triads for effect, one-line
  punchlines, em dashes, or "why this comes first".
- No praise, no streaks, no "you've got this", no "the secret is".
- Every method, number and check comes from a source you opened, named in `sources:` and credited
  in the text ("Proko teaches this as..."). Never invent a measurement.
- Say the concrete thing: how far apart, how long, what pen, what to look at.

## Checking your work

Run `node scripts/build-content.mjs --check` and fix every error and warning in your own folders.
Other people are writing other lessons at the same time, so ignore errors about folders that are
not yours. Do not edit files outside your folders and your resources file. Do not run git.

When you finish, report: the lessons written, each resource added and how you verified it, and any
lesson where you could not find a good source.
