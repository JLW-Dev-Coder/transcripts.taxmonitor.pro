#!/usr/bin/env node

// RETIRED 2026-04-13: Batch generation has migrated to the VLP Worker campaign
// processor. Clay CSVs are uploaded via the VLP dashboard and processed by Worker
// templates. This script is no longer part of the active pipeline. Kept for
// historical reference only.

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROSPECTS_DIR = path.join(__dirname, 'prospects');
const BATCHES_DIR = path.join(__dirname, 'batches');
const GMAIL_DIR = path.join(__dirname, 'gmail', 'email1');
const LOCKFILE = path.join(PROSPECTS_DIR, '.batch-in-progress');
const DEFAULT_BATCH_SIZE = 50;

const REOON_QUICK_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/verify';
const REOON_BALANCE_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/check-account-balance/';
const REOON_RATE_LIMIT_MS = 1000;
const REOON_SKIP_STATUSES = new Set(['invalid', 'disposable']);

// Map raw Reoon response status to the canonical email_status values stored in the CSV.
// Canonical values: valid | invalid | disposable | risky
const REOON_STATUS_MAP = {
  safe: 'valid',
  valid: 'valid',
  invalid: 'invalid',
  disabled: 'invalid',
  spamtrap: 'invalid',
  disposable: 'disposable',
  inbox_full: 'risky',
  catch_all: 'risky',
  role_account: 'risky',
  unknown: 'risky',
};

function mapReoonStatus(res) {
  const raw = ((res && (res.status || res.state)) || 'unknown').toString().toLowerCase();
  return REOON_STATUS_MAP[raw] || 'risky';
}

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

function titleCase(str) {
  if (!str) return '';
  return String(str).toLowerCase().replace(/\b\w/g, c => c.toUpperCase());
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

// --- CLI arg parsing ---

function parseArgs(argv) {
  const out = {
    limit: DEFAULT_BATCH_SIZE,
    dryRun: false,
    skipValidation: false,
    sourceArg: null,
  };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') {
      out.dryRun = true;
    } else if (a === '--skip-validation') {
      out.skipValidation = true;
    } else if (a === '--limit') {
      const v = args[++i];
      const n = parseInt(v, 10);
      if (!Number.isFinite(n) || n <= 0) {
        console.error(`ERROR: --limit expects a positive integer (got "${v}")`);
        process.exit(2);
      }
      out.limit = n;
    } else if (a.startsWith('--limit=')) {
      const n = parseInt(a.slice('--limit='.length), 10);
      if (!Number.isFinite(n) || n <= 0) {
        console.error(`ERROR: --limit expects a positive integer (got "${a}")`);
        process.exit(2);
      }
      out.limit = n;
    } else if (a === '--help' || a === '-h') {
      console.log('Usage: node scale/generate-batch.js [source.csv] [--limit N] [--dry-run] [--skip-validation]');
      process.exit(0);
    } else if (a.startsWith('--')) {
      console.error(`ERROR: unknown flag "${a}"`);
      process.exit(2);
    } else if (!out.sourceArg) {
      out.sourceArg = a;
    } else {
      console.error(`ERROR: unexpected positional arg "${a}"`);
      process.exit(2);
    }
  }
  return out;
}

// --- Reoon email validation ---

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

function httpGetJson(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
    const req = https.get(url.toString(), (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Reoon parse error: ${e.message} | body: ${body.slice(0, 200)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(new Error('Reoon request timeout')); });
  });
}

function reoonQuickVerify(email, apiKey) {
  return httpGetJson(REOON_QUICK_ENDPOINT, { email, key: apiKey, mode: 'quick' });
}

function reoonBalance(apiKey) {
  return httpGetJson(REOON_BALANCE_ENDPOINT, { key: apiKey });
}

// --- Main ---

function getNextSequenceNumber(today) {
  const existing = fs.readdirSync(BATCHES_DIR)
    .filter(f => f.match(new RegExp(`^scale-batch-${today}-\\d+\\.json$`)));
  return existing.length + 1;
}

async function main() {
  const { limit, dryRun, skipValidation, sourceArg } = parseArgs(process.argv);
  const reoonKey = (process.env.REOON_API_KEY || '').trim();
  const validationEnabled = !skipValidation && !!reoonKey;
  const today = new Date().toISOString().slice(0, 10);
  const timestamp = new Date().toISOString();
  const seq = getNextSequenceNumber(today);

  if (skipValidation) {
    console.log('[--skip-validation] Reoon email validation is disabled for this run.');
  } else if (!reoonKey) {
    console.warn('[WARN] REOON_API_KEY not set — skipping email validation. Set it to enable pre-send verification.');
  }
  if (dryRun) {
    console.log('[DRY RUN] Source CSV will NOT be updated.');
  }

  // 1. Create lockfile
  fs.writeFileSync(LOCKFILE, '');

  try {
    // 2. Resolve master CSV path (positional arg overrides auto-detect)
    let masterPath;
    if (sourceArg) {
      masterPath = path.isAbsolute(sourceArg) ? sourceArg : path.resolve(process.cwd(), sourceArg);
      if (!fs.existsSync(masterPath)) {
        console.error(`ERROR: source CSV not found: ${masterPath}`);
        process.exit(1);
      }
    } else {
      const csvFiles = fs.readdirSync(PROSPECTS_DIR).filter(f => f.startsWith('IRS') && f.endsWith('.csv'));
      if (csvFiles.length === 0) {
        console.error('ERROR: No IRS*.csv file found in scale/prospects/');
        process.exit(1);
      }
      if (csvFiles.length > 1) {
        console.error('ERROR: Multiple IRS*.csv files found in scale/prospects/:', csvFiles);
        process.exit(1);
      }
      masterPath = path.join(PROSPECTS_DIR, csvFiles[0]);
    }

    // 3. Read and parse
    const raw = fs.readFileSync(masterPath, 'utf-8');
    const parsed = parseCSV(raw);
    if (parsed.length < 2) {
      console.error('ERROR: Master CSV has no data rows');
      process.exit(1);
    }

    let headers = parsed[0];
    if (!headers.includes('email_1_prepared_at')) {
      headers.push('email_1_prepared_at');
    }

    const records = parsed.slice(1)
      .filter(row => row.length > 1)
      .map(row => {
        const rec = {};
        headers.forEach((h, i) => { rec[h] = row[i] || ''; });
        return rec;
      });

    // 4. Candidate filter (format + not stamped + not already known-bad).
    // Empty email_status is still a candidate; Reoon will verify in the walk below.
    const candidates = records.filter(r => {
      const email = (r.email_found || '').trim();
      if (!email || email === 'undefined' || email.toLowerCase() === 'nan' || email === 'null') return false;
      if ((r.email_1_prepared_at || '').trim() !== '') return false;
      const st = (r.email_status || '').trim().toLowerCase();
      if (REOON_SKIP_STATUSES.has(st)) return false;
      return true;
    });

    candidates.sort((a, b) => {
      const da = (a.domain_clean || '').trim();
      const db = (b.domain_clean || '').trim();
      if (!da && !db) return 0;
      if (!da) return 1;
      if (!db) return -1;
      return da.localeCompare(db);
    });

    if (candidates.length === 0) {
      console.error('PIPELINE EXHAUSTION: Zero eligible records remain. No batch generated.');
      process.exit(1);
    }

    // Count candidates with empty email_status to size the Reoon budget check.
    const emptyStatusCount = candidates.filter(r => !(r.email_status || '').trim()).length;

    // 4.5 Balance check (only if we'll actually call Reoon)
    if (validationEnabled && emptyStatusCount > 0) {
      try {
        const bal = await reoonBalance(reoonKey);
        const daily = Number(bal && (bal.remaining_daily_credits ?? bal.daily_credits_available ?? bal.daily_credits ?? bal.daily ?? NaN));
        const instant = Number(bal && (bal.remaining_instant_credits ?? bal.instant_credits_available ?? bal.instant_credits ?? bal.instant ?? NaN));
        const dailyStr = Number.isFinite(daily) ? daily : 'unknown';
        const instantStr = Number.isFinite(instant) ? instant : 'unknown';
        console.log(`[reoon] Balance — daily: ${dailyStr}, instant: ${instantStr} (need up to ${emptyStatusCount})`);
        if (Number.isFinite(daily) && daily < emptyStatusCount) {
          console.warn(`[reoon] WARNING: daily credits (${daily}) < emails to validate (${emptyStatusCount}). Some records will skip validation.`);
        }
      } catch (err) {
        console.warn(`[reoon] Balance check failed: ${err.message} — proceeding anyway`);
      }
    }

    // 5. Validation + selection walk.
    // Iterates candidates in domain-sort order. Empty email_status triggers a Reoon
    // Quick API call (rate limited to 1 req/sec). Result is mapped to the canonical
    // set (valid | invalid | disposable | risky) and persisted to the source CSV
    // (unless --dry-run). Invalid/disposable are skipped; risky proceeds with a warning.
    const selected = [];
    let reoonCalls = 0;
    let skippedInvalid = 0;
    let skippedDisposable = 0;
    let reoonErrors = 0;
    let riskyCount = 0;

    for (const r of candidates) {
      if (selected.length >= limit) break;

      const currentStatus = (r.email_status || '').trim().toLowerCase();

      if (currentStatus === 'valid') {
        selected.push(r);
        continue;
      }
      if (currentStatus === 'risky') {
        console.warn(`  [risky] ${r.email_found} — pre-marked risky, proceeding with warning`);
        riskyCount++;
        selected.push(r);
        continue;
      }
      if (REOON_SKIP_STATUSES.has(currentStatus)) {
        // Defense in depth — pre-filter already dropped these.
        if (currentStatus === 'disposable') skippedDisposable++; else skippedInvalid++;
        continue;
      }

      // Empty status path
      if (skipValidation) {
        console.warn(`  [skip-validation] ${r.email_found} — unvalidated, proceeding`);
        selected.push(r);
        continue;
      }
      if (!reoonKey) {
        // Warning already printed at start of main()
        selected.push(r);
        continue;
      }

      try {
        if (reoonCalls > 0) await sleep(REOON_RATE_LIMIT_MS);
        const res = await reoonQuickVerify(r.email_found.trim(), reoonKey);
        reoonCalls++;
        const mapped = mapReoonStatus(res);
        r.email_status = mapped;
        if (!dryRun) {
          fs.writeFileSync(masterPath, rowsToCSV(headers, records));
        }
        if (REOON_SKIP_STATUSES.has(mapped)) {
          if (mapped === 'disposable') skippedDisposable++; else skippedInvalid++;
          console.log(`  [reoon] ${r.email_found} -> ${mapped} (skipped)`);
          continue;
        }
        if (mapped === 'risky') {
          console.warn(`  [reoon] ${r.email_found} -> risky (proceeding with warning)`);
          riskyCount++;
        } else {
          console.log(`  [reoon] ${r.email_found} -> ${mapped}`);
        }
        selected.push(r);
      } catch (err) {
        reoonErrors++;
        console.warn(`  [reoon] ${r.email_found} -> ERROR ${err.message} — including as unverified`);
        selected.push(r);
      }
    }

    if (selected.length === 0) {
      console.error('PIPELINE EXHAUSTION: Zero eligible records after validation. No batch generated.');
      process.exit(1);
    }

    if (selected.length < limit) {
      console.log(`WARNING: Only ${selected.length} eligible records (fewer than ${limit})`);
    }

    // 6. Generate slugs
    const selectionRecords = selected.map(r => {
      const cred = (r.PROFESSION || '').trim().toUpperCase();
      const savings = CREDENTIAL_MAP[cred] || DEFAULT_CREDENTIAL;
      return {
        slug: generateSlug(r.First_NAME, r.LAST_NAME, r.BUS_ADDR_CITY, r.BUS_ST_CODE),
        email: r.email_found.trim(),
        first_name: titleCase((r.First_NAME || '').trim()),
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
        _sourceRef: r,
      };
    });

    dedupSlugs(selectionRecords);

    // 7. Write selection file
    if (!fs.existsSync(BATCHES_DIR)) fs.mkdirSync(BATCHES_DIR, { recursive: true });
    if (!fs.existsSync(GMAIL_DIR)) fs.mkdirSync(GMAIL_DIR, { recursive: true });

    const selectionPath = path.join(BATCHES_DIR, `batch-selection-${today}-${seq}.json`);
    const output = selectionRecords.map(({ _sourceRef, ...rest }) => rest);
    fs.writeFileSync(selectionPath, JSON.stringify(output, null, 2));

    // 8. Stamp tracking in master CSV (skipped under --dry-run)
    if (!dryRun) {
      for (const rec of selectionRecords) {
        rec._sourceRef.email_1_prepared_at = timestamp;
      }
      fs.writeFileSync(masterPath, rowsToCSV(headers, records));
    }

    // 9. Summary
    const remaining = candidates.length - selected.length - skippedInvalid - skippedDisposable;
    const daysRemaining = remaining > 0 ? Math.ceil(remaining / limit) : 0;
    let validationLine;
    if (skipValidation) {
      validationLine = 'SKIPPED (--skip-validation)';
    } else if (!reoonKey) {
      validationLine = 'SKIPPED (REOON_API_KEY not set)';
    } else {
      validationLine = `Reoon Quick enabled (${reoonCalls} verified, ${skippedInvalid} invalid, ${skippedDisposable} disposable, ${riskyCount} risky, ${reoonErrors} errors)`;
    }
    const stampLine = dryRun
      ? '[DRY RUN] Source CSV was NOT updated.'
      : `Master CSV updated: ${selected.length} rows stamped with email_1_prepared_at`;

    console.log(`
=== BATCH SELECTION COMPLETE ===
Date: ${today}  |  Batch #${seq}
Records selected: ${selected.length}
Limit: ${limit}
Validation: ${validationLine}
Selection file: scale/batches/batch-selection-${today}-${seq}.json
${stampLine}
Remaining candidates: ${remaining}
Days of pipeline remaining: ${daysRemaining} (at ${limit}/run)

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

main().catch(err => {
  console.error('FATAL:', err);
  try { fs.unlinkSync(LOCKFILE); } catch (_) {}
  process.exit(1);
});
