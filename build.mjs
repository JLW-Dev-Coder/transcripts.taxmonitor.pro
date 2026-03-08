// build.mjs (repo-root)
// Purpose: build dist/ for Cloudflare Pages by:
// 1. copying static folders into dist/
// 2. copying /partials into dist/ so runtime fetch("/partials/*.html") works
// 3. injecting <!-- PARTIAL:name --> markers into HTML files in dist/

import { cp, mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST = path.join(__dirname, "dist");
const PARTIALS_DIR = path.join(__dirname, "partials");

// Copy these folders into dist/ (alphabetical)
const COPY_DIRS = [
  "_sdk",
  "assets",
  "legal",
  "magnets",
  "partials",
  "resources",
  "scripts",
  "styles",
].sort();

// Copy these root files into dist/ (alphabetical)
const COPY_FILES = ["_redirects", "sitemap.xml"].sort();

async function exists(targetPath) {
  try {
    await stat(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function existsReadable(filePath) {
  try {
    await readFile(filePath, "utf8");
    return true;
  } catch {
    return false;
  }
}

function extractPartialNames(html) {
  const re = /<!--\s*PARTIAL:([A-Za-z0-9_-]+)\s*-->/g;
  const names = new Set();
  let match = null;

  while ((match = re.exec(html)) !== null) {
    if (match[1]) names.add(match[1]);
  }

  return Array.from(names).sort();
}

function injectNamedPartials(html, partialMap) {
  let out = html;

  for (const name of Object.keys(partialMap).sort()) {
    const markerRe = new RegExp(`<!--\\s*PARTIAL:${name}\\s*-->`, "g");
    out = out.replace(markerRe, partialMap[name]);
  }

  return out;
}

async function loadPartialMapFromMarkers(markers) {
  const partialMap = {};

  for (const name of markers) {
    const partialPath = path.join(PARTIALS_DIR, `${name}.html`);

    if (!(await existsReadable(partialPath))) {
      throw new Error(`Missing partial file for marker "${name}": ${partialPath}`);
    }

    partialMap[name] = await readFile(partialPath, "utf8");
  }

  return partialMap;
}

async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      out.push(...(await walk(fullPath)));
    } else {
      out.push(fullPath);
    }
  }

  return out;
}

async function injectPartialsIntoHtmlFile(filePath) {
  const html = await readFile(filePath, "utf8");
  const markers = extractPartialNames(html);

  if (!markers.length) return;

  const partialMap = await loadPartialMapFromMarkers(markers);
  const built = injectNamedPartials(html, partialMap);

  if (built !== html) {
    await writeFile(filePath, built, "utf8");
  }
}

async function injectPartialsIntoDistHtml() {
  const files = (await walk(DIST))
    .filter((targetPath) => targetPath.toLowerCase().endsWith(".html"))
    .sort();

  for (const file of files) {
    await injectPartialsIntoHtmlFile(file);
  }
}

async function buildRootHtmlFiles() {
  const rootFiles = (await readdir(__dirname))
    .filter((file) => file.toLowerCase().endsWith(".html"))
    .sort();

  for (const file of rootFiles) {
    const src = path.join(__dirname, file);
    const dst = path.join(DIST, file);
    const html = await readFile(src, "utf8");
    await writeFile(dst, html, "utf8");
  }
}

async function copyRootFiles() {
  for (const file of COPY_FILES) {
    const src = path.join(__dirname, file);
    const dst = path.join(DIST, file);

    if (!(await exists(src))) continue;
    await cp(src, dst);
  }
}

async function copyStaticDirs() {
  for (const dir of COPY_DIRS) {
    const src = path.join(__dirname, dir);
    const dst = path.join(DIST, dir);

    if (!(await exists(src))) continue;
    await cp(src, dst, { recursive: true });
  }
}

async function ensureSdkCopied() {
  const sdkSrc = path.join(__dirname, "_sdk");
  const sdkDst = path.join(DIST, "_sdk");

  if (!(await exists(sdkSrc))) return;

  await cp(sdkSrc, sdkDst, { recursive: true });

  const required = path.join(sdkDst, "data_sdk.js");
  if (!(await exists(required))) {
    throw new Error(
      `Build output missing required file: ${required}\n` +
      `Ensure _sdk/data_sdk.js exists in repo and is copied into dist/_sdk/.`
    );
  }
}

async function ensurePartialsCopied() {
  const partialsSrc = PARTIALS_DIR;
  const partialsDst = path.join(DIST, "partials");

  if (!(await exists(partialsSrc))) {
    throw new Error("Missing /partials directory at repo root.");
  }

  await cp(partialsSrc, partialsDst, { recursive: true });
}

async function main() {
  await rm(DIST, { force: true, recursive: true });
  await mkdir(DIST, { recursive: true });

  if (!(await exists(PARTIALS_DIR))) {
    throw new Error("Missing /partials directory at repo root.");
  }

  await buildRootHtmlFiles();
  await copyStaticDirs();
  await ensurePartialsCopied();
  await ensureSdkCopied();
  await copyRootFiles();
  await injectPartialsIntoDistHtml();

  try {
    const partialFiles = (await readdir(PARTIALS_DIR))
      .filter((file) => file.toLowerCase().endsWith(".html"))
      .sort();

    console.log("Partials available:", partialFiles.join(", "));
  } catch {
    // ignore
  }

  console.log("Build complete → dist/");
}

main().catch((err) => {
  console.error(err?.stack || err);
  process.exit(1);
});
