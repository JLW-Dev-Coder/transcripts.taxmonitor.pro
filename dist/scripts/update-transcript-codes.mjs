import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const RESOURCES_DIR = path.join(ROOT, "resources");
const TARGET_FILE = path.join(RESOURCES_DIR, "transcript-codes.html");

// Keep your existing “seed” entries exactly as-is.
// Anything not present in seed is generated from page HTML.
const seed = [
  { code: "150", category: "assessment", related: ["290", "570", "806"], summary: "Return filed and tax assessed." },
  { code: "290", category: "adjustments", related: ["150", "291", "420"], summary: "Additional tax assessed." },
  { code: "420", category: "adjustments", related: ["421", "424", "290"], summary: "Examination initiated." },
  { code: "424", category: "adjustments", related: ["420", "421", "290"], summary: "Examination request indicator." },
  { code: "570", category: "holds", related: ["150", "571", "971"], summary: "Additional account action pending (hold)." },
  { code: "571", category: "holds", related: ["150", "570", "846"], summary: "Resolved additional account action (hold released)." },
  { code: "670", category: "payments", related: ["150", "700", "706"], summary: "Payment made and credited." },
  { code: "766", category: "credits", related: ["768", "806", "846"], summary: "Credit to your account." },
  { code: "806", category: "credits", related: ["150", "766", "846"], summary: "Credit for withheld taxes and excess FICA." },
  { code: "846", category: "credits", related: ["150", "766", "806"], summary: "Refund issued." },
  { code: "971", category: "notices", related: ["290", "570", "810"], summary: "Notice issued (IRS correspondence)." },
];

function readUtf8(p) {
  return fs.readFileSync(p, "utf8");
}

function listResourcePages() {
  const files = fs.readdirSync(RESOURCES_DIR, { withFileTypes: true })
    .filter(d => d.isFile())
    .map(d => d.name);

  // Include irs-code-###-meaning and irs-code-971-ac-065-meaning
  return files.filter(f =>
    /^irs-code-\d{3}-meaning\.html$/i.test(f) ||
    /^irs-code-971-ac-065-meaning\.html$/i.test(f)
  );
}

function extractMetaDescription(html) {
  const m = html.match(/<meta[^>]*name=["']description["'][^>]*>/i);
  if (!m) return "";
  const content = m[0].match(/content=["']([^"']+)["']/i);
  return content ? decodeHtml(content[1]).trim() : "";
}

function extractRelatedCodes(html) {
  const hrefs = [...html.matchAll(/href\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  const codes = [];
  for (const h of hrefs) {
    const m1 = h.match(/\/resources\/irs-code-(\d{3})-meaning\.html/i);
    if (m1) codes.push(m1[1]);
    const m2 = h.match(/\/resources\/irs-code-971-ac-065-meaning\.html/i);
    if (m2) codes.push("971-AC-065");
  }
  return [...new Set(codes)];
}

function firstSentence(desc) {
  const s = desc.replace(/\s+/g, " ").trim();
  const m = s.match(/^(.+?\.)\s/);
  return (m ? m[1] : s).trim();
}

function decodeHtml(s) {
  return s
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", "\"")
    .replaceAll("&#39;", "'");
}

function categorize(desc) {
  const d = (desc || "").toLowerCase();

  const hasAny = (arr) => arr.some(k => d.includes(k));

  if (hasAny(["refund", "credit", "withheld", "earned income", "additional child", "stimulus"])) return "credits";
  if (hasAny(["payment", "paid", "remittance", "deposit", "installment"])) return "payments";
  if (hasAny(["hold", "freeze", "blocked", "stopped", "offset"])) return "holds";
  if (hasAny(["notice", "letter", "correspondence"])) return "notices";
  if (hasAny(["audit", "examination", "exam", "review", "investigation"])) return "adjustments";
  if (hasAny(["penalty", "interest", "lien", "levy"])) return "collections";
  if (hasAny(["return filed", "assessed", "assessment"])) return "assessment";
  if (hasAny(["adjust", "adjustment", "additional tax", "abatement"])) return "adjustments";

  return "other";
}

function sortKey(code) {
  const m = String(code).match(/^(\d{3})(?:-(.+))?$/);
  if (!m) return [Number.MAX_SAFE_INTEGER, String(code)];
  const num = Number(m[1]);
  const suf = m[2] || "";
  return [num, suf];
}

function stableSorted(arr) {
  return arr.slice().sort((a, b) => {
    const [an, as] = sortKey(a.code);
    const [bn, bs] = sortKey(b.code);
    if (an !== bn) return an - bn;
    return String(as).localeCompare(String(bs));
  });
}

function toJsArray(entries) {
  const lines = [];
  lines.push("const tmCodes = [");
  for (const e of entries) {
    const rel = e.related.slice().sort((a, b) => String(a).localeCompare(String(b)));
    lines.push(
      `  { code: ${JSON.stringify(e.code)}, category: ${JSON.stringify(e.category)}, related: ${JSON.stringify(rel)}, summary: ${JSON.stringify(e.summary)} },`
    );
  }
  lines.push("].slice().sort((a, b) => Number(a.code) - Number(b.code));");
  return lines.join("\n");
}

function main() {
  if (!fs.existsSync(TARGET_FILE)) {
    throw new Error(`Missing: ${TARGET_FILE}`);
  }

  const seedMap = new Map(seed.map(s => [s.code, s]));

  const pages = listResourcePages();
  const generated = [];

  for (const f of pages) {
    const p = path.join(RESOURCES_DIR, f);
    const html = readUtf8(p);

    const code = f.includes("971-ac-065") ? "971-AC-065" : (f.match(/irs-code-(\d{3})-meaning/i)?.[1] || "");
    if (!code) continue;

    if (seedMap.has(code)) continue;

    const desc = extractMetaDescription(html);
    const summary = firstSentence(desc);
    const related = extractRelatedCodes(html).filter(c => c !== code).slice(0, 3);

    generated.push({
      code,
      category: categorize(desc),
      related,
      summary,
    });
  }

  const merged = new Map(seed.map(s => [s.code, s]));
  for (const g of generated) merged.set(g.code, g);

  const final = stableSorted([...merged.values()]);
  const replacement = toJsArray(final);

  const original = readUtf8(TARGET_FILE);

  const blockRe = /const\s+tmCodes\s*=\s*\[[\s\S]*?\]\.slice\(\)\.sort\(\(a,\s*b\)\s*=>\s*Number\(a\.code\)\s*-\s*Number\(b\.code\)\s*\);\s*/m;
  if (!blockRe.test(original)) {
    throw new Error("Could not find tmCodes block in resources/transcript-codes.html");
  }

  const updated = original.replace(blockRe, replacement + "\n");
  fs.writeFileSync(TARGET_FILE, updated, "utf8");

  console.log(`Updated: ${TARGET_FILE}`);
  console.log(`Codes total: ${final.length}`);
}

main();