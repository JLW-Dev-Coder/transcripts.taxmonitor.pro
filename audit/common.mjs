import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

export const REPO_ROOT = process.cwd();

export async function walkFiles(dir, base = dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.name === '.git' || entry.name === 'dist') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full, base)));
    } else {
      files.push(path.relative(base, full).replaceAll('\\', '/'));
    }
  }
  return files.sort();
}

export function fileType(relPath) {
  const ext = path.extname(relPath).toLowerCase();
  if (ext === '.html') return 'html';
  if (ext === '.js' || ext === '.mjs' || ext === '.cjs') return 'script';
  if (ext === '.css') return 'style';
  if (ext === '.json') return 'json';
  if (ext === '.xml') return 'xml';
  if (ext === '.svg' || ext === '.png' || ext === '.jpg' || ext === '.jpeg' || ext === '.ico' || ext === '.webp') return 'asset';
  return ext ? ext.slice(1) : 'unknown';
}

export async function readTextSafe(relPath) {
  try {
    return await readFile(path.join(REPO_ROOT, relPath), 'utf8');
  } catch {
    return null;
  }
}

export async function getFileSize(relPath) {
  const s = await stat(path.join(REPO_ROOT, relPath));
  return s.size;
}

export function toRoute(relPath) {
  if (!relPath.endsWith('.html')) return null;
  let route = `/${relPath.replace(/index\.html$/, '').replace(/\.html$/, '')}`;
  route = route.replace(/\/+/g, '/');
  if (route.endsWith('/') && route !== '/') route = route.slice(0, -1);
  return route || '/';
}

export function uniq(arr) {
  return [...new Set(arr)];
}
