#!/usr/bin/env node
// Push email2 queue to R2 for the VLP Worker cron.
// Usage: node scale/push-email2-queue.js scale/batches/scale-batch-2026-04-01.json

const fs = require('fs');
const path = require('path');

const R2_KEY = 'vlp-scale/send-queue/email2-pending.json';
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
  const res = await fetch(`${API_BASE}/v1/r2/${R2_KEY.split('/').map(encodeURIComponent).join('/')}`, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`R2 GET failed: ${res.status} ${await res.text()}`);
  return res.json();
}

async function r2Put(token, data) {
  const res = await fetch(`${API_BASE}/v1/r2/${R2_KEY.split('/').map(encodeURIComponent).join('/')}`, {
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
  const batchPath = process.argv[2];
  if (!batchPath) {
    console.error('Usage: node scale/push-email2-queue.js <batch-json-path>');
    process.exit(1);
  }

  const token = loadToken();
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const prospects = Array.isArray(batch) ? batch : batch.prospects || [];

  if (prospects.length === 0) {
    console.error('Error: no prospects found in batch file');
    process.exit(1);
  }

  const newRecords = prospects.map(p => ({
    email: p.email,
    slug: p.slug,
    name: p.name,
    subject: p.email_2?.subject || '',
    body: p.email_2?.body || '',
    queued_at: new Date().toISOString(),
  }));

  // Merge with existing queue — don't overwrite records that already have email_2_sent_at
  const existing = await r2Get(token);
  const sentEmails = new Set(
    existing.filter(r => r.email_2_sent_at).map(r => r.email)
  );
  const merged = [
    ...existing,
    ...newRecords.filter(r => !sentEmails.has(r.email)),
  ];

  await r2Put(token, merged);
  console.log(`Pushed ${newRecords.length} records to R2 key: ${R2_KEY}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
