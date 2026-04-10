#!/usr/bin/env node
// Append a batch history entry to R2 at vlp-scale/batch-history.json.
// Usage: node scale/push-batch-history.js scale/batches/scale-batch-2026-04-04-1.json

const fs = require('fs');
const path = require('path');

const R2_KEY = 'vlp-scale/batch-history.json';
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
    console.error('Usage: node scale/push-batch-history.js <batch-json-path>');
    process.exit(1);
  }

  const token = loadToken();
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const prospects = Array.isArray(batch) ? batch : batch.prospects || [];

  if (prospects.length === 0) {
    console.error('Error: no prospects found in batch file');
    process.exit(1);
  }

  // Extract date from batch filename (e.g. scale-batch-2026-04-04-1.json)
  const basename = path.basename(batchPath, '.json');
  const dateMatch = basename.match(/scale-batch-(\d{4}-\d{2}-\d{2}(-\d+)?)/);
  const batchDate = dateMatch ? dateMatch[1].replace(/-\d+$/, '') : new Date().toISOString().slice(0, 10);

  const entry = {
    date: batchDate,
    batch_file: path.basename(batchPath),
    record_count: prospects.length,
    email1_pushed: true,
    asset_pages_pushed: true,
    created_at: new Date().toISOString(),
  };

  const existing = await r2Get(token);
  const history = Array.isArray(existing) ? existing : [];
  history.push(entry);

  await r2Put(token, history);
  console.log(`Appended batch history entry to R2 key: ${R2_KEY} (${prospects.length} records, ${batchDate})`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
