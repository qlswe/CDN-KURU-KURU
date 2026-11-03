(() => {
  "use strict";
  const API = "/api/telemetry";
  const KEY = "kuru.telemetry.consent";
  const ID_KEY = "kuru.telemetry.wbuid";
  const VERSION = "1";
  const $ = (id) => document.getElementById(id);
  const device = () => {
    const ua = navigator.userAgent || "";
    if (/iPad|Tablet|PlayBook/i.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1)) return "tablet";
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "mobile";
    return "desktop";
  };
  const page = () => location.hash && ["#work","#about","#interests","#contact"].includes(location.hash) ? "/" + location.hash : "/";
  const getId = () => {
    let id = localStorage.getItem(ID_KEY);
    if (!id) { id = crypto.randomUUID(); localStorage.setItem(ID_KEY, id); }
    return id;
  };
  async function send(type, extra = {}) {
    if (localStorage.getItem(KEY) !== "accepted") return;
    const body = {
      consent: true, consentVersion: VERSION, wbuid: getId(), type, page: page(),
      device: device(), language: (navigator.language || "und").slice(0, 12),
      screenWidth: Math.min(screen.width || 0, 10000), screenHeight: Math.min(screen.height || 0, 10000), ...extra
    };
    try { await fetch(API + "/collect", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(body), keepalive:true, credentials:"omit" }); } catch (_) {}
  }
  function banner() {
    if (localStorage.getItem(KEY)) return;
    const box = document.createElement("aside");
    box.id = "kuru-consent";
    box.innerHTML = '<div><strong>Анонимная статистика</strong><p>Можно разрешить сбор случайного WBUID, типа устройства и событий сайта. Без IP, геолокации и цифрового отпечатка. <a href="/privacy.html">Подробнее</a></p></div><div class="kuru-consent-actions"><button type="button" data-choice="no">Не разрешать</button><button type="button" data-choice="yes">Разрешить</button></div>';
    document.body.append(box);
    box.addEventListener("click", (event) => {
      const choice = event.target.closest("button")?.dataset.choice;
      if (!choice) return;
      localStorage.setItem(KEY, choice === "yes" ? "accepted" : "rejected");
      box.remove();
      if (choice === "yes") { send("page_view"); setTimeout(() => send("performance", {loadMs:Math.min(Math.round(performance.now()),120000)}), 0); }
    });
  }
  window.addEventListener("DOMContentLoaded", banner, {once:true});
  window.addEventListener("hashchange", () => send("section_view"));
  window.addEventListener("error", (e) => send("js_error", {message:String(e.message || "script error").slice(0,180)}));
  window.addEventListener("unhandledrejection", (e) => send("js_error", {message:String(e.reason || "promise rejection").slice(0,180)}));
  window.kuruTelemetry = {
    revoke: async () => {
      const id = localStorage.getItem(ID_KEY);
      if (id) { try { await fetch(API + "/revoke", {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({wbuid:id}),credentials:"omit"}); } catch (_) {} }
      localStorage.removeItem(ID_KEY); localStorage.setItem(KEY,"rejected");
    },
    status: () => localStorage.getItem(KEY) || "unset"
  };
})();