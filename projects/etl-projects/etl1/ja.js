'use strict';

/* ===========================
   CURSOR
=========================== */
const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');
let mouseX = 0, mouseY = 0, followerX = 0, followerY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX; mouseY = e.clientY;
  cursor.style.opacity = '1';
  cursorFollower.style.opacity = '0.55';
  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

(function animateCursor() {
  followerX += (mouseX - followerX) * 0.11;
  followerY += (mouseY - followerY) * 0.11;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  requestAnimationFrame(animateCursor);
})();

document.querySelectorAll('a, button, .kpi-box, .flow-step, .stack-card, .learning-card').forEach(el => {
  el.addEventListener('mouseenter', () => { cursor.style.width = cursor.style.height = '12px'; cursorFollower.style.width = cursorFollower.style.height = '52px'; });
  el.addEventListener('mouseleave', () => { cursor.style.width = cursor.style.height = '6px';  cursorFollower.style.width = cursorFollower.style.height = '32px'; });
});

window.addEventListener('touchstart', () => {
  cursor.style.display = cursorFollower.style.display = 'none';
}, { once: true });

/* ===========================
   BACKGROUND CANVAS (aurora + particles)
=========================== */
const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');
let particles = [], auroraWaves = [], auroraT = 0;
let cmx = 0, cmy = 0;

function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); particles = []; auroraWaves = []; initAll(); });
document.addEventListener('mousemove', e => { cmx = e.clientX; cmy = e.clientY; });

class AuroraWave {
  constructor(i) {
    this.amp = Math.random()*50+30; this.freq = Math.random()*.002+.0008;
    this.speed = Math.random()*.004+.001; this.phase = Math.random()*Math.PI*2;
    this.yBase = canvas.height/(6+1)*(i+1);
    this.hue = [210,225,258,160,195,240][i%6];
    this.alpha = Math.random()*.04+.015; this.thick = Math.random()*80+50;
    this.mi = Math.random()*25+8;
  }
  draw(t) {
    const W=canvas.width, H=canvas.height, mx=(cmx/W-.5)*this.mi;
    ctx.beginPath();
    for(let x=0;x<=W;x+=3){
      const y=this.yBase+Math.sin(x*this.freq+t*this.speed+this.phase)*this.amp+Math.sin(x*this.freq*2.1-t*this.speed*1.3)*(this.amp*.4)+mx;
      x===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
    }
    ctx.lineTo(W,H);ctx.lineTo(0,H);ctx.closePath();
    const g=ctx.createLinearGradient(0,this.yBase-this.amp,0,this.yBase+this.thick);
    g.addColorStop(0,`hsla(${this.hue},100%,62%,${this.alpha})`);
    g.addColorStop(.5,`hsla(${this.hue},90%,55%,${this.alpha*.5})`);
    g.addColorStop(1,'transparent');
    ctx.fillStyle=g; ctx.fill();
  }
}

class Particle {
  constructor() { this.reset(true); }
  reset(init=false) {
    this.x=Math.random()*canvas.width;
    this.y=init?Math.random()*canvas.height:(Math.random()>.5?-5:canvas.height+5);
    this.vx=(Math.random()-.5)*.2; this.vy=(Math.random()-.5)*.2;
    this.size=Math.random()*1.1+.3; this.alpha=Math.random()*.35+.08;
    this.pulse=Math.random()*Math.PI*2; this.ps=Math.random()*.01+.005;
  }
  update() {
    this.x+=this.vx; this.y+=this.vy; this.pulse+=this.ps;
    const dx=this.x-cmx,dy=this.y-cmy,d=Math.sqrt(dx*dx+dy*dy);
    if(d<80){const f=(80-d)/80*.28;this.x+=dx/d*f;this.y+=dy/d*f;}
    if(this.x<-10||this.x>canvas.width+10||this.y<-10||this.y>canvas.height+10)this.reset();
  }
  draw() {
    const a=this.alpha*(.75+.25*Math.sin(this.pulse));
    ctx.beginPath();ctx.arc(this.x,this.y,this.size,0,Math.PI*2);
    ctx.fillStyle=`hsla(210,100%,65%,${a})`;ctx.fill();
  }
}

function drawConnections() {
  const len=particles.length, MAX=95;
  for(let i=0;i<len;i++) for(let j=i+1;j<len;j++){
    const dx=particles[i].x-particles[j].x, dy=particles[i].y-particles[j].y, d=Math.sqrt(dx*dx+dy*dy);
    if(d<MAX){ctx.beginPath();ctx.moveTo(particles[i].x,particles[i].y);ctx.lineTo(particles[j].x,particles[j].y);ctx.strokeStyle=`hsla(210,100%,65%,${(1-d/MAX)*.08})`;ctx.lineWidth=.5;ctx.stroke();}
  }
}

function initAll() {
  for(let i=0;i<6;i++) auroraWaves.push(new AuroraWave(i));
  const c=Math.min(80,Math.floor(canvas.width*canvas.height/14000));
  for(let i=0;i<c;i++) particles.push(new Particle());
}
initAll();

(function animateCanvas() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  auroraT++;
  auroraWaves.forEach(w=>w.draw(auroraT));
  particles.forEach(p=>{p.update();p.draw();});
  drawConnections();
  requestAnimationFrame(animateCanvas);
})();

/* ===========================
   PROGRESS BAR
=========================== */
const progressBar = document.getElementById('progressBar');
window.addEventListener('scroll', () => {
  const pct = window.scrollY / (document.body.scrollHeight - window.innerHeight) * 100;
  progressBar.style.width = Math.min(pct, 100) + '%';
}, { passive: true });

/* ===========================
   SCROLL REVEAL
=========================== */
const revealEls = document.querySelectorAll('.reveal-up');
const observer  = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(e.isIntersecting){ e.target.classList.add('visible'); observer.unobserve(e.target); }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
revealEls.forEach(el => observer.observe(el));

/* ===========================
   COUNTER ANIMATION
=========================== */
const easeOut = t => 1 - Math.pow(1-t, 3);
const cntObs  = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if(!e.isIntersecting) return;
    const el = e.target, end = parseInt(el.dataset.count, 10), dur = 1600, start = performance.now();
    const tick = now => {
      const prog = Math.min((now-start)/dur, 1);
      el.textContent = Math.round(end * easeOut(prog)).toLocaleString();
      if(prog < 1) requestAnimationFrame(tick); else el.textContent = end.toLocaleString();
    };
    requestAnimationFrame(tick);
    cntObs.unobserve(el);
  });
}, { threshold: 0.5 });
document.querySelectorAll('.kpi-num[data-count]').forEach(el => cntObs.observe(el));

/* ===========================
   CODE TABS
=========================== */
const tabBtns   = document.querySelectorAll('.tab-btn');
const tabPanels = document.querySelectorAll('.code-panel');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    tabBtns.forEach(b => b.classList.remove('active'));
    tabPanels.forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

/* ===========================
   COPY BUTTON
=========================== */
document.querySelectorAll('.copy-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const pre  = document.getElementById(btn.dataset.target);
    const text = pre ? pre.innerText : '';
    navigator.clipboard.writeText(text).then(() => {
      const orig = btn.innerHTML;
      btn.classList.add('copied');
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 2000);
    });
  });
});