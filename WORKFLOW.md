# WORKFLOW.md — transcript.taxmonitor.pro
Owner: Jamie L Williams
Last updated: 2026-04-13

---

## 1. Daily Operations

### Morning checklist
- Review any email replies or bounces in Gmail
- Confirm VLP Worker send cron ran successfully (check D1 analytics)
- Confirm R2 asset pages are live for previous batch

### Batch generation (automated — VLP Worker)

Batch generation has migrated to the VLP Worker campaign processor. This repo no longer generates batches.

1. Operator downloads Clay CSV export (pre-validated emails)
2. Operator uploads via VLP dashboard at `virtuallaunch.pro/scale/workflow` (Upload tab)
3. 12:00 UTC — Worker campaign processor parses CSV, generates email copy + asset pages from templates
4. 14:00 UTC — Worker send cron delivers Email 1 via Gmail API
5. Email 2 auto-scheduled 3 days after Email 1

### End of day
- Review open rates and click-through in VLP dashboard analytics
- Check for replies requiring manual response
- Log any issues or observations

---

## 2. Weekly Operations

- **Pipeline health:** Check VLP dashboard for remaining unsent prospects
- **Conversion review:** Emails sent > clicks > signups > payments in Stripe
- **Content refresh:** Update asset page templates based on click/reply performance
- **Prospect sourcing:** If pipeline drops below 200 eligible, download next Clay CSV export

---

## 3. Escalation Triggers

- Pipeline exhausted (fewer than 50 eligible Email 1 records in pending CSVs)
- Bounce rate exceeds 5%
- Spam complaints received
- Stripe payment failures
- Asset page 404s on live links

---

## 4. Key Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run cf:build` | Production build |
| `npm run deploy` | Build + deploy to Cloudflare Workers |
| `npm run preview` | Build + local preview |

Legacy scale commands (retired — VLP Worker handles all batch operations):
- `node scale/generate-batch.js` — replaced by Worker campaign processor
- `node scale/push-*.js` — replaced by Worker campaign processor
- `node scale/scripts/merge-intake.js` — replaced by VLP dashboard upload

---

## 5. Account Credentials Reference

| Platform | URL | Purpose |
|----------|-----|---------|
| Clay.com | clay.com | Prospect sourcing + email validation |
| Stripe | dashboard.stripe.com | Payment processing |
| Cal.com | cal.com/tax-monitor-pro | Discovery call scheduling |
| Cloudflare | dash.cloudflare.com | Workers, R2, KV |
| Gmail | mail.google.com | Outreach sending account (via VLP Worker) |

No passwords here — use password manager.

---

## 6. Troubleshooting

| Issue | Check |
|-------|-------|
| Email not sending | VLP Worker cron logs, Gmail API auth status |
| Asset page 404 | R2 key exists at `vlp-scale/asset-pages/{slug}.json` |
| Campaign processor fails | VLP Worker logs, check pending CSV format |
| Deploy fails | GitHub Actions log, `npm run cf:build` locally |
