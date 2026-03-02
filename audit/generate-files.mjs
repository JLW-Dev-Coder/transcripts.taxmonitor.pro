import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { walkFiles, getFileSize, fileType } from './common.mjs';

const files = await walkFiles(process.cwd());
const inventory = [];
for (const rel of files) {
  inventory.push({ path: rel, type: fileType(rel), size: await getFileSize(rel) });
}
await writeFile(path.join(process.cwd(), 'audit/files.json'), `${JSON.stringify(inventory, null, 2)}\n`);
console.log(`Wrote audit/files.json (${inventory.length} files)`);
