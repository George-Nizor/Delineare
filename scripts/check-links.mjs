// Checks that every resource link still answers. Run weekly in CI (linkcheck.yml), which opens an
// issue when one fails; nothing about checking ever shows in the app.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const resources = YAML.parse(fs.readFileSync(path.join(root, 'content', 'resources.yaml'), 'utf8')) || [];
const agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';

async function status(url, method) {
  const response = await fetch(url, { method, redirect: 'follow', headers: { 'user-agent': agent }, signal: AbortSignal.timeout(20000) });
  return response.status;
}

const failures = [];
for (const resource of resources) {
  const urls = [resource.url, resource.youtube ? `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${resource.youtube}&format=json` : null].filter(Boolean);
  for (const url of urls) {
    let code = 0;
    try {
      code = await status(url, 'HEAD');
      if (code === 405 || code === 403) code = await status(url, 'GET');
    } catch (error) {
      code = `failed (${error.cause?.code || error.name})`;
    }
    const ok = typeof code === 'number' && code < 400;
    console.log(`${ok ? 'ok  ' : 'FAIL'} ${code} ${resource.id} ${url}`);
    if (!ok) failures.push(`${resource.id}: ${url} answered ${code}`);
  }
}
if (failures.length) {
  fs.writeFileSync(path.join(root, 'link-report.md'), `Links that failed on ${new Date().toISOString().slice(0, 10)}:\n\n${failures.map((line) => `- ${line}`).join('\n')}\n`);
  process.exit(1);
}
