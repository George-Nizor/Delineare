![Delineare banner](docs/images/delineare-banner.png)

<p align="center"><img src="docs/delineare-animated.svg" alt="Delineare pencil" width="96" /></p>

# Delineare

Learn to draw one skill at a time. Each lesson shows what to do, what it looks like done well, and
the best free lesson on it from the teacher who made it. Then you draw, with the reference and a
timer beside you. A practice library holds exercises for every lesson, for whenever you have
time.

The course is 34 lessons in 6 parts, from a first confident line to a scene drawn from imagination.
Lessons 1 to 3 are written; the rest follow in updates.

## Using it

Delineare runs inside [Instrumenta](https://github.com/George-Nizor/Instrumenta). Install it from
Add apps. Your pages, practice history and settings stay on your computer; nothing is sent
anywhere.

- **Home** says what to do now: the lesson you are on, and three things to practise.
- **Course** lists the six parts and their lessons.
- **Practise** has every exercise, by lesson, length and kind. Nothing there is ever due or missed.
- **Drawings** keeps a photo of each page, so you can put your first and latest side by side.

## Developing

```bash
npm install
npm run dev          # builds content/ into public/content.json, then starts Vite
npm run lint:copy    # the writing rules, for content and interface
npm test
npm run build
npm run e2e          # drives the built app through Instrumenta's static server; needs ../Instrumenta
```

Lessons live in `content/`. `docs/rebuild/PLAN.md` describes the product, `docs/rebuild/WRITING.md`
how every word is written, and `CLAUDE.md` the rules for working here.

## Licence

MIT for the code. Linked lessons belong to their teachers; Delineare links to them and never copies
them.
