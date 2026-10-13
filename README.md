![Delineare banner](docs/images/delineare-banner.png)

<p align="center"><img src="docs/delineare-animated.svg" alt="Delineare pencil" width="96" /></p>

# Delineare

Learn to draw anything: today's session, the reference and the clock, and where to learn each step.

Delineare runs a drawing curriculum as daily practice. It tells you what to draw today, shows the
reference on neutral grey with a timer, asks for a photo of your page at the end, has you answer that
chapter's checks in words, and decides what comes next. The teaching comes from free lessons by the
people who made them (Drawabox, Proko, Ctrl+Paint, museums, schools and many others), linked and
credited, never copied. Where no free lesson covers a topic, Delineare has a short lesson of its own.

The name is Latin for "to sketch out". Pliny the Elder uses it once, for the painter Apelles drawing
a face on a wall with a dead coal (Natural History 35.89).

## What is in it

- Today: one recommended session from your weekly plan (3, 6 or 10 hours a week), a 10-minute
  version for tired days, and your last page.
- The session runner: timed parts and gesture ladders, the reference with flip, greyscale, grid and
  squint, prompts for invention, cold revisits drawn from memory, and a check at the end.
- The path: 96 chapters in 10 parts, laid out as a book's contents, with what is open, in progress
  and done. Drawing from imagination starts in the first week.
- Chapters: the idea, exercises, the checks that say when you have it, common mistakes in the
  margin, and the sources as footnotes with honest labels (free, part free, unverified, link problem).
- Drawings: every photographed page, a chapter's first and latest side by side, and your page over
  the reference.
- Library and sources: practice material with its licences, the teachers credited, and the gaps that
  are still open.

A chapter counts as done only when its checks hold on two different days. Revisits come back at
growing intervals. There are no streaks, badges or scores.

## Your data

Everything stays in this browser's storage on this computer: progress, sessions and photos of your
pages (resized to 2000 px). There is no account and nothing is sent anywhere. Settings exports all of
it as a zip and imports it again. The only outside requests are searches of three museums'
open-access collections (the Art Institute of Chicago, the Cleveland Museum of Art and the
Metropolitan Museum of Art) for public-domain reference images, and the links you choose to open.

## Run it

Through Instrumenta: Delineare is in the launcher's catalogue and installs from this repository's
releases. Its links open in your browser; the launcher allows that for Delineare only.

From a checkout (Node.js 22.12 or newer):

```bash
npm install
npm run dev        # http://localhost:5173
npm test
npm run build      # dist/, as the launcher serves it
```

The curriculum is data, built by a script and checked by another (Python 3, standard library):

```bash
npm run curriculum   # curriculum/build_v2.py, then curriculum/validate.py
```

`docs/CURRICULUM.md` explains the data, the changes from the first version and how to rebuild it.
`npm run brand` copies the fonts, the mark and the colours from the Instrumenta checkout beside
this one (`public/brand/SOURCE.txt` records which commit).

## Releases

Tag `v<version>` (matching `package.json`) and push the tag. `.github/workflows/release.yml` calls
Instrumenta's shared web product release, which builds, audits the build under the launcher's rules,
and publishes the zip with `instrumenta-release.json`.

## Family

Delineare is part of [Instrumenta](https://github.com/George-Nizor/Instrumenta), a suite of local
creative tools made by [Bonehead Labs](https://boneheadlabs.org) ([GitHub](https://github.com/Bonehead-Labs)).
It follows Instrumenta's brand v2: the pencil mark in chartreuse, Fraunces, Commissioner and Spline
Sans Mono, with Newsreader for lesson text. All four faces are under the SIL Open Font License.
Licence: MIT.
