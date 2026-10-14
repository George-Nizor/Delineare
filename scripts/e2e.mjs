// Drives the built app the way a learner would, served by Instrumenta's own static server so the
// real content policy and isolation headers apply. Fails on any console error, page error or
// content-policy violation, and leaves screenshots for a person to look at.
//
//   npm run build && npm run e2e            (needs the Instrumenta checkout beside this one)
//   E2E_OUT=some/folder npm run e2e         screenshots somewhere else
//
// Chromium comes from Playwright (npx playwright install chromium). On a machine without its
// system libraries, point LD_LIBRARY_PATH at a folder that has them.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { createStaticServer } = require(path.join(root, '..', 'Instrumenta', 'electron', 'static-server.cjs'));
const out = path.resolve(process.env.E2E_OUT || path.join(root, 'test-results', 'e2e'));
fs.rmSync(out, { recursive: true, force: true });
fs.mkdirSync(out, { recursive: true });
const photo = path.join(root, 'public', 'brand', 'delineare-512.png');

const problems = [];
const server = await createStaticServer(path.join(root, 'dist'), { port: 0, tool: 'delineare' });
const browser = await chromium.launch();

async function open(width, scheme) {
  const context = await browser.newContext({ viewport: { width, height: 900 }, colorScheme: scheme });
  const page = await context.newPage();
  const tag = `${width}-${scheme}`;
  page.on('console', (message) => { if (message.type() === 'error') problems.push(`[${tag}] console: ${message.text()}`); });
  page.on('pageerror', (error) => problems.push(`[${tag}] page error: ${error.message}`));
  await page.addInitScript(() => {
    document.addEventListener('securitypolicyviolation', (event) => console.error(`content policy: ${event.violatedDirective} ${event.blockedURI}`));
  });
  return { context, page, tag };
}

async function shot(page, name) {
  await page.waitForTimeout(250);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
}

const steps = [];
const step = (text) => { steps.push(text); console.log(`  ${text}`); };

try {
  // A learner's first run, wide and light.
  const { context, page } = await open(1440, 'light');
  await page.goto(`${server.url}/`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Confident lines' }).waitFor();
  await shot(page, '01-home-first-run');
  step('home offers lesson 1');

  await page.getByRole('link', { name: 'Start the lesson' }).click();
  await page.getByRole('heading', { name: 'How' }).waitFor();
  await shot(page, '02-lesson-1');
  step('lesson 1 shows its format');

  await page.getByRole('button', { name: 'Fold the steps away' }).click();
  await page.getByText('Plan · Ghost · Draw · Leave it').waitFor();
  await page.getByRole('button', { name: 'Show the steps' }).click();
  step('steps fold and unfold');

  await page.getByRole('link', { name: 'Start the exercise' }).click();
  await page.getByRole('button', { name: 'Start', exact: true }).waitFor();
  await shot(page, '03-exercise-ready');
  await page.getByRole('button', { name: 'Start', exact: true }).click();
  await page.waitForTimeout(1300);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByText('Paused').waitFor();
  step('timer starts and pauses');
  await page.getByRole('button', { name: 'Finish now' }).click();
  await page.locator('input[type=file]').setInputFiles(photo);
  await page.getByRole('img', { name: 'Your page' }).waitFor();
  for (const box of await page.getByRole('checkbox').all()) await box.check();
  await shot(page, '04-exercise-finish');
  await page.getByRole('button', { name: 'Save', exact: true }).click();
  await page.getByText('so lesson 1 is done').waitFor();
  step('a page with every check held finishes the lesson');

  await page.getByRole('link', { name: 'Home' }).first().click();
  await page.getByText('Your last page').waitFor();
  await shot(page, '05-home-after-lesson-1');
  step('home moves on and shows the last page');

  await page.getByRole('link', { name: 'Course', exact: true }).click();
  await page.getByRole('heading', { name: 'The course' }).waitFor();
  await shot(page, '06-course');
  step('course lists the parts');

  await page.getByRole('link', { name: 'Practise', exact: true }).click();
  await page.getByRole('heading', { name: 'Everything' }).waitFor();
  await page.getByRole('button', { name: 'Up to 5 min' }).click();
  await shot(page, '07-practice');
  step('practice library filters');

  await page.getByRole('link', { name: 'Drawings', exact: true }).click();
  await page.locator('.page-grid img').first().waitFor();
  await shot(page, '08-drawings');
  await page.locator('.page-grid a').first().click();
  await page.getByText('Held').first().waitFor();
  await shot(page, '09-drawing');
  step('drawings show the saved page and its checks');

  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Dark' }).check();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await shot(page, '10-settings-dark');
  await page.goto(`${server.url}/#/lesson/confident-lines`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'How' }).waitFor();
  await shot(page, '11-lesson-1-dark');
  step('dark theme applies');

  // Every written lesson and every practice item renders, in light.
  const content = JSON.parse(fs.readFileSync(path.join(root, 'dist', 'content.json'), 'utf8'));
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Light' }).check();
  for (const lesson of Object.values(content.lessons)) {
    await page.goto(`${server.url}/#/lesson/${lesson.slug}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: lesson.title, level: 1 }).waitFor();
    await shot(page, `lesson-${String(lesson.number).padStart(2, '0')}-${lesson.slug}`);
  }
  for (const item of Object.values(content.practice)) {
    await page.goto(`${server.url}/#/do/${item.id}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: item.title, level: 1 }).waitFor();
    await page.screenshot({ path: path.join(out, `practice-${item.id}.png`) });
  }
  step('every written lesson and practice item renders');

  await page.goto(`${server.url}/#/free/3`, { waitUntil: 'networkidle' });
  await page.locator('.reference-prompt').waitFor();
  await shot(page, '12-free-drawing');
  step('a free drawing prompt opens');
  await context.close();

  // Narrow windows.
  for (const scheme of ['light', 'dark']) {
    const narrow = await open(390, scheme);
    await narrow.page.goto(`${server.url}/`, { waitUntil: 'networkidle' });
    await narrow.page.getByRole('heading', { name: 'Confident lines' }).waitFor();
    await shot(narrow.page, `13-narrow-home-${scheme}`);
    await narrow.page.goto(`${server.url}/#/lesson/confident-lines`, { waitUntil: 'networkidle' });
    await narrow.page.getByRole('heading', { name: 'How' }).waitFor();
    await shot(narrow.page, `14-narrow-lesson-${scheme}`);
    await narrow.page.goto(`${server.url}/#/do/ghosted-lines-page`, { waitUntil: 'networkidle' });
    await shot(narrow.page, `15-narrow-exercise-${scheme}`);
    await narrow.context.close();
  }
  step('narrow windows render in both themes');
} catch (error) {
  problems.push(`flow stopped: ${error.message.split('\n')[0]}`);
} finally {
  await browser.close();
  await server.close();
}

console.log(`\nScreenshots in ${path.relative(process.cwd(), out) || out}`);
if (problems.length) {
  console.error(problems.map((line) => `problem: ${line}`).join('\n'));
  process.exit(1);
}
console.log('No console errors, page errors or content-policy violations.');
