(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const logs=[];
function renderLogs(){const list=$("#log-list"),f=$("#filter")?.value||"all";if(!list)return;list.replaceChildren();logs.filter(x=>f==="all"||x.level===f).forEach(x=>{const p=document.createElement("p");p.className=x.level.toLowerCase();p.textContent="["+x.time+"] ["+x.level+"] "+x.msg;list.append(p);});}
function log(level,msg){logs.push({time:new Date().toLocaleTimeString(),level,msg});if(logs.length>250)logs.shift();renderLogs();if(level==="ERROR")console.error(msg);else if(level==="WARN")console.warn(msg);}
window.addEventListener("error",e=>log("ERROR",e.message));window.addEventListener("unhandledrejection",e=>log("ERROR",String(e.reason)));
const menu=$("#menu-toggle"),nav=$("#nav");
function closeMenu(){nav?.classList.remove("open");menu?.setAttribute("aria-expanded","false");menu?.setAttribute("aria-label","Открыть меню");}
function toggleMenu(){if(!nav||!menu)return;const open=nav.classList.toggle("open");menu.setAttribute("aria-expanded",String(open));menu.setAttribute("aria-label",open?"Закрыть меню":"Открыть меню");}
menu?.addEventListener("click",toggleMenu);
$$('#nav a').forEach(a=>a.addEventListener("click",closeMenu));
document.addEventListener("click",e=>{if(nav?.classList.contains("open")&&!nav.contains(e.target)&&!menu?.contains(e.target))closeMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&nav?.classList.contains("open")){closeMenu();menu?.focus();}});
window.addEventListener("resize",()=>{if(window.innerWidth>620)closeMenu();},{passive:true});
const input=$("#interest-search"),tags=$$(".tag"),empty=$("#empty");
input?.addEventListener("input",()=>{const q=input.value.trim().toLocaleLowerCase();let count=0;tags.forEach(t=>{const show=(t.dataset.key||t.textContent).toLocaleLowerCase().includes(q);t.hidden=!show;if(show)count++;});if(empty)empty.hidden=count>0;});
$("#open-logs")?.addEventListener("click",()=>$("#logs")?.showModal());$("#close-logs")?.addEventListener("click",()=>$("#logs")?.close());$("#filter")?.addEventListener("change",renderLogs);$("#clear-logs")?.addEventListener("click",()=>{logs.length=0;renderLogs();});
const projectList=$("#project-list"),editButton=$("#edit-projects"),resetButton=$("#reset-projects"),editStatus=$("#edit-status");
const storageKey="kuruPortfolioProjectsV1";
function getProjectData(){return $$(".project").map(card=>({label:card.querySelector("label")?.textContent||"",title:card.querySelector("h3")?.textContent||"",description:card.querySelector("p")?.textContent||"",linkText:card.querySelector("a")?.textContent||"",href:card.querySelector("a")?.getAttribute("href")||""}));}
function applyProjectData(data){$$(".project").forEach((card,i)=>{const d=data[i];if(!d)return;const set=(selector,value)=>{const el=card.querySelector(selector);if(el)el.textContent=value;};set("label",d.label);set("h3",d.title);set("p",d.description);const a=card.querySelector("a");if(a){a.textContent=d.linkText;a.setAttribute("href",d.href);}});}
let originalProjects=getProjectData();
try{const saved=localStorage.getItem(storageKey);if(saved){const parsed=JSON.parse(saved);if(Array.isArray(parsed)&&parsed.length===originalProjects.length)applyProjectData(parsed);}}catch(error){log("WARN","Не удалось загрузить сохранённые карточки");}
originalProjects=getProjectData();
function setEditing(enabled){if(!projectList||!editButton)return;projectList.classList.toggle("editing",enabled);$$(".project").forEach(card=>{["label","h3","p","a"].forEach(selector=>{const el=card.querySelector(selector);if(!el)return;el.contentEditable=enabled?"true":"false";el.spellcheck=enabled;});const a=card.querySelector("a");if(a){a.classList.toggle("edit-link",enabled);a.title=enabled?"Нажми, чтобы изменить адрес ссылки":"";}});editButton.textContent=enabled?"Сохранить карточки":"Изменить карточки";if(resetButton)resetButton.hidden=!enabled;if(editStatus)editStatus.textContent=enabled?"Режим редактирования: нажми на текст или ссылку":"Карточки проектов";}
let editing=false;
editButton?.addEventListener("click",()=>{if(!editing){editing=true;setEditing(true);editStatus?.scrollIntoView({behavior:"smooth",block:"nearest"});return;}const data=getProjectData();try{localStorage.setItem(storageKey,JSON.stringify(data));originalProjects=data;log("INFO","Карточки проектов сохранены в этом браузере");}catch(error){log("ERROR","Не удалось сохранить карточки в браузере");}editing=false;setEditing(false);});
projectList?.addEventListener("click",e=>{const a=e.target.closest("a");if(!editing||!a)return;e.preventDefault();const next=prompt("Новая ссылка для карточки:",a.getAttribute("href")||"");if(next!==null){const value=next.trim();if(value&&/^(https?:|mailto:|#)/i.test(value))a.setAttribute("href",value);else if(value)alert("Используй ссылку https://, mailto: или якорь #");}});
resetButton?.addEventListener("click",()=>{if(!confirm("Вернуть исходные тексты и ссылки карточек?"))return;applyProjectData(originalProjects);try{localStorage.removeItem(storageKey);}catch{}editing=false;setEditing(false);log("INFO","Карточки возвращены к исходным значениям");});
const top=$("#top");let scrollTick=false;
window.addEventListener("scroll",()=>{if(scrollTick)return;scrollTick=true;requestAnimationFrame(()=>{top?.classList.toggle("visible",window.scrollY>450);scrollTick=false;});},{passive:true});
top?.addEventListener("click",()=>window.scrollTo({top:0,behavior:matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth"}));
const reveal=$$(".hero-text,.hero-art,.stats,.section,.contact,.footer");reveal.forEach(el=>el.classList.add("js-reveal"));
if("IntersectionObserver"in window){const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add("is-visible");observer.unobserve(entry.target);}});},{threshold:.06,rootMargin:"0px 0px -24px 0px"});reveal.forEach(el=>observer.observe(el));}else reveal.forEach(el=>el.classList.add("is-visible"));
log("INFO","Portfolio initialized");
})();