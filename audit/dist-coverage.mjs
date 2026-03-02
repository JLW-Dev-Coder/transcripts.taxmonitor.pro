#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distRoot = path.join(root, 'dist');

const requiredDirs = ['assets', 'legal', 'magnets', 'scripts', 'styles', '_sdk'];
const requiredFiles = ['_redirects'];

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function walk(dir, skip = new Set()) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (skip.has(e.name)) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, skip));
    else out.push(full);
  }
  return out;
}

function rel(p, base) { return path.relative(base, p).split(path.sep).join('/'); }

const srcHtml = (await walk(root, new Set(['.git', 'node_modules', 'dist']))).filter((f) => f.endsWith('.html')).map((f) => rel(f, root)).sort();
const distExists = await exists(distRoot);
const distHtml = distExists ? (await walk(distRoot)).filter((f) => f.endsWith('.html')).map((f) => rel(f, distRoot)).sort() : [];

const missingHtmlInDist = srcHtml.filter((f) => !distHtml.includes(f));

const directoryChecks = [];
for (const dir of requiredDirs) {
  const src = await exists(path.join(root, dir));
  const dist = await exists(path.join(distRoot, dir));
  directoryChecks.push({ dir, presentInSource: src, presentInDist: dist, ok: !src || dist });
}

const fileChecks = [];
for (const file of requiredFiles) {
  const src = await exists(path.join(root, file));
  const dist = await exists(path.join(distRoot, file));
  fileChecks.push({ file, presentInSource: src, presentInDist: dist, ok: !src || dist });
}

let redirects = '';
let redirectWarnings = [];
if (await exists(path.join(root, '_redirects'))) {
  redirects = await readFile(path.join(root, '_redirects'), 'utf8');
  const lines = redirects.split(/\r?\n/).map((l) => l.trim()).filter(Boolean).filter((l) => !l.startsWith('#'));
  const catchAll = lines.find((l) => l.startsWith('/* '));
  if (catchAll) {
    const parts = catchAll.split(/\s+/);
    const target = parts[1] || '';
    if (!target.startsWith('/index.html') && !target.startsWith('/index')) {
      redirectWarnings.push(`Catch-all route points to ${target}; verify static routes still win.`);
    }
  }
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  distExists,
  html: {
    sourceCount: srcHtml.length,
    distCount: distHtml.length,
    missingHtmlInDist,
  },
  directoryChecks,
  fileChecks,
  redirectWarnings,
}, null, 2));
