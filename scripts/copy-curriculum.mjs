// The curriculum is fetched at start from the build's own folder, so the launcher's audit can see
// it, the bundle stays small, and it works offline. curriculum/build_v2.py writes the source copy.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'src', 'data', 'curriculum.json');
if (!fs.existsSync(source)) throw new Error('src/data/curriculum.json is missing; run npm run curriculum.');
fs.mkdirSync(path.join(root, 'public'), { recursive: true });
fs.copyFileSync(source, path.join(root, 'public', 'curriculum.json'));
