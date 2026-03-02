import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { walkFiles, toRoute } from './common.mjs';

const allFiles = await walkFiles(process.cwd());
const html = allFiles.filter((f) => f.endsWith('.html'));
const pages = html.map((file) => ({
  path: file,
  route: toRoute(file),
  inImpliedScope: /^site\//.test(file) || /^app\//.test(file) || /^app\/pages\//.test(file),
}));

const scoped = pages.filter((p) => p.inImpliedScope);
const out = {
  totals: { htmlPages: pages.length, impliedScopePages: scoped.length },
  pages,
  impliedScopePages: scoped,
};

await writeFile(path.join(process.cwd(), 'audit/pages.json'), `${JSON.stringify(out, null, 2)}\n`);
console.log(`Wrote audit/pages.json (${pages.length} html pages)`);
