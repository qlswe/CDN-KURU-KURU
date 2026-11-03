import { createRemoteJWKSet, jwtVerify } from "jose";

const ORIGIN = "https://kuru-kuru.ru";
const CONSENT_VERSION = "1";
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_ALLOWLIST = new Set(["/", "/#work", "/#about", "/#interests", "/#contact"]);
const EVENT_TYPES = new Set(["page_view", "section_view", "js_error", "performance"]);
const cors = {
  "Access-Control-Allow-Origin": ORIGIN,
  "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, CF-Access-Jwt-Assertion",
  "Vary": "Origin",
};

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...cors, ...headers } });
}
function validOrigin(req) {
  const origin = req.headers.get("Origin");
  return origin === ORIGIN || origin === null;
}
function safePage(value) {
  if (typeof value !== "string") return "/";
  const path = value.split("?")[0].slice(0, 120);
  return PAGE_ALLOWLIST.has(path) ? path : "/";
}
function boundedInt(value, min, max, fallback) {
  return Number.isInteger(value) && value >= min && value <= max ? value : fallback;
}
function safeLanguage(value) {
  return typeof value === "string" && /^[a-z]{2,3}(-[A-Z]{2})?$/.test(value) ? value : "und";
}
async function accessAuthorized(request, env) {
  const token = request.headers.get("Cf-Access-Jwt-Assertion");
  if (!token || !env.ACCESS_TEAM_DOMAIN || !env.ACCESS_AUD || env.ACCESS_TEAM_DOMAIN.startsWith("REPLACE_") || env.ACCESS_AUD.startsWith("REPLACE_")) return false;
  try {
    const issuer = "https://" + env.ACCESS_TEAM_DOMAIN;
    const jwks = createRemoteJWKSet(new URL(issuer + "/cdn-cgi/access/certs"));
    await jwtVerify(token, jwks, { issuer, audience: env.ACCESS_AUD });
    return true;
  } catch {
    return false;
  }
}
async function parseBody(req) {
  const length = Number(req.headers.get("Content-Length") || 0);
  if (length > 4096) throw new Error("payload_too_large");
  const data = await req.json();
  if (!data || typeof data !== "object" || Array.isArray(data)) throw new Error("invalid_payload");
  return data;
}
async function collect(req, env) {
  if (!validOrigin(req)) return json({ error: "origin_denied" }, 403);
  const data = await parseBody(req);
  if (data.consent !== true || data.consentVersion !== CONSENT_VERSION) return json({ error: "consent_required" }, 400);
  if (typeof data.wbuid !== "string" || !UUID_RE.test(data.wbuid)) return json({ error: "invalid_wbuid" }, 400);
  if (!EVENT_TYPES.has(data.type)) return json({ error: "invalid_event" }, 400);
  const page = safePage(data.page);
  const device = ["desktop", "mobile", "tablet"].includes(data.device) ? data.device : "unknown";
  const language = safeLanguage(data.language);
  const width = boundedInt(data.screenWidth, 0, 10000, 0);
  const height = boundedInt(data.screenHeight, 0, 10000, 0);
  const now = new Date().toISOString();
  const minute = Math.floor(Date.now() / 60000);
  const throttle = await env.DB.prepare("INSERT INTO rate_limits(wbuid,window_minute,hits) VALUES(?,?,1) ON CONFLICT(wbuid) DO UPDATE SET window_minute=excluded.window_minute,hits=CASE WHEN rate_limits.window_minute=excluded.window_minute THEN rate_limits.hits+1 ELSE 1 END RETURNING hits").bind(data.wbuid, minute).first();
  if ((throttle?.hits || 0) > 30) return json({ error: "rate_limited" }, 429, { "Retry-After": "60" });
  let detail = {};
  if (data.type === "js_error") {
    detail = { message: typeof data.message === "string" ? data.message.slice(0, 180).replace(/[\r\n\t]/g, " ") : "unknown" };
  } else if (data.type === "performance") {
    detail = { loadMs: boundedInt(data.loadMs, 0, 120000, 0) };
  }
  await env.DB.prepare(`INSERT INTO visitors(wbuid,created_at,last_seen,device,language,screen_width,screen_height,consent_version)
    VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(wbuid) DO UPDATE SET last_seen=excluded.last_seen,device=excluded.device,language=excluded.language,screen_width=excluded.screen_width,screen_height=excluded.screen_height`)
    .bind(data.wbuid, now, now, device, language, width, height, CONSENT_VERSION).run();
  await env.DB.prepare("INSERT INTO events(wbuid,event_type,page,created_at,detail) VALUES(?,?,?,?,?)")
    .bind(data.wbuid, data.type, page, now, JSON.stringify(detail)).run();
  return json({ ok: true });
}
async function admin(req, env, url) {
  if (!(await accessAuthorized(req, env))) return json({ error: "unauthorized" }, 401);
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);
  if (url.pathname.endsWith("/summary")) {
    const [totals, daily, devices, recent] = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) visitors FROM visitors").first(),
      env.DB.prepare("SELECT substr(created_at,1,10) day, COUNT(*) events FROM events WHERE created_at >= datetime('now','-30 days') GROUP BY day ORDER BY day").all(),
      env.DB.prepare("SELECT device, COUNT(*) count FROM visitors GROUP BY device").all(),
      env.DB.prepare("SELECT wbuid,created_at,last_seen,device,language FROM visitors ORDER BY last_seen DESC LIMIT 100").all()
    ]);
    const eventCount = await env.DB.prepare("SELECT COUNT(*) count FROM events WHERE created_at >= datetime('now','-30 days')").first();
    return json({ visitors: totals?.visitors || 0, events30d: eventCount?.count || 0, daily: daily.results || [], devices: devices.results || [], recent: recent.results || [] });
  }
  if (url.pathname.endsWith("/events")) {
    const rows = await env.DB.prepare("SELECT event_type,page,created_at,detail,wbuid FROM events ORDER BY id DESC LIMIT 200").all();
    return json({ events: rows.results || [] });
  }
  return json({ error: "not_found" }, 404);
}
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    try {
      if (url.pathname === "/api/telemetry/collect" && request.method === "POST") return await collect(request, env);
      if (url.pathname === "/api/telemetry/revoke" && request.method === "POST") {
        if (!validOrigin(request)) return json({ error: "origin_denied" }, 403);
        const data = await parseBody(request);
        if (typeof data.wbuid !== "string" || !UUID_RE.test(data.wbuid)) return json({ error: "invalid_wbuid" }, 400);
        await env.DB.prepare("DELETE FROM visitors WHERE wbuid=?").bind(data.wbuid).run();
        return json({ ok: true });
      }
      if (url.pathname.startsWith("/api/telemetry/admin/")) return await admin(request, env, url);
      return json({ error: "not_found" }, 404);
    } catch (error) {
      if (error?.message === "payload_too_large") return json({ error: "payload_too_large" }, 413);
      return json({ error: "request_failed" }, 400);
    }
  },
  async scheduled(_event, env, ctx) {
    ctx.waitUntil(env.DB.prepare("DELETE FROM events WHERE created_at < datetime('now','-90 days')").run());
    ctx.waitUntil(env.DB.prepare("DELETE FROM visitors WHERE last_seen < datetime('now','-90 days')").run());
  }
};
