const ORIGIN = "https://kuru-kuru.ru";
const CONSENT_VERSION = "2";
const SESSION_COOKIE = "__Host-kuru_admin";
const SESSION_TTL = 12 * 60 * 60;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAGE_ALLOWLIST = new Set(["/", "/#work", "/#about", "/#interests", "/#contact"]);
const EVENT_TYPES = new Set(["page_view", "section_view", "js_error", "performance"]);
const cors = {"Access-Control-Allow-Origin":ORIGIN,"Access-Control-Allow-Methods":"POST, GET, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"};
function json(data,status=200,headers={}) { return new Response(JSON.stringify(data),{status,headers:{"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store",...cors,...headers}}); }
function validOrigin(req) { return req.headers.get("Origin") === ORIGIN; }
function safePage(value) { if(typeof value!=="string")return "/";const path=value.split("?")[0].slice(0,120);return PAGE_ALLOWLIST.has(path)?path:"/"; }
function boundedInt(value,min,max,fallback) { return Number.isInteger(value)&&value>=min&&value<=max?value:fallback; }
function safeToken(value,allowed,fallback="unknown") { return typeof value==="string"&&allowed.has(value)?value:fallback; }
function safeLanguage(value) { return typeof value==="string"&&/^[a-z]{2,3}(-[A-Z]{2})?$/.test(value)?value:"und"; }
async function parseBody(req) { const length=Number(req.headers.get("Content-Length")||0);if(length>4096)throw new Error("payload_too_large");const data=await req.json();if(!data||typeof data!=="object"||Array.isArray(data))throw new Error("invalid_payload");return data; }
function bytesToBase64Url(bytes) { let binary="";for(const byte of bytes)binary+=String.fromCharCode(byte);return btoa(binary).replace(/=/g,"").replace(/\+/g,"-").replace(/\//g,"_"); }
async function sign(value,secret) { const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(secret),{name:"HMAC",hash:"SHA-256"},false,["sign"]);return bytesToBase64Url(new Uint8Array(await crypto.subtle.sign("HMAC",key,new TextEncoder().encode(value)))); }
async function createSession(secret) { const payload=String(Math.floor(Date.now()/1000)+SESSION_TTL);return payload+"."+await sign(payload,secret); }
async function validSession(request,env) { if(!env.COOKIE_SECRET||env.COOKIE_SECRET.length<32)return false;const cookie=request.headers.get("Cookie")||"";const match=cookie.split(";").map(x=>x.trim()).find(x=>x.startsWith(SESSION_COOKIE+"="));if(!match)return false;const token=match.slice(SESSION_COOKIE.length+1);const [expiry,signature,extra]=token.split(".");if(!expiry||!signature||extra||!/^\d+$/.test(expiry)||Number(expiry)<Math.floor(Date.now()/1000)||Number(expiry)>Math.floor(Date.now()/1000)+SESSION_TTL+60)return false;return signature===await sign(expiry,env.COOKIE_SECRET); }
function safeTechProfile(data,cf) {
  const webgl = data.webgl && typeof data.webgl==="object" ? data.webgl : {};
  const network = data.network && typeof data.network==="object" ? data.network : {};
  const browser = safeToken(data.browser,new Set(["Chrome","Edge","Firefox","Safari","Opera","Samsung Internet","Other"]));
  const os = safeToken(data.os,new Set(["Windows","macOS","Linux","Android","iOS","Other"]));
  const glVersion = safeToken(webgl.version,new Set(["WebGL 1","WebGL 2","unsupported"]),"unsupported");
  const effectiveType = safeToken(network.effectiveType,new Set(["slow-2g","2g","3g","4g"]));
  return {
    browser, browserMajor:boundedInt(data.browserMajor,0,999,0), os,
    screenDpr:typeof data.screenDpr==="number"&&Number.isFinite(data.screenDpr)?Math.max(0,Math.min(5,Math.round(data.screenDpr*100)/100)):0,
    colorDepth:boundedInt(data.colorDepth,0,64,0), touch: data.touch===true,
    hardwareConcurrency:boundedInt(data.hardwareConcurrency,0,256,0),
    deviceMemory:typeof data.deviceMemory==="number"&&[0.25,0.5,1,2,4,8,16,32].includes(data.deviceMemory)?data.deviceMemory:0,
    webgl:{version:glVersion, maxTextureSize:boundedInt(webgl.maxTextureSize,0,32768,0), extensionsCount:boundedInt(webgl.extensionsCount,0,256,0)},
    network:{effectiveType, saveData:network.saveData===true},
    country:typeof cf?.country==="string"?cf.country.slice(0,2):"unknown",
    region:typeof cf?.regionCode==="string"?cf.regionCode.slice(0,8):"unknown",
    asn:boundedInt(cf?.asn,0,4294967295,0),
    colo:typeof cf?.colo==="string"?cf.colo.slice(0,8):"unknown"
  };
}
async function recordConsent(req,env) {
  if(!validOrigin(req))return json({error:"origin_denied"},403);
  const data=await parseBody(req);
  if(data.version!==CONSENT_VERSION||!["accepted","declined"].includes(data.decision))return json({error:"invalid_consent_choice"},400);
  const db=env["kuru-kuru"];
  await db.prepare("CREATE TABLE IF NOT EXISTS consent_metrics (day TEXT NOT NULL, decision TEXT NOT NULL CHECK(decision IN ('accepted','declined')), version TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY(day,decision,version))").run();
  const now=new Date().toISOString(),day=now.slice(0,10);
  await db.prepare("INSERT INTO consent_metrics(day,decision,version,count,updated_at) VALUES(?,?,?,1,?) ON CONFLICT(day,decision,version) DO UPDATE SET count=consent_metrics.count+1,updated_at=excluded.updated_at").bind(day,data.decision,CONSENT_VERSION,now).run();
  return json({ok:true});
}
async function collect(req,env) {
  if(!validOrigin(req))return json({error:"origin_denied"},403);
  const data=await parseBody(req);
  if(data.consent!==true||data.consentVersion!==CONSENT_VERSION)return json({error:"consent_required"},400);
  if(typeof data.wbuid!=="string"||!UUID_RE.test(data.wbuid))return json({error:"invalid_wbuid"},400);
  if(!EVENT_TYPES.has(data.type))return json({error:"invalid_event"},400);
  const page=safePage(data.page),device=safeToken(data.device,new Set(["desktop","mobile","tablet"]));
  const language=safeLanguage(data.language),width=boundedInt(data.screenWidth,0,10000,0),height=boundedInt(data.screenHeight,0,10000,0);
  const now=new Date().toISOString(),minute=Math.floor(Date.now()/60000);
  const db=env["kuru-kuru"];
  const throttle=await db.prepare("INSERT INTO rate_limits(wbuid,window_minute,hits) VALUES(?,?,1) ON CONFLICT(wbuid) DO UPDATE SET window_minute=excluded.window_minute,hits=CASE WHEN rate_limits.window_minute=excluded.window_minute THEN rate_limits.hits+1 ELSE 1 END RETURNING hits").bind(data.wbuid,minute).first();
  if((throttle?.hits||0)>30)return json({error:"rate_limited"},429,{"Retry-After":"60"});
  let detail={};
  if(data.type==="js_error")detail={message:typeof data.message==="string"?data.message.slice(0,180).replace(/[\r\n\t]/g," "):"unknown"};
  if(data.type==="performance")detail={loadMs:boundedInt(data.loadMs,0,120000,0),screenWidth:boundedInt(data.screenWidth,0,10000,0),screenHeight:boundedInt(data.screenHeight,0,10000,0),...safeTechProfile(data,req.cf)};
  await db.prepare("INSERT INTO visitors(wbuid,created_at,last_seen,device,language,screen_width,screen_height,consent_version) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(wbuid) DO UPDATE SET last_seen=excluded.last_seen,device=excluded.device,language=excluded.language,screen_width=excluded.screen_width,screen_height=excluded.screen_height").bind(data.wbuid,now,now,device,language,width,height,CONSENT_VERSION).run();
  await db.prepare("INSERT INTO events(wbuid,event_type,page,created_at,detail) VALUES(?,?,?,?,?)").bind(data.wbuid,data.type,page,now,JSON.stringify(detail)).run();
  return json({ok:true});
}
async function admin(req,env,url) {
  if(url.pathname==="/api/telemetry/admin/login"&&req.method==="POST") {
    if(!validOrigin(req))return json({error:"origin_denied"},403);
    if(!env.TELEMETRY_ADMIN_PASSWORD||!env.COOKIE_SECRET||env.COOKIE_SECRET.length<32)return json({error:"server_not_configured"},503);
    const data=await parseBody(req);
    if(typeof data.password!=="string"||data.password.length>256||data.password!==env.TELEMETRY_ADMIN_PASSWORD)return json({error:"invalid_credentials"},401);
    const token=await createSession(env.COOKIE_SECRET);
    return json({ok:true},200,{"Set-Cookie":SESSION_COOKIE+"="+token+"; Max-Age="+SESSION_TTL+"; Path=/; HttpOnly; Secure; SameSite=Strict"});
  }
  if(url.pathname==="/api/telemetry/admin/logout"&&req.method==="POST") {
    if(!validOrigin(req))return json({error:"origin_denied"},403);
    return json({ok:true},200,{"Set-Cookie":SESSION_COOKIE+"=; Max-Age=0; Path=/; HttpOnly; Secure; SameSite=Strict"});
  }
  if(!(await validSession(req,env)))return json({error:"unauthorized"},401);
  if(req.method!=="GET")return json({error:"method_not_allowed"},405);
  const db=env["kuru-kuru"];
  if(url.pathname.endsWith("/summary")) {
    await db.prepare("CREATE TABLE IF NOT EXISTS consent_metrics (day TEXT NOT NULL, decision TEXT NOT NULL, version TEXT NOT NULL, count INTEGER NOT NULL DEFAULT 0, updated_at TEXT NOT NULL, PRIMARY KEY(day,decision,version))").run();
    const [totals,daily,devices,recent,eventCount,consentTotals,consentDaily]=await Promise.all([
      db.prepare("SELECT COUNT(*) visitors FROM visitors").first(),
      db.prepare("SELECT substr(created_at,1,10) day,COUNT(*) events FROM events WHERE created_at>=datetime('now','-30 days') GROUP BY day ORDER BY day").all(),
      db.prepare("SELECT device,COUNT(*) count FROM visitors GROUP BY device").all(),
      db.prepare("SELECT wbuid,created_at,last_seen,device,language FROM visitors ORDER BY last_seen DESC LIMIT 100").all(),
      db.prepare("SELECT COUNT(*) count FROM events WHERE created_at>=datetime('now','-30 days')").first(),
      db.prepare("SELECT decision,SUM(count) count FROM consent_metrics WHERE version=? GROUP BY decision").bind(CONSENT_VERSION).all(),
      db.prepare("SELECT day,decision,count FROM consent_metrics WHERE version=? AND day>=date('now','-30 days') ORDER BY day").bind(CONSENT_VERSION).all()
    ]);
    const choices=Object.fromEntries((consentTotals.results||[]).map(x=>[x.decision,x.count]));
    return json({visitors:totals?.visitors||0,events30d:eventCount?.count||0,daily:daily.results||[],devices:devices.results||[],recent:recent.results||[],consent:{accepted:choices.accepted||0,declined:choices.declined||0,daily:consentDaily.results||[]}});
  }
  if(url.pathname.endsWith("/events")) { const rows=await db.prepare("SELECT event_type,page,created_at,detail,wbuid FROM events ORDER BY id DESC LIMIT 200").all();return json({events:rows.results||[]}); }
  return json({error:"not_found"},404);
}
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(request.method==="OPTIONS")return new Response(null,{status:204,headers:cors});
    try {
      if(url.pathname==="/api/telemetry/consent"&&request.method==="POST")return await recordConsent(request,env);
      if(url.pathname==="/api/telemetry/collect"&&request.method==="POST")return await collect(request,env);
      if(url.pathname==="/api/telemetry/revoke"&&request.method==="POST") {
        if(!validOrigin(request))return json({error:"origin_denied"},403);
        const data=await parseBody(request);if(typeof data.wbuid!=="string"||!UUID_RE.test(data.wbuid))return json({error:"invalid_wbuid"},400);
        const db=env["kuru-kuru"];
        await db.prepare("DELETE FROM events WHERE wbuid=?").bind(data.wbuid).run();
        await db.prepare("DELETE FROM visitors WHERE wbuid=?").bind(data.wbuid).run();
        await db.prepare("DELETE FROM rate_limits WHERE wbuid=?").bind(data.wbuid).run();
        return json({ok:true});
      }
      if(url.pathname.startsWith("/api/telemetry/admin/"))return await admin(request,env,url);
      return json({error:"not_found"},404);
    } catch(error) {
      if(error?.message==="payload_too_large")return json({error:"payload_too_large"},413);
      return json({error:"request_failed"},400);
    }
  },
  async scheduled(_event,env,ctx) {
    ctx.waitUntil(env["kuru-kuru"].prepare("DELETE FROM events WHERE created_at<datetime('now','-90 days')").run());
    ctx.waitUntil(env["kuru-kuru"].prepare("DELETE FROM visitors WHERE last_seen<datetime('now','-90 days')").run());
    ctx.waitUntil(env["kuru-kuru"].prepare("DELETE FROM rate_limits WHERE window_minute<(strftime('%s','now')/60)-1440").run());
  }
};
