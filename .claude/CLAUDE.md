# transcript.taxmonitor.pro — Claude Context

## Role of This Repo
FRONTEND ONLY. No backend logic lives here.
All API calls go to https://api.virtuallaunch.pro

## Migration Complete
Backend:  ✅ All 24 routes live in VLP Worker
Frontend: ✅ All API calls pointing to api.virtuallaunch.pro
Worker:   ✅ Deleted from this repo
Remaining: Delete Worker from Cloudflare dashboard (manual step)

## Hard Rules
- Never create a new Worker in this repo
- Never add backend logic to this repo
- All fetch() calls must go to https://api.virtuallaunch.pro
- The workers/ directory is scheduled for deletion

## VLP API Base URL
https://api.virtuallaunch.pro

## Route Mapping (Legacy → VLP)
/api/transcripts/magic-link/request → /v1/auth/magic-link/request
/api/transcripts/magic-link/verify  → /v1/auth/magic-link/verify
/api/transcripts/me                 → /v1/auth/session
/api/transcripts/preview            → /v1/transcripts/preview
/api/transcripts/checkout/status    → /v1/checkout/status
/api/transcripts/reports            → /v1/transcripts/reports
/api/transcripts/purchases          → /v1/transcripts/purchases
/api/transcripts/sign-out           → /v1/auth/logout
/forms/transcript/report-email      → /v1/transcripts/report-email
/transcript/prices                  → /v1/pricing/transcripts
/transcript/checkout                → /v1/checkout/sessions
/transcript/report-link             → /v1/transcripts/report-link
/transcript/report-data             → /v1/transcripts/report-data
/transcript/report                  → /v1/transcripts/report
/transcript/tokens                  → /v1/tokens/balance/{account_id}
/transcript/consume                 → /v1/tokens/consume
/v1/help/tickets                    → /v1/support/tickets
/v1/help/status                     → /v1/support/tickets/{ticket_id}

## Migration Status
Backend:  ✅ Complete — all 24 routes live in VLP Worker
Frontend: 🔄 In Progress — updating API calls
Worker:   ✅ Deleted — workers/ directory removed from repo
