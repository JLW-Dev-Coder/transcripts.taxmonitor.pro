#!/usr/bin/env node

// RETIRED 2026-04-13: Clay.com now pre-validates emails. This script is no longer
// part of the active pipeline. Kept for historical reference only.

// Standalone bulk email validator for the TTMP master prospect CSV.
// Uses Reoon's Bulk verification API to validate up to 500 addresses per run
// (Reoon daily free-tier credit limit), then writes results back to the
// email_status column of the source CSV.
//
// Usage:
//   REOON_API_KEY=xxx node scale/validate-emails.js [source.csv]
//
// If source.csv is omitted, auto-detects the master CSV in scale/prospects/
// (file matching IRS*.csv).

const fs = require('fs');
const path = require('path');
const https = require('https');

const PROSPECTS_DIR = path.join(__dirname, 'prospects');
const DAILY_LIMIT = 500;
const POLL_INTERVAL_MS = 10000;
const POLL_MAX_ATTEMPTS = 120; // 20 minutes

const REOON_CREATE_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/create-bulk-verification-task/';
const REOON_RESULT_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/get-result-bulk-verification-task/';
const REOON_BALANCE_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/check-account-balance/';

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

// --- CSV helpers (RFC-4180 minimal) ---

function parseCSV(text) {
  const rows = [];
  let i = 0;
  while (i < text.length) {
    const r = parseRow(text, i);
    rows.push(r.fields);
    i = r.nextIndex;
  }
  return rows;
}

function parseRow(text, start) {
  const fields = [];
  let i = start;
  while (i < text.length) {
    if (text[i] === '"') {
      let v = ''; i++;
      while (i < text.length) {
        if (text[i] === '"') {
          if (text[i + 1] === '"') { v += '"'; i += 2; }
          else { i++; break; }
        } else { v += text[i]; i++; }
      }
      fields.push(v);
      if (text[i] === ',') { i++; }
      else if (text[i] === '\r' || text[i] === '\n') {
        if (text[i] === '\r' && text[i + 1] === '\n') i += 2; else i++;
        return { fields, nextIndex: i };
      }
    } else {
      let end = i;
      while (end < text.length && text[end] !== ',' && text[end] !== '\r' && text[end] !== '\n') end++;
      fields.push(text.substring(i, end));
      i = end;
      if (text[i] === ',') { i++; }
      else if (text[i] === '\r' || text[i] === '\n') {
        if (text[i] === '\r' && text[i + 1] === '\n') i += 2; else i++;
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

// --- HTTP helpers ---

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function httpGetJson(endpoint, params) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint);
    for (const [k, v] of Object.entries(params || {})) url.searchParams.set(k, v);
    const req = https.get(url.toString(), (res) => {
      let body = '';
      res.on('data', (c) => { body += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error(`Reoon parse error: ${e.message} | body: ${body.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(new Error('Reoon GET timeout')); });
  });
}

function httpPostJson(endpoint, payload) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payload);
    const url = new URL(endpoint);
    const req = https.request({
      method: 'POST',
      hostname: url.hostname,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let respBody = '';
      res.on('data', (c) => { respBody += c; });
      res.on('end', () => {
        try { resolve(JSON.parse(respBody)); }
        catch (e) { reject(new Error(`Reoon parse error: ${e.message} | body: ${respBody.slice(0, 300)}`)); }
      });
    });
    req.on('error', reject);
    req.setTimeout(30000, () => { req.destroy(new Error('Reoon POST timeout')); });
    req.write(body);
    req.end();
  });
}

function mapReoonStatus(raw) {
  const s = (raw || 'unknown').toString().toLowerCase();
  return REOON_STATUS_MAP[s] || 'risky';
}

// --- Main ---

async function main() {
  const reoonKey = (process.env.REOON_API_KEY || '').trim();
  if (!reoonKey) {
    console.error('ERROR: REOON_API_KEY environment variable is required.');
    console.error('Set it before running: REOON_API_KEY=xxx node scale/validate-emails.js [source.csv]');
    process.exit(1);
  }

  const sourceArg = process.argv[2];
  let masterPath;
  if (sourceArg) {
    masterPath = path.isAbsolute(sourceArg) ? sourceArg : path.resolve(process.cwd(), sourceArg);
    if (!fs.existsSync(masterPath)) {
      console.error(`ERROR: source CSV not found: ${masterPath}`);
      process.exit(1);
    }
  } else {
    const csvFiles = fs.readdirSync(PROSPECTS_DIR).filter(f => f.startsWith('IRS') && f.endsWith('.csv'));
    if (csvFiles.length !== 1) {
      console.error(`ERROR: expected exactly one IRS*.csv in ${PROSPECTS_DIR}, found ${csvFiles.length}`);
      process.exit(1);
    }
    masterPath = path.join(PROSPECTS_DIR, csvFiles[0]);
  }

  console.log(`Source: ${masterPath}`);

  // 1. Read CSV
  const raw = fs.readFileSync(masterPath, 'utf-8');
  const parsed = parseCSV(raw);
  if (parsed.length < 2) {
    console.error('ERROR: CSV has no data rows');
    process.exit(1);
  }
  const headers = parsed[0];
  if (!headers.includes('email_status')) {
    console.error('ERROR: CSV is missing the email_status column');
    process.exit(1);
  }
  const records = parsed.slice(1)
    .filter(row => row.length > 1)
    .map(row => {
      const rec = {};
      headers.forEach((h, i) => { rec[h] = row[i] || ''; });
      return rec;
    });

  // 2. Find candidates: records with non-empty email_found and empty email_status.
  const candidates = records.filter(r => {
    const e = (r.email_found || '').trim();
    if (!e || e === 'undefined' || e.toLowerCase() === 'nan' || e === 'null') return false;
    return !(r.email_status || '').trim();
  });

  if (candidates.length === 0) {
    console.log('Nothing to validate — all records with a usable email already have a status.');
    return;
  }

  const toValidate = candidates.slice(0, DAILY_LIMIT);
  console.log(`Found ${candidates.length} unvalidated records. Submitting ${toValidate.length} to Reoon bulk API (daily cap: ${DAILY_LIMIT}).`);

  // 3. Balance check
  try {
    const bal = await httpGetJson(REOON_BALANCE_ENDPOINT, { key: reoonKey });
    const daily = Number(bal && (bal.remaining_daily_credits ?? bal.daily_credits_available ?? bal.daily_credits ?? bal.daily ?? NaN));
    const instant = Number(bal && (bal.remaining_instant_credits ?? bal.instant_credits_available ?? bal.instant_credits ?? bal.instant ?? NaN));
    const dailyStr = Number.isFinite(daily) ? daily : 'unknown';
    const instantStr = Number.isFinite(instant) ? instant : 'unknown';
    console.log(`[reoon] Balance — daily: ${dailyStr}, instant: ${instantStr}`);
    if (Number.isFinite(daily) && daily < toValidate.length) {
      console.warn(`[reoon] WARNING: daily credits (${daily}) < emails to submit (${toValidate.length}).`);
      if (!process.stdin.isTTY) {
        console.warn('[reoon] Non-interactive shell — proceeding anyway. Rerun tomorrow if quota errors.');
      } else {
        process.stdout.write('Proceed anyway? [y/N]: ');
        const answer = await new Promise(resolve => {
          process.stdin.resume();
          process.stdin.once('data', d => resolve(d.toString().trim().toLowerCase()));
        });
        if (answer !== 'y' && answer !== 'yes') {
          console.log('Aborted by user.');
          process.exit(0);
        }
      }
    }
  } catch (err) {
    console.warn(`[reoon] Balance check failed: ${err.message} — proceeding anyway`);
  }

  // 4. Create bulk task
  const emails = toValidate.map(r => r.email_found.trim());
  const taskName = `TTMP batch validation ${new Date().toISOString().slice(0, 19)}`;
  console.log(`[reoon] Creating bulk task "${taskName}" for ${emails.length} emails...`);
  let createRes;
  try {
    createRes = await httpPostJson(REOON_CREATE_ENDPOINT, {
      name: taskName,
      emails,
      key: reoonKey,
    });
  } catch (err) {
    console.error(`[reoon] Create task failed: ${err.message}`);
    process.exit(1);
  }
  const taskId = createRes && (createRes.task_id || createRes.id || createRes.taskId);
  if (!taskId) {
    console.error('[reoon] Create task response missing task_id:', JSON.stringify(createRes).slice(0, 500));
    process.exit(1);
  }
  console.log(`[reoon] Task created: ${taskId}`);

  // 5. Poll until completed
  let result = null;
  for (let attempt = 1; attempt <= POLL_MAX_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);
    try {
      const polled = await httpGetJson(REOON_RESULT_ENDPOINT, { key: reoonKey, task_id: taskId });
      const status = (polled && polled.status || '').toString().toLowerCase();
      process.stdout.write(`[reoon] poll ${attempt}: status=${status || 'unknown'}\n`);
      if (status === 'completed' || status === 'complete' || status === 'done') {
        result = polled;
        break;
      }
      if (status === 'failed' || status === 'error') {
        console.error(`[reoon] Task failed:`, JSON.stringify(polled).slice(0, 500));
        process.exit(1);
      }
    } catch (err) {
      console.warn(`[reoon] poll ${attempt}: error ${err.message}`);
    }
  }

  if (!result) {
    console.error('[reoon] Task did not complete within polling window — aborting. Rerun later; task id:', taskId);
    process.exit(1);
  }

  // 6. Extract results.
  // Reoon returns { results: { "email@x": { status: "safe", ... }, ... } } or similar.
  // Normalize into a { email -> rawStatus } map.
  const resultsByEmail = {};
  const bucket = result.results || result.data || result.emails || {};
  if (Array.isArray(bucket)) {
    for (const row of bucket) {
      const em = (row.email || row.address || '').toLowerCase();
      const st = (row.status || row.state || 'unknown').toString();
      if (em) resultsByEmail[em] = st;
    }
  } else if (typeof bucket === 'object') {
    for (const [em, row] of Object.entries(bucket)) {
      const st = ((row && (row.status || row.state)) || row || 'unknown').toString();
      resultsByEmail[em.toLowerCase()] = st;
    }
  }

  // 7. Write results back to email_status
  const summary = { valid: 0, invalid: 0, risky: 0, disposable: 0, failed: 0 };
  for (const r of toValidate) {
    const email = r.email_found.trim().toLowerCase();
    const raw = resultsByEmail[email];
    if (!raw) {
      summary.failed++;
      continue;
    }
    const mapped = mapReoonStatus(raw);
    r.email_status = mapped;
    summary[mapped] = (summary[mapped] || 0) + 1;
  }

  fs.writeFileSync(masterPath, rowsToCSV(headers, records));

  // 8. Print summary
  console.log(`
=== BULK VALIDATION COMPLETE ===
Task id: ${taskId}
Submitted: ${toValidate.length}
Valid: ${summary.valid}
Invalid: ${summary.invalid}
Risky: ${summary.risky}
Disposable: ${summary.disposable}
Failed (no result): ${summary.failed}
CSV updated: ${masterPath}
`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
