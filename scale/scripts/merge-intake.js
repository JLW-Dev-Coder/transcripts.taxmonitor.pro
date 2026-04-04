#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const PROSPECTS_DIR = path.join(__dirname, '..', 'prospects');
const LOCKFILE = path.join(PROSPECTS_DIR, '.batch-in-progress');
const INTAKE_PATH = path.join(PROSPECTS_DIR, 'new-prospects.csv');
const ARCHIVE_DIR = path.join(PROSPECTS_DIR, 'archive');

const FREE_EMAIL_PROVIDERS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com',
  'icloud.com', 'protonmail.com', 'proton.me', 'live.com', 'msn.com', 'me.com'
]);

const VALID_FIRM_BUCKETS = new Set(['solo_brand', 'local_firm', 'national_firm']);

// --- CSV helpers (no external deps) ---

function parseCSVRow(line) {
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current);
        current = '';
      } else {
        current += ch;
      }
    }
  }
  fields.push(current);
  return fields;
}

function escapeCSVField(value) {
  if (value == null) return '';
  const str = String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function rowToCSV(fields) {
  return fields.map(escapeCSVField).join(',');
}

// --- Read CSV file into { headers: string[], rows: object[] } ---

function readCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };
  const headers = parseCSVRow(lines[0]);
  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const fields = parseCSVRow(lines[i]);
    const obj = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = fields[j] !== undefined ? fields[j] : '';
    }
    rows.push(obj);
  }
  return { headers, rows };
}

// --- Main ---

function main() {
  // 1. Check lockfile
  if (fs.existsSync(LOCKFILE)) {
    console.log('Batch in progress — wait for Claude to finish and try again.');
    process.exit(1);
  }

  // 2. Read intake file
  if (!fs.existsSync(INTAKE_PATH)) {
    console.log('No intake file found or intake file is empty.');
    process.exit(1);
  }
  const intakeContent = fs.readFileSync(INTAKE_PATH, 'utf-8').trim();
  const intakeLines = intakeContent.split(/\r?\n/).filter(l => l.trim() !== '');
  if (intakeLines.length <= 1) {
    console.log('No intake file found or intake file is empty.');
    process.exit(1);
  }
  const intake = readCSV(INTAKE_PATH);

  // 3. Find master CSV
  const csvFiles = fs.readdirSync(PROSPECTS_DIR).filter(f => f.startsWith('IRS') && f.endsWith('.csv'));
  if (csvFiles.length === 0) {
    console.log('Error: No master CSV found in scale/prospects/ starting with "IRS".');
    process.exit(1);
  }
  if (csvFiles.length > 1) {
    console.log('Error: Multiple CSV files starting with "IRS" found in scale/prospects/. Expected exactly one.');
    process.exit(1);
  }
  const masterPath = path.join(PROSPECTS_DIR, csvFiles[0]);
  const master = readCSV(masterPath);

  // Build set of existing emails in master (lowercase for comparison)
  const masterEmails = new Set();
  for (const row of master.rows) {
    const email = (row.email_found || '').trim().toLowerCase();
    if (email) masterEmails.add(email);
  }

  // 4. Validate and process intake rows
  const stats = {
    total: intake.rows.length,
    merged: 0,
    rejected: 0,
    invalidEmail: 0,
    invalidEmailStatus: 0,
    invalidFirmBucket: 0,
    dupMaster: 0,
    dupIntake: 0,
    emptyEmail: 0,
    reviewDomainMismatch: 0,
  };

  const validRows = [];
  const seenIntakeEmails = new Set();
  const reviewRows = [];

  for (const row of intake.rows) {
    const emailRaw = (row.email_found || '').trim();
    const emailLower = emailRaw.toLowerCase();

    // Validate email_found is non-empty, not "undefined", not "NaN"
    if (!emailRaw || emailRaw === 'undefined' || emailRaw === 'NaN' || emailRaw.toLowerCase() === 'nan') {
      stats.emptyEmail++;
      stats.rejected++;
      continue;
    }

    // Validate email_status
    const emailStatus = (row.email_status || '').trim();
    if (emailStatus !== 'valid' && emailStatus !== 'invalid') {
      stats.invalidEmailStatus++;
      stats.rejected++;
      continue;
    }

    // Validate firm_bucket
    const firmBucket = (row.firm_bucket || '').trim();
    if (!VALID_FIRM_BUCKETS.has(firmBucket)) {
      stats.invalidFirmBucket++;
      stats.rejected++;
      continue;
    }

    // Deduplicate against master
    if (masterEmails.has(emailLower)) {
      stats.dupMaster++;
      stats.rejected++;
      continue;
    }

    // Deduplicate within intake
    if (seenIntakeEmails.has(emailLower)) {
      stats.dupIntake++;
      stats.rejected++;
      continue;
    }
    seenIntakeEmails.add(emailLower);

    // Check email domain vs domain_clean
    const emailDomain = emailRaw.split('@')[1] || '';
    const domainClean = (row.domain_clean || '').trim().toLowerCase();
    if (emailDomain.toLowerCase() !== domainClean && !FREE_EMAIL_PROVIDERS.has(emailDomain.toLowerCase())) {
      stats.reviewDomainMismatch++;
      reviewRows.push(row);
    }

    validRows.push(row);
  }

  stats.merged = validRows.length;

  // 5. Transform and append valid rows to master
  if (validRows.length > 0) {
    // Build lines matching master CSV header exactly
    const appendLines = [];
    for (const row of validRows) {
      // Map intake columns to master columns, dropping FULL_NAME, adding tracking cols
      const masterRow = {};
      for (const col of master.headers) {
        if (col === 'clay_workbook_ref') {
          masterRow[col] = row.clay_workbook_ref || '';
        } else if (['email_1_prepared_at', 'email_2_prepared_at', 'email_3_prepared_at'].includes(col)) {
          masterRow[col] = '';
        } else {
          masterRow[col] = row[col] !== undefined ? row[col] : '';
        }
      }
      const fields = master.headers.map(h => masterRow[h] || '');
      appendLines.push(rowToCSV(fields));
    }

    // Append to master (add newline before if file doesn't end with one)
    const masterContent = fs.readFileSync(masterPath, 'utf-8');
    const separator = masterContent.endsWith('\n') ? '' : '\n';
    fs.appendFileSync(masterPath, separator + appendLines.join('\n') + '\n');
  }

  // 6. Archive intake file
  if (!fs.existsSync(ARCHIVE_DIR)) {
    fs.mkdirSync(ARCHIVE_DIR, { recursive: true });
  }
  const today = new Date().toISOString().split('T')[0];
  let archiveName = `intake-${today}.csv`;
  let archivePath = path.join(ARCHIVE_DIR, archiveName);
  let suffix = 2;
  while (fs.existsSync(archivePath)) {
    archiveName = `intake-${today}-${suffix}.csv`;
    archivePath = path.join(ARCHIVE_DIR, archiveName);
    suffix++;
  }
  fs.copyFileSync(INTAKE_PATH, archivePath);

  // 7. Truncate intake to header row only
  const intakeHeader = intakeLines[0];
  fs.writeFileSync(INTAKE_PATH, intakeHeader + '\n');

  // 8. Recount master rows
  const updatedMaster = readCSV(masterPath);
  const masterTotal = updatedMaster.rows.length;

  // 9. Print summary
  console.log('');
  console.log('=== MERGE COMPLETE ===');
  console.log(`Rows in intake file: ${stats.total}`);
  console.log(`Rows merged: ${stats.merged}`);
  console.log(`Rows rejected: ${stats.rejected}`);
  console.log(`  - invalid email_status: ${stats.invalidEmailStatus}`);
  console.log(`  - invalid firm_bucket: ${stats.invalidFirmBucket}`);
  console.log(`  - duplicate in master: ${stats.dupMaster}`);
  console.log(`  - duplicate in intake: ${stats.dupIntake}`);
  console.log(`  - empty email: ${stats.emptyEmail}`);
  console.log(`Rows flagged for review (email domain mismatch): ${stats.reviewDomainMismatch}`);
  console.log(`Master CSV total rows: ${masterTotal}`);
  console.log(`Archive saved: scale/prospects/archive/${archiveName}`);
}

main();
