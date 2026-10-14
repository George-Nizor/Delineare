// Renders lesson diagrams onto one sheet, in light and dark, for a person to look over while
// drawing them. Writes test-results/diagrams-light.png and test-results/diagrams-dark.png.
//
//   npm run content && npm run diagrams     every diagram in public/content.json
//   npm run diagrams -- 06-gesture          one lesson folder, straight from its diagrams/*.mjs,
//                                           so it works while other lessons are half written
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { chromium } from 'playwright';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const only = process.argv[2] || '';
const css = fs.readFileSync(path.join(root, 'src', 'styles', 'app.css'), 'utf8');
let diagrams;
const folder = only && path.join(root, 'content', 'lessons', only, 'diagrams');
if (folder && fs.existsSync(folder)) {
  const lib = await import(pathToFileURL(path.join(root, 'content', 'diagrams', 'lib.mjs')).href);
  diagrams = [];
  for (const file of fs.readdirSync(folder).filter((name) => name.endsWith('.mjs')).sort()) {
    const module = await import(`${pathToFileURL(path.join(folder, file)).href}?v=${Date.now()}`);
    // Shared helpers sit beside the diagrams; only a file whose default export draws is a diagram.
    if (typeof module.default !== 'function') continue;
    diagrams.push({ id: `${only}/${file.replace(/\.mjs$/, '')}`, svg: module.default(lib), alt: '' });
  }
} else {
  const content = JSON.parse(fs.readFileSync(path.join(root, 'public', 'content.json'), 'utf8'));
  diagrams = Object.values(content.diagrams).filter((d) => !only || d.id.startsWith(`${only}/`));
}
const cells = diagrams.map((d) => `<figure><div class="diagram-art">${d.svg}</div><figcaption><b>${d.id}</b> ${d.alt.replace(/</g, '&lt;')}</figcaption></figure>`).join('');
const out = path.join(root, 'test-results');
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const theme of ['light', 'dark']) {
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });
  await page.setContent(`<!doctype html><html data-theme="${theme}"><head><style>${css}
    body { padding: 24px; } main { display: grid; grid-template-columns: repeat(3, 1fr); gap: 24px; }
    figure { margin: 0; } figcaption { font-size: 12px; color: var(--muted); margin-top: 6px; }</style></head>
    <body><main>${cells}</main></body></html>`);
  await page.screenshot({ path: path.join(out, `diagrams-${theme}${only ? `-${only}` : ''}.png`), fullPage: true });
  await page.close();
}
await browser.close();
console.log(`${diagrams.length} diagrams on test-results/diagrams-*.png`);
