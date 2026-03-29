#!/usr/bin/env node
/**
 * Batch convert /resources/*.html → /content/resources/*.json
 * Usage: node convert-html.js [batchStart] [batchSize]
 *   e.g. node convert-html.js 0 50   (default)
 *        node convert-html.js 50 50
 */

const fs = require('fs');
const path = require('path');

const RESOURCES_DIR = path.join(__dirname, '..', 'resources');
const OUTPUT_DIR = path.join(__dirname, '..', 'content', 'resources');
const VALID_TEMPLATES = ['irs-code', 'how-to', 'comparison', 'explainer', 'sales'];

const batchStart = parseInt(process.argv[2] ?? '0', 10);
const batchSize  = parseInt(process.argv[3] ?? '50', 10);

// ── helpers ─────────────────────────────────────────────────────────────────

function assignTemplate(filename) {
  const f = filename.toLowerCase();
  if (/irs-code-|transaction-code-/.test(f)) return 'irs-code';
  if (/how-to-|guide-|step-/.test(f))       return 'how-to';
  if (/vs-|versus-|compare-|comparison-/.test(f)) return 'comparison';
  if (/what-is-|explained-|meaning-|definition-/.test(f)) return 'explainer';
  if (/pricing|buy|trial|start-/.test(f))   return 'sales';
  return 'explainer';
}

function assignCategory(template) {
  if (template === 'irs-code')   return 'transaction-code';
  if (template === 'how-to')     return 'guide';
  if (template === 'comparison') return 'comparison';
  return 'resource';
}

function assignCta(template) {
  return template === 'irs-code' ? 'transcript-analysis' : 'free-trial';
}

function extractMeta(html, name) {
  const re = new RegExp(`<meta[^>]+name=["']${name}["'][^>]+content=["']([^"']+)["']`, 'i');
  let m = html.match(re);
  if (m) return m[1].trim();
  // Try reversed attribute order
  const re2 = new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${name}["']`, 'i');
  m = html.match(re2);
  return m ? m[1].trim() : '';
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  if (!m) return '';
  return m[1]
    .replace(/\s*\|\s*Transcript Tax Monitor Pro\s*$/i, '')
    .replace(/\s*[-–]\s*Transcript\.?Tax Monitor Pro\s*$/i, '')
    .trim();
}

function extractMainContent(html) {
  // Try <main ...> ... </main>
  let m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
  if (m) return m[1].trim();

  // Try <article ...> ... </article>
  m = html.match(/<article[^>]*>([\s\S]*?)<\/article>/i);
  if (m) return m[1].trim();

  // Try <div id="content"> or <div class="content">
  m = html.match(/<div[^>]+(?:id=["']content["']|class=["'][^"']*\bcontent\b[^"']*["'])[^>]*>([\s\S]*?)<\/div>/i);
  if (m) return m[1].trim();

  return '';
}

function firstNChars(html, n) {
  // Strip tags for plain-text fallback
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, n);
}

// ── main ────────────────────────────────────────────────────────────────────

const allFiles = fs.readdirSync(RESOURCES_DIR)
  .filter(f => f.endsWith('.html') && f !== 'index.html')
  .sort();

const batch = allFiles.slice(batchStart, batchStart + batchSize);

const results = { processed: [], skipped: [], errors: [] };

for (const filename of batch) {
  const slug = filename.replace(/\.html$/, '');
  const outputPath = path.join(OUTPUT_DIR, `${slug}.json`);
  const inputPath  = path.join(RESOURCES_DIR, filename);

  // Self-check 4: already exists?
  if (fs.existsSync(outputPath)) {
    results.skipped.push({ file: filename, reason: 'already exists in /content/resources/' });
    continue;
  }

  let html;
  try {
    html = fs.readFileSync(inputPath, 'utf8');
  } catch (e) {
    results.errors.push({ file: filename, reason: `read error: ${e.message}` });
    continue;
  }

  const content = extractMainContent(html);
  if (!content) {
    results.skipped.push({ file: filename, reason: 'no extractable body content (<main>/<article>/<div id="content">)' });
    continue;
  }

  const template = assignTemplate(filename);

  // Self-check 3: valid template?
  if (!VALID_TEMPLATES.includes(template)) {
    results.errors.push({ file: filename, reason: `invalid template: ${template}` });
    continue;
  }

  const title       = extractTitle(html);
  const description = extractMeta(html, 'description') || firstNChars(content, 160);
  const category    = assignCategory(template);
  const cta         = assignCta(template);

  const json = {
    slug,
    title,
    template,
    category,
    cta,
    description,
    content,
    related: []
  };

  try {
    fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf8');
    results.processed.push(filename);
  } catch (e) {
    results.errors.push({ file: filename, reason: `write error: ${e.message}` });
  }
}

// ── report ──────────────────────────────────────────────────────────────────

console.log('\n=== BATCH REPORT ===');
console.log(`Range: files ${batchStart + 1}–${batchStart + batch.length} of ${allFiles.length} total`);
console.log(`\n✅ Processed (${results.processed.length}):`);
results.processed.forEach(f => console.log(`   ${f}`));

if (results.skipped.length) {
  console.log(`\n⏭  Skipped (${results.skipped.length}):`);
  results.skipped.forEach(s => console.log(`   ${s.file} — ${s.reason}`));
}

if (results.errors.length) {
  console.log(`\n❌ Errors (${results.errors.length}):`);
  results.errors.forEach(e => console.log(`   ${e.file} — ${e.reason}`));
}

const remaining = allFiles.length - (batchStart + batch.length);
console.log(`\n📦 Next batch: node convert-html.js ${batchStart + batchSize} ${batchSize}`);
console.log(`   Files remaining after this batch: ${remaining > 0 ? remaining : 0}`);
