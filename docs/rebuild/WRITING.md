# Writing for Delineare

Every word in Delineare is either teaching someone to draw or getting out of their way. This guide
says how to write both. It applies to lessons, practice cards, buttons, empty states and the
resource lines. It is stricter than general prose advice because a learner reads a lesson with a
pen in one hand and stops reading the moment the text stops helping.

Two skills in `.claude/skills/` back this guide. `humanizer` lists 26 patterns of machine-sounding
prose, ranked by how strongly they give text away. `stop-slop` is a shorter checklist of the same
habits. Run `humanizer` on every lesson draft (embedded mode). Where this guide and a skill disagree,
this guide wins: `stop-slop` bans every adverb, for example, and a lesson sometimes needs "slightly"
to describe a line.

## Who you are writing for

One person at a desk with paper in front of them. They may never have drawn, or they may have drawn
for years and want to fix one gap. They want to know what to do, see it done, and try it. They do
not want to know how the app was built, how the research was done, or how cautious we are being.

Write as a good teacher talks at that desk: directly, to "you", about the drawing in front of them.

## The rules

1. **Steps are instructions.** Start each step with a verb: "Put two dots on the page." Not "The
   first step is to place two dots."
2. **Show before you explain.** A step comes with its diagram, placed beside it. The rule behind a
   step comes after the learner has seen it work, in one sentence.
3. **Say the number.** "Two dots, 10 to 20 cm apart." "Five boxes." "Two minutes." A learner can
   act on a number and cannot act on "a few" or "some time".
4. **Checks are things you can see on the page.** "Every line is one stroke." "Extended edges meet
   within 1 cm." Never "you feel confident" or "it looks right".
5. **Name the teacher whose method it is.** "Drawabox calls this ghosting." Credit is one short
   clause or one resource line, never a paragraph.
6. **One idea per sentence.** Aim for 8 to 20 words. Anything over 28 words gets split.
7. **Cut anything the learner cannot use right now.** History, the theory of why a method works
   beyond one sentence, and alternatives they will not try all go.
8. **Never write about the app or the writing.** No "this lesson will", no "in this section", no
   "written for Delineare", no notes on how a fact was checked.
9. **Never reassure or praise.** No "don't worry", "great job", "it's easy", "simply", "just".
   "Just" and "simply" tell a struggling learner they are failing at something trivial.
10. **No hedging the learner has to carry.** If we are unsure a resource is free, we check it before
    it ships. A lesson never shows "unverified", "estimate", "thin coverage" or a licence note in
    running text.

## Shapes and word budgets for a lesson

| Part | Shape | Budget |
| --- | --- | --- |
| Title | The skill's name. No colon, no brackets, no sentence | 1 to 5 words |
| Outcome | "After this you can..." in one sentence | 15 words |
| Words to know | Up to three terms, each with a plain definition | 15 words each |
| Steps | 3 to 6 numbered steps, each paired with a diagram | 30 words each |
| Common mistake | One wrong-and-right pair, with the reason in one sentence | 40 words |
| Do this | What to draw, how many, how long, with what | 50 words |
| Check | 3 to 5 things to look for after the page is done | 15 words each |
| Watch | One or two resources, one line each | Title, teacher, length |

A lesson's own prose stays under 350 words. If a skill needs more, it is two lessons.

## UI copy

- Buttons are verbs: "Start", "Draw from memory", "Add a photo". Not "Begin session flow".
- Sentence case everywhere. Straight quotes. No exclamation marks.
- An empty state says what to do: "No drawings yet. Add a photo of a page after your next exercise."
- A resource line is one line: `Ghosted Lines · Drawabox · video, 11 min · free`.

## Banned outright

These are checked by `npm run lint:copy`, and a hit blocks the build.

- **Dashes.** No em dashes or en dashes in prose. Use a period, comma, colon or parentheses.
- **Contrast staging.** "not just X but Y", "it's not X, it's Y", "X isn't the problem, Y is".
- **Puffed-up words.** delve, crucial, key (as an adjective), essential, robust, journey, unlock,
  master (as a verb), elevate, seamless, vibrant, testament, landscape (meaning context), navigate
  (meaning cope with), dive into.
- **Filler.** simply, just, easily, obviously, of course, basically, essentially, actually, really,
  "it's important to", "note that", "remember to", "don't worry", "let's".
- **Talking about the text.** "in this lesson", "this section", "as we'll see", "below you'll find".
- **Typography.** Curly quotes, exclamation marks, emoji.

These are flagged for a human to judge, not blocked:

- Sentences over 28 words.
- Three-item lists, which are often padding.
- Passive voice.
- A paragraph that ends on a short line restating the paragraph.

## Before and after, from the first build

| Before | After |
| --- | --- |
| Baseline: draw ten things from imagination (repeat at every benchmark) | Baseline drawings |
| Drawing from imagination is the goal, so it needs its own measure. Most checks in this curriculum compare a drawing with a reference; this one has no reference while you draw. | Draw ten subjects without looking anything up. You will draw the same ten again later and put the pages side by side. |
| No reference. Just the page and the clock. | (Cut. Show the subject to draw and the time.) |
| 96 chapters in 10 parts. The spine is about 251 to 517 h of study, and everything together about 668 to 1546 h, plus ongoing practice. These are estimates, not measurements. | 34 lessons in 6 parts. |
| The baseline is not a test you pass or fail: the module is done when the set exists, is annotated and is stored where the benchmarks can find it. | There is no pass mark. You are done when all ten are drawn, labelled and photographed. |
| Licence: Photographers licensed the images for educational use inside the site's tools; drawings may be posted but not sold. (Search results and a third-party blog; not opened.) Use for private practice only. | `Line of Action · photo reference · free` |
| Written for Delineare, because the free material does not cover all of this. | (Cut.) |
| Gather or buy one graphite pencil (HB or 2B), one black fineliner, one eraser, a sharpener, a stack of cheap printer paper and one ring-bound sketchbook you would be happy to carry. Write the total cost on the inside cover so you can judge later purchases against it. | You need a ballpoint pen and a stack of printer paper. |

## How a lesson gets written

1. **Gather the method from its sources.** Read or watch the resources the lesson will link, and
   take the steps, numbers and checks from them. Never invent a measurement.
2. **Draft into the template** (`content/lessons/_template.md`), inside the word budgets.
3. **Run `npm run lint:copy`** and fix every hit.
4. **Run the `humanizer` skill on the draft** and apply what it finds.
5. **Do the exercise.** Someone does the exercise as written, with no other help. Any step they
   had to guess at gets rewritten.
6. **The owner reads it in the app.** Nothing ships on the strength of a review in a text editor.
