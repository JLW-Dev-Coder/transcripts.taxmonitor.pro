# WORKFLOW.md — TTMP SCALE

Repo: transcript.taxmonitor.pro
Owner: Jamie L Williams
Last updated: 2026-04-05

---

## Status

This repo's operational workflow shares the same prospect pipeline as VLP SCALE.
The master workflow with BigQuery, Clay, and Hunter.io instructions is at:

C:\Users\eimaj\virtuallaunch.pro\scale\WORKFLOW.md

TTMP-specific differences from VLP:
- Batch generator: node scale/generate-batch.js (not generate-vlp-batch.js)
- Merge script: node scale/scripts/merge-intake.js (run before batch generation)
- Email pitch: transcript time savings, not directory listings
- Token packs: $19/$29/$129 (not membership tiers)
- Tracking column: email_1_prepared_at (not vlp_email_1_prepared_at)

When sourcing for TTMP, use a separate Clay batch from VLP prospects.
The batch generator filters by email_1_prepared_at, not vlp_email_1_prepared_at.

---

## Quick Reference

| Item | Value |
|------|-------|
| Platform | Transcript Tax Monitor Pro |
| Domain | transcript.taxmonitor.pro |
| Campaign type | Email (Hunter.io) |
| Deploy command | npm run deploy |
| Batch generator | node scale/generate-batch.js scale/prospects/{source}.csv |
| Merge script | node scale/scripts/merge-intake.js |
