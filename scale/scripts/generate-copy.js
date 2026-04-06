#!/usr/bin/env node
/**
 * generate-copy.js
 * Reads a batch-selection JSON and produces:
 *   1. scale-batch-{date}-{n}.json  (full batch with asset_page + email copy)
 *   2. gmail/email1/{date}-{n}-batch.csv (Gmail import CSV)
 *
 * Usage: node scale/scripts/generate-copy.js scale/batches/batch-selection-2026-04-05-1.json
 */

const fs = require('fs');
const path = require('path');

const selectionPath = process.argv[2];
if (!selectionPath) {
  console.error('Usage: node generate-copy.js <batch-selection-file>');
  process.exit(1);
}

const prospects = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));

// Extract date and sequence from filename: batch-selection-YYYY-MM-DD-N.json
const basename = path.basename(selectionPath, '.json');
const match = basename.match(/batch-selection-(\d{4}-\d{2}-\d{2})-(\d+)/);
if (!match) {
  console.error('Cannot parse date/sequence from filename:', basename);
  process.exit(1);
}
const [, batchDate, seq] = match;

// --- Helpers ---

function titleCase(str) {
  return str
    .toLowerCase()
    .split(/[\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function credentialLabel(cred) {
  switch ((cred || '').toUpperCase()) {
    case 'EA': return 'EAs';
    case 'CPA': return 'CPAs';
    case 'ATTY': return 'attorneys';
    case 'JD': return 'attorneys';
    default: return 'CPAs';
  }
}

function credentialLabelLong(cred) {
  switch ((cred || '').toUpperCase()) {
    case 'EA': return 'Enrolled Agents';
    case 'CPA': return 'CPAs';
    case 'ATTY': return 'attorneys';
    case 'JD': return 'attorneys';
    default: return 'CPAs';
  }
}

function cityTitle(city) {
  // Title-case city, handle multi-word
  return city
    .split(/[\s]+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

// --- Workflow gaps pool (rotate to add variety) ---
const gapSets = [
  [
    'Manual transcript review averaging 20+ minutes per client',
    'No automated detection of priority transaction codes',
    'Billable hours lost to repetitive transcript interpretation',
  ],
  [
    'Manually reading IRS transaction codes line by line — 20+ minutes per transcript',
    'Cross-referencing code meanings across multiple IRS publications',
    'Retyping key figures into client-facing summaries instead of auto-generating reports',
  ],
  [
    'Spending 20+ minutes decoding each IRS transcript by hand',
    'No system to flag high-priority codes like 971, 846, or 570 automatically',
    'Hours of billable time consumed by repetitive manual transcript work each week',
  ],
];

// --- Generate per prospect ---

const batch = [];

for (let i = 0; i < prospects.length; i++) {
  const p = prospects[i];
  const first = titleCase(p.first_name);
  const city = cityTitle(p.city);
  const cred = (p.credential || 'CPA').toUpperCase();
  const credShort = credentialLabel(cred);
  const credLong = credentialLabelLong(cred);
  const isSolo = p.firm_bucket === 'solo_brand';
  const hrsRaw = p.time_savings_weekly;   // "5.0 hours"
  const annualRaw = p.time_savings_annual; // "260 hours"
  const hrs = hrsRaw.replace(/\s*hours?/, '');      // "5.0"
  const annualHrs = annualRaw.replace(/\s*hours?/, ''); // "260"
  const rev = p.revenue_opportunity;
  const slug = p.slug;
  const firm = p.firm;

  // Subject & headline per firm_bucket
  let email1Subject, headline;
  if (isSolo) {
    email1Subject = `${first} — ${credShort} running ${firm} spend ${hrs}+ hours/week on this`;
    headline = `${first}, here's what 20 minutes per transcript is costing ${firm}`;
  } else {
    email1Subject = `${first} — ${credShort} in ${city} are spending ${hrs}+ hours/week on this`;
    headline = `${first}, here's what 20 minutes per transcript is costing your ${city} practice`;
  }

  // Full display strings for body copy
  const hrsDisplay = `${hrs} hours`;
  const annualDisplay = `${annualHrs} hours`;

  const subheadline = `A practice analysis for ${credLong} who work with IRS transcripts`;

  const firmRef = isSolo ? firm : `your ${city} practice`;

  // Email 1 body
  const email1Body = `Hi ${first},

I built a tool that turns IRS transcripts into plain-English reports in seconds — specifically for ${credShort} who are done spending 20 minutes per client translating transaction codes manually. I'm an EA myself, so I built it from the same frustration.

At ${hrsDisplay} per week, that adds up to ${annualDisplay} a year of work that should take seconds. Transcript Tax Monitor Pro handles it for $19 per 10 analyses, with nothing to install.

Here's a free IRS code lookup to try first, no account needed:
https://transcript.taxmonitor.pro/tools/code-lookup

And here's a quick practice analysis I put together for ${firmRef}:
https://transcript.taxmonitor.pro/asset/${slug}

If any of this lands, I'd be glad to show you a live analysis on a real transcript — 15 minutes on Google Meet.
https://cal.com/tax-monitor-pro/ttmp-discovery?slug=${slug}

—
Jamie L Williams, EA
Founder, Transcript Tax Monitor Pro
transcript.taxmonitor.pro`;

  // Email 2
  const email2Subject = `Quick asset generated for your firm, ${first} — ${annualDisplay}/yr on the table`;

  const email2Body = `Hi ${first},

I sent you a note a few days ago about a tool I built for ${credShort} who spend too long on IRS transcripts. I'm an EA myself, so I built it from the same frustration.

I put together a quick practice analysis for ${firmRef} — it breaks down what ${hrsDisplay} per week of manual transcript work is really costing in billable time:
https://transcript.taxmonitor.pro/asset/${slug}

That's ${annualDisplay} a year, or ${rev} in recovered revenue. Transcript Tax Monitor Pro turns each transcript into a plain-English report in seconds, for $19 per 10 analyses.

If you'd like to see it in action on a real transcript, here's a 15-minute slot:
https://cal.com/tax-monitor-pro/ttmp-discovery?slug=${slug}

Or check out pricing here:
https://transcript.taxmonitor.pro/pricing

—
Jamie L Williams, EA
Founder, Transcript Tax Monitor Pro
transcript.taxmonitor.pro`;

  const record = {
    slug,
    email: p.email,
    name: `${first} ${titleCase(p.last_name)}`,
    credential: cred,
    city,
    state: p.state,
    firm,
    firm_bucket: p.firm_bucket,
    domain_clean: p.domain_clean,
    asset_page: {
      headline,
      subheadline,
      workflow_gaps: gapSets[i % gapSets.length],
      time_savings_weekly: hrsDisplay,
      time_savings_annual: annualDisplay,
      revenue_opportunity: `${rev} in recovered billable time`,
      tool_preview_codes: ['971', '846', '570'],
      cta_pricing_url: 'https://transcript.taxmonitor.pro/pricing',
      cta_booking_url: `https://cal.com/tax-monitor-pro/ttmp-discovery?slug=${slug}`,
      cta_learn_more_url: 'https://transcript.taxmonitor.pro',
    },
    email_1: { subject: email1Subject, body: email1Body },
    email_2: { subject: email2Subject, body: email2Body },
  };

  batch.push(record);
}

// --- Write batch JSON ---
const batchPath = path.join('scale', 'batches', `scale-batch-${batchDate}-${seq}.json`);
fs.writeFileSync(batchPath, JSON.stringify(batch, null, 2) + '\n', 'utf8');
console.log(`Batch JSON written: ${batchPath} (${batch.length} records)`);

// --- Write Gmail CSV ---
function csvEscape(str) {
  // RFC 4180: wrap in quotes, escape internal quotes
  return '"' + str.replace(/"/g, '""') + '"';
}

const csvLines = ['email,first_name,subject,body'];
for (const r of batch) {
  const first = r.name.split(' ')[0];
  csvLines.push(
    [csvEscape(r.email), csvEscape(first), csvEscape(r.email_1.subject), csvEscape(r.email_1.body)].join(',')
  );
}

const csvPath = path.join('scale', 'gmail', 'email1', `${batchDate}-${seq}-batch.csv`);
fs.writeFileSync(csvPath, csvLines.join('\n') + '\n', 'utf8');
console.log(`Gmail CSV written: ${csvPath} (${batch.length} rows + header)`);
