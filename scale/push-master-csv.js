#!/usr/bin/env node
// Push the updated master CSV to R2 at vlp-scale/prospects/master.csv.
// Usage: node scale/push-master-csv.js

const fs = require('fs');
const path = require('path');

const R2_KEY = 'vlp-scale/prospects/master.csv';
const API_BASE = 'https://api.virtuallaunch.pro';
const PROSPECTS_DIR = path.join(__dirname, 'prospects');

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

async function main() {
  const token = loadToken();

  // Auto-detect master CSV
  const csvFiles = fs.readdirSync(PROSPECTS_DIR).filter(f => f.startsWith('IRS') && f.endsWith('.csv'));
  if (csvFiles.length === 0) {
    console.error('ERROR: No IRS*.csv file found in scale/prospects/');
    process.exit(1);
  }
  if (csvFiles.length > 1) {
    console.error('ERROR: Multiple IRS*.csv files found in scale/prospects/:', csvFiles);
    process.exit(1);
  }

  const masterPath = path.join(PROSPECTS_DIR, csvFiles[0]);
  const csvData = fs.readFileSync(masterPath, 'utf8');

  const res = await fetch(`${API_BASE}/v1/r2/${encodeURIComponent(R2_KEY)}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/csv',
    },
    body: csvData,
  });

  if (!res.ok) throw new Error(`R2 PUT failed: ${res.status} ${await res.text()}`);
  console.log(`Pushed master CSV to R2 key: ${R2_KEY} (${csvData.length} bytes)`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
