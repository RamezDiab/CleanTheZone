const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const timerEl = document.getElementById("timer");
const startOverlay = document.getElementById("startOverlay");
const resultOverlay = document.getElementById("resultOverlay");
const rewardCard = document.getElementById("rewardCard");
const rewardPlaceholder = document.getElementById("rewardPlaceholder");
const finalScore = document.getElementById("finalScore");
const caughtStat = document.getElementById("caughtStat");
const resultKicker = document.getElementById("resultKicker");
const resultTitle = document.getElementById("resultTitle");

const mascot = new Image();
mascot.src = "assets/character.png";

const items = [
  {name:"Keyboard", src:"assets/keyboard.svg", points:1, w:92, h:45},
  {name:"Mouse", src:"assets/mouse.svg", points:1, w:44, h:59},
  {name:"Headset", src:"assets/headset.svg", points:1, w:67, h:56},
  {name:"Controller", src:"assets/controller.svg", points:1, w:78, h:49},
  {name:"Mousepad", src:"assets/mousepad.svg", points:1, w:82, h:48}
];
const hazards = [
  {name:"Hazard", src:null, points:-2, w:42, h:42}
];
items.forEach(i => { i.img = new Image(); i.img.src=i.src; });

const CFG=window.ALTZONE_CONFIG||{shopUrl:"#",couponCode:"ALT15",discountText:"15% OFF",winScore:15,gameDuration:30};
let W=900,H=600,dpr=1;
let player={x:0,y:0,w:120,h:150};
let falling=[],score=0,timeLeft=30,running=false,last=0,spawn=0,keys={},pointerX=null;
let particles=[];

function resize(){
  const r=canvas.getBoundingClientRect(); dpr=Math.min(devicePixelRatio||1,2);
  W=Math.max(320,r.width); H=Math.max(420,r.height);
  canvas.width=Math.floor(W*dpr); canvas.height=Math.floor(H*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  player.w=Math.min(125,W*.22); player.h=player.w*1.25;
  player.y=H-player.h-18;
  player.x=Math.max(8,Math.min(W-player.w-8,player.x||W/2-player.w/2));
}
window.addEventListener("resize",resize); resize();

function applyConfig(){
  document.querySelectorAll('a[href="#"]').forEach(a=>{ if(a.id==="shopTop"||a.id==="shopBottom") a.href=CFG.shopUrl; });
  document.getElementById("couponCode").textContent=CFG.couponCode;
  document.querySelector("#couponCode").nextElementSibling.textContent=CFG.discountText;
}
applyConfig();

function reset(){
  score=0; timeLeft=CFG.gameDuration; falling=[]; particles=[]; spawn=0; pointerX=null;
  player.x=W/2-player.w/2; player.y=H-player.h-18;
  scoreEl.textContent=score; timerEl.textContent=timeLeft;
  resultOverlay.classList.add("hidden");
  startOverlay.classList.remove("hidden");
  rewardCard.classList.add("hidden"); rewardPlaceholder.classList.remove("hidden");
}

function start(){
  startOverlay.classList.add("hidden"); resultOverlay.classList.add("hidden");
  rewardCard.classList.add("hidden"); rewardPlaceholder.classList.remove("hidden");
  score=0; timeLeft=CFG.gameDuration; falling=[]; particles=[]; spawn=0; running=true; last=performance.now();
  scoreEl.textContent=score; timerEl.textContent=timeLeft;
  requestAnimationFrame(loop);
}
document.getElementById("startBtn").onclick=start;
document.getElementById("heroPlay").onclick=()=>document.getElementById("game").scrollIntoView({behavior:"smooth"});
document.getElementById("retryBtn").onclick=start;
document.getElementById("rewardBtn").onclick=()=>showReward(score>=CFG.winScore);
document.getElementById("copyBtn").onclick=async()=>{
  const code=document.getElementById("couponCode").textContent;
  try{await navigator.clipboard.writeText(code);document.getElementById("copyBtn").textContent="✓ COPIED";setTimeout(()=>document.getElementById("copyBtn").textContent="▣ COPY CODE",1500)}catch(e){}
};

function spawnItem(){
  const pool = Math.random()<.14 ? hazards : items;
  const base=pool[Math.floor(Math.random()*pool.length)];
  falling.push({...base,x:Math.random()*(W-base.w-10)+5,y:-base.h-10,speed:120+Math.random()*115+score*2,rot:(Math.random()-.5)*.03});
}
function overlap(a,b){return a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y}

function drawBackground(){
  ctx.fillStyle="#061226";ctx.fillRect(0,0,W,H);
  for(let x=0;x<W;x+=55){ctx.strokeStyle="rgba(36,200,255,.07)";ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke()}
  for(let y=0;y<H;y+=55){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke()}
  const grad=ctx.createRadialGradient(W/2,H*.65,20,W/2,H*.65,H*.75);
  grad.addColorStop(0,"rgba(0,130,255,.12)");grad.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=grad;ctx.fillRect(0,0,W,H);
  ctx.fillStyle="rgba(36,200,255,.12)";ctx.fillRect(0,H-5,W,5);
}

function drawHazard(o){
  ctx.save();ctx.translate(o.x+o.w/2,o.y+o.h/2);
  ctx.rotate(performance.now()/500);
  ctx.strokeStyle="#ff3d57";ctx.lineWidth=4;ctx.fillStyle="rgba(255,61,87,.12)";
  ctx.beginPath();ctx.arc(0,0,17,0,Math.PI*2);ctx.fill();ctx.stroke();
  ctx.beginPath();ctx.moveTo(-10,-10);ctx.lineTo(10,10);ctx.moveTo(10,-10);ctx.lineTo(-10,10);ctx.stroke();
  ctx.restore();
}

function draw(){
  drawBackground();
  // falling objects
  falling.forEach(o=>{
    if(o.img && o.img.complete){
      ctx.save();ctx.translate(o.x+o.w/2,o.y+o.h/2);ctx.rotate(o.rot);
      ctx.shadowColor="rgba(36,200,255,.35)";ctx.shadowBlur=14;
      ctx.drawImage(o.img,-o.w/2,-o.h/2,o.w,o.h);ctx.restore();
    } else drawHazard(o);
  });
  // mascot
  if(mascot.complete){
    ctx.save();ctx.shadowColor="rgba(0,175,255,.4)";ctx.shadowBlur=24;
    ctx.drawImage(mascot,player.x,player.y,player.w,player.h);ctx.restore();
  }
  particles.forEach(p=>{ctx.fillStyle=p.color;ctx.globalAlpha=p.life;ctx.fillRect(p.x,p.y,p.s,p.s);ctx.globalAlpha=1});
}

function burst(x,y,good){
  for(let i=0;i<12;i++) particles.push({x,y,s:2+Math.random()*4,vx:(Math.random()-.5)*100,vy:(Math.random()-.7)*100,life:1,color:good?"#24c8ff":"#ff3d57"});
}
function update(dt){
  // keyboard
  const speed=420;
  if(keys.ArrowLeft||keys.a) player.x-=speed*dt;
  if(keys.ArrowRight||keys.d) player.x+=speed*dt;
  if(pointerX!==null) player.x += (pointerX-player.x-player.w/2)*Math.min(1,dt*10);
  player.x=Math.max(0,Math.min(W-player.w,player.x));
  spawn-=dt;if(spawn<=0){spawnItem();spawn=.55-Math.min(.22,score*.006)}
  falling.forEach(o=>o.y+=o.speed*dt);
  for(let i=falling.length-1;i>=0;i--){
    const o=falling[i];
    if(overlap({x:player.x+player.w*.16,y:player.y+player.h*.25,w:player.w*.68,h:player.h*.7},o)){
      score=Math.max(0,score+o.points);scoreEl.textContent=score;burst(o.x+o.w/2,o.y+o.h/2,o.points>0);falling.splice(i,1);continue;
    }
    if(o.y>H+60) falling.splice(i,1);
  }
  particles.forEach(p=>{p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt*2});
  particles=particles.filter(p=>p.life>0);
  timeLeft=Math.max(0,timeLeft-dt);timerEl.textContent=Math.ceil(timeLeft);
  if(timeLeft<=0) endGame();
}
function loop(now){
  if(!running)return;
  const dt=Math.min(.033,(now-last)/1000);last=now;update(dt);draw();
  if(running)requestAnimationFrame(loop);
}
function endGame(){
  running=false;
  finalScore.textContent=score;caughtStat.textContent=score;
  const won=score>=CFG.winScore;
  resultKicker.textContent=won?"YOU DID IT!":"GAME OVER";
  resultTitle.textContent=won?"YOU CLEANED THE ZONE!":"TRY AGAIN";
  document.getElementById("rewardBtn").style.display=won?"inline-flex":"none";
  resultOverlay.classList.remove("hidden");
}
function showReward(won){
  resultOverlay.classList.add("hidden");
  rewardPlaceholder.classList.add("hidden");rewardCard.classList.remove("hidden");
  rewardCard.scrollIntoView({behavior:"smooth",block:"center"});
}

// Keyboard
window.addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","a","d"].includes(e.key))e.preventDefault();keys[e.key]=true});
window.addEventListener("keyup",e=>keys[e.key]=false);

// Touch / pointer: drag anywhere inside game
canvas.addEventListener("pointerdown",e=>{pointerX=e.offsetX});
canvas.addEventListener("pointermove",e=>{if(e.buttons)pointerX=e.offsetX});
canvas.addEventListener("pointerup",()=>pointerX=null);
canvas.addEventListener("pointercancel",()=>pointerX=null);

function hold(btn,key){
  const down=e=>{e.preventDefault();keys[key]=true},up=e=>{e.preventDefault();keys[key]=false};
  btn.addEventListener("pointerdown",down);btn.addEventListener("pointerup",up);btn.addEventListener("pointerleave",up);btn.addEventListener("pointercancel",up);
}
hold(document.getElementById("leftBtn"),"ArrowLeft");hold(document.getElementById("rightBtn"),"ArrowRight");

// Keep the canvas visible even before start.
draw();
