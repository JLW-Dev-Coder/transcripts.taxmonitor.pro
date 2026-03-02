#!/usr/bin/env node
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distRoot = path.join(root, 'dist');

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else out.push(full);
  }
  return out;
}

async function walkDist(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walkDist(full));
    else out.push(full);
  }
  return out;
}

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

function rel(p, base) {
  return path.relative(base, p).split(path.sep).join('/');
}

const srcFiles = await walk(root);
const srcHtml = srcFiles.filter((f) => f.endsWith('.html')).map((f) => rel(f, root)).sort();
const srcAssets = srcFiles.filter((f) => /\.(css|js|mjs|png|jpg|jpeg|gif|svg|webp|ico|woff2?|ttf|pdf)$/i.test(f)).map((f) => rel(f, root)).sort();

let distFiles = [];
if (await exists(distRoot)) {
  distFiles = await walkDist(distRoot);
}
const distHtml = distFiles.filter((f) => f.endsWith('.html')).map((f) => rel(f, distRoot)).sort();

const report = {
  generatedAt: new Date().toISOString(),
  source: {
    htmlCount: srcHtml.length,
    htmlFiles: srcHtml,
    assetCount: srcAssets.length,
  },
  dist: {
    exists: await exists(distRoot),
    htmlCount: distHtml.length,
    htmlFiles: distHtml,
  },
};

console.log(JSON.stringify(report, null, 2));
