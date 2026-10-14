# Video check

Every YouTube URL in `COURSE.md` (29 URLs across 27 lessons), checked on 2026-10-14. A second table
covers related videos found while reading the lesson 1 to 3 sources and the Ctrl+Paint pages that
`COURSE.md` links.

## How each column was checked

- **Title, channel, length:** from `videoDetails` in `ytInitialPlayerResponse` on the watch page
  (`https://www.youtube.com/watch?v=ID&hl=en`), fetched with a desktop Chrome user agent. Length is
  `lengthSeconds` as m:ss.
- **Status:** `playabilityStatus.status`. `OK` means the page would play it.
- **Embeddable:** `playabilityStatus.playableInEmbed` is true and the oEmbed endpoint
  (`https://www.youtube.com/oembed?url=...&format=json`) answers 200. oEmbed answers 401 for a video
  whose owner has turned embedding off; none did.
- **Age-restricted:** no age-verification or sign-in reason in `playabilityStatus`, and
  `microformat.isFamilySafe` is true. All 49 videos checked are family-safe.
- **Result:** pass when all four hold.
- Requests went out from the owner's Windows machine (YouTube served its AU site). Availability in
  other countries was not checked.
- The app frames lesson videos from `www.youtube-nocookie.com` (`Delineare/CLAUDE.md`). Every video
  below that passes is embeddable on YouTube's terms; the nocookie domain itself was not loaded.

## COURSE.md videos

**Failures: none.** All 29 are public, play, embed, and are not age-restricted. Every length matches
the rounded figure in `COURSE.md`. Lessons 20 and 25 give no length; they are 15:41, and 11:58 plus
24:34.

| Lesson | Video | Title (as on YouTube) | Channel | Length | COURSE.md says | Status | Embeddable | Age-restricted | oEmbed | Result |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 1. Confident lines | [LkJG6pKTuRc](https://www.youtube.com/watch?v=LkJG6pKTuRc) | Drawabox Lesson 1, Exercise 2: Ghosted Lines | Uncomfortable | 10:32 | 11 min | OK | yes | no | 200 | pass |
| 2. Ellipses | [tHJ3rzk6kno](https://www.youtube.com/watch?v=tHJ3rzk6kno) | Drawabox Lesson 1: Ellipses | Uncomfortable | 12:48 | 13 min | OK | yes | no | 200 | pass |
| 4. Measuring | [1J7RQvKnWf4](https://www.youtube.com/watch?v=1J7RQvKnWf4) | How to Draw Accurate Proportions | Proko | 12:04 | 12 min | OK | yes | no | 200 | pass |
| 6. Gesture | [8j39NqwL7s4](https://www.youtube.com/watch?v=8j39NqwL7s4) | How to Draw Gesture - Step by Step | Proko | 14:55 | 15 min | OK | yes | no | 200 | pass |
| 7. Checking your drawing | [SGJ_uBtK__M](https://www.youtube.com/watch?v=SGJ_uBtK__M) | How to EVALUATE YOURSELF as a SELF-TAUGHT ARTIST ??! - Teach Yourself to Draw - Methodology | Florent Farges - arts | 10:02 | 10 min | OK | yes | no | 200 | pass |
| 8. Drawing from memory | [XDLJAfDR4fM](https://www.youtube.com/watch?v=XDLJAfDR4fM) | How to Improve Your Visual Memory | Proko | 6:26 | 6 min | OK | yes | no | 200 | pass |
| 9. Simple forms | [3uEtdDvK6Xo](https://www.youtube.com/watch?v=3uEtdDvK6Xo) | Structure Basics - Making Things Look 3D | Proko | 11:11 | 11 min | OK | yes | no | 200 | pass |
| 10. Contour lines on round forms | [y5By0Q_XFBM](https://www.youtube.com/watch?v=y5By0Q_XFBM) | Drawabox Lesson 2: Sausages with Contour Lines | Uncomfortable | 12:17 | 12 min | OK | yes | no | 200 | pass |
| 11. Horizon and one-point perspective | [BYlW8XC0MlI](https://www.youtube.com/watch?v=BYlW8XC0MlI) | Perspective for Beginners | Proko | 13:56 | 14 min | OK | yes | no | 200 | pass |
| 13. Freehand boxes | [Oz98L4Fyxoo](https://www.youtube.com/watch?v=Oz98L4Fyxoo) | Drawabox Lesson 1, Exercise 9: Rotated Boxes | Uncomfortable | 17:55 | 18 min | OK | yes | no | 200 | pass |
| 14. Cylinders | [PdtDtGBu-Dc](https://www.youtube.com/watch?v=PdtDtGBu-Dc) | How to Draw Cylinders and Ellipses | Proko | 14:35 | 15 min | OK | yes | no | 200 | pass |
| 15. Building objects | [VuorfzSk33Y](https://www.youtube.com/watch?v=VuorfzSk33Y) | Drawabox Lesson 2, Exercise 5: Form Intersections | Uncomfortable | 29:00 | 29 min | OK | yes | no | 200 | pass |
| 16. Turning objects in your head | [ja4W5P7K5PE](https://www.youtube.com/watch?v=ja4W5P7K5PE) | Perspective Drawing 9 -  Rotating Objects in Perspective (Part 1) | Dan Beardshaw | 10:14 | 10 min | OK | yes | no | 200 | pass |
| 17. Seeing value | [a0uaqmY04OI](https://www.youtube.com/watch?v=a0uaqmY04OI) | Intro to Value Drawing | Proko | 8:40 | 9 min | OK | yes | no | 200 | pass |
| 18. Light on form | [V3WmrWUEIJo](https://www.youtube.com/watch?v=V3WmrWUEIJo) | Shading Light and Form - Basics | Proko | 7:15 | 7 min | OK | yes | no | 200 | pass |
| 19. Cast shadows | [QNDJZSpyRLI](https://www.youtube.com/watch?v=QNDJZSpyRLI) | Shadow Mapping Basics | Proko | 8:26 | 8 min | OK | yes | no | 200 | pass |
| 20. Tone with line | [rIIpEuLxsiI](https://www.youtube.com/watch?v=rIIpEuLxsiI) | Pen and Ink Crosshatching \| A simple introduction | Alphonso Dunn | 15:41 | (none) | OK | yes | no | 200 | pass |
| 22. Proportions and landmarks | [OyWHmxFGVK4](https://www.youtube.com/watch?v=OyWHmxFGVK4) | Human Figure Proportions - Average Figures - Dr. Paul Richer | Proko | 6:58 | 7 min | OK | yes | no | 200 | pass |
| 22. Proportions and landmarks | [Qwt_wggUFHg](https://www.youtube.com/watch?v=Qwt_wggUFHg) | Landmarks of the Human Body | Proko | 7:48 | 8 min | OK | yes | no | 200 | pass |
| 23. The mannequin | [DIjooolQ6xs](https://www.youtube.com/watch?v=DIjooolQ6xs) | Step by Step Figure Construction | Steven Michael Hampton | 13:54 | 14 min | OK | yes | no | 200 | pass |
| 24. Figures from imagination | [6-8ED4DW6A0](https://www.youtube.com/watch?v=6-8ED4DW6A0) | Training Yourself to Draw From Imagination - Peter Han | Proko | 28:09 | 28 min | OK | yes | no | 200 | pass |
| 25. The head | [wAOldLWIDSM](https://www.youtube.com/watch?v=wAOldLWIDSM) | Quickly Draw Heads with the Loomis Method - Part 1 | Proko | 11:58 | (none) | OK | yes | no | 200 | pass |
| 25. The head | [JC2ZppKHCqU](https://www.youtube.com/watch?v=JC2ZppKHCqU) | Draw ANY Head Type with the Loomis Method - Part 2 | Proko | 24:34 | (none) | OK | yes | no | 200 | pass |
| 26. Features and likeness | [F_vMtxyq9_U](https://www.youtube.com/watch?v=F_vMtxyq9_U) | How to get a LIKENESS in a portrait | Love Life Drawing | 22:46 | 23 min | OK | yes | no | 200 | pass |
| 27. Hands and feet | [kV2e_v5Pqho](https://www.youtube.com/watch?v=kV2e_v5Pqho) | How to Draw Hands from IMAGINATION - Step-by-Step | Proko | 12:51 | 13 min | OK | yes | no | 200 | pass |
| 28. Clothing folds | [d07NanfYT8U](https://www.youtube.com/watch?v=d07NanfYT8U) | Understanding Every Type Of Clothing Fold | Marco Bucci | 14:12 | 14 min | OK | yes | no | 200 | pass |
| 31. Rooms and streets | [C2xn9HiHmT0](https://www.youtube.com/watch?v=C2xn9HiHmT0) | H2Dr page 053: Transferring Scale in Perspective | Scott Robertson | 10:59 | 11 min | OK | yes | no | 200 | pass |
| 32. Composition and thumbnails | [VSRLe6ewKIc](https://www.youtube.com/watch?v=VSRLe6ewKIc) | Composition Sketching - How You Should Start Every Drawing | Proko | 8:52 | 9 min | OK | yes | no | 200 | pass |
| 34. A scene from imagination | [aa9hfOOVpUo](https://www.youtube.com/watch?v=aa9hfOOVpUo) | How I Draw Dystopian Cityscapes/Environments From Imagination - Page 05 | Dan Beardshaw | 8:57 | 9 min | OK | yes | no | 200 | pass |

Titles that differ from the names `COURSE.md` uses (worth matching in the resource line):

- Lesson 7: "How to EVALUATE YOURSELF as a SELF-TAUGHT ARTIST ??! - Teach Yourself to Draw -
  Methodology" (COURSE.md: "How to Evaluate Yourself as a Self-Taught Artist").
- Lesson 16: "Perspective Drawing 9 - Rotating Objects in Perspective (Part 1)". It is part 1 of a
  series.
- Lesson 22: the proportions video is "Human Figure Proportions - Average Figures - Dr. Paul Richer".
- Lesson 23: the channel is "Steven Michael Hampton" (COURSE.md: Michael Hampton).
- Lesson 31: "H2Dr page 053: Transferring Scale in Perspective".
- Lesson 34: "How I Draw Dystopian Cityscapes/Environments From Imagination - Page 05".

## Other videos checked

All pass (public, embeddable, not age-restricted). "Not watched" means only the metadata and
description were read.

| Lesson | Video | Title (as on YouTube) | Channel | Length | Embeddable | Age-restricted | Where it came from |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 1 | [o1HAVipdsZM](https://www.youtube.com/watch?v=o1HAVipdsZM) | Drawabox Lesson 1: The Levels of the Ghosting Method | Uncomfortable | 4:54 | yes | no | Linked from Drawabox Ghosted Lines page |
| 1 | [0_AdsK8x9Lw](https://www.youtube.com/watch?v=0_AdsK8x9Lw) | Drawabox Lesson 1: Drawing From Your Wrist and Shoulder | Uncomfortable | 9:35 | yes | no | Drawabox, accompanies lesson/1/2 (arm and shoulder) |
| 1 (replacement) | [lTslVOUJ0jI](https://www.youtube.com/watch?v=lTslVOUJ0jI) | 6 Habits for Good Line Quality | Proko | 9:58 | yes | no | Proko; pencil on paper (see note) |
| 1 (current link) | [be8gp7N5LVU](https://www.youtube.com/watch?v=be8gp7N5LVU) | Drawing Straight Lines in Photoshop | Ctrl+Paint | 5:23 | yes | no | Embedded on ctrlpaint.com/videos/straight-lines; Photoshop |
| 2 | [7WLmXufShyA](https://www.youtube.com/watch?v=7WLmXufShyA) | Drawabox Lesson 1, Exercise 4: Tables of Ellipses | Uncomfortable | 6:36 | yes | no | Linked from Drawabox Tables of Ellipses |
| 2 | [gyRHkTPqfrQ](https://www.youtube.com/watch?v=gyRHkTPqfrQ) | Drawabox Lesson 1, Exercise 4: Things to Remember (Tables of Ellipses) | Uncomfortable | 5:56 | yes | no | Linked from Drawabox Tables of Ellipses |
| 2 | [9EUc-nni1_w](https://www.youtube.com/watch?v=9EUc-nni1_w) | Drawabox Lesson 1, Exercise 5: Ellipses in Planes | Uncomfortable | 4:00 | yes | no | Linked from Drawabox Ellipses in Planes |
| 2 | [CKgeIA2PqY8](https://www.youtube.com/watch?v=CKgeIA2PqY8) | Drawabox Lesson 1, Exercise 5: Things to Remember (Ellipses in Planes) | Uncomfortable | 4:49 | yes | no | Linked from Drawabox Ellipses in Planes |
| 2 | [xiMEIg2fU-g](https://www.youtube.com/watch?v=xiMEIg2fU-g) | Drawabox Lesson 1, Exercise 6: Funnels | Uncomfortable | 5:35 | yes | no | Linked from Drawabox Funnels |
| 2 | [HMbBMQMICmk](https://www.youtube.com/watch?v=HMbBMQMICmk) | Drawabox Lesson 1, Exercise 6: Things to Remember (Funnels) | Uncomfortable | 2:38 | yes | no | Linked from Drawabox Funnels |
| 2 | [Kg0LhSRxA-E](https://www.youtube.com/watch?v=Kg0LhSRxA-E) | Drawabox Lesson 1, Exercise 6: Funnels | ScyllaStew | 36:32 | yes | no | Linked from Drawabox Funnels; another channel |
| 2 | [TTXrOb4DMLY](https://www.youtube.com/watch?v=TTXrOb4DMLY) | Drawing Confident Circles in Photoshop | Ctrl+Paint | 3:46 | yes | no | Embedded on ctrlpaint.com/videos/ellipse-control; Photoshop |
| 2 | [_xFEV2uOp1M](https://www.youtube.com/watch?v=_xFEV2uOp1M) | page 018: freehand ellipses | Scott Robertson | 9:14 | yes | no | Named in research/02; not watched |
| 3 | [R2lyErHiwt0](https://www.youtube.com/watch?v=R2lyErHiwt0) | Ctrl+Paint unplugged: Drawing Contour Lines | Ctrl+Paint | 3:58 | yes | no | Embedded on ctrlpaint.com/videos/drawing-shape-contour (COURSE.md's lesson 3 link) |
| 3 | [jIC_BDff4Ow](https://www.youtube.com/watch?v=jIC_BDff4Ow) | Blind contour drawing demonstration: Self-portrait | Tucson Museum of Art | 1:44 | yes | no | Embedded on Tucson Museum of Art 'Exploring Portraits' |
| 3 | [d_aMCHRyELQ](https://www.youtube.com/watch?v=d_aMCHRyELQ) | Hilarious Blind Contour Drawing Tutorial | Art Prof: Your Art School | 1:36 | yes | no | Named in research/02; not watched |
| 5 | [JWWzFs3oQ5s](https://www.youtube.com/watch?v=JWWzFs3oQ5s) | Ctrl+Paint unplugged: Linear Blockin | Ctrl+Paint | 4:05 | yes | no | Embedded on ctrlpaint.com/videos/drawing-shape-linear-block-in |
| 5 | [1s3ERiR1hAs](https://www.youtube.com/watch?v=1s3ERiR1hAs) | Ctrl+Paint unplugged: Drawing Negative Space | Ctrl+Paint | 4:37 | yes | no | Embedded on ctrlpaint.com/videos/drawing-shape-negative-space |
| 21 | [t5JikOGuiV4](https://www.youtube.com/watch?v=t5JikOGuiV4) | Ctrl+Paint unplugged: Simple Still Life | Ctrl+Paint | 4:08 | yes | no | Embedded on ctrlpaint.com/videos/drawing-shape-simple-still-life |
| 33 | [1E1DfBc0R9g](https://www.youtube.com/watch?v=1E1DfBc0R9g) | Digital Sketching: Designing With Reference | Ctrl+Paint | 4:15 | yes | no | Embedded on ctrlpaint.com/videos/designing-with-reference; digital |

Not on YouTube:

| Lesson | Video | Length | Host | Note |
| --- | --- | --- | --- | --- |
| 3 | RISD Museum, "Out of Line / Blind Contour Drawing" (https://risdmuseum.org/art-design/projects-publications/watch-listen/out-line-blind-contour-drawing) | 2:32 | Vimeo 233326488 (oEmbed 200, embeddable on Vimeo) | The launcher only frames `www.youtube-nocookie.com`, so in the app this can only be a link. The same video is a free .mp4 download at https://digitalcommons.risd.edu/risdmuseum_films_draw/10. |

## Medium check: pen and paper or digital

Ctrl+Paint's site is "Digital Painting Simplified", so each Ctrl+Paint page `COURSE.md` or the content
links was checked for what the video teaches with.

- **Lesson 1, "Straight Lines" (https://www.ctrlpaint.com/videos/straight-lines): digital.** The page
  says "This video explores the art of drawing straight lines in Photoshop. There are a few different
  ways to approach it within the software". The embedded video is titled "Drawing Straight Lines in
  Photoshop" (be8gp7N5LVU, 5:23) and its description begins "In this Photoshop digital painting
  tutorial we'll tackle a deceptively simple task: straight lines." The page's own assignment ("Draw
  from the elbow and shoulder, keep your wrist rigid") applies to paper too, but the video shows
  Photoshop. It is linked today from `content/resources.yaml` (`ctrlpaint-straight-lines`) and from
  `content/lessons/01-confident-lines/lesson.md` (`watch:`), and in `sample-lesson-01.md`.
  - **Suggested replacement:** Proko, "6 Habits for Good Line Quality" (lTslVOUJ0jI, 9:58, embeddable,
    not age-restricted, free on YouTube and on proko.com). Pencil on paper: the video frame shows a
    pencil on paper, and the description lists "follow-through, ghost in your lines, rotate the paper,
    and use simple strokes". Chapters: 00:56 Avoid the Common Mistakes, 02:20 Find the Comfortable
    Speed, 03:36 Follow Through, 04:38 Ghosting, 06:46 Rotate the Paper, 08:16 Use Simple Strokes.
    Its ghosting and page-rotation advice matches lesson 1. I could not read its transcript, so check
    the content against lesson 1 before linking.
  - **Alternatives from Drawabox, same method as lesson 1:** "Drawabox Lesson 1: Drawing From Your Wrist
    and Shoulder" (0_AdsK8x9Lw, 9:35, embeddable), or "Drawabox Lesson 1: The Levels of the Ghosting
    Method" (o1HAVipdsZM, 4:54, embeddable; it explains the three levels lesson 1's checks use).
- **Lesson 2, "Ellipse Control": digital** (Photoshop shape tool; "Drawing Confident Circles in
  Photoshop", 3:46). Not in `COURSE.md`; do not use it.
- **Lessons 3, 5 and 21: pen and paper.** The embedded videos are "Ctrl+Paint unplugged: Drawing
  Contour Lines", "Ctrl+Paint unplugged: Linear Blockin", "Ctrl+Paint unplugged: Drawing Negative
  Space" and "Ctrl+Paint unplugged: Simple Still Life". The lesson 3 transcript confirms pencil on paper
  ("use the tip of your pencil").
- **Lesson 33, "Designing with Reference": digital.** The embedded video is titled "Digital Sketching:
  Designing With Reference" (1E1DfBc0R9g, 4:15). The design method may still transfer, but the video
  is drawn on screen; decide when lesson 33 is written.
