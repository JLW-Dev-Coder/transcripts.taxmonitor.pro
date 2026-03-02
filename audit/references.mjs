#!/usr/bin/env node
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const distRoot = path.join(root, 'dist');

const SOURCE_EXT = /\.(html|css|js|mjs)$/i;

async function exists(p) {
  try { await stat(p); return true; } catch { return false; }
}

async function walk(dir, skipDist = true) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const e of entries) {
    if (e.name === '.git' || e.name === 'node_modules') continue;
    if (skipDist && e.name === 'dist') continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(full, skipDist));
    else out.push(full);
  }
  return out;
}

function rel(p, base) { return path.relative(base, p).split(path.sep).join('/'); }

function extractRefs(text) {
  const refs = [];
  const attrRegex = /(src|href)=(["'])(.*?)\2/g;
  const cssUrlRegex = /url\((['"]?)(.*?)\1\)/g;
  let m;
  while ((m = attrRegex.exec(text)) !== null) refs.push(m[3]);
  while ((m = cssUrlRegex.exec(text)) !== null) refs.push(m[2]);
  return refs;
}

function isLocalRef(ref) {
  if (!ref) return false;
  if (ref.startsWith('#') || ref.startsWith('mailto:') || ref.startsWith('tel:')) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(ref)) return false;
  if (ref.startsWith('//')) return false;
  if (ref.includes('${') || ref.includes("' +") || ref.includes('+ \"')) return false;
  return true;
}

function normalizeRef(ref) {
  return ref.split('#')[0].split('?')[0];
}

function resolveFromFile(baseFile, ref, projectRoot) {
  if (ref.startsWith('/')) return path.join(projectRoot, ref.slice(1));
  return path.resolve(path.dirname(baseFile), ref);
}

async function referenceExists(baseFile, ref, projectRoot) {
  const resolved = resolveFromFile(baseFile, ref, projectRoot);
  if (await exists(resolved)) return { ok: true, resolved };

  if (!path.extname(resolved)) {
    const asHtml = `${resolved}.html`;
    if (await exists(asHtml)) return { ok: true, resolved: asHtml };

    const asIndex = path.join(resolved, 'index.html');
    if (await exists(asIndex)) return { ok: true, resolved: asIndex };
  }

  return { ok: false, resolved };
}

const srcFiles = (await walk(root, true)).filter((f) => SOURCE_EXT.test(f));
const missingInSource = [];

for (const file of srcFiles) {
  const text = await readFile(file, 'utf8');
  for (const rawRef of extractRefs(text)) {
    if (!isLocalRef(rawRef)) continue;
    const ref = normalizeRef(rawRef);
    if (!ref) continue;
    const check = await referenceExists(file, ref, root);
    if (!check.ok) {
      missingInSource.push({ file: rel(file, root), ref: rawRef, resolved: rel(check.resolved, root) });
    }
  }
}

const missingInDist = [];
if (await exists(distRoot)) {
  const distFiles = (await walk(distRoot, false)).filter((f) => SOURCE_EXT.test(f));
  for (const file of distFiles) {
    const text = await readFile(file, 'utf8');
    for (const rawRef of extractRefs(text)) {
      if (!isLocalRef(rawRef)) continue;
      const ref = normalizeRef(rawRef);
      if (!ref) continue;
      const check = await referenceExists(file, ref, distRoot);
      if (!check.ok) {
        missingInDist.push({ file: rel(file, distRoot), ref: rawRef, resolved: rel(check.resolved, distRoot) });
      }
    }
  }
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  checkedSourceFiles: srcFiles.length,
  missingInSource,
  checkedDist: await exists(distRoot),
  missingInDist,
}, null, 2));
