// build.mjs (repo-root)
// Purpose: build dist/ for Cloudflare Pages by injecting /partials/*.html
// into ALL HTML files (root + copied folders) and copying static folders into dist/.

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
  "resources",
  "scripts",
  "styles",
].sort();

// Copy these root files into dist/ (alphabetical)
const COPY_FILES = ["_redirects", "sitemap.xml"].sort();

async function exists(p) {
  try {
    await stat(p);
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
  let m = null;

  while ((m = re.exec(html)) !== null) {
    if (m[1]) names.add(m[1]);
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
    const p = path.join(PARTIALS_DIR, `${name}.html`);
    if (!(await existsReadable(p))) {
      throw new Error(`Missing partial file for marker "${name}": ${p}`);
    }
    partialMap[name] = await readFile(p, "utf8");
  }

  return partialMap;
}

/*
  Recursively walk directory
*/
async function walk(dir) {
  const out = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...await walk(fullPath));
    } else {
      out.push(fullPath);
    }
  }

  return out;
}

/*
  Inject partials into a single HTML file
*/
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

/*
  Inject partials into ALL HTML files inside dist/
*/
async function injectPartialsIntoDistHtml() {
  const files = (await walk(DIST))
    .filter((p) => p.toLowerCase().endsWith(".html"))
    .sort();

  for (const file of files) {
    await injectPartialsIntoHtmlFile(file);
  }
}

async function buildRootHtmlFiles() {
  const rootFiles = (await readdir(__dirname))
    .filter((f) => f.endsWith(".html"))
    .sort();

  for (const file of rootFiles) {
    const src = path.join(__dirname, file);
    const dst = path.join(DIST, file);

    const html = await readFile(src, "utf8");
    await writeFile(dst, html, "utf8");
  }
}

async function main() {
  // Clean dist
  await rm(DIST, { force: true, recursive: true });
  await mkdir(DIST, { recursive: true });

  // Validate partials dir
  if (!(await exists(PARTIALS_DIR))) {
    throw new Error("Missing /partials directory at repo root.");
  }

  // Copy root HTML files (without injecting yet)
  await buildRootHtmlFiles();

  // Copy folders (if they exist)
  for (const dir of COPY_DIRS) {
    const src = path.join(__dirname, dir);
    const dst = path.join(DIST, dir);

    if (!(await exists(src))) continue;
    await cp(src, dst, { recursive: true });
  }

  /**
   * Hard guard: ensure _sdk copies correctly
   * Why: /_sdk/data_sdk.js is a required runtime dependency for site pages.
   */
  {
    const sdkSrc = path.join(__dirname, "_sdk");
    const sdkDst = path.join(DIST, "_sdk");

    if (await exists(sdkSrc)) {
      // Re-copy explicitly to avoid any silent skip in the directory loop.
      await cp(sdkSrc, sdkDst, { recursive: true });

      const required = path.join(sdkDst, "data_sdk.js");
      if (!(await exists(required))) {
        throw new Error(
          `Build output missing required file: ${required}\n` +
            `Ensure _sdk/data_sdk.js exists in repo and is copied into dist/_sdk/.`
        );
      }
    }
  }

  // Copy root files (if they exist)
  for (const file of COPY_FILES) {
    const src = path.join(__dirname, file);
    const dst = path.join(DIST, file);

    if (!(await exists(src))) continue;
    await cp(src, dst);
  }

  // Inject partials into ALL dist HTML files
  await injectPartialsIntoDistHtml();

  // Optional logging
  try {
    const partialFiles = (await readdir(PARTIALS_DIR))
      .filter((f) => f.endsWith(".html"))
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