// Builds public/content.json from content/: the course, the written lessons with their diagrams,
// practice items, resources and drawing prompts. It refuses to build anything that breaks the
// format, a word budget or the copy rules in docs/rebuild/WRITING.md.
//
//   node scripts/build-content.mjs           check and write public/content.json
//   node scripts/build-content.mjs --check   check only
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import YAML from 'yaml';
import { marked } from 'marked';
import { lintProse, words } from './copy-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const contentDir = path.join(root, 'content');
const checkOnly = process.argv.includes('--check');

const errors = [];
const warnings = [];
const fail = (where, message) => errors.push(`${where}: ${message}`);
const warn = (where, message) => warnings.push(`${where}: ${message}`);

const BUDGET = { title: 5, outcome: 15, term: 15, step: 30, mistake: 40, exercise: 50, check: 15, lesson: 350 };
const KINDS = ['drill', 'warm-up', 'timed', 'memory', 'life', 'imagination', 'location', 'master-copy', 'retest'];
const SECTIONS = ['Words to know', 'How', 'The usual mistake', 'Check'];

const readYaml = (file) => YAML.parse(fs.readFileSync(file, 'utf8'));

// ---- Inline text ------------------------------------------------------------------------------
// Lesson prose is stored as a small tree (text, strong, em, link, code) the app renders itself,
// so no HTML from content ever reaches the page.

function inline(tokens = []) {
  const out = [];
  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        if (token.tokens?.length) out.push(...inline(token.tokens));
        else out.push({ t: 'text', v: decode(token.text) });
        break;
      case 'escape': out.push({ t: 'text', v: decode(token.text) }); break;
      case 'strong': out.push({ t: 'strong', c: inline(token.tokens) }); break;
      case 'em': out.push({ t: 'em', c: inline(token.tokens) }); break;
      case 'codespan': out.push({ t: 'code', v: decode(token.text) }); break;
      case 'link': out.push({ t: 'link', href: token.href, c: inline(token.tokens) }); break;
      case 'br': out.push({ t: 'text', v: ' ' }); break;
      case 'image': break;
      default: throw new Error(`unsupported inline markdown: ${token.type}`);
    }
  }
  return out;
}

const decode = (text) => text.replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const plain = (nodes) => nodes.map((node) => (node.c ? plain(node.c) : node.v)).join('');
const images = (tokens = []) => tokens.flatMap((token) => (token.type === 'image' ? [{ name: token.href, alt: decode(token.text) }] : images(token.tokens || [])));

// Turns markdown text into paragraphs of inline nodes.
function paragraphs(markdown) {
  return marked.lexer(String(markdown ?? '').trim()).filter((token) => token.type === 'paragraph').map((token) => inline(token.tokens));
}

// ---- Prose checks -----------------------------------------------------------------------------

function checkProse(where, text, budget) {
  for (const finding of lintProse(text)) {
    const line = `${finding.rule} ("${finding.match}"). ${finding.why}`;
    if (finding.level === 'error') fail(where, line);
    else warn(where, line);
  }
  if (budget && words(text) > budget) fail(where, `${words(text)} words, over the budget of ${budget}.`);
  return words(text);
}

// ---- Diagrams ---------------------------------------------------------------------------------

const lib = await import(pathToFileURL(path.join(contentDir, 'diagrams', 'lib.mjs')).href);

async function diagram(folder, slug, name, alt, where) {
  const file = path.join(folder, 'diagrams', `${name}.mjs`);
  if (!/^[a-z0-9-]+$/.test(name) || !fs.existsSync(file)) {
    fail(where, `diagram "${name}" has no diagrams/${name}.mjs`);
    return null;
  }
  const module = await import(`${pathToFileURL(file).href}?v=${fs.statSync(file).mtimeMs}`);
  const svg = module.default(lib);
  if (typeof svg !== 'string' || !svg.startsWith('<svg') || /<script|on\w+=/i.test(svg)) {
    fail(where, `diagrams/${name}.mjs did not return plain SVG markup`);
    return null;
  }
  if (alt !== undefined && !alt.trim()) fail(where, `diagram "${name}" needs a description in its alt text`);
  return { id: `${slug}/${name}`, svg, alt: alt ?? '' };
}

// ---- Lessons ----------------------------------------------------------------------------------

function splitFrontMatter(source, where) {
  const match = source.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    fail(where, 'missing front matter between --- lines');
    return { meta: {}, body: source };
  }
  return { meta: YAML.parse(match[1]) || {}, body: match[2] };
}

// The first strong run of a list item is its title ("**Plan.** Put two dots"), the rest its text.
function titled(nodes) {
  const [first, ...rest] = nodes;
  if (!first || first.t !== 'strong') return null;
  const title = plain(first.c).trim().replace(/[.:]$/, '');
  const text = [...rest];
  if (text[0]?.t === 'text') text[0] = { t: 'text', v: text[0].v.replace(/^\s+/, '') };
  return { title, text };
}

function itemTokens(item) {
  return item.tokens.flatMap((token) => (token.type === 'paragraph' || token.type === 'text' ? [token] : []));
}

async function readLesson(folder, entry, diagrams) {
  const slug = entry.slug;
  const where = `content/lessons/${path.basename(folder)}`;
  const { meta, body } = splitFrontMatter(fs.readFileSync(path.join(folder, 'lesson.md'), 'utf8'), where);
  const tokens = marked.lexer(body).filter((token) => token.type !== 'space');
  const lesson = { slug, number: entry.number, part: entry.part, title: entry.title, outcome: entry.outcome, needs: [], terms: [], steps: [], howNotes: [], mistake: null, checkIntro: [], checks: [], checkNotes: [], watch: [], exercise: '', practice: [], example: null };
  let prose = 0;

  // Title and outcome must match the course file, which is their one source.
  const [h1, outcome, example, ...rest] = tokens;
  if (h1?.type !== 'heading' || h1.depth !== 1 || h1.text.trim() !== entry.title) fail(where, `the first line must be "# ${entry.title}" (from course.yaml)`);
  const expected = `After this you can ${entry.outcome}`;
  if (outcome?.type !== 'paragraph' || outcome.text.trim() !== expected) fail(where, `the outcome paragraph must read "${expected}" (from course.yaml)`);
  const exampleImage = images(example ? [example] : [])[0];
  if (!exampleImage) fail(where, 'the paragraph after the outcome must be the example diagram, ![description](name)');
  else {
    const art = await diagram(folder, slug, exampleImage.name, exampleImage.alt, where);
    if (art) diagrams.set(art.id, art);
    lesson.example = art?.id ?? null;
  }

  // Sections.
  const sections = new Map();
  let current = null;
  for (const token of rest) {
    if (token.type === 'heading' && token.depth === 2) {
      if (!SECTIONS.includes(token.text.trim())) fail(where, `unknown section "## ${token.text}". Sections are: ${SECTIONS.join(', ')}`);
      current = token.text.trim();
      sections.set(current, []);
    } else if (current) sections.get(current).push(token);
    else fail(where, `unexpected ${token.type} before the first section`);
  }
  for (const required of ['How', 'The usual mistake', 'Check']) if (!sections.has(required)) fail(where, `missing "## ${required}"`);

  for (const token of sections.get('Words to know') || []) {
    if (token.type !== 'list') { fail(where, 'Words to know holds one list of "**Term:** definition" items'); continue; }
    if (token.items.length > 3) fail(where, 'Words to know has more than three terms');
    for (const item of token.items) {
      const parsed = titled(inline(itemTokens(item).flatMap((t) => t.tokens || [])));
      if (!parsed) { fail(where, `a term must start with **Term:** ("${item.text.slice(0, 40)}")`); continue; }
      prose += checkProse(`${where}, term "${parsed.title}"`, plain(parsed.text), BUDGET.term);
      lesson.terms.push({ term: parsed.title, text: parsed.text });
    }
  }

  for (const token of sections.get('How') || []) {
    if (token.type === 'list') {
      if (!token.ordered) fail(where, 'How must be a numbered list');
      if (token.items.length < 3 || token.items.length > 6) fail(where, `How has ${token.items.length} steps; it needs 3 to 6`);
      for (const item of token.items) {
        const parts = itemTokens(item);
        const parsed = titled(inline(parts[0]?.tokens || []));
        if (!parsed) { fail(where, `a step must start with a bold title, "**Plan.** ..." ("${item.text.slice(0, 40)}")`); continue; }
        const more = parts.slice(1).flatMap((t) => inline(t.tokens || []));
        const text = more.length ? [...parsed.text, { t: 'text', v: ' ' }, ...more] : parsed.text;
        prose += checkProse(`${where}, step "${parsed.title}"`, `${parsed.title}. ${plain(text)}`, BUDGET.step);
        const image = images(item.tokens)[0];
        const art = image ? await diagram(folder, slug, image.name, image.alt, where) : null;
        if (art) diagrams.set(art.id, art);
        lesson.steps.push({ title: parsed.title, text, diagram: art?.id ?? null });
      }
    } else if (token.type === 'paragraph') {
      prose += checkProse(`${where}, note under How`, token.text);
      lesson.howNotes.push(inline(token.tokens));
    } else fail(where, `How holds the steps and short notes, not a ${token.type}`);
  }

  const mistake = sections.get('The usual mistake') || [];
  const mistakeImage = images(mistake)[0];
  const mistakeArt = mistakeImage ? await diagram(folder, slug, mistakeImage.name, mistakeImage.alt, where) : null;
  if (!mistakeArt) fail(where, 'The usual mistake needs its wrong-and-right diagram');
  else diagrams.set(mistakeArt.id, mistakeArt);
  const mistakeText = mistake.filter((token) => token.type === 'paragraph' && !images([token]).length);
  prose += checkProse(`${where}, the usual mistake`, mistakeText.map((token) => token.text).join(' '), BUDGET.mistake);
  lesson.mistake = { diagram: mistakeArt?.id ?? null, text: mistakeText.map((token) => inline(token.tokens)) };

  let seenList = false;
  for (const token of sections.get('Check') || []) {
    if (token.type === 'list') {
      if (seenList) fail(where, 'Check holds one list');
      seenList = true;
      if (token.items.length < 3 || token.items.length > 5) fail(where, `Check has ${token.items.length} items; it needs 3 to 5`);
      for (const item of token.items) {
        const nodes = inline(itemTokens(item).flatMap((t) => t.tokens || []));
        prose += checkProse(`${where}, check "${plain(nodes).slice(0, 30)}"`, plain(nodes), BUDGET.check);
        lesson.checks.push(nodes);
      }
    } else if (token.type === 'paragraph') {
      prose += checkProse(`${where}, note under Check`, token.text);
      (seenList ? lesson.checkNotes : lesson.checkIntro).push(inline(token.tokens));
    } else fail(where, `Check holds a list and short notes, not a ${token.type}`);
  }

  // Front matter: what the lesson needs, its exercise, and what to watch.
  lesson.needs = (meta.needs || []).map(String);
  lesson.exercise = String(meta.exercise || '');
  lesson.watch = (meta.watch || []).map(String);
  if (!lesson.exercise) fail(where, 'front matter needs "exercise:", the id of the main practice item');
  if (lesson.watch.length < 1 || lesson.watch.length > 2) fail(where, 'front matter "watch:" lists one or two resources');
  if (!Array.isArray(meta.sources) || !meta.sources.length) fail(where, 'front matter "sources:" must name where the method comes from');
  return { lesson, prose };
}

async function readPractice(folder, lesson, diagrams, practice) {
  const where = `content/lessons/${path.basename(folder)}/practice.yaml`;
  const file = path.join(folder, 'practice.yaml');
  if (!fs.existsSync(file)) { fail(where, 'missing'); return 0; }
  const items = readYaml(file) || [];
  let mainWords = 0;
  const ITEM_KEYS = ['id', 'main', 'title', 'kind', 'minutes', 'text', 'steps', 'timer', 'reference', 'check'];
  const strict = (at, value, allowed, what) => {
    for (const key of Object.keys(value || {})) {
      if (!allowed.includes(key)) fail(at, `${what} has an unexpected key "${key}". A comma in an unquoted value inside { } ends it early, so quote the value.`);
    }
  };
  for (const raw of items) {
    const at = `${where}, ${raw.id}`;
    strict(at, raw, ITEM_KEYS, 'the item');
    strict(at, raw.timer, ['minutes', 'rounds'], 'timer');
    for (const round of raw.timer?.rounds || []) strict(at, round, ['label', 'minutes', 'seconds'], 'a timer round');
    strict(at, raw.reference, ['diagram', 'alt', 'prompt'], 'reference');
    if (!/^[a-z0-9-]+$/.test(raw.id || '')) { fail(where, `bad practice id "${raw.id}"`); continue; }
    if (practice.has(raw.id)) fail(at, 'duplicate practice id');
    if (!KINDS.includes(raw.kind)) fail(at, `kind must be one of ${KINDS.join(', ')}`);
    if (!(raw.minutes > 0)) fail(at, 'minutes must be a positive number');
    if (!raw.title || words(raw.title) > 6) fail(at, 'title is required and at most 6 words');
    checkProse(`${at}, title`, raw.title || '');
    const textWords = checkProse(at, raw.text || '', BUDGET.exercise);
    if (raw.main) mainWords = textWords;
    const timer = raw.timer || {};
    let rounds;
    if (Array.isArray(timer.rounds)) {
      rounds = timer.rounds.map((round) => ({ label: String(round.label || ''), seconds: Math.round((round.seconds ?? round.minutes * 60) || 0) }));
      if (rounds.some((round) => !(round.seconds > 0))) fail(at, 'every timer round needs seconds or minutes');
      for (const round of rounds) if (round.label) checkProse(`${at}, round "${round.label}"`, round.label);
    } else if (timer.minutes > 0) rounds = [{ label: '', seconds: Math.round(timer.minutes * 60) }];
    else fail(at, 'timer needs minutes or rounds');
    let reference = { type: 'none' };
    if (raw.reference?.diagram) {
      const art = await diagram(folder, lesson.slug, raw.reference.diagram, raw.reference.alt, at);
      if (art) {
        const alt = art.alt || diagrams.get(art.id)?.alt || '';
        if (!alt) fail(at, `reference diagram "${raw.reference.diagram}" needs "alt:" because the lesson page does not describe it`);
        diagrams.set(art.id, { ...art, alt });
        reference = { type: 'diagram', diagram: art.id };
      }
    } else if (raw.reference?.prompt) reference = { type: 'prompt', prompt: String(raw.reference.prompt) };
    const check = (raw.check || []).map((line) => { checkProse(`${at}, check`, line, BUDGET.check); return paragraphs(line)[0] || []; });
    if (!raw.main && (check.length < 1 || check.length > 3)) fail(at, 'a practice item needs 1 to 3 checks of its own');
    for (const step of raw.steps || []) checkProse(`${at}, step`, step);
    practice.set(raw.id, {
      id: raw.id, lesson: lesson.slug, main: Boolean(raw.main), title: raw.title, kind: raw.kind, minutes: raw.minutes,
      text: paragraphs(raw.text), steps: (raw.steps || []).map(String), rounds, reference, check,
    });
    lesson.practice.push(raw.id);
  }
  const main = items.filter((item) => item.main);
  if (main.length !== 1 || main[0].id !== lesson.exercise) fail(where, `exactly one item is main, and it is the lesson's exercise "${lesson.exercise}"`);
  return mainWords;
}

// ---- Resources and prompts --------------------------------------------------------------------

function readResources() {
  const where = 'content/resources.yaml';
  const resources = new Map();
  for (const raw of readYaml(path.join(contentDir, 'resources.yaml')) || []) {
    const at = `${where}, ${raw.id}`;
    for (const key of Object.keys(raw)) if (!['id', 'title', 'teacher', 'url', 'kind', 'minutes', 'youtube', 'cost', 'checked'].includes(key)) fail(at, `unexpected key "${key}"; quote values that contain a comma or colon`);
    if (resources.has(raw.id)) fail(at, 'duplicate id');
    if (!/^https:\/\//.test(raw.url || '')) fail(at, 'url must be https');
    if (!['free', 'paid'].includes(raw.cost)) fail(at, 'cost is free or paid');
    if (!raw.title || !raw.teacher || !raw.kind) fail(at, 'title, teacher and kind are required');
    if (raw.youtube && !/^[\w-]{11}$/.test(raw.youtube)) fail(at, 'youtube must be an 11-character video id');
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(raw.checked || ''))) fail(at, 'checked must be the date someone last opened it, YYYY-MM-DD');
    resources.set(raw.id, { id: raw.id, title: raw.title, teacher: raw.teacher, url: raw.url, kind: raw.kind, minutes: raw.minutes ?? null, youtube: raw.youtube ?? null, cost: raw.cost, checked: String(raw.checked) });
  }
  return resources;
}

function readPrompts() {
  const prompts = readYaml(path.join(contentDir, 'prompts.yaml')) || {};
  for (const key of ['subjects', 'twists', 'views']) {
    if (!Array.isArray(prompts[key]) || prompts[key].length < 5) fail('content/prompts.yaml', `${key} needs at least five entries`);
    for (const entry of prompts[key] || []) checkProse(`content/prompts.yaml, ${key}`, entry);
  }
  return { subjects: prompts.subjects || [], twists: prompts.twists || [], views: prompts.views || [] };
}

// ---- Course -----------------------------------------------------------------------------------

const course = readYaml(path.join(contentDir, 'course.yaml'));
const folders = new Map(fs.readdirSync(path.join(contentDir, 'lessons'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && /^\d{2}-/.test(entry.name))
  .map((entry) => [entry.name.slice(3), path.join(contentDir, 'lessons', entry.name)]));

const parts = [];
const lessons = {};
const diagrams = new Map();
const practice = new Map();
const resources = readResources();
const slugs = new Set();
let number = 0;

for (const [index, part] of (course.parts || []).entries()) {
  const entries = [];
  for (const raw of part.lessons || []) {
    number += 1;
    for (const key of Object.keys(raw)) if (!['slug', 'title', 'outcome'].includes(key)) fail(`content/course.yaml, ${raw.slug}`, `unexpected key "${key}"; quote values that contain a comma`);
    const entry = { slug: raw.slug, number, part: index + 1, title: raw.title, outcome: raw.outcome };
    const at = `content/course.yaml, ${raw.slug}`;
    if (slugs.has(raw.slug)) fail(at, 'duplicate slug');
    slugs.add(raw.slug);
    if (words(raw.title || '') > BUDGET.title) fail(at, `title over ${BUDGET.title} words`);
    if (/[:()]/.test(raw.title || '')) fail(at, 'a title has no colon or brackets');
    checkProse(`${at}, title`, raw.title || '');
    checkProse(`${at}, outcome`, `After this you can ${raw.outcome}`, BUDGET.outcome + 4);
    const folder = folders.get(raw.slug);
    if (folder) {
      const expectedFolder = `${String(number).padStart(2, '0')}-${raw.slug}`;
      if (path.basename(folder) !== expectedFolder) fail(`content/lessons/${path.basename(folder)}`, `folder should be named ${expectedFolder}`);
      const { lesson, prose } = await readLesson(folder, entry, diagrams);
      const exerciseWords = await readPractice(folder, lesson, diagrams, practice);
      const total = prose + exerciseWords + words(lesson.outcome);
      if (total > BUDGET.lesson) fail(`content/lessons/${path.basename(folder)}`, `${total} words of lesson prose, over the budget of ${BUDGET.lesson}`);
      lesson.prose = total;
      lessons[raw.slug] = lesson;
    }
    entries.push({ ...entry, written: Boolean(folder) });
  }
  parts.push({ number: index + 1, title: part.title, lessons: entries });
}

for (const slug of folders.keys()) if (!slugs.has(slug)) fail(`content/lessons/*-${slug}`, 'folder has no entry in course.yaml');
for (const lesson of Object.values(lessons)) {
  for (const need of lesson.needs) if (!slugs.has(need)) fail(`lesson ${lesson.slug}`, `needs unknown lesson "${need}"`);
  for (const id of lesson.watch) if (!resources.has(id)) fail(`lesson ${lesson.slug}`, `watch lists unknown resource "${id}"`);
}
// "needs" must point backwards, which also rules out loops.
const order = new Map(parts.flatMap((part) => part.lessons).map((entry) => [entry.slug, entry.number]));
for (const lesson of Object.values(lessons)) for (const need of lesson.needs) if (order.get(need) >= lesson.number) fail(`lesson ${lesson.slug}`, `needs "${need}", which comes later`);

const prompts = readPrompts();

for (const line of warnings) console.warn(`warning  ${line}`);
if (errors.length) {
  for (const line of errors) console.error(`error    ${line}`);
  console.error(`\n${errors.length} content error${errors.length === 1 ? '' : 's'}. Nothing was written.`);
  process.exit(1);
}

const written = Object.values(lessons);
console.log(`Content: ${number} lessons in ${parts.length} parts, ${written.length} written (${written.map((lesson) => `${lesson.number}: ${lesson.prose} words`).join(', ')}), ${practice.size} practice items, ${resources.size} resources, ${diagrams.size} diagrams.`);
if (!checkOnly) {
  const output = { format: 1, parts, lessons, practice: Object.fromEntries(practice), resources: Object.fromEntries(resources), diagrams: Object.fromEntries(diagrams), prompts };
  fs.mkdirSync(path.join(root, 'public'), { recursive: true });
  fs.writeFileSync(path.join(root, 'public', 'content.json'), `${JSON.stringify(output)}\n`);
}
