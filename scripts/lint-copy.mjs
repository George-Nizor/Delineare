// Holds the interface's own words to the same rules as the lessons: every piece of JSX text and
// every string literal that reads as prose in src/, plus the page description in index.html.
// Content is checked by build-content.mjs.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { lintProse } from './copy-rules.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = [];
const walk = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (/\.tsx?$/.test(entry.name) && !full.includes(`${path.sep}brand${path.sep}`)) files.push(full);
  }
};
walk(path.join(root, 'src'));

const errors = [];
const warnings = [];
const check = (file, line, text) => {
  for (const finding of lintProse(text)) {
    const message = `${path.relative(root, file)}:${line}: ${finding.rule} ("${finding.match}"). ${finding.why}`;
    (finding.level === 'error' ? errors : warnings).push(message);
  }
};

for (const file of files) {
  const source = fs.readFileSync(file, 'utf8');
  const lineOf = (index) => source.slice(0, index).split('\n').length;
  // Text between JSX tags.
  for (const match of source.matchAll(/>([^<>{}]*[A-Za-z][^<>{}]*)</g)) {
    const text = match[1].trim();
    if (text.includes(' ') && !/[=;]|=>|\bconst\b/.test(text)) check(file, lineOf(match.index), text);
  }
  // String and template literals that look like sentences: a capital or lower-case word, a space,
  // and no code punctuation. Comments are skipped.
  const code = source.replace(/\/\/[^\n]*|\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));
  for (const match of code.matchAll(/(['`])((?:[^'`\\\n]|\\.)*?)\1/g)) {
    const text = match[2];
    if (/^[A-Za-z][^{}<>=;|&]*\s[^{}<>=;|&]*$/.test(text) && !/^[a-z-]+( [a-z-]+)*$/.test(text)) check(file, lineOf(match.index), text);
  }
}

const description = fs.readFileSync(path.join(root, 'index.html'), 'utf8').match(/name="description" content="([^"]+)"/)?.[1] ?? '';
check(path.join(root, 'index.html'), 1, description);

for (const line of warnings) console.warn(`warning  ${line}`);
for (const line of errors) console.error(`error    ${line}`);
if (errors.length) process.exit(1);
console.log(`Interface copy: ${files.length} files checked, no errors.`);
