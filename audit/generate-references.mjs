import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { walkFiles, readTextSafe, uniq } from './common.mjs';

const files = await walkFiles(process.cwd());
const scanFiles = files.filter((f) => /\.(html|css|js|mjs|cjs)$/i.test(f));

const hrefRe = /\bhref\s*=\s*['\"]([^'\"#][^'\"]*)['\"]/gi;
const srcRe = /\bsrc\s*=\s*['\"]([^'\"#][^'\"]*)['\"]/gi;
const actionRe = /\baction\s*=\s*['\"]([^'\"]*)['\"]/gi;
const urlRe = /url\(\s*['\"]?([^)'\"]+)['\"]?\s*\)/gi;
const fetchRe = /\bfetch\(\s*['\"]([^'\"]+)['\"]/gi;
const methodRe = /\bmethod\s*=\s*['\"](get|post)['\"]/gi;

const refs = [];

for (const file of scanFiles) {
  const text = await readTextSafe(file);
  if (!text) continue;

  const matchPush = (regex, kind) => {
    let m;
    while ((m = regex.exec(text)) !== null) {
      refs.push({ file, kind, target: m[1].trim() });
    }
  };

  matchPush(hrefRe, 'href');
  matchPush(srcRe, 'src');
  matchPush(urlRe, 'url');
  matchPush(fetchRe, 'fetch');
  matchPush(actionRe, 'form-action');

  if (file.endsWith('.html')) {
    let m;
    while ((m = methodRe.exec(text)) !== null) {
      refs.push({ file, kind: 'form-method', target: m[1].toUpperCase() });
    }
  }
}

const endpoints = uniq(
  refs
    .filter((r) => ['fetch', 'form-action', 'href', 'src'].includes(r.kind))
    .map((r) => r.target)
).sort();

await writeFile(path.join(process.cwd(), 'audit/references.json'), `${JSON.stringify({ totals: { filesScanned: scanFiles.length, references: refs.length }, references: refs, uniqueTargets: endpoints }, null, 2)}\n`);
console.log(`Wrote audit/references.json (${refs.length} references)`);
