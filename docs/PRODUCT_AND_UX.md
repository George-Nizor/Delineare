# Product and UX brief

## The user and the job
One adult learning to draw from near zero, aiming at the ability to draw anything he imagines. He learns by doing. Streaks
and heavy note-taking have not worked for him. He wants light retrieval, a clear next step, and honest critique. He forgets
what tools and methods exist, so the app should surface the right exercise at the right moment instead of making him browse.
He draws on paper mostly, maybe digitally later. Phone and laptop both matter; the phone sits next to the paper as a
reference screen and timer.

The job of the app: tell me what to draw today, show me the reference, time me, let me log what I made, tell me whether it
meets the standard, and decide what comes next.

## Why the old front end failed
It was a catalogue: a long list of 125 collapsible rows with filter chips. Nothing in it helped him start drawing. It
presented the whole curriculum at once, had no sessions, no references, no timers and no way to record or judge a drawing.
Visually it was a generic technical-looking page. Do not iterate on it.

## Core objects
- Path: phases and modules as a map of dependencies, not a list. Shows done, available now, locked by prerequisites.
- Module workspace: the lesson. Outcome, the idea in short, one to three teaching resources (core first), the exercises,
  the done-when check, common mistakes. One column, reads like a worksheet, practice starts from the same page.
- Session: a timed block of drills. Types: warm-up gesture, module exercise, reference study, free prompt.
- Reference viewer: full-window image, no chrome, with controls for timer, flip, grayscale, grid, squint blur, next. Source
  and licence shown small at the edge.
- Drawing log: photo of the page, module, session, date, a one-line note, done-when ticks, and a self-rating against that
  module's pass signs.
- Review: phase benchmark tasks (`benchmarks`) and weak-module revisit.

## Screens
1. Today. One recommended session (about the time he has, from his weekly template), a Start button, the last drawing, and
   the next module. No dashboards. No streak counters.
2. Path. A map of the 10 phases with prerequisites visible; colour carries state only. Tier and track filters. A Surprise me
   button for the play modules (invented, surreal, prompt-based) so "draw anything" is practised from week one.
3. Module workspace as above.
4. Session runner and reference viewer.
5. Gallery. Chronological and per-module drawings, side by side comparison of the same module across time. This is how he
   sees improvement.
6. Library. Practice material by type and phase, with licence and attribution.
7. Sources and gaps. Provider index, link status, known gaps, school syllabi. Honest and boring.

## Honesty rules in the UI
Show cost (free, part free, paid), unverified, link problem, and free coverage thin on the thing they apply to, in words.
Show estimated hours as a range and call them estimates. Show the real total once, in the Path screen, without comfort
copy. Links open in a new tab.

## Interaction details that matter
- Keyboard: space to pause the timer, arrows for next and previous reference, F to flip, G for grayscale, B for blur.
- Phone: the reference viewer is the main phone screen. Wake lock while a session runs. Large tap targets. Works one-handed.
- Drawings: resize on import, keep originals optional. Storage use visible. Export everything as a zip with JSON.
- Offline: after first load the path, module pages and timers work offline. Reference images may need a connection.
- Reference sources: only licensed ones (for example museum open-access APIs and Wikimedia Commons, to be confirmed against
  `data.library` licences and each site's current terms before use). Cache nothing that the licence forbids caching.

## Visual direction
This is a studio workbench, not a landing page. Reference points: the feel of a well-made editor or a darkroom tool, a
printed drawing manual, an architect's drafting sheet. Not references: SaaS marketing pages, card grids with soft shadows,
purple-blue gradients, glassmorphism, icon-in-a-circle feature rows, emoji, stock illustration.

Rules:
- The reference viewer and any area where he judges tone uses a neutral mid-to-dark grey surround, because the colour of
  the surround changes how values read. Do not tint it.
- Content surfaces are paper-like and quiet. One accent colour, used for action and state only. Real light and dark themes.
- Type does the work. One serif or humanist face for lesson text at a comfortable measure (60 to 70 characters), one clean
  sans or mono for controls and numbers. Pick faces on purpose and say why. Do not default to Inter.
- Density: lessons are airy, tools (Path, Gallery, Library) are compact. Nothing is decorative. Any illustration is a
  functional diagram (a box in perspective, a value scale) drawn precisely.
- Motion: only where it explains (a timer ring, a flip, a panel opening). Respect reduced motion.
- Accessibility: WCAG AA contrast, visible focus, full keyboard use, labels for every control.

Prototype the Session runner and the Module workspace first as real screens, screenshot at 1440 and 390 wide in both themes,
and show the user before building the rest. He rejected the previous look, so confirm the direction early.
