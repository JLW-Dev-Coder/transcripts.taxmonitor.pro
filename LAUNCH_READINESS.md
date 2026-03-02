# Launch Readiness Audit — transcript.taxmonitor.pro

Generated: 2026-03-02 (UTC)

## Scope

This audit reflects the repository's current static-site setup and build output behavior.

- Static build command: `node build.mjs`
- Dist output: `dist/` (generated locally, not committed)
- API integration expectation: external endpoint `https://api.taxmonitor.pro` (no local `workers/api/src/index.js` required)

## Toolkit

The following scripts were added under `/audit`:

- `audit/inventory.mjs` — inventories source and dist HTML/assets.
- `audit/references.mjs` — checks local references in HTML/CSS/JS/MJS for missing targets in source and dist.
- `audit/dist-coverage.mjs` — checks source HTML coverage in dist and required directory/file presence.

## Checks Run

1. `node build.mjs`
2. `node audit/inventory.mjs`
3. `node audit/references.mjs`
4. `node audit/dist-coverage.mjs`

## Results

### Build

- Build completed successfully and generated `dist/`.
- Partials were injected across generated HTML as configured by `build.mjs`.

### Dist coverage

- Source HTML files: **467**
- Dist HTML files: **464**
- Missing in dist from source set: **3**
  - `partials/footer.html`
  - `partials/header.html`
  - `partials/parse-lab.html`

Interpretation: missing pages are partial templates (non-routable include files), not launch pages.

### Required folders/files in dist

All required source-present paths are present in `dist`:

- `_sdk/`
- `assets/`
- `legal/`
- `magnets/`
- `scripts/`
- `styles/`
- `_redirects`

### Reference integrity

#### Missing local references in source: 4

1. `assets/product.html` → `/index/#how-it-works`
2. `resources/index.html` → `/resources/how-to-read-an-irs-account-transcript.html`
3. `resources/irs-code-300-meaning.html` → `/app/intake`
4. `resources/irs-code-520-meaning.html` → `/app/intake`

#### Missing local references in dist: 4

1. `assets/product.html` → `/index/#how-it-works`
2. `resources/index.html` → `/resources/how-to-read-an-irs-account-transcript.html`
3. `resources/irs-code-300-meaning.html` → `/app/intake`
4. `resources/irs-code-520-meaning.html` → `/app/intake`

### Redirect review

- No catch-all redirect warning triggered by `audit/dist-coverage.mjs`.

## Launch Readiness Status

**Status: Needs follow-up (non-build blockers identified).**

- Build and required dist structure are healthy.
- There are 4 unresolved local-reference issues that should be reviewed before launch hardening.
- No worker/api code additions are required for this static repository.

## Recommended Next Actions

1. Fix or remove `/index/#how-it-works` reference in `assets/product.html` if `/index/` route is not intended.
2. Add or correct `/resources/how-to-read-an-irs-account-transcript.html` target.
3. Replace `/app/intake` links with a valid static destination or approved external URL.
4. Re-run audit scripts after link fixes and confirm zero missing references.
