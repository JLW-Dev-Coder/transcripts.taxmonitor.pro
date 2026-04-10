#!/usr/bin/env node
// Build/append an email-to-slug lookup index in R2 at vlp-scale/prospect-index.json.
// Usage: node scale/push-prospect-index.js scale/batches/scale-batch-2026-04-04-1.json

const fs = require('fs');
const path = require('path');

const R2_KEY = 'vlp-scale/prospect-index.json';
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
  if (res.status === 404) return {};
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
    console.error('Usage: node scale/push-prospect-index.js <batch-json-path>');
    process.exit(1);
  }

  const token = loadToken();
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const prospects = Array.isArray(batch) ? batch : batch.prospects || [];

  if (prospects.length === 0) {
    console.error('Error: no prospects found in batch file');
    process.exit(1);
  }

  const existing = await r2Get(token);
  const index = typeof existing === 'object' && !Array.isArray(existing) ? existing : {};

  let added = 0;
  for (const p of prospects) {
    if (p.email && p.slug) {
      index[p.email] = p.slug;
      added++;
    }
  }

  await r2Put(token, index);
  console.log(`Updated prospect index in R2 key: ${R2_KEY} (${added} new entries, ${Object.keys(index).length} total)`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
