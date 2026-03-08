/**
 * Transcript Tax Monitor Pro — Cloudflare Worker
 *
 * Routes:
 * - GET  /health
 * - GET  /transcript/prices
 * - POST /transcript/checkout
 * - GET  /transcript/tokens?tokenId=...
 * - POST /transcript/credit
 * - POST /transcript/consume
 * - POST /transcript/stripe/webhook
 * - GET  /transcript/report?r=...
 * - POST /forms/transcript/report-email
 * - GET  /transcript/report-link?reportId=...
 * - GET  /transcript/report?r=...
 * - GET  /api/transcripts/checkout/status?session_id=...
 * - GET  /api/transcripts/me
 * - GET  /api/transcripts/purchases
 * - POST /api/transcripts/preview
 * - GET  /api/transcripts/reports
 * - POST /api/transcripts/report/:reportId/print-complete
 * - POST /api/transcripts/sign-out
 * - GET  /v1/help/status?ticket_id=...
 * - POST /v1/help/tickets
 * - POST /v1/clickup/webhook
 *
 * Notes:
 * - Extracted from the mixed Tax Monitor Pro Worker.
 * - Keeps existing Stripe, Durable Object, Gmail, and transcript receipt behavior.
 * - Non-transcript routes intentionally removed.
 */

/* ------------------------------------------
 * Shared Utilities
 * ------------------------------------------ */

function tryParseJson(raw) {
  try {
    return { ok: true, value: JSON.parse(raw) };
  } catch (error) {
    return { ok: false, error };
  }
}

function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set("content-type", "application/json; charset=utf-8");
  return new Response(JSON.stringify(data, null, 2), { ...init, headers });
}

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      ...headers,
    },
  });
}

function requireMethod(request, allowed) {
  const method = request.method.toUpperCase();
  return allowed.includes(method);
}

function isPath(url, pathname) {
  return url.pathname === pathname;
}

function withCors(request, headers = {}) {
  const origin = request.headers.get("origin") || "";
  const allowed = new Set(["https://taxmonitor.pro", "https://transcript.taxmonitor.pro"]);

  return {
    "access-control-allow-headers": "content-type, stripe-signature",
    "access-control-allow-methods": "GET, POST, OPTIONS",
    "access-control-allow-origin": allowed.has(origin) ? origin : "https://transcript.taxmonitor.pro",
    "access-control-max-age": "86400",
    ...headers,
  };
}

function handleCorsPreflight(request) {
  if (request.method !== "OPTIONS") return null;
  return new Response(null, { status: 204, headers: withCors(request) });
}

/* ------------------------------------------
 * Transcript: Report Email helpers (CORS + Gmail)
 * ------------------------------------------ */

function corsHeadersForRequest(req) {
  const origin = req.headers.get("Origin") || "";
  const allowed = ["https://transcript.taxmonitor.pro"];

  if (!origin) return {};
  const ok = allowed.includes(origin);

  return {
    "Access-Control-Allow-Credentials": "false",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "OPTIONS, POST",
    "Access-Control-Allow-Origin": ok ? origin : "null",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
}

function isLikelyEmail(v) {
  const s = String(v || "").trim().toLowerCase();
  if (!s || s.length > 254) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function isTokenIdFormat(v) {
  const s = String(v || "").trim();
  return /^[A-Za-z0-9_-]{8,128}$/.test(s);
}

function isSafeReportUrl(v) {
  const s = String(v || "").trim();
  if (!s) return false;

  let url;
  try {
    url = new URL(s);
  } catch {
    return false;
  }

  if (url.origin !== "https://transcript.taxmonitor.pro") return false;

  const allowedPaths = new Set([
    "/assets/report",
    "/assets/report.html",
    "/assets/report-preview.html",
    "/transcript/report",
  ]);

  if (!allowedPaths.has(url.pathname)) return false;

  const hasShortId = !!url.searchParams.get("r");
  const hasHash = !!(url.hash && url.hash.slice(1).trim());
  const hasPayloadQuery = !!(
    (url.searchParams.get("data") || "").trim() ||
    (url.searchParams.get("payload") || "").trim()
  );

  return hasShortId || hasHash || hasPayloadQuery;
}



async function getShortReportLink(env, reportId) {
  const stored = await resolveShortReportPayload(env, reportId);
  if (!stored || !stored.payload) return null;

  const target = new URL("https://transcript.taxmonitor.pro/assets/report");

  if (String(stored.payloadTransport || "hash") === "query") {
    target.searchParams.set("data", String(stored.payload));
  } else {
    target.hash = String(stored.payload);
  }

  return {
    reportId: String(reportId || "").trim(),
    reportUrl: target.toString(),
  };
}

function getReportKv(env) {
  // Canonical KV binding for permanent report links
  return env.KV_TRANSCRIPT || null;
}

// TTL removed intentionally — report links are permanent unless manually deleted from KV
function getReportLinkTtlSeconds(env) {
  return null;
}

function randomShortId(bytes = 18) {
  const arr = new Uint8Array(bytes);
  crypto.getRandomValues(arr);
  return b64UrlEncode(arr);
}

function getShortReportKey(reportId) {
  return `report:${String(reportId || "").trim()}`;
}

function getReportUnlockKey(eventId) {
  return `report-unlock:${String(eventId || "").trim()}`;
}

function extractStoredReportPayload(reportUrl) {
  const url = new URL(String(reportUrl || "").trim());

  if (url.searchParams.get("r")) {
    return { ok: false, error: "reportUrl_already_short" };
  }

  const hash = url.hash ? url.hash.slice(1).trim() : "";
  if (hash) {
    return { ok: true, payload: hash, transport: "hash" };
  }

  const qp = url.searchParams.get("data") || url.searchParams.get("payload") || "";
  if (qp.trim()) {
    return { ok: true, payload: qp.trim(), transport: "query" };
  }

  return { ok: false, error: "missing_report_payload" };
}

function buildAssetReportUrl(payload, transport = "hash") {
  const target = new URL("https://transcript.taxmonitor.pro/assets/report");

  if (String(transport || "hash") === "query") {
    target.searchParams.set("data", String(payload || ""));
  } else {
    target.hash = String(payload || "");
  }

  return target.toString();
}

function extractInboundReportPayload(input = {}) {
  const payload = String(input?.payload || "").trim();
  const reportUrl = String(input?.reportUrl || "").trim();
  const transport = String(input?.transport || "").trim().toLowerCase();

  if (payload) {
    return {
      ok: true,
      payload,
      transport: transport === "query" ? "query" : "hash",
    };
  }

  if (reportUrl) {
    return extractStoredReportPayload(reportUrl);
  }

  return { ok: false, error: "missing_report_payload" };
}

async function storeShortReportPayload(env, payload, meta = {}) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const now = new Date().toISOString();

  for (let i = 0; i < 5; i++) {
    const reportId = randomShortId();
    const key = getShortReportKey(reportId);

    const existing = await kv.get(key);
    if (existing) continue;

    await kv.put(
      key,
      JSON.stringify(
        {
          createdAt: now,
          payload: String(payload || ""),
          payloadTransport: meta.payloadTransport || "hash",
          sourcePath: meta.sourcePath || "/assets/report"
        },
        null,
        2
      )
    );

    return {
      reportId,
      shortUrl: buildShortReportUrl(reportId)
    };
  }

  throw new Error("Failed to allocate a unique reportId");
}

function buildShortReportUrl(reportId) {
  return `https://transcript.taxmonitor.pro/transcript/report?r=${encodeURIComponent(reportId)}`;
}

async function resolveShortReportPayload(env, reportId) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const raw = await kv.get(getShortReportKey(reportId));
  if (!raw) return null;

  const parsed = tryParseJson(raw);
  if (!parsed.ok || !parsed.value || typeof parsed.value !== "object") return null;

  return parsed.value;
}

function pemToArrayBuffer(pem) {
  const clean = String(pem || "")
    .replace(/-----BEGIN[\s\S]*?-----/g, "")
    .replace(/-----END[\s\S]*?-----/g, "")
    .replace(/\s+/g, "");
  const bin = atob(clean);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes.buffer;
}

function b64UrlEncode(bytes) {
  const u8 = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes || []);
  let bin = "";
  for (let i = 0; i < u8.length; i++) bin += String.fromCharCode(u8[i]);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

async function googleServiceAccountAccessToken(env, subjectUser, scopes) {
  const now = Math.floor(Date.now() / 1000);
  const iat = now - 5;
  const exp = now + 55 * 60;

  const tokenUri = env.GOOGLE_TOKEN_URI;
  const clientEmail = env.GOOGLE_CLIENT_EMAIL;
  const privateKeyPem = env.GOOGLE_PRIVATE_KEY;

  if (!tokenUri || !clientEmail || !privateKeyPem) {
    throw new Error("Missing Google env vars: GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY, GOOGLE_TOKEN_URI.");
  }
  if (!subjectUser) {
    throw new Error("Missing Workspace user env var: GOOGLE_WORKSPACE_USER_*.");
  }

  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    aud: tokenUri,
    exp,
    iat,
    iss: clientEmail,
    scope: (Array.isArray(scopes) ? scopes : [String(scopes)]).join(" "),
    sub: subjectUser,
  };

  const enc = (obj) => b64UrlEncode(new TextEncoder().encode(JSON.stringify(obj)));
  const signingInput = enc(header) + "." + enc(claim);

  const key = await crypto.subtle.importKey(
    "pkcs8",
    pemToArrayBuffer(privateKeyPem),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    key,
    new TextEncoder().encode(signingInput)
  );

  const jwt = signingInput + "." + b64UrlEncode(new Uint8Array(sig));

  const body = new URLSearchParams();
  body.set("assertion", jwt);
  body.set("grant_type", "urn:ietf:params:oauth:grant-type:jwt-bearer");

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error("Google token exchange failed (" + String(res.status) + "): " + (t || res.statusText));
  }

  const parsed = await res.json();
  const accessToken = parsed && parsed.access_token ? String(parsed.access_token) : "";
  if (!accessToken) throw new Error("Google token exchange returned no access_token.");
  return accessToken;
}

function makeRfc2822({ from, to, subject, text }) {
  const safeSubject = String(subject || "").replace(/[\r\n]+/g, " ").trim();
  const safeFrom = String(from || "").replace(/[\r\n]+/g, "").trim();
  const safeTo = String(to || "").replace(/[\r\n]+/g, "").trim();
  const safeText = String(text || "").replace(/\r\n/g, "\n");

  return [
    "From: " + safeFrom,
    "To: " + safeTo,
    "Subject: " + safeSubject,
    "MIME-Version: 1.0",
    "Content-Type: text/plain; charset=UTF-8",
    "Content-Transfer-Encoding: 7bit",
    "",
    safeText,
    "",
  ].join("\n");
}

async function gmailSendMessage(env, { from, to, subject, text }) {
  const workspaceUser =
    env.GOOGLE_WORKSPACE_USER_SUPPORT ||
    env.GOOGLE_WORKSPACE_USER_NOREPLY ||
    env.GOOGLE_WORKSPACE_USER_DEFAULT;

  const token = await googleServiceAccountAccessToken(env, workspaceUser, [
    "https://www.googleapis.com/auth/gmail.send",
  ]);

  const rfc = makeRfc2822({ from, to, subject, text });
  const raw = b64UrlEncode(new TextEncoder().encode(rfc));

  const res = await fetch("https://gmail.googleapis.com/gmail/v1/users/me/messages/send", {
    method: "POST",
    headers: {
      Authorization: "Bearer " + token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ raw }),
  });

  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error("Gmail send failed (" + String(res.status) + "): " + (t || res.statusText));
  }

  return await res.json().catch(() => ({}));
}

function assertEnv(env, keys) {
  const missing = keys.filter((k) => !env[k]);
  if (missing.length) throw new Error(`Missing env vars: ${missing.join(", ")}`);
}

function envMissing(env, keys) {
  return keys.filter((k) => !env[k]);
}

function jsonError(request, status, error, details = null) {
  const payload = { error };
  if (details) payload.details = details;

  const pathname = new URL(request.url).pathname;
  const isTranscriptRequest =
    pathname.startsWith("/transcript/") || pathname === "/forms/transcript/report-email";

  return json(payload, status, isTranscriptRequest ? withCors(request) : undefined);
}

/* ------------------------------------------
 * Transcript: Return origin allowlist (strict)
 * ------------------------------------------ */

function normalizeOrigin(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    return new URL(raw).origin;
  } catch {
    return "";
  }
}

function getAllowedReturnOrigins(env) {
  const fallback = ["https://transcript.taxmonitor.pro"];

  const raw = String(env.TRANSCRIPT_RETURN_ORIGINS_JSON || "").trim();
  if (!raw) return new Set(fallback);

  try {
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return new Set(fallback);

    const normalized = arr.map(normalizeOrigin).filter(Boolean);
    return new Set(normalized.length ? normalized : fallback);
  } catch {
    return new Set(fallback);
  }
}

/* ------------------------------------------
 * Body Parsing (Forms + JSON)
 * ------------------------------------------ */

async function parseInboundBody(request) {
  const contentType = (request.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    const raw = await request.text();
    const parsed = tryParseJson(raw);
    if (!parsed.ok) {
      return {
        ok: false,
        error: "Invalid JSON",
        details: String(parsed.error?.message || parsed.error),
      };
    }
    return { ok: true, data: parsed.value, type: "json" };
  }

  try {
    const fd = await request.formData();
    const data = {};
    for (const [k, v] of fd.entries()) {
      data[k] = typeof v === "string" ? v : v?.name || "uploaded_file";
    }
    return { ok: true, data, type: "form" };
  } catch (error) {
    return {
      ok: false,
      error: "Unsupported body type",
      details: String(error?.message || error),
    };
  }
}

/* ------------------------------------------
 * Ids
 * ------------------------------------------ */

function isUuidLike(v) {
  return (
    typeof v === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v.trim())
  );
}

/* ------------------------------------------
 * Transcript: Stripe helpers
 * ------------------------------------------ */

async function stripeFetch(env, method, path, bodyObj = null, extraHeaders = {}) {
  assertEnv(env, ["STRIPE_SECRET_KEY"]);
  const res = await fetch(`https://api.stripe.com/v1${path}`, {
    method,
    headers: {
      authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      "content-type": "application/x-www-form-urlencoded",
      ...extraHeaders,
    },
    body: bodyObj ? new URLSearchParams(bodyObj).toString() : null,
  });

  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) throw new Error(`Stripe error (${res.status}): ${data?.error?.message || text}`);
  return data;
}

function getTranscriptCreditMap(env) {
  const raw = String(env.CREDIT_MAP_JSON || "").trim();
  if (!raw) throw new Error("Missing CREDIT_MAP_JSON");

  const parsed = JSON.parse(raw);
  if (!parsed || typeof parsed !== "object") {
    throw new Error("Invalid CREDIT_MAP_JSON");
  }

  return parsed;
}

function getCreditsForPriceId(env, priceId) {
  const creditMap = getTranscriptCreditMap(env);
  const credits = creditMap[String(priceId || "").trim()];
  return typeof credits === "number" && Number.isFinite(credits) ? credits : null;
}

function buildPaymentMethodLabel(paymentMethod) {
  const card = paymentMethod && paymentMethod.card ? paymentMethod.card : null;
  if (!card) return "Not available";

  const brandRaw = String(card.brand || "").trim();
  const brand = brandRaw ? brandRaw.charAt(0).toUpperCase() + brandRaw.slice(1) : "Card";
  const last4 = String(card.last4 || "").trim();

  return last4 ? `${brand} • ${last4}` : brand;
}

async function verifyStripeSignature(env, sigHeader, rawBodyText) {
  const parts = sigHeader.split(",").map((p) => p.trim());
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Part = parts.find((p) => p.startsWith("v1="));

  if (!tPart || !v1Part) throw new Error("Invalid Stripe signature header");

  const timestamp = tPart.slice(2);
  const signature = v1Part.slice(3);

  const signedPayload = `${timestamp}.${rawBodyText}`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.STRIPE_WEBHOOK_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const expected = [...new Uint8Array(mac)].map((b) => b.toString(16).padStart(2, "0")).join("");

  if (!timingSafeEqualHex(expected, signature)) throw new Error("Stripe signature verification failed");
  return JSON.parse(rawBodyText);
}

function timingSafeEqualHex(a, b) {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

/* ------------------------------------------
 * Transcript: Durable Object authoritative ledger
 * ------------------------------------------ */

export class TokenLedger {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    const url = new URL(request.url);

    if (request.method === "GET" && url.pathname === "/balance") {
      const balance = (await this.state.storage.get("balance")) ?? 0;
      return json({ balance }, 200);
    }

    if (request.method === "POST" && url.pathname === "/credit") {
      const body = await request.json().catch(() => ({}));
      const amount = Number(body?.amount ?? 0);
      const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";

      if (!Number.isFinite(amount) || amount <= 0) return json({ error: "invalid_amount" }, 400);
      if (!requestId) return json({ error: "missing_requestId" }, 400);

      const idemKey = `credit:${requestId}`;
      const already = await this.state.storage.get(idemKey);
      if (already !== undefined) return json({ balance: already, idempotent: true }, 200);

      const current = (await this.state.storage.get("balance")) ?? 0;
      const next = Number(current) + amount;

      await this.state.storage.put("balance", next);
      await this.state.storage.put(idemKey, next);

      return json({ balance: next }, 200);
    }

    if (request.method === "POST" && url.pathname === "/consume") {
      const body = await request.json().catch(() => ({}));
      const amount = Number(body?.amount ?? 1);
      const requestId = typeof body?.requestId === "string" ? body.requestId.trim() : "";

      if (!Number.isFinite(amount) || amount <= 0) return json({ error: "invalid_amount" }, 400);
      if (!requestId) return json({ error: "missing_requestId" }, 400);

      const idemKey = `consume:${requestId}`;
      const already = await this.state.storage.get(idemKey);
      if (already !== undefined) return json({ balance: already, idempotent: true }, 200);

      const current = (await this.state.storage.get("balance")) ?? 0;
      if (Number(current) < amount) return json({ balance: current, error: "insufficient_balance", needed: amount }, 402);

      const next = Number(current) - amount;
      await this.state.storage.put("balance", next);
      await this.state.storage.put(idemKey, next);

      return json({ balance: next }, 200);
    }

    return json({ error: "not_found" }, 404);
  }
}

function getLedgerStub(env, tokenId) {
  if (!env.TOKEN_LEDGER) throw new Error("Missing Durable Object binding: TOKEN_LEDGER");
  const id = env.TOKEN_LEDGER.idFromName(tokenId);
  return env.TOKEN_LEDGER.get(id);
}

const TRANSCRIPT_SESSION_COOKIE = "tm_transcript_session";

/* ------------------------------------------
 * Transcript: ClickUp projection config
 * ------------------------------------------ */

const CLICKUP_TRANSCRIPT = {
  ACCOUNTS_LIST_ID: "901710909567",
  SUPPORT_LIST_ID: "901710818377",
  ACCOUNT_FIELDS: {
    ACCOUNT_ID: "e5f176ba-82c8-47d8-b3b1-0716d075f43f",
    PRIMARY_EMAIL: "a105f99e-b33d-4d12-bb24-f7c827ec761a",
    SUPPORT_STATUS: "bbdf5418-8be0-452d-8bd0-b9f46643375e",
    SUPPORT_TASK_LINK: "9e14a458-96fd-4109-a276-034d8270e15b",
    TRANSCRIPT_CREDITS: "f938260c-600d-405a-bee7-a8db5d09bf6d",
  },
  SUPPORT_FIELDS: {
    ACTION_REQUIRED: "aac0816d-0e05-4c57-8196-6098929f35ac",
    EMAIL: "7f547901-690d-4f39-8851-d19e19f87bf8",
    EVENT_ID: "8e8b453e-01f3-40fe-8156-2e9d9633ebd6",
    LATEST_UPDATE: "03ebc8ba-714e-4f7c-9748-eb1b62e657f7",
    PRIORITY: "b96403c7-028a-48eb-b6b1-349f295244b5",
    RELATED_ORDER_ID: "423fda3b-f7c0-471e-aaa2-464d78db0a31",
    SUPPORT_ID: "30fda9ea-12cd-4dc1-a89f-4633f4d06b27",
    TYPE: "e09d9f53-4f03-49fe-8c5f-abe3b160b167",
  },
  WEBHOOK_ROUTE: "/v1/clickup/webhook",
};

function getClickUpApiToken(env) {
  return String(env.CLICKUP_API_TOKEN || env.CLICKUP_TOKEN || "").trim();
}

function clickupHeaders(env) {
  const token = getClickUpApiToken(env);
  if (!token) throw new Error("Missing ClickUp API token");
  return {
    authorization: token,
    "content-type": "application/json",
  };
}

async function clickupFetchJson(env, path, init = {}) {
  const response = await fetch(`https://api.clickup.com/api/v2${path}`, {
    ...init,
    headers: {
      ...clickupHeaders(env),
      ...(init.headers || {}),
    },
  });

  const text = await response.text().catch(() => "");
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    const message =
      (data && (data.err || data.error || data.message) ? String(data.err || data.error || data.message) : "") ||
      text ||
      response.statusText ||
      "clickup_request_failed";
    throw new Error(`ClickUp error (${response.status}): ${message}`);
  }

  return data;
}

function getSupportStatusKey(supportId) {
  return `support-status:${String(supportId || "").trim()}`;
}

function getSupportTaskKey(taskId) {
  return `support-task:${String(taskId || "").trim()}`;
}

function getSupportEmailIndexKey(email, supportId) {
  return `support-email-index:${normalizeEmail(email)}:${String(supportId || "").trim()}`;
}

function buildCanonicalSupportId() {
  return `SUP-${randomShortId(9).replace(/[^A-Za-z0-9]/g, "").toUpperCase()}`;
}

function normalizeSupportId(value) {
  return String(value || "").trim();
}

function normalizeSupportStatus(value) {
  return String(value || "").trim() || "open / new";
}

function getTaskCustomField(task, fieldId) {
  const fields = Array.isArray(task && task.custom_fields) ? task.custom_fields : [];
  return fields.find((field) => String(field && field.id || "") === String(fieldId || "")) || null;
}

function getTaskCustomFieldValue(task, fieldId) {
  const field = getTaskCustomField(task, fieldId);
  if (!field) return "";

  if (field.value === undefined || field.value === null) return "";

  if (typeof field.value === "string") return field.value.trim();

  if (typeof field.value === "number" || typeof field.value === "boolean") return String(field.value);

  if (typeof field.value === "object") {
    if (typeof field.value.name === "string") return field.value.name.trim();
    if (typeof field.value.label === "string") return field.value.label.trim();
    if (typeof field.value.text === "string") return field.value.text.trim();
  }

  return String(field.value || "").trim();
}

function buildSupportLatestUpdateFromTask(task, fallbackHistoryItem) {
  const explicit = getTaskCustomFieldValue(task, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.LATEST_UPDATE);
  if (explicit) return explicit;

  const status = normalizeSupportStatus(task && task.status && task.status.status);
  const at = task && task.date_updated ? new Date(Number(task.date_updated)).toISOString() : new Date().toISOString();
  const by = fallbackHistoryItem && fallbackHistoryItem.user && fallbackHistoryItem.user.username ? String(fallbackHistoryItem.user.username).trim() : "Staff";

  return `${status} • ${by} • ${at}`;
}

function mapSupportStatusToAccountStatus(status) {
  const normalized = String(status || "").trim().toLowerCase();
  if (normalized === "blocked") return "Blocked";
  if (normalized === "client feedback") return "Waiting on Client";
  if (normalized === "complete") return "Complete";
  if (normalized === "closed") return "Closed";
  if (normalized === "in progress") return "In Progress";
  if (normalized === "in review") return "Needs Review";
  if (normalized === "open / new") return "New / Open";
  if (normalized === "resolved") return "Complete";
  if (normalized === "waiting on client") return "Waiting on Client";
  return "New / Open";
}

function getDropdownOptionIdByName(options, name) {
  const target = String(name || "").trim().toLowerCase();
  const list = Array.isArray(options) ? options : [];
  const found = list.find((option) => String(option && option.name || "").trim().toLowerCase() === target);
  return found && found.id ? String(found.id) : "";
}

async function setClickUpCustomField(env, taskId, fieldId, value) {
  await clickupFetchJson(env, `/task/${encodeURIComponent(taskId)}/field/${encodeURIComponent(fieldId)}`, {
    method: "POST",
    body: JSON.stringify({ value }),
  });
}

async function createClickUpTask(env, listId, payload) {
  return await clickupFetchJson(env, `/list/${encodeURIComponent(listId)}/task`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

async function linkClickUpTasks(env, taskId, linksTo) {
  if (!taskId || !linksTo || String(taskId) === String(linksTo)) return null;
  try {
    return await clickupFetchJson(env, `/task/${encodeURIComponent(taskId)}/link/${encodeURIComponent(linksTo)}`, {
      method: "POST",
      body: JSON.stringify({}),
    });
  } catch (_) {
    return null;
  }
}

function getPriorityOptionName(priority) {
  const normalized = String(priority || "").trim().toLowerCase();
  if (normalized === "critical") return "🟥 Critical — Today";
  if (normalized === "high") return "🟧 High — 48 Hours";
  if (normalized === "low") return "🟦 Low — As Scheduled";
  return "🟨 Normal — 3–5 Days";
}

function getSupportTypeOptionName(payload) {
  const issueType = String(payload && payload.issueType || "").trim().toLowerCase();
  if (issueType === "token" || issueType === "credits" || issueType === "billing") {
    return "Ticket - Transcript Token";
  }
  return "Ticket - Transcript Token";
}

function buildInitialSupportLatestUpdate(payload) {
  const subject = String(payload && payload.subject || "").trim();
  if (subject) return `Ticket submitted: ${subject}`;
  return "Ticket submitted.";
}

function buildSupportTaskDescription(payload, supportId) {
  const lines = [
    `Support ID: ${supportId}`,
    `Name: ${String(payload && payload.name || "").trim()}`,
    `Email: ${normalizeEmail(payload && payload.email)}`,
    `Category: ${String(payload && payload.category || "").trim()}`,
    `Issue Type: ${String(payload && payload.issueType || "").trim()}`,
    `Priority: ${String(payload && payload.priority || "").trim()}`,
    `Urgency: ${String(payload && payload.urgency || "").trim()}`,
    `Event ID: ${String(payload && payload.eventId || "").trim()}`,
  ];

  const tokenId = String(payload && payload.tokenId || "").trim();
  const relatedOrderId = String(payload && payload.relatedOrderId || "").trim();
  if (tokenId) lines.push(`Token ID: ${tokenId}`);
  if (relatedOrderId) lines.push(`Related Order ID: ${relatedOrderId}`);

  lines.push("");
  lines.push(`Subject: ${String(payload && payload.subject || "").trim()}`);
  lines.push("");
  lines.push("Message:");
  lines.push(String(payload && payload.message || "").trim());

  return lines.join("\n");
}

async function createCanonicalSupportTicket(env, payload) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const email = normalizeEmail(payload && payload.email);
  const eventId = String(payload && payload.eventId || "").trim();
  const latestUpdate = buildInitialSupportLatestUpdate(payload);
  const priorityName = getPriorityOptionName(payload && payload.priority);
  const supportTypeName = getSupportTypeOptionName(payload);
  const supportStatus = "open / new";
  const createdAt = new Date().toISOString();

  let supportId = "";
  let existing = null;

  for (let i = 0; i < 5; i++) {
    supportId = buildCanonicalSupportId();
    existing = await kv.get(getSupportStatusKey(supportId));
    if (!existing) break;
    supportId = "";
  }

  if (!supportId) {
    throw new Error("unable_to_allocate_support_id");
  }

  const canonicalRecord = {
    accountEmail: email,
    createdAt,
    eventId,
    latestUpdate,
    relatedOrderId: String(payload && payload.relatedOrderId || "").trim(),
    source: "worker",
    status: supportStatus,
    subject: String(payload && payload.subject || "").trim(),
    supportId,
    taskId: "",
    taskName: "",
    type: supportTypeName,
    updatedAt: createdAt,
  };

  await kv.put(getSupportStatusKey(supportId), JSON.stringify(canonicalRecord, null, 2));
  await kv.put(getSupportEmailIndexKey(email, supportId), JSON.stringify({ createdAt, supportId }, null, 2));

  const supportTask = await createClickUpTask(env, CLICKUP_TRANSCRIPT.SUPPORT_LIST_ID, {
    description: buildSupportTaskDescription(payload, supportId),
    name: `Support ${supportId} - ${String(payload && payload.subject || "Transcript Support").trim() || "Transcript Support"}`,
    priority: null,
    status: "open / new",
  });

  const taskId = String(supportTask && supportTask.id || "").trim();
  if (!taskId) {
    throw new Error("clickup_support_task_not_created");
  }

  const fullSupportTask = await getClickUpTask(env, taskId);
  const actionRequiredField = getTaskCustomField(fullSupportTask, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.ACTION_REQUIRED);
  const priorityField = getTaskCustomField(fullSupportTask, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.PRIORITY);
  const typeField = getTaskCustomField(fullSupportTask, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.TYPE);

  const actionRequiredOptionId = getDropdownOptionIdByName(
    actionRequiredField && actionRequiredField.type_config && actionRequiredField.type_config.options,
    "Acknowledge"
  );
  const priorityOptionId = getDropdownOptionIdByName(
    priorityField && priorityField.type_config && priorityField.type_config.options,
    priorityName
  );
  const typeOptionId = getDropdownOptionIdByName(
    typeField && typeField.type_config && typeField.type_config.options,
    supportTypeName
  );

  await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.SUPPORT_ID, supportId);
  await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.EMAIL, email);
  await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.EVENT_ID, eventId);
  await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.LATEST_UPDATE, latestUpdate);

  if (String(payload && payload.relatedOrderId || "").trim()) {
    await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.RELATED_ORDER_ID, String(payload.relatedOrderId).trim());
  }

  if (actionRequiredOptionId) {
    await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.ACTION_REQUIRED, actionRequiredOptionId);
  }

  if (priorityOptionId) {
    await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.PRIORITY, priorityOptionId);
  }

  if (typeOptionId) {
    await setClickUpCustomField(env, taskId, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.TYPE, typeOptionId);
  }

  const refreshedRecord = {
    ...canonicalRecord,
    taskId,
    taskName: String(fullSupportTask && fullSupportTask.name || supportTask && supportTask.name || "").trim(),
    updatedAt: new Date().toISOString(),
  };

  await kv.put(getSupportStatusKey(supportId), JSON.stringify(refreshedRecord, null, 2));
  await kv.put(getSupportTaskKey(taskId), JSON.stringify({ supportId }, null, 2));

  try {
    const accountTask = await findAccountTaskByEmail(env, email);
    if (accountTask && accountTask.id) {
      const accountSupportStatusField = getTaskCustomField(accountTask, CLICKUP_TRANSCRIPT.ACCOUNT_FIELDS.SUPPORT_STATUS);
      const accountSupportStatusOptionId = getDropdownOptionIdByName(
        accountSupportStatusField && accountSupportStatusField.type_config && accountSupportStatusField.type_config.options,
        mapSupportStatusToAccountStatus(supportStatus)
      );

      if (accountSupportStatusOptionId) {
        await setClickUpCustomField(env, accountTask.id, CLICKUP_TRANSCRIPT.ACCOUNT_FIELDS.SUPPORT_STATUS, accountSupportStatusOptionId);
      }

      await linkClickUpTasks(env, taskId, accountTask.id);
      await linkClickUpTasks(env, accountTask.id, taskId);
    }
  } catch (_) {
    // Projection only. Ticket creation should still succeed.
  }

  return refreshedRecord;
}

async function listClickUpTasksByList(env, listId, page = 0) {
  const qs = new URLSearchParams();
  qs.set("include_closed", "true");
  qs.set("page", String(page));
  qs.set("subtasks", "true");
  return await clickupFetchJson(env, `/list/${encodeURIComponent(listId)}/task?${qs.toString()}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
}

async function findSupportTaskBySupportId(env, supportId) {
  const wanted = normalizeSupportId(supportId);
  if (!wanted) return null;

  for (let page = 0; page < 20; page++) {
    const data = await listClickUpTasksByList(env, CLICKUP_TRANSCRIPT.SUPPORT_LIST_ID, page);
    const tasks = Array.isArray(data && data.tasks) ? data.tasks : [];

    for (const task of tasks) {
      const value = normalizeSupportId(getTaskCustomFieldValue(task, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.SUPPORT_ID));
      if (value && value === wanted) return task;
    }

    if (tasks.length < 100) break;
  }

  return null;
}

async function getClickUpTask(env, taskId) {
  return await clickupFetchJson(env, `/task/${encodeURIComponent(taskId)}`, {
    method: "GET",
    headers: { "content-type": "application/json" },
  });
}

async function findAccountTaskByEmail(env, email) {
  const wanted = normalizeEmail(email);
  if (!wanted) return null;

  for (let page = 0; page < 20; page++) {
    const data = await listClickUpTasksByList(env, CLICKUP_TRANSCRIPT.ACCOUNTS_LIST_ID, page);
    const tasks = Array.isArray(data && data.tasks) ? data.tasks : [];

    for (const task of tasks) {
      const value = normalizeEmail(getTaskCustomFieldValue(task, CLICKUP_TRANSCRIPT.ACCOUNT_FIELDS.PRIMARY_EMAIL));
      if (value && value === wanted) return task;
    }

    if (tasks.length < 100) break;
  }

  return null;
}

async function mirrorSupportStatusToAccount(env, supportTask, supportStatus) {
  try {
    const supportEmail = normalizeEmail(getTaskCustomFieldValue(supportTask, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.EMAIL));
    if (!supportEmail) return;

    const accountTask = await findAccountTaskByEmail(env, supportEmail);
    if (!accountTask || !accountTask.id) return;

    const accountField = getTaskCustomField(accountTask, CLICKUP_TRANSCRIPT.ACCOUNT_FIELDS.SUPPORT_STATUS);
    const options = accountField && accountField.type_config && Array.isArray(accountField.type_config.options)
      ? accountField.type_config.options
      : [];
    const mappedName = mapSupportStatusToAccountStatus(supportStatus);
    const optionId = getDropdownOptionIdByName(options, mappedName);
    if (!optionId) return;

    await setClickUpCustomField(env, accountTask.id, CLICKUP_TRANSCRIPT.ACCOUNT_FIELDS.SUPPORT_STATUS, optionId);
  } catch (_) {
    // Projection only. Canonical support state must still update even if this mirror write fails.
  }
}

async function upsertCanonicalSupportFromTask(env, task, historyItem = null) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const supportId = normalizeSupportId(getTaskCustomFieldValue(task, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.SUPPORT_ID));
  if (!supportId) {
    return { ok: false, reason: "missing_support_id" };
  }

  const status = normalizeSupportStatus(task && task.status && task.status.status);
  const latestUpdate = buildSupportLatestUpdateFromTask(task, historyItem);
  const updatedAt = task && task.date_updated ? new Date(Number(task.date_updated)).toISOString() : new Date().toISOString();
  const supportEmail = normalizeEmail(getTaskCustomFieldValue(task, CLICKUP_TRANSCRIPT.SUPPORT_FIELDS.EMAIL));

  const record = {
    latestUpdate,
    source: "clickup_webhook",
    status,
    supportEmail,
    supportId,
    taskId: String(task && task.id || "").trim(),
    taskName: String(task && task.name || "").trim(),
    updatedAt,
  };

  await kv.put(getSupportStatusKey(supportId), JSON.stringify(record, null, 2));
  if (record.taskId) {
    await kv.put(getSupportTaskKey(record.taskId), JSON.stringify({ supportId }, null, 2));
  }

  await mirrorSupportStatusToAccount(env, task, status);

  return { ok: true, record };
}

async function getCanonicalSupportRecord(env, supportId) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const raw = await kv.get(getSupportStatusKey(supportId));
  if (!raw) return null;

  const parsed = tryParseJson(raw);
  if (!parsed.ok || !parsed.value) return null;
  return parsed.value;
}

async function syncSupportRecordFromClickUp(env, supportId) {
  const task = await findSupportTaskBySupportId(env, supportId);
  if (!task) return null;

  const fullTask = await getClickUpTask(env, task.id);
  const synced = await upsertCanonicalSupportFromTask(env, fullTask, null);
  return synced.ok ? synced.record : null;
}

async function verifyClickUpWebhookSignature(env, request, rawBody) {
  const secret = String(env.CLICKUP_WEBHOOK_SECRET || "").trim();
  if (!secret) throw new Error("Missing CLICKUP_WEBHOOK_SECRET");

  const incoming = String(request.headers.get("x-signature") || request.headers.get("X-Signature") || "").trim().toLowerCase();
  if (!incoming) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const mac = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(rawBody));
  const expected = Array.from(new Uint8Array(mac)).map((b) => b.toString(16).padStart(2, "0")).join("");

  return timingSafeEqualHex(expected, incoming);
}

function buildAppDashboardUrl() {
  return "https://transcript.taxmonitor.pro/app-dashboard.html";
}

function buildMagicVerifyUrl(token) {
  return `https://transcript.taxmonitor.pro/api/transcripts/magic-link/verify?token=${encodeURIComponent(token)}`;
}

function buildReportPageUrl(reportId) {
  return `https://transcript.taxmonitor.pro/assets/report.html?reportId=${encodeURIComponent(reportId)}`;
}

function buildSessionCookie(sessionId, maxAgeSeconds = 60 * 60 * 24 * 30) {
  return [
    `${TRANSCRIPT_SESSION_COOKIE}=${encodeURIComponent(sessionId)}`,
    "HttpOnly",
    `Max-Age=${maxAgeSeconds}`,
    "Path=/",
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

function buildSessionCookieClear() {
  return [
    `${TRANSCRIPT_SESSION_COOKIE}=`,
    "HttpOnly",
    "Max-Age=0",
    "Path=/",
    "SameSite=Lax",
    "Secure",
  ].join("; ");
}

function getCookieValue(request, name) {
  const raw = String(request.headers.get("cookie") || "");
  if (!raw) return "";
  const parts = raw.split(";").map((x) => x.trim());
  for (const part of parts) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key === name) return decodeURIComponent(value);
  }
  return "";
}

function getMagicLinkKey(token) {
  return `magic-link:${String(token || "").trim()}`;
}

function getSessionKey(sessionId) {
  return `session:${String(sessionId || "").trim()}`;
}

function getUserAccountKey(email) {
  return `user-account:${String(email || "").trim().toLowerCase()}`;
}

function getReportIndexKey(email, createdAt, reportId) {
  return `report-index:${String(email || "").trim().toLowerCase()}:${String(createdAt || "").trim()}:${String(reportId || "").trim()}`;
}

function getReportMetaKey(reportId) {
  return `report-meta:${String(reportId || "").trim()}`;
}

function normalizeEmail(value) {
  return String(value || "").trim().toLowerCase();
}

async function sha256Hex(input) {
  const bytes = new TextEncoder().encode(String(input || ""));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getOrCreateUserAccount(env, email) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const normalizedEmail = normalizeEmail(email);
  const key = getUserAccountKey(normalizedEmail);
  const raw = await kv.get(key);

  if (raw) {
    const parsed = tryParseJson(raw);
    if (parsed.ok && parsed.value && parsed.value.email && parsed.value.tokenId) {
      return parsed.value;
    }
  }

  const tokenHash = await sha256Hex(`transcript-account:${normalizedEmail}`);
  const tokenId = `acct_${tokenHash.slice(0, 24)}`;

  const account = {
    createdAt: new Date().toISOString(),
    email: normalizedEmail,
    tokenId,
  };

  await kv.put(key, JSON.stringify(account, null, 2));
  return account;
}

async function createMagicLinkRecord(env, email, redirect) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const account = await getOrCreateUserAccount(env, email);
  const token = randomShortId(24);

  const record = {
    accountEmail: account.email,
    createdAt: new Date().toISOString(),
    redirect: redirect || "/app-dashboard.html",
    tokenId: account.tokenId,
  };

  await kv.put(getMagicLinkKey(token), JSON.stringify(record, null, 2), {
    expirationTtl: 60 * 30,
  });

  return {
    account,
    token,
  };
}

async function consumeMagicLinkRecord(env, token) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const key = getMagicLinkKey(token);
  const raw = await kv.get(key);
  if (!raw) return null;

  await kv.delete(key);

  const parsed = tryParseJson(raw);
  if (!parsed.ok || !parsed.value) return null;
  return parsed.value;
}

async function createSessionRecord(env, email, tokenId) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const sessionId = randomShortId(24);
  const session = {
    createdAt: new Date().toISOString(),
    email: normalizeEmail(email),
    tokenId: String(tokenId || "").trim(),
  };

  await kv.put(getSessionKey(sessionId), JSON.stringify(session, null, 2), {
    expirationTtl: 60 * 60 * 24 * 30,
  });

  return {
    session,
    sessionId,
  };
}

async function getSessionFromRequest(request, env) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const sessionId = getCookieValue(request, TRANSCRIPT_SESSION_COOKIE);
  if (!sessionId) return null;

  const raw = await kv.get(getSessionKey(sessionId));
  if (!raw) return null;

  const parsed = tryParseJson(raw);
  if (!parsed.ok || !parsed.value) return null;

  return {
    session: parsed.value,
    sessionId,
  };
}

async function requireTranscriptSession(request, env) {
  const current = await getSessionFromRequest(request, env);
  if (!current || !current.session || !current.session.email || !current.session.tokenId) {
    return null;
  }
  return current;
}

async function listUserReportRecords(env, email, limit = 50, cursor = undefined) {
  const kv = getReportKv(env);
  if (!kv) throw new Error("Missing KV binding: KV_TRANSCRIPT");

  const prefix = `report-index:${normalizeEmail(email)}:`;
  const listed = await kv.list({ cursor, limit, prefix });

  const records = [];
  for (const key of listed.keys || []) {
    const raw = await kv.get(key.name);
    const parsed = tryParseJson(raw || "");
    if (!parsed.ok || !parsed.value || !parsed.value.reportId) continue;

    const metaRaw = await kv.get(getReportMetaKey(parsed.value.reportId));
    const metaParsed = tryParseJson(metaRaw || "");
    if (!metaParsed.ok || !metaParsed.value) continue;

    records.push(metaParsed.value);
  }

  records.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));

  return {
    cursor: listed.list_complete ? null : listed.cursor,
    records,
  };
}

async function listUserPurchaseRecords(env, tokenId) {
  if (!env.R2_TRANSCRIPT) return [];

  const out = [];
  let cursor = undefined;

  do {
    const page = await env.R2_TRANSCRIPT.list({
      cursor,
      limit: 100,
      prefix: "receipts/stripe/",
    });

    for (const obj of page.objects || []) {
      const body = await env.R2_TRANSCRIPT.get(obj.key);
      if (!body) continue;

      const text = await body.text();
      const parsed = tryParseJson(text);
      if (!parsed.ok || !parsed.value) continue;

      if (String(parsed.value.tokenId || "") !== String(tokenId || "")) continue;

      out.push({
        amount: null,
        createdAt: parsed.value.at || null,
        credits: parsed.value.credits || null,
        priceId: parsed.value.priceId || "",
        sessionId: parsed.value.sessionId || "",
        status: "completed",
        tokenId: parsed.value.tokenId || "",
      });
    }

    cursor = page.truncated ? page.cursor : undefined;
  } while (cursor);

  out.sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  return out;
}

/* ------------------------------------------
 * Transcript: Handlers
 *
 * Projection plan now confirmed from ClickUp:
 * - Accounts list: 901710909567
 * - Support list: 901710818377
 * - Use Account Transcript Credits field for transcript balances, not Account Gaming Credits.
 * - Mirror support status onto Account Support Status.
 * - Support list now has a dedicated Support ID field: 30fda9ea-12cd-4dc1-a89f-4633f4d06b27.
 * - Canonical supportId should live in Worker state and be projected into that field.
 * - Public support lookup should read canonical Worker state, with ClickUp status and latest update projected back into it.
 * ------------------------------------------
 */

/* ------------------------------------------
 * Transcript: Handlers
 * ------------------------------------------ */

async function handleGetTranscriptPrices(request, env) {
  const required = ["CREDIT_MAP_JSON", "PRICE_10", "PRICE_100", "PRICE_25", "STRIPE_SECRET_KEY"];
  const missing = envMissing(env, required);
  if (missing.length) return jsonError(request, 503, "pricing_temporarily_unavailable", { missing: missing.sort() });

  let creditMap;
  try {
    creditMap = JSON.parse(env.CREDIT_MAP_JSON);
  } catch (err) {
    return jsonError(request, 500, "invalid_credit_map", String(err?.message || err));
  }

  const priceIds = [env.PRICE_10, env.PRICE_25, env.PRICE_100].filter(Boolean).sort();

  try {
    const out = [];
    for (const priceId of priceIds) {
      const price = await stripeFetch(env, "GET", `/prices/${encodeURIComponent(priceId)}`);
      const credits = creditMap[priceId] ?? null;

      out.push({
        amount: price.unit_amount,
        credits,
        currency: (price.currency || "usd").toUpperCase(),
        label: "Transcript.Tax Monitor Pro",
        perks: ["Client-ready report preview", "Credits applied instantly", "Local PDF parsing (no uploads)"].sort(),
        priceId,
        recommended: credits === 25,
      });
    }

    out.sort((a, b) => (a.credits || 0) - (b.credits || 0));
    return json({ prices: out }, 200, withCors(request));
  } catch (err) {
    return jsonError(request, 502, "pricing_temporarily_unavailable", String(err?.message || err));
  }
}

async function handleCreateTranscriptCheckout(request, env) {
  const required = ["CREDIT_MAP_JSON", "PRICE_10", "PRICE_100", "PRICE_25", "STRIPE_SECRET_KEY"];
  const missing = envMissing(env, required);
  if (missing.length) return jsonError(request, 503, "checkout_temporarily_unavailable", { missing: missing.sort() });

  const body = await request.json().catch(() => ({}));
  const priceId = typeof body?.priceId === "string" ? body.priceId.trim() : "";
  const tokenId = typeof body?.tokenId === "string" ? body.tokenId.trim() : "";
  const returnUrlBaseRaw = typeof body?.returnUrlBase === "string" ? body.returnUrlBase.trim() : "";
  const successPathRaw = typeof body?.successPath === "string" ? body.successPath.trim() : "";

  if (!priceId) return jsonError(request, 400, "missing_priceId");
  if (!tokenId) return jsonError(request, 400, "missing_tokenId");

  const allowedPrices = [env.PRICE_10, env.PRICE_25, env.PRICE_100].filter(Boolean);
  if (!allowedPrices.includes(priceId)) return jsonError(request, 400, "invalid_priceId");

  const allowedReturnOrigins = getAllowedReturnOrigins(env);
  const returnOrigin = normalizeOrigin(returnUrlBaseRaw);

  if (!returnOrigin) return jsonError(request, 400, "missing_or_invalid_returnUrlBase");

  if (!allowedReturnOrigins.has(returnOrigin)) {
    return jsonError(request, 400, "return_origin_not_allowed", {
      allowed: Array.from(allowedReturnOrigins).sort(),
      returnOrigin,
    });
  }

  const successPath = successPathRaw === "/assets/payment-success.html"
    ? "/assets/payment-success.html"
    : "/assets/payment-success.html";

  try {
    const session = await stripeFetch(env, "POST", "/checkout/sessions", {
      mode: "payment",
      allow_promotion_codes: "true",
      "line_items[0][price]": priceId,
      "line_items[0][quantity]": "1",
      cancel_url: `${returnOrigin}/index.html#pricing`,
      success_url: `${returnOrigin}${successPath}?session_id={CHECKOUT_SESSION_ID}&tokenId=${encodeURIComponent(tokenId)}`,
      "metadata[priceId]": priceId,
      "metadata[tokenId]": tokenId,
    });

    return json({ id: session.id, url: session.url }, 200, withCors(request));
  } catch (err) {
    return jsonError(request, 502, "checkout_temporarily_unavailable", String(err?.message || err));
  }
}

async function handleGetTranscriptCheckoutStatus(request, url, env) {
  const sessionId = String(url.searchParams.get("session_id") || "").trim();
  const tokenIdFromQuery = String(url.searchParams.get("tokenId") || "").trim();

  if (!sessionId) {
    return json({ error: "missing_session_id", ok: false }, 400, withCors(request));
  }

  try {
    const session = await stripeFetch(
      env,
      "GET",
      `/checkout/sessions/${encodeURIComponent(sessionId)}?expand[]=payment_intent.payment_method&expand[]=line_items.data.price.product`
    );

    const metadata = session && session.metadata ? session.metadata : {};
    const priceId = String(
      metadata.priceId ||
      (session && session.line_items && session.line_items.data && session.line_items.data[0] && session.line_items.data[0].price && session.line_items.data[0].price.id) ||
      ""
    ).trim();
    const tokenId = String(metadata.tokenId || tokenIdFromQuery || "").trim();
    const creditsAdded = priceId ? getCreditsForPriceId(env, priceId) : null;
    const amountPaid = Number(session && (session.amount_total ?? session.amount_subtotal) ?? 0);
    const currency = String(session && session.currency || "usd").trim();
    const quantityRaw = session && session.line_items && session.line_items.data && session.line_items.data[0] ? session.line_items.data[0].quantity : 1;
    const quantity = Number.isFinite(Number(quantityRaw)) ? Number(quantityRaw) : 1;
    const productName = String(
      metadata.productLabel ||
      (session && session.line_items && session.line_items.data && session.line_items.data[0] && session.line_items.data[0].description) ||
      (session && session.line_items && session.line_items.data && session.line_items.data[0] && session.line_items.data[0].price && session.line_items.data[0].price.product && session.line_items.data[0].price.product.name) ||
      "Transcript credits"
    ).trim();
    const paymentMethod = session && session.payment_intent && session.payment_intent.payment_method
      ? session.payment_intent.payment_method
      : null;
    const paymentMethodLabel = buildPaymentMethodLabel(paymentMethod);
    const paymentStatus = String(session && session.payment_status || session && session.status || "unpaid").trim().toLowerCase();
    const receiptNumber = String(session && (session.client_reference_id || session.id) || sessionId).trim();
    const datePaidValue = session && (session.created ? Number(session.created) * 1000 : Date.now());
    const datePaid = new Date(datePaidValue).toISOString();

    let balance = null;
    if (tokenId) {
      try {
        const stub = getLedgerStub(env, tokenId);
        const balanceRes = await stub.fetch("https://ledger/balance", { method: "GET" });
        const balanceOut = await balanceRes.json().catch(() => ({}));
        if (typeof balanceOut.balance === "number") {
          balance = balanceOut.balance;
        }
      } catch (_) {
        balance = null;
      }
    }

    return json(
      {
        amountPaid,
        balance,
        creditsAdded,
        currency,
        datePaid,
        ok: true,
        paymentMethodLabel,
        paymentStatus,
        productLabel: productName,
        quantity,
        receiptNumber,
        sessionId: String(session && session.id || sessionId),
        tokenId,
      },
      200,
      withCors(request)
    );
  } catch (err) {
    return jsonError(request, 502, "checkout_status_unavailable", String(err?.message || err));
  }
}

async function handleGetTranscriptTokens(request, url, env) {
  const tokenId = (url.searchParams.get("tokenId") || "").trim();
  if (!tokenId) return json({ error: "missing_tokenId" }, 400, withCors(request));

  const stub = getLedgerStub(env, tokenId);
  const res = await stub.fetch("https://ledger/balance", { method: "GET" });
  const out = await res.json().catch(() => ({}));

  return json({ balance: out.balance ?? 0, tokenId }, 200, withCors(request));
}

async function handleCreditTranscriptTokens(request, env, ctx) {
  const body = await request.json().catch(() => ({}));
  const tokenId = typeof body?.tokenId === "string" ? body.tokenId.trim() : "";
  const amount = Number(body?.amount ?? 0);

  const requestIdRaw = typeof body?.requestId === "string" ? body.requestId.trim() : "";
  const requestId = requestIdRaw || crypto.randomUUID();

  if (!tokenId) {
    return json({ error: "missing_tokenId" }, 400, withCors(request));
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return json({ error: "invalid_amount" }, 400, withCors(request));
  }

  const stub = getLedgerStub(env, tokenId);

  const res = await stub.fetch("https://ledger/credit", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount, requestId }),
  });

  const out = await res.json().catch(() => ({}));

  if (env.R2_TRANSCRIPT) {
    const key = `receipts/manual-credit/${requestId}.json`;
    ctx.waitUntil(
      env.R2_TRANSCRIPT.put(
        key,
        JSON.stringify(
          {
            amount,
            at: new Date().toISOString(),
            balance: out.balance ?? null,
            requestId,
            tokenId,
            type: "manual_credit",
          },
          null,
          2
        ),
        { httpMetadata: { contentType: "application/json" } }
      )
    );
  }

  return json({ ...out, requestId, tokenId }, res.status, withCors(request));
}

async function handleConsumeTranscriptTokens(request, env, ctx) {
  const body = await request.json().catch(() => ({}));
  const tokenId = typeof body?.tokenId === "string" ? body.tokenId.trim() : "";
  const amount = Number(body?.amount ?? 1);

  if (!tokenId) return json({ error: "missing_tokenId" }, 400, withCors(request));
  if (!Number.isFinite(amount) || amount <= 0) return json({ error: "invalid_amount" }, 400, withCors(request));

  const requestIdRaw = typeof body?.requestId === "string" ? body.requestId.trim() : "";
  const requestId = isUuidLike(requestIdRaw) ? requestIdRaw : crypto.randomUUID();
  const stub = getLedgerStub(env, tokenId);

  const res = await stub.fetch("https://ledger/consume", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ amount, requestId }),
  });

  const out = await res.json().catch(() => ({}));

  if (res.ok) {
    const kv = getReportKv(env);
    if (kv) {
      ctx.waitUntil(
        kv.put(
          getReportUnlockKey(requestId),
          JSON.stringify(
            {
              amount,
              balanceAfter: out.balance ?? null,
              createdAt: new Date().toISOString(),
              tokenId,
              type: "preview_unlock",
            },
            null,
            2
          )
        )
      );
    }
  }

  if (env.R2_TRANSCRIPT) {
    const key = `receipts/consume/${requestId}.json`;
    ctx.waitUntil(
      env.R2_TRANSCRIPT.put(
        key,
        JSON.stringify({ amount, at: new Date().toISOString(), balance: out.balance, tokenId }, null, 2),
        { httpMetadata: { contentType: "application/json" } }
      )
    );
  }

  return json({ ...out, requestId, tokenId }, res.status, withCors(request));
}

async function handleTranscriptStripeWebhook(request, env, ctx) {
  assertEnv(env, ["CREDIT_MAP_JSON", "STRIPE_WEBHOOK_SECRET"]);

  const sig = request.headers.get("stripe-signature");
  if (!sig) return json({ error: "missing_signature" }, 400);

  const rawBody = await request.arrayBuffer();
  const rawText = new TextDecoder().decode(rawBody);
  const event = await verifyStripeSignature(env, sig, rawText);

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const tokenId = session?.metadata?.tokenId;
    const priceId = session?.metadata?.priceId;

    if (tokenId && priceId) {
      const creditMap = JSON.parse(env.CREDIT_MAP_JSON);
      const credits = creditMap[priceId];

      if (typeof credits === "number" && credits > 0) {
        const requestId = `stripe:${session.id}`;
        const stub = getLedgerStub(env, tokenId);

        await stub.fetch("https://ledger/credit", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ amount: credits, requestId }),
        });

        if (env.R2_TRANSCRIPT) {
          const key = `receipts/stripe/${session.id}.json`;
          ctx.waitUntil(
            env.R2_TRANSCRIPT.put(
              key,
              JSON.stringify(
                {
                  at: new Date().toISOString(),
                  credits,
                  priceId,
                  sessionId: session.id,
                  tokenId,
                  type: event.type,
                },
                null,
                2
              ),
              { httpMetadata: { contentType: "application/json" } }
            )
          );
        }
      }
    }
  }

  return json({ received: true }, 200);
}

/* ------------------------------------------
 * FORMS: Transcript Report Email
 * ------------------------------------------ */

async function handleShortReportLookup(request, env, url) {
  if (!requireMethod(request, ["GET"])) {
    return new Response("Method not allowed", { status: 405 });
  }

  const reportId = String(url.searchParams.get("r") || "").trim();
  if (!reportId || !/^[A-Za-z0-9_-]{8,128}$/.test(reportId)) {
    return new Response("Invalid report link.", {
      status: 400,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const stored = await resolveShortReportPayload(env, reportId);
  if (!stored || !stored.payload) {
    return new Response("This report link was not found.", {
      status: 404,
      headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
    });
  }

  const target = new URL("https://transcript.taxmonitor.pro/assets/report");
  if (String(stored.payloadTransport || "hash") === "query") {
    target.searchParams.set("data", String(stored.payload));
  } else {
    target.hash = String(stored.payload);
  }

  return Response.redirect(target.toString(), 302);
}

async function handleFormsTranscriptReportEmail(request, env, ctx) {
  if (!requireMethod(request, ["POST"])) {
    return new Response(JSON.stringify({ ok: false, error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const parsed = await parseInboundBody(request);
  if (!parsed.ok) {
    return new Response(JSON.stringify({ ok: false, error: parsed.error, details: parsed.details }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const email = String(parsed.data?.email || "").trim();
  const eventId = String(parsed.data?.eventId || "").trim();
  const reportUrl = String(parsed.data?.reportUrl || "").trim();
  const tokenId = String(parsed.data?.tokenId || "").trim();

  const missing = [];
  if (!email) missing.push("email");
  if (!eventId) missing.push("eventId");
  if (!reportUrl) missing.push("reportUrl");
  if (!tokenId) missing.push("tokenId");

  if (missing.length) {
    return new Response(JSON.stringify({ ok: false, error: "Missing required fields", missing }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!isLikelyEmail(email)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid email" }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!isTokenIdFormat(tokenId)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid tokenId format" }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!isUuidLike(eventId)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid eventId format" }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  if (!isSafeReportUrl(reportUrl)) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid reportUrl" }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const kv = getReportKv(env);
  if (!kv) {
    return new Response(JSON.stringify({ ok: false, error: "Missing KV binding: KV_TRANSCRIPT" }), {
      status: 500,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const unlockRaw = await kv.get(getReportUnlockKey(eventId));
  if (!unlockRaw) {
    return new Response(JSON.stringify({ ok: false, error: "report_not_unlocked" }), {
      status: 403,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const unlockParsed = tryParseJson(unlockRaw);
  const unlock = unlockParsed.ok ? unlockParsed.value : null;
  if (!unlock || String(unlock.tokenId || "") !== tokenId) {
    return new Response(JSON.stringify({ ok: false, error: "report_unlock_token_mismatch" }), {
      status: 403,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const stub = getLedgerStub(env, tokenId);
  const balanceRes = await stub.fetch("https://ledger/balance", { method: "GET" });
  const balanceOut = await balanceRes.json().catch(() => ({}));

  const extracted = extractStoredReportPayload(reportUrl);
  if (!extracted.ok) {
    return new Response(JSON.stringify({ ok: false, error: extracted.error }), {
      status: 400,
      headers: { ...corsHeadersForRequest(request), "Content-Type": "application/json; charset=utf-8" },
    });
  }

  const shortLink = await storeShortReportPayload(env, extracted.payload, {
    payloadTransport: extracted.transport,
    sourcePath: "/assets/report",
  });

  const fromUser =
    env.GOOGLE_WORKSPACE_USER_SUPPORT ||
    env.GOOGLE_WORKSPACE_USER_NOREPLY ||
    env.GOOGLE_WORKSPACE_USER_DEFAULT;

  const from = "Transcript Tax Monitor Pro <" + String(fromUser || "support@taxmonitor.pro") + ">";
  const subject = "Your Transcript Tax Report";
  const text = `Your transcript report is ready.

Open report:
${shortLink.shortUrl}

Important:
- Save this email if you may need the report again.
- This link is intended for your use only.
- This report link does not expire unless you remove it from KV.

If you did not request this report, you can ignore this email.

Transcript Tax Monitor Pro`;

  await gmailSendMessage(env, { from, to: email, subject, text });

  if (env.R2_TRANSCRIPT) {
    const key = `receipts/report-email/${shortLink.reportId}.json`;
    ctx.waitUntil(
      env.R2_TRANSCRIPT.put(
        key,
        JSON.stringify(
          {
            at: new Date().toISOString(),
            email,
            eventId,
            remainingBalance: balanceOut?.balance ?? null,
            reportId: shortLink.reportId,
            shortUrl: shortLink.shortUrl,
            tokenId,
          },
          null,
          2
        ),
        { httpMetadata: { contentType: "application/json" } }
      )
    );
  }

  return new Response(JSON.stringify({ ok: true, reportId: shortLink.reportId, reportUrl: shortLink.shortUrl, remainingBalance: balanceOut?.balance ?? null }), {
    status: 200,
    headers: {
      ...corsHeadersForRequest(request),
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function handleGetTranscriptReportLink(request, url, env) {
  const payload = (url.searchParams.get("payload") || url.searchParams.get("data") || "").trim();
  const reportId = (url.searchParams.get("reportId") || url.searchParams.get("r") || "").trim();
  const reportUrl = (url.searchParams.get("reportUrl") || "").trim();
  const shouldShorten = ["1", "true", "yes"].includes(
    String(url.searchParams.get("short") || "").trim().toLowerCase()
  );
  const transport = String(url.searchParams.get("transport") || "").trim().toLowerCase();

  if (reportId) {
    const link = await getShortReportLink(env, reportId);
    if (!link) return json({ ok: false, error: "report_not_found" }, 404, withCors(request));

    return json({ ok: true, reportId: link.reportId, reportUrl: link.reportUrl }, 200, withCors(request));
  }

  const extracted = extractInboundReportPayload({ payload, reportUrl, transport });
  if (!extracted.ok) {
    return json({ ok: false, error: extracted.error }, 400, withCors(request));
  }

  if (shouldShorten) {
    const shortLink = await storeShortReportPayload(env, extracted.payload, {
      payloadTransport: extracted.transport,
      sourcePath: "/assets/report",
    });

    return json(
      {
        ok: true,
        reportId: shortLink.reportId,
        reportUrl: shortLink.shortUrl,
      },
      200,
      withCors(request)
    );
  }

  return json(
    {
      ok: true,
      reportUrl: buildAssetReportUrl(extracted.payload, extracted.transport),
      transport: extracted.transport,
    },
    200,
    withCors(request)
  );
}

async function handlePostTranscriptReportLink(request, env) {
  const body = await request.json().catch(() => ({}));
  const extracted = extractInboundReportPayload(body || {});
  if (!extracted.ok) {
    return json({ ok: false, error: extracted.error }, 400, withCors(request));
  }

  const shouldShorten = Boolean(body?.short);

  if (shouldShorten) {
    const shortLink = await storeShortReportPayload(env, extracted.payload, {
      payloadTransport: extracted.transport,
      sourcePath: "/assets/report",
    });

    return json(
      {
        ok: true,
        reportId: shortLink.reportId,
        reportUrl: shortLink.shortUrl,
      },
      200,
      withCors(request)
    );
  }

  return json(
    {
      ok: true,
      reportUrl: buildAssetReportUrl(extracted.payload, extracted.transport),
      transport: extracted.transport,
    },
    200,
    withCors(request)
  );
}

async function handleGetTranscriptReportData(request, url, env) {
  const reportId = (url.searchParams.get("reportId") || "").trim();

  if (!reportId) {
    return json({ error: "missing_reportId" }, 400, withCors(request));
  }

  const stored = await resolveShortReportPayload(env, reportId);

  if (!stored || !stored.payload) {
    return json({ error: "report_not_found" }, 404, withCors(request));
  }

  return json(
    {
      ok: true,
      reportId,
      payload: stored.payload,
      transport: stored.payloadTransport || "hash",
      createdAt: stored.createdAt || null,
    },
    200,
    withCors(request)
  );
}

async function handleTranscriptMagicLinkRequest(request, env) {
  const body = await request.json().catch(() => ({}));
  const email = normalizeEmail(body?.email);
  const redirectRaw = String(body?.redirect || "").trim();
  const redirect = redirectRaw && redirectRaw.startsWith("/") ? redirectRaw : "/app-dashboard.html";

  if (!isLikelyEmail(email)) {
    return json({ error: "invalid_email" }, 400, withCors(request));
  }

  const created = await createMagicLinkRecord(env, email, redirect);
  const verifyUrl = buildMagicVerifyUrl(created.token);

  const fromUser =
    env.GOOGLE_WORKSPACE_USER_SUPPORT ||
    env.GOOGLE_WORKSPACE_USER_NOREPLY ||
    env.GOOGLE_WORKSPACE_USER_DEFAULT;

  const from = "Transcript Tax Monitor Pro <" + String(fromUser || "support@taxmonitor.pro") + ">";
  const subject = "Your Transcript Tax Monitor sign-in link";
  const text = `Use this secure sign-in link to open your Transcript Tax Monitor account.

Sign in:
${verifyUrl}

This link expires in 30 minutes.

Transcript Tax Monitor Pro`;

  await gmailSendMessage(env, { from, subject, text, to: email });

  return json({ ok: true }, 200, withCors(request));
}

async function handleTranscriptMagicLinkVerify(request, url, env) {
  const token = String(url.searchParams.get("token") || "").trim();
  if (!token) {
    return new Response("Missing magic link token.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
      status: 400,
    });
  }

  const record = await consumeMagicLinkRecord(env, token);
  if (!record || !record.accountEmail || !record.tokenId) {
    return new Response("This magic link is invalid or expired.", {
      headers: { "content-type": "text/plain; charset=utf-8" },
      status: 400,
    });
  }

  const created = await createSessionRecord(env, record.accountEmail, record.tokenId);
  const redirect = String(record.redirect || "/app-dashboard.html").trim();
  const target = new URL(redirect.startsWith("/") ? `https://transcript.taxmonitor.pro${redirect}` : buildAppDashboardUrl());

  return new Response(null, {
    headers: {
      "cache-control": "no-store",
      Location: target.toString(),
      "Set-Cookie": buildSessionCookie(created.sessionId),
    },
    status: 302,
  });
}

async function handleGetTranscriptMe(request, env) {
  const current = await requireTranscriptSession(request, env);
  if (!current) {
    return json({ error: "unauthorized" }, 401, withCors(request));
  }

  const stub = getLedgerStub(env, current.session.tokenId);
  const res = await stub.fetch("https://ledger/balance", { method: "GET" });
  const out = await res.json().catch(() => ({}));

  return json(
    {
      ok: true,
      user: {
        balance: out.balance ?? 0,
        email: current.session.email,
        tokenId: current.session.tokenId,
      },
    },
    200,
    withCors(request)
  );
}

async function handleGetTranscriptPurchases(request, url, env) {
  const current = await requireTranscriptSession(request, env);
  if (!current) {
    return json({ error: "unauthorized" }, 401, withCors(request));
  }

  const limitRaw = Number(url.searchParams.get("limit") || 25);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 25;

  const purchases = await listUserPurchaseRecords(env, current.session.tokenId);

  return json(
    {
      ok: true,
      purchases: purchases.slice(0, limit),
    },
    200,
    withCors(request)
  );
}

async function handleGetTranscriptReports(request, url, env) {
  const current = await requireTranscriptSession(request, env);
  if (!current) {
    return json({ error: "unauthorized" }, 401, withCors(request));
  }

  const cursor = String(url.searchParams.get("cursor") || "").trim() || undefined;
  const limitRaw = Number(url.searchParams.get("limit") || 25);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(limitRaw, 100) : 25;

  const listed = await listUserReportRecords(env, current.session.email, limit, cursor);

  return json(
    {
      cursor: listed.cursor,
      ok: true,
      reports: listed.records,
    },
    200,
    withCors(request)
  );
}

async function handleCreateTranscriptPreview(request, env, ctx) {
  const current = await requireTranscriptSession(request, env);
  if (!current) {
    return json({ error: "unauthorized" }, 401, withCors(request));
  }

  const body = await request.json().catch(() => ({}));
  const reportData = body?.reportData;

  if (!reportData || typeof reportData !== "object") {
    return json({ error: "missing_reportData" }, 400, withCors(request));
  }

  const requestId = crypto.randomUUID();
  const consumeRes = await getLedgerStub(env, current.session.tokenId).fetch("https://ledger/consume", {
    body: JSON.stringify({ amount: 1, requestId }),
    headers: { "content-type": "application/json" },
    method: "POST",
  });

  const consumeOut = await consumeRes.json().catch(() => ({}));
  if (!consumeRes.ok) {
    return json(
      {
        balance: consumeOut.balance ?? 0,
        error: consumeOut.error || "token_consume_failed",
        needed: consumeOut.needed ?? 1,
      },
      consumeRes.status,
      withCors(request)
    );
  }

  const payload = JSON.stringify(reportData);
  const shortLink = await storeShortReportPayload(env, payload, {
    payloadTransport: "query",
    sourcePath: "/assets/report.html",
  });

  const createdAt = new Date().toISOString();
  const reportMeta = {
    accountEmail: current.session.email,
    balanceAfter: consumeOut.balance ?? 0,
    createdAt,
    printedAt: null,
    reportId: shortLink.reportId,
    reportUrl: buildReportPageUrl(shortLink.reportId),
    status: "pending",
    tokenId: current.session.tokenId,
  };

  const kv = getReportKv(env);
  await kv.put(getReportMetaKey(shortLink.reportId), JSON.stringify(reportMeta, null, 2));
  await kv.put(
    getReportIndexKey(current.session.email, createdAt, shortLink.reportId),
    JSON.stringify({ createdAt, reportId: shortLink.reportId }, null, 2)
  );
  await kv.put(
    getReportUnlockKey(requestId),
    JSON.stringify(
      {
        amount: 1,
        balanceAfter: consumeOut.balance ?? 0,
        createdAt,
        reportId: shortLink.reportId,
        tokenId: current.session.tokenId,
        type: "preview_unlock",
      },
      null,
      2
    )
  );

  if (env.R2_TRANSCRIPT) {
    ctx.waitUntil(
      env.R2_TRANSCRIPT.put(
        `receipts/consume/${requestId}.json`,
        JSON.stringify(
          {
            amount: 1,
            at: createdAt,
            balance: consumeOut.balance ?? 0,
            reportId: shortLink.reportId,
            tokenId: current.session.tokenId,
            type: "preview",
          },
          null,
          2
        ),
        { httpMetadata: { contentType: "application/json" } }
      )
    );
  }

  return json(
    {
      ok: true,
      balance: consumeOut.balance ?? 0,
      eventId: requestId,
      reportId: shortLink.reportId,
      reportUrl: buildReportPageUrl(shortLink.reportId),
    },
    200,
    withCors(request)
  );
}

async function handleTranscriptPrintComplete(request, url, env) {
  const current = await requireTranscriptSession(request, env);
  if (!current) {
    return json({ error: "unauthorized" }, 401, withCors(request));
  }

  const match = url.pathname.match(/^\/api\/transcripts\/report\/([^/]+)\/print-complete$/);
  const reportId = String(match && match[1] ? match[1] : "").trim();
  if (!reportId) {
    return json({ error: "missing_reportId" }, 400, withCors(request));
  }

  const kv = getReportKv(env);
  const raw = await kv.get(getReportMetaKey(reportId));
  if (!raw) {
    return json({ error: "report_not_found" }, 404, withCors(request));
  }

  const parsed = tryParseJson(raw);
  if (!parsed.ok || !parsed.value) {
    return json({ error: "invalid_report_meta" }, 500, withCors(request));
  }

  const meta = parsed.value;
  if (String(meta.accountEmail || "") !== String(current.session.email || "")) {
    return json({ error: "forbidden" }, 403, withCors(request));
  }

  meta.printedAt = new Date().toISOString();
  meta.status = "printed";

  await kv.put(getReportMetaKey(reportId), JSON.stringify(meta, null, 2));

  return json(
    {
      ok: true,
      printedAt: meta.printedAt,
      reportId,
      status: meta.status,
    },
    200,
    withCors(request)
  );
}

async function handleTranscriptSignOut(request) {
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      ...withCors(request),
      "cache-control": "no-store",
      "content-type": "application/json; charset=utf-8",
      "Set-Cookie": buildSessionCookieClear(),
    },
    status: 200,
  });
}

async function handlePostHelpTickets(request, env) {
  const parsed = await parseInboundBody(request);
  if (!parsed.ok) {
    return json({ error: parsed.error, details: parsed.details }, 400, withCors(request));
  }

  const payload = parsed.data || {};
  const required = ["category", "email", "eventId", "issueType", "message", "name", "priority", "subject", "urgency"];
  const missing = required.filter((key) => !String(payload[key] || "").trim()).sort();

  if (missing.length) {
    return json({ error: "missing_required_fields", missing }, 400, withCors(request));
  }

  const email = normalizeEmail(payload.email);
  const eventId = String(payload.eventId || "").trim();

  if (!isLikelyEmail(email)) {
    return json({ error: "invalid_email" }, 400, withCors(request));
  }

  if (!isUuidLike(eventId)) {
    return json({ error: "invalid_eventId" }, 400, withCors(request));
  }

  const record = await createCanonicalSupportTicket(env, payload);

  return json(
    {
      latestUpdate: record.latestUpdate,
      ok: true,
      status: record.status,
      supportId: record.supportId,
      taskId: record.taskId,
      updatedAt: record.updatedAt,
    },
    200,
    withCors(request)
  );
}

async function handleGetHelpStatus(request, url, env) {
  const supportId = normalizeSupportId(
    url.searchParams.get("ticket_id") || url.searchParams.get("supportId") || url.searchParams.get("support_id") || ""
  );

  if (!supportId) {
    return json({ error: "missing_ticket_id" }, 400, withCors(request));
  }

  let record = await getCanonicalSupportRecord(env, supportId);
  if (!record) {
    try {
      record = await syncSupportRecordFromClickUp(env, supportId);
    } catch (_) {
      record = null;
    }
  }

  if (!record) {
    return json({ error: "ticket_not_found" }, 404, withCors(request));
  }

  return json(
    {
      latestUpdate: record.latestUpdate || "",
      ok: true,
      status: record.status || "open / new",
      supportId: record.supportId || supportId,
      taskId: record.taskId || "",
      updatedAt: record.updatedAt || null,
    },
    200,
    withCors(request)
  );
}

async function handleClickUpWebhook(request, env) {
  const rawBody = await request.text();
  const verified = await verifyClickUpWebhookSignature(env, request, rawBody);
  if (!verified) {
    return json({ error: "invalid_signature" }, 401, withCors(request));
  }

  const parsed = tryParseJson(rawBody);
  if (!parsed.ok || !parsed.value) {
    return json({ error: "invalid_json" }, 400, withCors(request));
  }

  const payload = parsed.value;
  const event = String(payload && payload.event || "").trim();
  const taskId = String(payload && payload.task_id || "").trim();
  const listId = String(payload && payload.list_id || "").trim();

  if (event !== "taskUpdated") {
    return json({ ignored: true, ok: true, reason: "unsupported_event" }, 200, withCors(request));
  }

  if (!taskId) {
    return json({ ignored: true, ok: true, reason: "missing_task_id" }, 200, withCors(request));
  }

  if (listId && listId !== CLICKUP_TRANSCRIPT.SUPPORT_LIST_ID) {
    return json({ ignored: true, ok: true, reason: "wrong_list" }, 200, withCors(request));
  }

  const fullTask = await getClickUpTask(env, taskId);
  const taskListId = String(fullTask && fullTask.list && fullTask.list.id || "").trim();
  if (taskListId && taskListId !== CLICKUP_TRANSCRIPT.SUPPORT_LIST_ID) {
    return json({ ignored: true, ok: true, reason: "wrong_task_list" }, 200, withCors(request));
  }

  const historyItem = Array.isArray(payload && payload.history_items) && payload.history_items.length ? payload.history_items[0] : null;
  const synced = await upsertCanonicalSupportFromTask(env, fullTask, historyItem);

  if (!synced.ok) {
    return json({ ignored: true, ok: true, reason: synced.reason || "not_projectable" }, 200, withCors(request));
  }

  return json({ ok: true, supportId: synced.record.supportId, status: synced.record.status }, 200, withCors(request));
}

async function handleAssetReportRedirect(request, url, env) {
  const reportId = (url.searchParams.get("r") || "").trim();
  if (!reportId) return null;

  return await handleShortReportLookup(request, env, url);
}

/*
 * Preview integration note:
 *
 * The blank preview happens when the UI opens /assets/report with no payload.
 * Normalize every preview URL through /transcript/report-link first so the
 * iframe always receives either a hash payload, query payload, or short link.
 */

/* ------------------------------------------
 * Worker Entry
 * ------------------------------------------ */

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname.startsWith("/api/transcripts/")) {
      const pre = handleCorsPreflight(request);
      if (pre) return pre;

      try {
        if (request.method === "POST" && isPath(url, "/api/transcripts/magic-link/request")) {
          return await handleTranscriptMagicLinkRequest(request, env);
        }

        if (request.method === "GET" && isPath(url, "/api/transcripts/magic-link/verify")) {
          return await handleTranscriptMagicLinkVerify(request, url, env);
        }

        if (request.method === "GET" && isPath(url, "/api/transcripts/checkout/status")) {
          return await handleGetTranscriptCheckoutStatus(request, url, env);
        }

        if (request.method === "GET" && isPath(url, "/api/transcripts/me")) {
          return await handleGetTranscriptMe(request, env);
        }

        if (request.method === "GET" && isPath(url, "/api/transcripts/purchases")) {
          return await handleGetTranscriptPurchases(request, url, env);
        }

        if (request.method === "POST" && isPath(url, "/api/transcripts/preview")) {
          return await handleCreateTranscriptPreview(request, env, ctx);
        }

        if (request.method === "GET" && isPath(url, "/api/transcripts/reports")) {
          return await handleGetTranscriptReports(request, url, env);
        }

        if (
          request.method === "POST" &&
          /^\/api\/transcripts\/report\/[^/]+\/print-complete$/.test(url.pathname)
        ) {
          return await handleTranscriptPrintComplete(request, url, env);
        }

        if (request.method === "POST" && isPath(url, "/api/transcripts/sign-out")) {
          return await handleTranscriptSignOut(request);
        }

        return jsonError(request, 404, "not_found");
      } catch (err) {
        return jsonError(request, 500, "internal_error", String(err?.message || err));
      }
    }

    if (url.pathname.startsWith("/transcript/")) {
      const pre = handleCorsPreflight(request);
      if (pre) return pre;

      try {
        if (request.method === "GET" && isPath(url, "/transcript/prices")) {
          return await handleGetTranscriptPrices(request, env);
        }

        if (request.method === "POST" && isPath(url, "/transcript/checkout")) {
          return await handleCreateTranscriptCheckout(request, env);
        }

        if (request.method === "GET" && isPath(url, "/transcript/tokens")) {
          return await handleGetTranscriptTokens(request, url, env);
        }

        if (request.method === "POST" && isPath(url, "/transcript/credit")) {
          return await handleCreditTranscriptTokens(request, env, ctx);
        }

        if (request.method === "POST" && isPath(url, "/transcript/consume")) {
          return await handleConsumeTranscriptTokens(request, env, ctx);
        }

        if (request.method === "POST" && isPath(url, "/transcript/stripe/webhook")) {
          return await handleTranscriptStripeWebhook(request, env, ctx);
        }

        if (request.method === "GET" && isPath(url, "/transcript/report-data")) {
          return await handleGetTranscriptReportData(request, url, env);
        }

        return jsonError(request, 404, "not_found");
      } catch (err) {
        return jsonError(request, 500, "internal_error", String(err?.message || err));
      }
    }

    if (isPath(url, "/transcript/report-link")) {
      try {
        if (request.method === "GET") {
          return await handleGetTranscriptReportLink(request, url, env);
        }

        if (request.method === "POST") {
          return await handlePostTranscriptReportLink(request, env);
        }

        return jsonError(request, 405, "method_not_allowed");
      } catch (err) {
        return jsonError(request, 500, "internal_error", String(err?.message || err));
      }
    }

    if (request.method === "GET" && isPath(url, "/transcript/report")) {
      try {
        const redirectRes = await handleAssetReportRedirect(request, url, env);
        if (redirectRes) return redirectRes;

        return new Response("Invalid report link.", {
          status: 400,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      } catch (err) {
        return new Response("Unable to open this report link.", {
          status: 500,
          headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
        });
      }
    }

    if (request.method === "GET" && isPath(url, "/health")) {
      return jsonResponse({ ok: true, service: "transcript-tax-monitor-pro-api" }, { status: 200 });
    }

    if (request.method === "GET" && isPath(url, "/v1/help/status")) {
      try {
        return await handleGetHelpStatus(request, url, env);
      } catch (err) {
        return jsonError(request, 500, "internal_error", String(err?.message || err));
      }
    }

    if (request.method === "POST" && isPath(url, "/v1/help/tickets")) {
      try {
        return await handlePostHelpTickets(request, env);
      } catch (err) {
        return jsonError(request, 500, "internal_error", String(err?.message || err));
      }
    }

    if (request.method === "OPTIONS" && isPath(url, CLICKUP_TRANSCRIPT.WEBHOOK_ROUTE)) {
      return new Response(null, { status: 204, headers: withCors(request) });
    }

    if (request.method === "POST" && isPath(url, CLICKUP_TRANSCRIPT.WEBHOOK_ROUTE)) {
      try {
        return await handleClickUpWebhook(request, env);
      } catch (err) {
        return jsonError(request, 500, "internal_error", String(err?.message || err));
      }
    }

    if (request.method === "OPTIONS" && isPath(url, "/forms/transcript/report-email")) {
      return new Response("", { status: 204, headers: corsHeadersForRequest(request) });
    }

    if (isPath(url, "/forms/transcript/report-email")) {
      try {
        return await handleFormsTranscriptReportEmail(request, env, ctx);
      } catch (err) {
        return new Response(
          JSON.stringify({ ok: false, error: "internal_error", details: String(err?.message || err) }),
          {
            status: 500,
            headers: {
              ...corsHeadersForRequest(request),
              "Content-Type": "application/json; charset=utf-8",
            },
          }
        );
      }
    }

    return jsonResponse({ ok: false, error: "Not found" }, { status: 404 });
  },
};
