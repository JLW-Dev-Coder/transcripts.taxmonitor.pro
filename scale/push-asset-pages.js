#!/usr/bin/env node
// Push asset pages to R2 — one object per prospect.
// Usage: node scale/push-asset-pages.js scale/batches/scale-batch-2026-04-01.json

const fs = require('fs');
const path = require('path');

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

async function r2Put(token, key, data) {
  const res = await fetch(`${API_BASE}/v1/r2/${encodeURIComponent(key)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`R2 PUT failed for ${key}: ${res.status} ${await res.text()}`);
}

async function main() {
  const batchPath = process.argv[2];
  if (!batchPath) {
    console.error('Usage: node scale/push-asset-pages.js <batch-json-path>');
    process.exit(1);
  }

  const token = loadToken();
  const batch = JSON.parse(fs.readFileSync(batchPath, 'utf8'));
  const prospects = Array.isArray(batch) ? batch : batch.prospects || [];

  if (prospects.length === 0) {
    console.error('Error: no prospects found in batch file');
    process.exit(1);
  }

  let pushed = 0;
  for (const p of prospects) {
    const key = `vlp-scale/asset-pages/${p.slug}.json`;
    const assetData = {
      ...p.asset_page,
      name: p.name,
      firm: p.firm,
      city: p.city,
      state: p.state,
    };
    await r2Put(token, key, assetData);
    pushed++;
  }

  console.log(`Pushed ${pushed} records to R2 key: vlp-scale/asset-pages/{slug}.json`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
