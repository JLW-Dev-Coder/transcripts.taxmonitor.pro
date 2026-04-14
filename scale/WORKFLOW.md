# WORKFLOW.md — TTMP SCALE

Repo: transcript.taxmonitor.pro
Owner: Jamie L Williams
Last updated: 2026-04-13

---

## Status

> **RETIRED (2026-04-13):** This repo's SCALE workflow has migrated to the VLP Worker
> campaign processor. Batch generation, email copy, asset page creation, and R2 push
> are all handled by the Worker. Clay.com CSVs are uploaded via the VLP dashboard.

This repo still owns the asset page route (`/asset/[slug]`) and all frontend pages.

---

## Quick Reference

| Item | Value |
|------|-------|
| Platform | Transcript Tax Monitor Pro |
| Domain | transcript.taxmonitor.pro |
| Campaign type | Email (VLP Worker via Gmail API) |
| Prospect source | Clay.com CSV exports (pre-validated) |
| Upload | VLP dashboard at virtuallaunch.pro/scale/workflow (Upload tab) |
| Deploy command | npm run deploy |
