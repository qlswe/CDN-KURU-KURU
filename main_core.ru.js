(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const logs=[];
function renderLogs(){const list=$("#log-list"),f=$("#filter")?.value||"all";if(!list)return;list.replaceChildren();logs.filter(x=>f==="all"||x.level===f).forEach(x=>{const p=document.createElement("p");p.className=x.level.toLowerCase();p.textContent="["+x.time+"] ["+x.level+"] "+x.msg;list.append(p);});}
function log(level,msg){logs.push({time:new Date().toLocaleTimeString(),level,msg});if(logs.length>250)logs.shift();renderLogs();if(level==="ERROR")console.error(msg);else if(level==="WARN")console.warn(msg);}
window.addEventListener("error",e=>log("ERROR",e.message));window.addEventListener("unhandledrejection",e=>log("ERROR",String(e.reason)));
const menu=$("#menu-toggle"),nav=$("#nav");
function closeMenu(){nav?.classList.remove("open");menu?.setAttribute("aria-expanded","false");}
menu?.addEventListener("click",()=>{const open=nav?.classList.toggle("open")||false;menu.setAttribute("aria-expanded",String(open));});
$$('#nav a').forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("click",e=>{if(nav?.classList.contains("open")&&!nav.contains(e.target)&&!menu?.contains(e.target))closeMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape")closeMenu();});
const input=$("#interest-search"),tags=$$(".tag");
input?.addEventListener("input",()=>{const q=input.value.trim().toLocaleLowerCase();let count=0;tags.forEach(t=>{const show=(t.dataset.key||t.textContent).toLocaleLowerCase().includes(q);t.hidden=!show;if(show)count++;});$("#empty").hidden=count>0;});
$("#open-logs")?.addEventListener("click",()=>$("#logs")?.showModal());$("#close-logs")?.addEventListener("click",()=>$("#logs")?.close());$("#filter")?.addEventListener("change",renderLogs);$("#clear-logs")?.addEventListener("click",()=>{logs.length=0;renderLogs();});
const top=$("#top");let scrollTick=false;
window.addEventListener("scroll",()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{top?.classList.toggle("visible",window.scrollY>450);scrollTick=false;});},{passive:true});
top?.addEventListener("click",()=>window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
const reveal=$$(".hero-text,.hero-art,.stats,.section,.contact,.footer");reveal.forEach(el=>el.classList.add("js-reveal"));
if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});},{threshold:.08,rootMargin:"0px 0px -35px 0px"});reveal.forEach(el=>observer.observe(el));}else reveal.forEach(el=>el.classList.add("is-visible"));
log("INFO","Portfolio initialized");
})();