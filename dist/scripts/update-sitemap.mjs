import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASE_URL = "https://transcript.taxmonitor.pro";

const INCLUDE_DIRS = [
  ".",          // root html: index.html, contact.html, etc.
  "assets",     // report-preview.html etc (optional but useful)
  "legal",
  "magnets",
  "resources",
];

const EXCLUDE_FILES = new Set([
  "_redirects",
  "README.md",
  "MARKET.md",
]);

function isHtmlFile(name) {
  return /\.html$/i.test(name);
}

function toPosix(p) {
  return p.split(path.sep).join("/");
}

function listHtmlFilesInDir(dirRel) {
  const abs = path.join(ROOT, dirRel);
  if (!fs.existsSync(abs)) return [];

  const entries = fs.readdirSync(abs, { withFileTypes: true });
  const out = [];

  for (const e of entries) {
    if (!e.isFile()) continue;
    if (EXCLUDE_FILES.has(e.name)) continue;
    if (!isHtmlFile(e.name)) continue;

    const relPath = dirRel === "." ? e.name : toPosix(path.join(dirRel, e.name));
    out.push(relPath);
  }

  return out;
}

function sortPathsAsc(a, b) {
  // Alphabetical sort, case-insensitive, stable enough for sitemap.
  return a.localeCompare(b, "en", { sensitivity: "base" });
}

function pathToUrl(relPath) {
  // Root: index.html should be /
  if (relPath === "index.html") return `${BASE_URL}/`;

  // Root: other html becomes /name.html
  if (!relPath.includes("/")) return `${BASE_URL}/${relPath}`;

  return `${BASE_URL}/${relPath}`;
}

function buildSitemap(urls) {
  const lines = [];
  lines.push(`<?xml version="1.0" encoding="UTF-8"?>`);
  lines.push(`<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`);

  for (const u of urls) {
    lines.push(`  <url>`);
    lines.push(`    <loc>${u}</loc>`);
    lines.push(`  </url>`);
  }

  lines.push(`</urlset>`);
  lines.push("");
  return lines.join("\n");
}

function main() {
  let paths = [];
  for (const d of INCLUDE_DIRS) {
    paths = paths.concat(listHtmlFilesInDir(d));
  }

  // De-dupe, sort, map to URLs
  const uniq = [...new Set(paths)].sort(sortPathsAsc);
  const urls = uniq.map(pathToUrl);

  const xml = buildSitemap(urls);
  const outPath = path.join(ROOT, "sitemap.xml");
  fs.writeFileSync(outPath, xml, "utf8");

  console.log(`Updated: ${outPath}`);
  console.log(`URLs total: ${urls.length}`);
}

main();