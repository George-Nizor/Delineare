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
  // Sections fade in as they scroll into view; a full-page capture never scrolls, so show them all.
  await page.evaluate(() => document.querySelectorAll('.reveal').forEach((el) => el.classList.add('shown')));
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(out, `${name}.png`), fullPage: true });
}

// The opening animation plays on the first load in each window.
async function waitForSplash(page) {
  await page.locator('.splash').waitFor({ state: 'detached', timeout: 8000 });
}

const steps = [];
const step = (text) => { steps.push(text); console.log(`  ${text}`); };

try {
  // A learner's first run, wide and light.
  const { context, page } = await open(1440, 'light');
  await page.goto(`${server.url}/`, { waitUntil: 'domcontentloaded' });
  await page.locator('.splash').waitFor();
  await page.waitForTimeout(1100);
  await page.screenshot({ path: path.join(out, '00-splash.png') });
  await waitForSplash(page);
  step('the opening animation plays and gets out of the way');

  await page.getByRole('heading', { name: 'Welcome to Delineare' }).waitFor();
  await shot(page, '01-welcome');
  step('the first open explains the app');

  await page.getByRole('link', { name: 'Start lesson 1' }).first().click();
  await page.getByRole('heading', { name: 'Lesson 1: Lines', level: 1 }).waitFor();
  await shot(page, '02-lesson-1');
  step('lesson 1 shows its format');

  await page.getByRole('button', { name: 'Hide the steps' }).click();
  await page.getByText('Plan · Ghost · Draw · Leave it').waitFor();
  await page.getByRole('button', { name: 'Show the steps' }).click();
  step('steps hide and show');

  // A lesson video loads as a credentialless frame, or Delineare's isolation leaves it blank.
  await page.locator('.video-poster').click();
  const frame = await page.locator('.video iframe').evaluate((el) => ({ credentialless: el.hasAttribute('credentialless'), src: el.getAttribute('src') }));
  if (!frame.credentialless || !frame.src?.startsWith('https://www.youtube-nocookie.com/embed/')) throw new Error(`the lesson video frame is not set up to play: ${JSON.stringify(frame)}`);
  step('a lesson video frame is credentialless');

  await page.getByRole('link', { name: 'Start the exercise' }).click();
  await page.getByRole('button', { name: 'Start the timer' }).waitFor();
  await shot(page, '03-exercise-ready');
  await page.getByRole('button', { name: 'Start the timer' }).click();
  await page.waitForTimeout(1300);
  await page.getByRole('button', { name: 'Pause' }).click();
  await page.getByText('Paused').waitFor();
  step('timer starts and pauses');
  await page.getByRole('button', { name: "I've finished my page" }).click();
  await page.locator('input[type=file]').setInputFiles(photo);
  await page.getByRole('img', { name: 'Your page' }).waitFor();
  for (const box of await page.getByRole('checkbox').all()) await box.check();
  await shot(page, '04-exercise-finish');
  await page.getByRole('button', { name: 'Save to my sketchbook' }).click();
  await page.getByText('so lesson 1 is done').waitFor();
  await shot(page, '04b-exercise-saved');
  step('a page with every check held finishes the lesson');

  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.getByRole('heading', { name: 'Next: Lesson 2, Ellipses' }).waitFor();
  await page.getByText('Your last page').waitFor();
  await shot(page, '05-home-after-lesson-1');
  step('home moves on and shows the last page');

  await page.getByRole('link', { name: 'Course', exact: true }).click();
  await page.getByRole('heading', { name: 'Course', level: 1 }).waitFor();
  await shot(page, '06-course');
  step('course shows every lesson as a card');

  await page.getByRole('link', { name: 'Practice', exact: true }).click();
  await page.getByRole('heading', { name: 'Practice', level: 1 }).waitFor();
  await page.getByRole('button', { name: /Up to 5 min/ }).click();
  await page.getByText(/^Showing \d+ of \d+ exercises/).waitFor();
  await shot(page, '07-practice');
  step('practice library filters');

  await page.getByRole('link', { name: 'Library', exact: true }).click();
  await page.getByRole('heading', { name: 'Library', level: 1 }).waitFor();
  await shot(page, '08-library');
  step('library lists the resources');

  await page.getByRole('link', { name: 'Sketchbook', exact: true }).click();
  await page.locator('.page-grid img').first().waitFor();
  await shot(page, '09-sketchbook');
  await page.locator('.page-grid a').first().click();
  await page.getByText('Held').first().waitFor();
  await shot(page, '10-drawing');
  step('the sketchbook shows the saved page and its checks');

  await page.getByRole('searchbox', { name: 'Search' }).fill('ellipse');
  await page.getByRole('heading', { name: 'Search', level: 1 }).waitFor();
  await shot(page, '11-search');
  step('search finds lessons, exercises and resources');

  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Dark' }).check();
  await page.waitForFunction(() => document.documentElement.dataset.theme === 'dark');
  await shot(page, '12-settings-dark');
  await page.goto(`${server.url}/#/lesson/confident-lines`, { waitUntil: 'networkidle' });
  await page.getByRole('heading', { name: 'Lesson 1: Lines', level: 1 }).waitFor();
  await shot(page, '13-lesson-1-dark');
  await page.goto(`${server.url}/#/course`, { waitUntil: 'networkidle' });
  await shot(page, '14-course-dark');
  step('dark theme applies');

  // Every written lesson and every practice item renders, in light.
  const content = JSON.parse(fs.readFileSync(path.join(root, 'dist', 'content.json'), 'utf8'));
  await page.getByRole('link', { name: 'Settings' }).click();
  await page.getByRole('radio', { name: 'Light' }).check();
  for (const lesson of Object.values(content.lessons)) {
    await page.goto(`${server.url}/#/lesson/${lesson.slug}`, { waitUntil: 'networkidle' });
    await page.getByRole('heading', { name: `Lesson ${lesson.number}: ${lesson.title}`, level: 1 }).waitFor();
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
  await shot(page, '15-free-drawing');
  step('a drawing prompt opens');
  await context.close();

  // Narrow windows.
  for (const scheme of ['light', 'dark']) {
    const narrow = await open(390, scheme);
    await narrow.page.goto(`${server.url}/`, { waitUntil: 'networkidle' });
    await waitForSplash(narrow.page);
    await narrow.page.getByRole('heading', { name: 'Welcome to Delineare' }).waitFor();
    await shot(narrow.page, `16-narrow-welcome-${scheme}`);
    await narrow.page.goto(`${server.url}/#/lesson/confident-lines`, { waitUntil: 'networkidle' });
    await narrow.page.getByRole('heading', { name: 'Lesson 1: Lines', level: 1 }).waitFor();
    await shot(narrow.page, `17-narrow-lesson-${scheme}`);
    await narrow.page.goto(`${server.url}/#/course`, { waitUntil: 'networkidle' });
    await shot(narrow.page, `18-narrow-course-${scheme}`);
    await narrow.page.goto(`${server.url}/#/do/ghosted-lines-page`, { waitUntil: 'networkidle' });
    await shot(narrow.page, `19-narrow-exercise-${scheme}`);
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
