(() => {
"use strict";
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const logs=[];
function log(level,msg){logs.push({time:new Date().toLocaleTimeString(),level,msg});if(logs.length>200)logs.shift();const list=$("#log-list");if(list){list.replaceChildren();const f=$("#filter")?.value||"all";logs.filter(x=>f==="all"||x.level===f).forEach(x=>{const p=document.createElement("p");p.className=x.level.toLowerCase();p.textContent="["+x.time+"] ["+x.level+"] "+x.msg;list.append(p);});}if(level==="ERROR")console.error(msg);}
window.addEventListener("error",e=>log("ERROR",e.message));window.addEventListener("unhandledrejection",e=>log("ERROR",String(e.reason)));
const translations={
en:{navContact:"Contact ↗",heroEyebrow:"DEVELOPMENT · TRANSLATION · MEDIA",heroHello:"Hi, I'm",heroLead:"Development, translations and personal projects. A little overview of what I do.",profileRole:"Development · translation · media",botgdxDesc:"A launcher and toolkit for a game library.",openSource:"Source code ↗",videoDesc:"A video project and a personal media space.",openProject:"View project ↗",translationTitle:"Translations",translationDesc:"Song translations and subtitles focused on meaning and rhythm.",telegramChannel:"Telegram channel ↗",aboutEyebrow:"ABOUT",aboutTitle:"Curious about<br><span class='grad'>how things work.</span>",aboutText:"I enjoy exploring technology, building personal projects, and working with language and music.",interestsEyebrow:"INTERESTS",interestsTitle:"Things I <span class='grad'>like</span>",searchPlaceholder:"Search interests…",fandomsTitle:"Fandoms & stories",musicTitle:"Music & artists",contactEyebrow:"CONTACT",contactTitle:"Have a question or an idea?<br><span class='grad'>Get in touch.</span>",contactButton:"Message me on Telegram ↗",empty:"No matches found.",projects:"Projects",aboutLink:"About",interestsLink:"Interests"}
};
let language="en";
function setLanguage(lang){language=lang;document.documentElement.lang=lang;$$("[data-i18n]").forEach(el=>{const key=el.dataset.i18n;if(translations[lang][key])el.innerHTML=translations[lang][key];});$$("[data-i18n-placeholder]").forEach(el=>{el.placeholder=translations[lang][el.dataset.i18nPlaceholder]||"";});const toggle=$("#language-toggle");if(toggle){toggle.textContent=lang==="ru"?"EN":"RU";toggle.setAttribute("aria-label",lang==="ru"?"Switch to English":"Переключить на русский");}const empty=$("#empty");if(empty)empty.textContent=translations[lang].empty;try{localStorage.setItem("kuru-language",lang);}catch{}}
setLanguage("en");
const menu=$("#menu-toggle"),nav=$("#nav");
function closeMenu(){nav?.classList.remove("open");menu?.setAttribute("aria-expanded","false");menu?.setAttribute("aria-label","Open menu");}
menu?.addEventListener("click",()=>{const open=nav?.classList.toggle("open");menu.setAttribute("aria-expanded",String(!!open));menu.setAttribute("aria-label",open?"Close menu":"Open menu");});
$$('#nav a').forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("click",e=>{if(nav?.classList.contains("open")&&!nav.contains(e.target)&&!menu?.contains(e.target))closeMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav?.classList.contains("open")){closeMenu();menu?.focus();}});
window.addEventListener("resize",()=>{if(innerWidth>620)closeMenu();},{passive:true});
const slides=$$(".carousel-slide"),dots=$$("#card-dots button");let current=0;
function showSlide(index){if(!slides.length)return;current=(index+slides.length)%slides.length;slides.forEach((s,i)=>{s.classList.toggle("is-active",i===current);s.setAttribute("aria-hidden",String(i!==current));});dots.forEach((d,i)=>{d.classList.toggle("is-active",i===current);d.setAttribute("aria-pressed",String(i===current));});}
$("#card-prev")?.addEventListener("click",()=>showSlide(current-1));$("#card-next")?.addEventListener("click",()=>showSlide(current+1));dots.forEach((d,i)=>d.addEventListener("click",()=>showSlide(i)));showSlide(0);
const input=$("#interest-search"),tags=$$(".tag"),empty=$("#empty");
input?.addEventListener("input",()=>{const q=input.value.trim().toLocaleLowerCase();let count=0;tags.forEach(t=>{const show=(t.dataset.key||t.textContent).toLocaleLowerCase().includes(q);t.hidden=!show;if(show)count++;});if(empty)empty.hidden=count>0;});
$("#open-logs")?.addEventListener("click",()=>$("#logs")?.showModal());$("#close-logs")?.addEventListener("click",()=>$("#logs")?.close());$("#filter")?.addEventListener("change",()=>log("INFO","Log filter changed"));$("#clear-logs")?.addEventListener("click",()=>{logs.length=0;$("#log-list")?.replaceChildren();});
const reveal=$$(".hero-text,.hero-art,.stats,.section,.contact,.footer");if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}}),{threshold:.08});reveal.forEach(el=>{el.classList.add("js-reveal");observer.observe(el);});}else reveal.forEach(el=>el.classList.add("is-visible"));
log("INFO","Portfolio initialized");
})();