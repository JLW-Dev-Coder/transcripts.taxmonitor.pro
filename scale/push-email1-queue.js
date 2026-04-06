#!/usr/bin/env node
// Push email1 Gmail CSV to R2 as a send queue for the VLP Worker cron.
// Usage: node scale/push-email1-queue.js scale/gmail/email1/2026-04-01-batch.csv

const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

const R2_KEY = 'vlp-scale/send-queue/email1-pending.json';
const API_BASE = 'https://api.taxmonitor.pro';

function loadToken() {
  if (process.env.R2_CANONICAL_WRITE_TOKEN) return process.env.R2_CANONICAL_WRITE_TOKEN;
  try {
    const envPath = path.resolve(__dirname, '..', '.env');
    const envFile = fs.readFileSync(envPath, 'utf8');
    const match = envFile.match(/^R2_CANONICAL_WRITE_TOKEN=(.+)$/m);
    if (match) return match[1].trim();
  } catch (_) {}
  console.error('Error: R2_CANONICAL_WRITE_TOKEN not found in environment or .env file');
  process.exit(1);
}

async function r2Get(token) {
  const res = await fetch(`${API_BASE}/v1/r2/${encodeURIComponent(R2_KEY)}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`R2 GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function r2Put(token, data) {
  const res = await fetch(`${API_BASE}/v1/r2/${encodeURIComponent(R2_KEY)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`R2 PUT failed: ${res.status} ${await res.text()}`);
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error('Usage: node scale/push-email1-queue.js <csv-path>');
    process.exit(1);
  }

  const token = loadToken();
  const raw = fs.readFileSync(csvPath, 'utf8');
  const parsed = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_quotes: true,
    trim: true,
  });
  const newRecords = parsed.map(r => ({
    email: r.EMAIL,
    first_name: r.FIRSTNAME,
    subject: r.SUBJECT,
    body: r.BODY,
    queued_at: new Date().toISOString(),
  }));

  if (newRecords.length === 0) {
    console.error('Error: no records found in CSV');
    process.exit(1);
  }

  // Merge with existing queue — don't overwrite records that already have email_1_sent_at
  const existing = await r2Get(token);
  const sentEmails = new Set(
    existing.filter(r => r.email_1_sent_at).map(r => r.email)
  );
  const merged = [
    ...existing,
    ...newRecords.filter(r => !sentEmails.has(r.email)),
  ];

  await r2Put(token, merged);
  console.log(`Pushed ${newRecords.length} records to R2 key: ${R2_KEY}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
