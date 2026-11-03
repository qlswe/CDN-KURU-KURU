(() => {
"use strict";
const $=s=>document.querySelector(s), $$=s=>[...document.querySelectorAll(s)];
const logs=[];function log(level,msg){logs.push({time:new Date().toLocaleTimeString(),level,msg});if(logs.length>250)logs.shift();renderLogs();if(level==="ERROR")console.error(msg);else if(level==="WARN")console.warn(msg);}
function renderLogs(){const list=$("#log-list"),f=$("#filter")?.value||"all";if(!list)return;list.replaceChildren();logs.filter(x=>f==="all"||x.level===f).forEach(x=>{const p=document.createElement("p");p.className=x.level.toLowerCase();p.textContent=`[${x.time}] [${x.level}] ${x.msg}`;list.append(p);});}
window.addEventListener("error",e=>log("ERROR",e.message));window.addEventListener("unhandledrejection",e=>log("ERROR",String(e.reason)));
$("#menu-toggle")?.addEventListener("click",()=>{const n=$("#nav");n.classList.toggle("open");$("#menu-toggle").setAttribute("aria-expanded",n.classList.contains("open"));});
$$('#nav a').forEach(a=>a.addEventListener("click",()=>$("#nav").classList.remove("open")));
const input=$("#interest-search"),tags=$$(".tag");input?.addEventListener("input",()=>{const q=input.value.trim().toLowerCase();let count=0;tags.forEach(t=>{const show=t.dataset.key.includes(q);t.hidden=!show;if(show)count++;});$("#empty").hidden=count>0;log("INFO",`Interest filter: ${q||"all"}`);});
const tracks=[{name:"Cyber Dreams",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"},{name:"Neon District",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"},{name:"Synthetic Soul",url:"https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"}];let index=0;const audio=$("#audio"),player=$("#player");
function setTrack(){audio.src=tracks[index].url;$("#track").textContent=tracks[index].name;$("#player-status").textContent="PLAYER · READY";}
function setPlaying(on){$("#play").innerHTML=on?'<i class="fa-solid fa-pause"></i>':'<i class="fa-solid fa-play"></i>';$("#player-status").textContent=on?"PLAYER · PLAYING":"PLAYER · PAUSED";}
$("#play").addEventListener("click",async()=>{if(!audio.src)setTrack();if(audio.paused){try{await audio.play();setPlaying(true);log("INFO","Playback started");}catch(e){log("WARN","Playback was blocked or unavailable");}}else{audio.pause();setPlaying(false);}});
$("#next").addEventListener("click",async()=>{index=(index+1)%tracks.length;setTrack();try{await audio.play();setPlaying(true);}catch{setPlaying(false);}log("INFO","Track changed");});
audio.addEventListener("ended",()=>{$("#next").click();});$("#hide-player").addEventListener("click",()=>{player.hidden=true;$("#show-player").hidden=false;});$("#show-player").addEventListener("click",()=>{player.hidden=false;$("#show-player").hidden=true;});
$("#open-logs").addEventListener("click",()=>$("#logs").showModal());$("#close-logs").addEventListener("click",()=>$("#logs").close());$("#filter").addEventListener("change",renderLogs);$("#clear-logs").addEventListener("click",()=>{logs.length=0;renderLogs();});
const top=$("#top");window.addEventListener("scroll",()=>top.classList.toggle("visible",scrollY>450),{passive:true});top.addEventListener("click",()=>scrollTo({top:0,behavior:"smooth"}));
log("INFO","Portfolio initialized");})();