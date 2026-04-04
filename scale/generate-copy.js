#!/usr/bin/env node
/**
 * generate-copy.js
 * Reads batch-selection-{date}.json and produces:
 *   - scale/batches/scale-batch-{date}.json
 *   - scale/gmail/email1/{date}-batch.csv
 */

const fs = require('fs');
const path = require('path');
const { expandAbbreviations } = require('./lib/expand-abbreviations');

const date = process.argv[2] || new Date().toISOString().slice(0, 10);
const selectionPath = path.join(__dirname, 'batches', `batch-selection-${date}.json`);
const batchOutPath = path.join(__dirname, 'batches', `scale-batch-${date}.json`);
const csvOutPath = path.join(__dirname, 'gmail', 'email1', `${date}-batch.csv`);

const records = JSON.parse(fs.readFileSync(selectionPath, 'utf8'));

// --- Truncation fixes (copy-layer only, source data unchanged) ---
// Keyed by exact source firm value → corrected value.
// Only fix when the completed word is obvious (1-3 missing letters).
const TRUNCATION_FIXES = [
  { match: /\bPlannin\b/, replacement: 'Planning' },
  { match: /\bIntegri$/, replacement: 'Integrity' },
];

function applyTruncationFixes(text) {
  let result = text;
  for (const fix of TRUNCATION_FIXES) {
    result = result.replace(fix.match, fix.replacement);
  }
  return result;
}

// --- Text formatting helpers ---

function titleCase(s) {
  if (!s) return s;
  return s
    .split(/(\s+|-)/g)
    .map(part => {
      if (/^\s+$/.test(part) || part === '-') return part;
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

// Acronyms that should stay uppercase after title-casing
const ACRONYMS = ['DBA', 'LLC', 'LLP', 'CPA', 'EA', 'PC', 'PLLC', 'LTD', 'INC'];

function preserveAcronyms(text) {
  return text.replace(/\b\w+\b/g, word => {
    const upper = word.toUpperCase();
    if (ACRONYMS.includes(upper)) return upper;
    return word;
  });
}

function firstName(raw) {
  return titleCase(raw.trim());
}

function cityDisplay(city) {
  const titled = city
    .split(/\s+/)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
  return expandAbbreviations(titled);
}

function firmDisplay(firm) {
  // Detect if the firm is mostly uppercase (all-caps source data)
  const words = firm.trim().split(/\s+/);
  const upperCount = words.filter(w => w === w.toUpperCase() && w.length > 1).length;
  const isAllCaps = upperCount > words.length / 2;

  let display = isAllCaps ? titleCase(firm) : firm;
  display = preserveAcronyms(display);
  display = applyTruncationFixes(display);
  display = expandAbbreviations(display);
  return display;
}

function credentialLabel(cred) {
  if (cred === 'EA') return 'Enrolled Agents';
  if (cred === 'CPA') return 'CPAs';
  if (cred === 'JD') return 'attorneys';
  return 'tax professionals';
}

function credentialPlural(cred) {
  if (cred === 'EA') return 'EAs';
  if (cred === 'CPA') return 'CPAs';
  if (cred === 'JD') return 'JDs';
  return 'tax professionals';
}

function workflowGaps(cred) {
  if (cred === 'EA') return [
    "Manually reading IRS transaction codes line by line \u2014 20+ minutes per transcript",
    "Cross-referencing code meanings across multiple IRS publications",
    "Retyping key figures into client-facing summaries instead of auto-generating reports"
  ];
  if (cred === 'CPA') return [
    "Manual transcript review averaging 20+ minutes per client",
    "No automated detection of priority transaction codes",
    "Billable hours lost to repetitive transcript interpretation"
  ];
  if (cred === 'JD') return [
    "Manual transcript review slowing case preparation",
    "No automated flagging for priority codes like 971, 846, or 570",
    "Time-sensitive transcript changes going undetected"
  ];
  return [
    "Manually reading IRS transaction codes line by line \u2014 20+ minutes per transcript",
    "Cross-referencing code meanings across multiple IRS publications",
    "Retyping key figures into client-facing summaries instead of auto-generating reports"
  ];
}

function timeSavings(cred) {
  if (cred === 'EA') return { weekly: '6.7 hours', annual: '348 hours', revenue: '$34,800\u2013$104,400/yr' };
  if (cred === 'CPA') return { weekly: '5.0 hours', annual: '260 hours', revenue: '$39,000\u2013$104,000/yr' };
  if (cred === 'JD') return { weekly: '3.3 hours', annual: '174 hours', revenue: '$34,800\u2013$87,000/yr' };
  return { weekly: '5.0 hours', annual: '260 hours', revenue: '$39,000\u2013$104,000/yr' };
}

function buildRecord(r) {
  const first = firstName(r.first_name);
  const cred = r.credential || 'EA';
  const ts = timeSavings(cred);
  const city = cityDisplay(r.city);
  const firm = firmDisplay(r.firm);
  const bucket = r.firm_bucket;
  const slug = r.slug;
  const hrsWeekNum = ts.weekly.replace(' hours', '');

  // Headline + subject per firm_bucket
  let headline, subject;
  if (bucket === 'solo_brand') {
    headline = `${first}, here's what 20 minutes per transcript is costing ${firm}`;
    subject = `${first} \u2014 ${credentialPlural(cred)} running ${firm} spend ${hrsWeekNum}+ hours/week on this`;
  } else {
    headline = `${first}, here's what 20 minutes per transcript is costing your ${city} practice`;
    subject = `${first} \u2014 ${credentialPlural(cred)} in ${city} are spending ${hrsWeekNum}+ hours/week on this`;
  }

  const asset_page = {
    headline,
    subheadline: `A practice analysis for ${credentialLabel(cred)} who work with IRS transcripts`,
    workflow_gaps: workflowGaps(cred),
    time_savings_weekly: ts.weekly,
    time_savings_annual: ts.annual,
    revenue_opportunity: `${ts.revenue} in recovered billable time`,
    tool_preview_codes: ["971", "846", "570"],
    cta_pricing_url: "https://transcript.taxmonitor.pro/pricing",
    cta_booking_url: "https://cal.com/vlp/ttmp-discovery",
    cta_learn_more_url: "https://transcript.taxmonitor.pro"
  };

  // Firm reference in email body
  const firmRef = bucket === 'solo_brand' ? firm : `your ${city} practice`;

  // Email 1 body (SKILL.md template)
  const email1Body = `Hi ${first},

I built a tool that turns IRS transcripts into plain-English reports in seconds \u2014 specifically for ${credentialPlural(cred)} who are done spending 20 minutes per client translating transaction codes manually. I'm an EA myself, so I built it from the same frustration.

At ${ts.weekly} per week, that adds up to ${ts.annual} a year of work that should take seconds. Transcript Tax Monitor Pro handles it for $19 per 10 analyses, with nothing to install.

Here's a free IRS code lookup to try first, no account needed:
https://transcript.taxmonitor.pro/tools/code-lookup

And here's a quick practice analysis I put together for ${firmRef}:
https://transcript.taxmonitor.pro/asset/${slug}

If any of this lands, I'd be glad to show you a live analysis on a real transcript \u2014 15 minutes on Google Meet.
https://cal.com/vlp/ttmp-discovery

\u2014
Jamie L Williams, EA
Founder, Transcript Tax Monitor Pro
transcript.taxmonitor.pro`;

  // Email 2 body
  const annualHrs = ts.annual.replace(' hours', '');
  const email2Subject = `Quick asset generated for your firm, ${first} \u2014 ${annualHrs} hours/yr on the table`;
  const email2Body = `Hi ${first},

I sent you a note a few days ago about a tool I built for ${credentialPlural(cred)} who spend too long on IRS transcripts. I'm an EA myself, so I built it from the same frustration.

I put together a quick practice analysis for ${firmRef} \u2014 it breaks down what ${ts.weekly} per week of manual transcript work is really costing in billable time:
https://transcript.taxmonitor.pro/asset/${slug}

That's ${ts.annual} a year, or ${ts.revenue} in recovered revenue. Transcript Tax Monitor Pro turns each transcript into a plain-English report in seconds, for $19 per 10 analyses.

If you'd like to see it in action on a real transcript, here's a 15-minute slot:
https://cal.com/vlp/ttmp-discovery

Or check out pricing here:
https://transcript.taxmonitor.pro/pricing

\u2014
Jamie L Williams, EA
Founder, Transcript Tax Monitor Pro
transcript.taxmonitor.pro`;

  return {
    slug,
    email: r.email,
    name: `${first} ${titleCase(r.last_name)}`,
    credential: cred,
    city,
    state: r.state,
    firm,
    firm_bucket: bucket,
    domain_clean: r.domain_clean,
    asset_page,
    email_1: { subject, body: email1Body },
    email_2: { subject: email2Subject, body: email2Body }
  };
}

// Generate all records
const batch = records.map(buildRecord);

// Validate
const slugs = new Set();
let errors = [];
batch.forEach((rec, i) => {
  if (!rec.email || rec.email === 'undefined' || rec.email === 'NaN') {
    errors.push(`Record ${i}: invalid email "${rec.email}"`);
  }
  if (slugs.has(rec.slug)) {
    errors.push(`Record ${i}: duplicate slug "${rec.slug}"`);
  }
  slugs.add(rec.slug);
  if (!rec.email_1.body.includes('Jamie L Williams')) {
    errors.push(`Record ${i}: missing signature in email_1`);
  }
  if (!rec.email_2.body.includes('Jamie L Williams')) {
    errors.push(`Record ${i}: missing signature in email_2`);
  }
  if (rec.email_1.body.includes('Woodland Hls') || rec.email_1.subject.includes('Woodland Hls')) {
    errors.push(`Record ${i}: unexpanded "Woodland Hls" in email_1`);
  }
  if (/\bPlannin\b(?!g)/i.test(rec.email_1.body) || /\bPlannin\b(?!g)/i.test(rec.email_1.subject)) {
    errors.push(`Record ${i}: truncated "Plannin" in email_1`);
  }
});

if (errors.length > 0) {
  console.error('VALIDATION ERRORS:');
  errors.forEach(e => console.error('  ' + e));
  process.exit(1);
}

// Write JSON batch
fs.writeFileSync(batchOutPath, JSON.stringify(batch, null, 2), 'utf8');
console.log(`Wrote ${batchOutPath} (${batch.length} records)`);

// Write Gmail CSV
function csvEscape(s) {
  return '"' + s.replace(/"/g, '""') + '"';
}

const csvLines = ['email,first_name,subject,body'];
batch.forEach(rec => {
  csvLines.push([
    csvEscape(rec.email),
    csvEscape(rec.name.split(' ')[0]),
    csvEscape(rec.email_1.subject),
    csvEscape(rec.email_1.body)
  ].join(','));
});

fs.writeFileSync(csvOutPath, csvLines.join('\n') + '\n', 'utf8');
console.log(`Wrote ${csvOutPath} (${batch.length} data rows + header)`);

// Summary
console.log(`\nBatch complete \u2014 ${batch.length} prospects processed`);
console.log(`Skipped: 0`);
console.log(`Errors: 0`);
console.log(`All ${batch.length} slugs unique`);
console.log(`All ${batch.length} emails valid`);
console.log(`All ${batch.length} bodies contain signature`);
console.log(`Abbreviation expansion: active`);
console.log(`Truncation fixes: active`);
