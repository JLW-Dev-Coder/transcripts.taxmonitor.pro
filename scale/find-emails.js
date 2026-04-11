#!/usr/bin/env node

// scale/find-emails.js
//
// Discovers email addresses for prospects using:
//   1. Free DNS MX precheck (filters dead domains before burning credits)
//   2. Pattern guessing against {first,last,domain}
//   3. Reoon Quick verification of each candidate
//
// Writes found emails back to the master CSV and stamps a per-row
// `email_find_attempted` timestamp so rows are not re-scanned on subsequent runs.
//
// Usage:
//   REOON_API_KEY=xxx node scale/find-emails.js [source.csv] [--limit N] [--dry-run]
//
// Flags:
//   --limit N   Process at most N eligible rows (default: 100)
//   --dry-run   MX precheck + pattern generation only. No Reoon calls, no CSV writes.

const fs = require('fs');
const path = require('path');
const https = require('https');
const dnsMod = require('dns');
const dns = dnsMod.promises;

// Force public resolvers so the script is deterministic across machines and
// survives environments where the local system resolver refuses connections.
dnsMod.setServers(['8.8.8.8', '1.1.1.1']);

const PROSPECTS_DIR = path.join(__dirname, 'prospects');
const DEFAULT_LIMIT = 100;
const CREDIT_SAFETY_CAP = 450;       // stop when cumulative Reoon calls reach this
const REOON_RATE_LIMIT_MS = 1000;    // 1 req/sec for Reoon Quick

const REOON_VERIFY_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/verify';
const REOON_BALANCE_ENDPOINT = 'https://emailverifier.reoon.com/api/v1/check-account-balance/';

// Canonical status mapping (mirrors validate-emails.js and generate-batch.js).
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

// Titles stripped from name tokens before pattern generation.
const NAME_TITLE_RE = /\b(dr|mr|mrs|ms|miss|jr|sr|iii|ii|iv|phd|esq|cpa|ea|jd)\b\.?/gi;

function mapReoonStatus(res) {
  const raw = ((res && (res.status || res.state)) || 'unknown').toString().toLowerCase();
  return REOON_STATUS_MAP[raw] || 'risky';
}

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
    req.setTimeout(30000, () => {
      const err = new Error('Reoon request timeout');
      err.isTimeout = true;
      req.destroy(err);
    });
  });
}

function reoonPowerVerify(email, apiKey) {
  return httpGetJson(REOON_VERIFY_ENDPOINT, { email, key: apiKey, mode: 'power' });
}

function reoonBalance(apiKey) {
  return httpGetJson(REOON_BALANCE_ENDPOINT, { key: apiKey });
}

// --- Name / pattern helpers ---

function normalizeFirstName(raw) {
  if (!raw) return '';
  let s = String(raw).replace(NAME_TITLE_RE, ' ').trim();
  // Multi-word first names ("John Michael") collapse to the first token.
  s = s.split(/\s+/)[0] || '';
  return s.toLowerCase().replace(/[^a-z]/g, '');
}

function normalizeLastName(raw) {
  if (!raw) return '';
  let s = String(raw).replace(NAME_TITLE_RE, ' ').trim();
  // Multi-word last names ("Smith Jones") collapse to the first token; hyphens
  // and apostrophes are dropped ("O'Brien" -> "obrien", "Smith-Jones" -> "smithjones").
  const cleaned = s.replace(/[^a-zA-Z\s]/g, '');
  const tokens = cleaned.split(/\s+/).filter(Boolean);
  const pick = tokens[0] || '';
  return pick.toLowerCase();
}

function buildCandidates(firstRaw, lastRaw, domain) {
  const f = normalizeFirstName(firstRaw);
  const l = normalizeLastName(lastRaw);
  if (!f || !domain) return [];
  const fi = f.charAt(0);
  const li = l ? l.charAt(0) : '';
  const out = [];
  const push = (local) => {
    if (!local) return;
    const em = `${local}@${domain}`;
    if (!out.includes(em)) out.push(em);
  };
  push(f);                                  // john@smithtax.com
  if (l) push(`${f}.${l}`);                 // john.smith@smithtax.com
  if (l) push(`${f}${l}`);                  // johnsmith@smithtax.com
  if (l) push(`${fi}${l}`);                 // jsmith@smithtax.com
  if (l) push(`${f}.${li}`);                // john.s@smithtax.com
  return out;
}

// --- MX precheck (free, no credits) ---

async function hasMXRecords(domain) {
  try {
    const records = await dns.resolveMx(domain);
    return Array.isArray(records) && records.length > 0;
  } catch {
    return false; // NXDOMAIN, SERVFAIL, timeout
  }
}

// --- CLI arg parsing ---

function parseArgs(argv) {
  const out = { limit: DEFAULT_LIMIT, dryRun: false, sourceArg: null };
  const args = argv.slice(2);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--dry-run') {
      out.dryRun = true;
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
      console.log('Usage: node scale/find-emails.js [source.csv] [--limit N] [--dry-run]');
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

// --- Main ---

async function main() {
  const { limit, dryRun, sourceArg } = parseArgs(process.argv);
  const reoonKey = (process.env.REOON_API_KEY || '').trim();

  if (dryRun) {
    console.log('[DRY RUN] MX precheck + pattern generation only. No Reoon calls, no CSV writes.');
  } else if (!reoonKey) {
    console.error('ERROR: REOON_API_KEY is required unless --dry-run is set.');
    process.exit(1);
  }

  // 1. Resolve master CSV path (positional arg overrides auto-detect)
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

  // 2. Parse CSV
  const raw = fs.readFileSync(masterPath, 'utf-8');
  const parsed = parseCSV(raw);
  if (parsed.length < 2) {
    console.error('ERROR: CSV has no data rows');
    process.exit(1);
  }

  const headers = parsed[0].slice();
  // Ensure required tracking columns exist.
  if (!headers.includes('email_found')) headers.push('email_found');
  if (!headers.includes('email_status')) headers.push('email_status');
  if (!headers.includes('email_find_attempted')) headers.push('email_find_attempted');

  const records = parsed.slice(1)
    .filter(row => row.length > 1)
    .map(row => {
      const rec = {};
      headers.forEach((h, i) => { rec[h] = row[i] || ''; });
      return rec;
    });

  // 3. Filter eligible rows
  const candidates = records.filter(r => {
    const em = (r.email_found || '').trim();
    const hasEmail = em && em !== 'undefined' && em.toLowerCase() !== 'nan' && em !== 'null';
    if (hasEmail) return false;
    if (!(r.domain_clean || '').trim()) return false;
    if ((r.email_find_attempted || '').trim()) return false;
    if ((r.email_1_prepared_at || '').trim()) return false;
    return true;
  });

  // Sort by domain_clean ascending — same order the batch generator walks in.
  candidates.sort((a, b) => {
    const da = (a.domain_clean || '').trim();
    const db = (b.domain_clean || '').trim();
    if (!da && !db) return 0;
    if (!da) return 1;
    if (!db) return -1;
    return da.localeCompare(db);
  });

  if (candidates.length === 0) {
    console.log('Nothing to scan — no rows with empty email_found + non-empty domain_clean + unscanned.');
    return;
  }

  const target = candidates.slice(0, limit);
  console.log(`Candidates to scan: ${target.length} (of ${candidates.length} eligible, limit=${limit})`);

  // 4. Balance check (skipped under --dry-run)
  if (!dryRun) {
    try {
      const bal = await reoonBalance(reoonKey);
      const daily = Number(bal && (bal.remaining_daily_credits ?? bal.daily_credits_available ?? bal.daily_credits ?? bal.daily ?? NaN));
      const instant = Number(bal && (bal.remaining_instant_credits ?? bal.instant_credits_available ?? bal.instant_credits ?? bal.instant ?? NaN));
      const dailyStr = Number.isFinite(daily) ? daily : 'unknown';
      const instantStr = Number.isFinite(instant) ? instant : 'unknown';
      console.log(`[reoon] Balance — daily: ${dailyStr}, instant: ${instantStr}`);
      if (Number.isFinite(daily) && daily < 50) {
        console.warn(`[reoon] WARNING: daily credits (${daily}) < 50 — this run will be short.`);
        if (process.stdin.isTTY) {
          process.stdout.write('Proceed anyway? [y/N]: ');
          const answer = await new Promise(resolve => {
            process.stdin.resume();
            process.stdin.once('data', d => resolve(d.toString().trim().toLowerCase()));
          });
          if (answer !== 'y' && answer !== 'yes') {
            console.log('Aborted by user.');
            process.exit(0);
          }
        } else {
          console.warn('[reoon] Non-interactive shell — proceeding anyway.');
        }
      }
    } catch (err) {
      console.warn(`[reoon] Balance check failed: ${err.message} — proceeding anyway`);
    }
  }

  // 5. MX precheck + pattern loop
  const now = new Date().toISOString();
  const summary = {
    scanned: 0,
    mxMissing: 0,
    found: 0,
    notFound: 0,
    disposable: 0,
    reoonCalls: 0,
    reoonErrors: 0,
    reoonTimeouts: 0,
    timeoutRetryDeferred: 0,
    stopped: false,
  };
  const foundByDomain = {};
  let lastCallAt = 0;

  const persist = () => {
    if (dryRun) return;
    fs.writeFileSync(masterPath, rowsToCSV(headers, records));
  };

  outer:
  for (const r of target) {
    summary.scanned++;
    const domain = (r.domain_clean || '').trim().toLowerCase();
    const firstRaw = r.First_NAME || '';
    const lastRaw = r.LAST_NAME || '';
    const tag = `${String(firstRaw).trim() || '?'} ${String(lastRaw).trim() || '?'} @ ${domain}`;

    // 5a. MX precheck
    const mxOk = await hasMXRecords(domain);
    if (!mxOk) {
      summary.mxMissing++;
      r.email_status = 'no_mx';
      r.email_find_attempted = now;
      console.log(`  [no-mx] ${tag}`);
      persist();
      continue;
    }

    // 5b. Candidate pattern generation
    const candidatesList = buildCandidates(firstRaw, lastRaw, domain);
    if (candidatesList.length === 0) {
      r.email_find_attempted = now;
      summary.notFound++;
      console.log(`  [no-patterns] ${tag} — could not derive any candidates`);
      persist();
      continue;
    }

    if (dryRun) {
      console.log(`  [mx+patterns] ${tag}`);
      for (const c of candidatesList) console.log(`      would try: ${c}`);
      continue;
    }

    // 5c. Verify each candidate via Reoon Power.
    //
    // Priority ladder (Power mode response includes `status` + `is_deliverable`):
    //   safe + is_deliverable === true   -> FOUND (valid), stop
    //   catch_all                        -> remember as risky fallback, keep trying
    //   safe + is_deliverable === false  -> skip, try next pattern
    //   unknown                          -> skip, try next pattern
    //   invalid / disabled               -> skip, try next pattern
    //   disposable / spamtrap            -> stop (domain-level signal)
    let matched = null;
    let hitDisposable = false;
    let riskyFallback = null; // first catch_all candidate, used if no `safe` hit
    let gotRealResponse = false; // true if at least one candidate received a real Reoon response
    for (const candidate of candidatesList) {
      if (summary.reoonCalls >= CREDIT_SAFETY_CAP) {
        console.warn(`[reoon] Credit safety cap (${CREDIT_SAFETY_CAP}) reached — stopping. Resume tomorrow.`);
        summary.stopped = true;
        break outer;
      }
      // Enforce 1 req/sec between Reoon calls.
      const elapsed = Date.now() - lastCallAt;
      if (lastCallAt > 0 && elapsed < REOON_RATE_LIMIT_MS) {
        await sleep(REOON_RATE_LIMIT_MS - elapsed);
      }
      let res = null;
      try {
        res = await reoonPowerVerify(candidate, reoonKey);
        lastCallAt = Date.now();
        summary.reoonCalls++;
        gotRealResponse = true;
      } catch (err) {
        lastCallAt = Date.now();
        summary.reoonErrors++;
        if (err && err.isTimeout) summary.reoonTimeouts++;
        console.warn(`  [reoon-err] ${candidate} -> ${err.message}`);
        continue;
      }

      const rawStatus = ((res && (res.status || res.state)) || 'unknown').toString().toLowerCase();
      const isDeliverable = res && (res.is_deliverable ?? res.deliverable ?? null);

      if (rawStatus === 'safe' && isDeliverable === true) {
        console.log(`  [power] ${candidate} -> status=${rawStatus} is_deliverable=${isDeliverable} -> FOUND (valid)`);
        matched = { email: candidate };
        break;
      }
      if (rawStatus === 'disposable' || rawStatus === 'spamtrap') {
        console.log(`  [power] ${candidate} -> status=${rawStatus} -> stop (domain-level signal)`);
        hitDisposable = true;
        break;
      }
      if (rawStatus === 'catch_all') {
        console.log(`  [power] ${candidate} -> status=${rawStatus} is_deliverable=${isDeliverable} -> risky (fallback, keep trying)`);
        if (!riskyFallback) riskyFallback = candidate;
        continue;
      }
      // safe+!deliverable, unknown, invalid, disabled, role_account, inbox_full -> skip
      console.log(`  [power] ${candidate} -> status=${rawStatus} is_deliverable=${isDeliverable} -> skip`);
    }

    if (matched) {
      r.email_found = matched.email;
      r.email_status = 'valid';
      r.email_find_attempted = now;
      summary.found++;
      foundByDomain[domain] = (foundByDomain[domain] || 0) + 1;
    } else if (hitDisposable) {
      r.email_status = 'disposable';
      r.email_find_attempted = now;
      summary.disposable++;
    } else if (riskyFallback) {
      r.email_found = riskyFallback;
      r.email_status = 'risky';
      r.email_find_attempted = now;
      summary.found++;
      foundByDomain[domain] = (foundByDomain[domain] || 0) + 1;
      console.log(`  [risky-fallback] ${tag} -> ${riskyFallback} (catch_all, no safe hit)`);
    } else if (!gotRealResponse) {
      // All candidates timed out / errored without a real Reoon response.
      // Do NOT stamp email_find_attempted — leave the row eligible for retry.
      summary.timeoutRetryDeferred++;
      console.log(`  [retry-next-run] ${tag} — all ${candidatesList.length} patterns timed out, leaving row eligible`);
    } else {
      r.email_find_attempted = now;
      summary.notFound++;
      console.log(`  [not-found] ${tag} — all ${candidatesList.length} patterns failed`);
    }
    persist();
  }

  // 6. Remaining credits lookup
  let remainingDaily = null;
  if (!dryRun) {
    try {
      const bal = await reoonBalance(reoonKey);
      const d = Number(bal && (bal.remaining_daily_credits ?? bal.daily_credits_available ?? bal.daily_credits ?? bal.daily ?? NaN));
      remainingDaily = Number.isFinite(d) ? d : null;
    } catch {}
  }

  // 7. Top-domain summary
  const topDomains = Object.entries(foundByDomain)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([d, n]) => `${d} (${n})`)
    .join(', ') || '(none)';

  console.log(`
=== EMAIL FINDER COMPLETE ===
Prospects scanned:            ${summary.scanned}
MX pre-filtered (no mail):    ${summary.mxMissing}
Emails found:                 ${summary.found}
Not found (all patterns):     ${summary.notFound}
Disposable domains hit:       ${summary.disposable}
Reoon Power calls used:       ${summary.reoonCalls}
Reoon errors:                 ${summary.reoonErrors}
Reoon timeouts:               ${summary.reoonTimeouts}
Deferred for retry (timeout): ${summary.timeoutRetryDeferred}
Credit cap reached:           ${summary.stopped ? 'YES — resume tomorrow' : 'no'}
Remaining daily credits:      ${remainingDaily != null ? remainingDaily : 'unknown'}
Top domains (found):          ${topDomains}
${dryRun ? '[DRY RUN] Source CSV was NOT updated.' : `CSV updated: ${masterPath}`}
`);
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
