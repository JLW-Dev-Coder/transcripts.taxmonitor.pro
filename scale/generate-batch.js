#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const PROSPECTS_DIR = path.join(__dirname, 'prospects');
const BATCHES_DIR = path.join(__dirname, 'batches');
const GMAIL_DIR = path.join(__dirname, 'gmail', 'email1');
const LOCKFILE = path.join(PROSPECTS_DIR, '.batch-in-progress');
const BATCH_SIZE = 50;

const CREDENTIAL_MAP = {
  EA:  { weekly: '6.7', annual: '348', revenue: '$34,800–$104,400/yr' },
  CPA: { weekly: '5.0', annual: '260', revenue: '$39,000–$104,000/yr' },
  JD:  { weekly: '3.3', annual: '174', revenue: '$34,800–$87,000/yr' },
  ATTY:{ weekly: '3.3', annual: '174', revenue: '$34,800–$87,000/yr' },
};
const DEFAULT_CREDENTIAL = { weekly: '5.0', annual: '260', revenue: '$39,000–$104,000/yr' };

// --- CSV helpers (no external deps) ---

function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const { fields, nextIndex } = parseRow(text, i);
    rows.push(fields);
    i = nextIndex;
  }
  return rows;
}

function parseRow(text, start) {
  const fields = [];
  let i = start;
  while (i < text.length) {
    if (text[i] === '"') {
      // quoted field
      let value = '';
      i++; // skip opening quote
      while (i < text.length) {
        if (text[i] === '"') {
          if (i + 1 < text.length && text[i + 1] === '"') {
            value += '"';
            i += 2;
          } else {
            i++; // skip closing quote
            break;
          }
        } else {
          value += text[i];
          i++;
        }
      }
      fields.push(value);
      // skip comma or line ending
      if (i < text.length && text[i] === ',') i++;
      else if (i < text.length && (text[i] === '\r' || text[i] === '\n')) {
        if (text[i] === '\r' && i + 1 < text.length && text[i + 1] === '\n') i += 2;
        else i++;
        return { fields, nextIndex: i };
      }
    } else {
      // unquoted field
      let end = i;
      while (end < text.length && text[end] !== ',' && text[end] !== '\r' && text[end] !== '\n') end++;
      fields.push(text.substring(i, end));
      i = end;
      if (i < text.length && text[i] === ',') i++;
      else if (i < text.length && (text[i] === '\r' || text[i] === '\n')) {
        if (text[i] === '\r' && i + 1 < text.length && text[i + 1] === '\n') i += 2;
        else i++;
        return { fields, nextIndex: i };
      }
    }
  }
  return { fields, nextIndex: i };
}

function csvEscapeField(value) {
  const s = String(value == null ? '' : value);
  if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
}

function rowsToCSV(headers, records) {
  const lines = [headers.map(csvEscapeField).join(',')];
  for (const rec of records) {
    lines.push(headers.map(h => csvEscapeField(rec[h] || '')).join(','));
  }
  return lines.join('\n') + '\n';
}

// --- Slug generation ---

function generateSlug(first, last, city, state) {
  const titles = /\b(dr|mr|mrs|ms|jr|sr|iii|ii|iv)\b\.?/gi;
  const clean = (s) => String(s || '').replace(titles, '').trim().toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const parts = [clean(first), clean(last), clean(city), clean(state)].filter(Boolean);
  return parts.join('-');
}

function dedupSlugs(records) {
  const seen = {};
  for (const rec of records) {
    const base = rec.slug;
    if (seen[base] == null) {
      seen[base] = 1;
    } else {
      seen[base]++;
      rec.slug = `${base}-${seen[base]}`;
    }
  }
}

// --- Main ---

function getNextSequenceNumber(today) {
  const existing = fs.readdirSync(BATCHES_DIR)
    .filter(f => f.match(new RegExp(`^scale-batch-${today}-\\d+\\.json$`)));
  return existing.length + 1;
}

function main() {
  const today = new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toISOString();
  const seq = getNextSequenceNumber(today);

  // 1. Create lockfile
  fs.writeFileSync(LOCKFILE, '');

  try {
    // 2. Find master CSV
    const csvFiles = fs.readdirSync(PROSPECTS_DIR).filter(f => f.startsWith('IRS') && f.endsWith('.csv'));
    if (csvFiles.length === 0) {
      console.error('ERROR: No IRS*.csv file found in scale/prospects/');
      process.exit(1);
    }
    if (csvFiles.length > 1) {
      console.error('ERROR: Multiple IRS*.csv files found in scale/prospects/:', csvFiles);
      process.exit(1);
    }
    const masterPath = path.join(PROSPECTS_DIR, csvFiles[0]);

    // 3. Read and parse
    const raw = fs.readFileSync(masterPath, 'utf-8');
    const parsed = parseCSV(raw);
    if (parsed.length < 2) {
      console.error('ERROR: Master CSV has no data rows');
      process.exit(1);
    }

    let headers = parsed[0];
    // Add email_1_prepared_at column if missing
    if (!headers.includes('email_1_prepared_at')) {
      headers.push('email_1_prepared_at');
    }

    const records = parsed.slice(1).map(row => {
      const rec = {};
      headers.forEach((h, i) => { rec[h] = row[i] || ''; });
      return rec;
    });

    // 4. Selection logic
    const eligible = records.filter(r => {
      const email = (r.email_found || '').trim();
      if (!email || email === 'undefined' || email.toLowerCase() === 'nan' || email === 'null') return false;
      if ((r.email_status || '').trim().toLowerCase() === 'invalid') return false;
      if ((r.email_1_prepared_at || '').trim() !== '') return false;
      return true;
    });

    // Sort ascending by domain_clean (empty last)
    eligible.sort((a, b) => {
      const da = (a.domain_clean || '').trim();
      const db = (b.domain_clean || '').trim();
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });

    if (eligible.length === 0) {
      console.error('PIPELINE EXHAUSTION: Zero eligible records remain. No batch generated.');
      process.exit(1);
    }

    const selected = eligible.slice(0, BATCH_SIZE);
    const remaining = eligible.length - selected.length;

    if (selected.length < BATCH_SIZE) {
      console.log(`WARNING: Only ${selected.length} eligible records (fewer than ${BATCH_SIZE})`);
    }

    // 5. Generate slugs
    const selectionRecords = selected.map(r => {
      const cred = (r.PROFESSION || '').trim().toUpperCase();
      const savings = CREDENTIAL_MAP[cred] || DEFAULT_CREDENTIAL;
      return {
        slug: generateSlug(r.First_NAME, r.LAST_NAME, r.BUS_ADDR_CITY, r.BUS_ST_CODE),
        email: r.email_found.trim(),
        first_name: (r.First_NAME || '').trim(),
        last_name: (r.LAST_NAME || '').trim(),
        credential: cred || 'Unknown',
        city: (r.BUS_ADDR_CITY || '').trim(),
        state: (r.BUS_ST_CODE || '').trim(),
        firm: (r.DBA || '').trim(),
        firm_bucket: (r.firm_bucket || '').trim(),
        domain_clean: (r.domain_clean || '').trim(),
        time_savings_weekly: `${savings.weekly} hours`,
        time_savings_annual: `${savings.annual} hours`,
        revenue_opportunity: savings.revenue,
        _sourceRef: r, // internal: pointer back to master record for stamping
      };
    });

    dedupSlugs(selectionRecords);

    // 6. Write selection file
    if (!fs.existsSync(BATCHES_DIR)) fs.mkdirSync(BATCHES_DIR, { recursive: true });
    if (!fs.existsSync(GMAIL_DIR)) fs.mkdirSync(GMAIL_DIR, { recursive: true });

    const selectionPath = path.join(BATCHES_DIR, `batch-selection-${today}-${seq}.json`);
    const output = selectionRecords.map(({ _sourceRef, ...rest }) => rest);
    fs.writeFileSync(selectionPath, JSON.stringify(output, null, 2));

    // 7. Stamp tracking in master CSV
    for (const rec of selectionRecords) {
      rec._sourceRef.email_1_prepared_at = timestamp;
    }
    const updatedCSV = rowsToCSV(headers, records);
    fs.writeFileSync(masterPath, updatedCSV);

    // 9. Print summary
    const daysRemaining = remaining > 0 ? Math.ceil(remaining / BATCH_SIZE) : 0;
    console.log(`
=== BATCH SELECTION COMPLETE ===
Date: ${today}  |  Batch #${seq}
Records selected: ${selected.length}
Selection file: scale/batches/batch-selection-${today}-${seq}.json
Master CSV updated: ${selected.length} rows stamped with email_1_prepared_at
Remaining eligible for Email 1: ${remaining}
Days of pipeline remaining: ${daysRemaining} (at ${BATCH_SIZE}/day)

NEXT STEP:
Claude Code now generates personalized email copy and asset page data
using the selection file and SKILL.md.

Output files will be:
  scale/batches/scale-batch-${today}-${seq}.json
  scale/gmail/email1/${today}-${seq}-batch.csv

Push to R2:
  node scale/push-email1-queue.js scale/gmail/email1/${today}-${seq}-batch.csv
  node scale/push-asset-pages.js scale/batches/scale-batch-${today}-${seq}.json
`);

  } finally {
    // 10. Delete lockfile
    try { fs.unlinkSync(LOCKFILE); } catch (_) {}
  }
}

main();
