import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { walkFiles, readTextSafe } from './common.mjs';

const allFiles = await walkFiles(process.cwd());
const contractFiles = allFiles.filter((f) => /^app\/contracts\//.test(f));
const endpointRe = /https?:\/\/[^'\"\s)]+|\/(api|forms)\/[A-Za-z0-9_\-/.]+/g;

const inventory = [];
for (const file of contractFiles) {
  const text = await readTextSafe(file);
  const endpoints = text ? [...new Set((text.match(endpointRe) || []))].sort() : [];
  const kind = file.includes('/forms/') ? 'forms' : file.includes('/webhooks/') ? 'webhooks' : file.includes('/registries/') ? 'registries' : 'other';
  inventory.push({ file, kind, endpoints });
}

const grouped = {
  forms: inventory.filter((i) => i.kind === 'forms'),
  webhooks: inventory.filter((i) => i.kind === 'webhooks'),
  registries: inventory.filter((i) => i.kind === 'registries'),
  other: inventory.filter((i) => i.kind === 'other'),
};

await writeFile(path.join(process.cwd(), 'audit/contracts.json'), `${JSON.stringify({ totals: { files: contractFiles.length }, inventory, grouped }, null, 2)}\n`);
console.log(`Wrote audit/contracts.json (${contractFiles.length} contract files)`);
