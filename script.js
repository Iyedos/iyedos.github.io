'use strict';

/* ===========================
   LOADER — cinematic exit
=========================== */

const loader = document.getElementById('loader');

window.addEventListener('load', () => {
  setTimeout(() => {
    loader.classList.add('hidden');
    loader.addEventListener('animationend', () => {
      loader.style.display = 'none';
    }, { once: true });
  }, 1500);
});

/* ===========================
   CUSTOM CURSOR — magnetic & smooth
=========================== */

const cursor         = document.getElementById('cursor');
const cursorFollower = document.getElementById('cursor-follower');

let mouseX = 0, mouseY = 0;
let followerX = 0, followerY = 0;
let cursorVisible = false;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  if (!cursorVisible) {
    cursorVisible = true;
    cursor.style.opacity = '1';
    cursorFollower.style.opacity = '0.6';
  }

  cursor.style.left = mouseX + 'px';
  cursor.style.top  = mouseY + 'px';
});

/* Smooth follower with lerp */
let rafId;
(function animateCursor() {
  followerX += (mouseX - followerX) * 0.11;
  followerY += (mouseY - followerY) * 0.11;
  cursorFollower.style.left = followerX + 'px';
  cursorFollower.style.top  = followerY + 'px';
  rafId = requestAnimationFrame(animateCursor);
})();

/* Hover states */
const hoverEls = document.querySelectorAll('a, button, [data-tilt], .stag, .tech-pill, .kpi-card, .filter-btn');

hoverEls.forEach(el => {
  el.addEventListener('mouseenter', () => {
    cursor.classList.add('hover');
    cursorFollower.classList.add('hover');
  });
  el.addEventListener('mouseleave', () => {
    cursor.classList.remove('hover');
    cursorFollower.classList.remove('hover');
  });
});

/* Click pulse */
document.addEventListener('mousedown', () => {
  cursor.classList.add('click');
  cursorFollower.classList.add('click');
});
document.addEventListener('mouseup', () => {
  cursor.classList.remove('click');
  cursorFollower.classList.remove('click');
});

document.addEventListener('mouseleave', () => {
  cursor.style.opacity = '0';
  cursorFollower.style.opacity = '0';
  cursorVisible = false;
});
document.addEventListener('mouseenter', () => {
  cursor.style.opacity = '1';
  cursorFollower.style.opacity = '0.6';
  cursorVisible = true;
});

/* ===========================
   ANIMATED BACKGROUND CANVAS
   — Aurora waves + constellation + mouse parallax
=========================== */

const canvas = document.getElementById('bg-canvas');
const ctx    = canvas.getContext('2d');

let particles    = [];
let auroraWaves  = [];
let canvasMouseX = 0, canvasMouseY = 0;
let auroraT      = 0;

function resizeCanvas() {
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', () => {
  resizeCanvas();
  particles   = [];
  auroraWaves = [];
  initParticles();
  initAurora();
});

document.addEventListener('mousemove', (e) => {
  canvasMouseX = e.clientX;
  canvasMouseY = e.clientY;
});

/* ── Aurora Wave class ── */
const WAVE_COUNT = 6;

class AuroraWave {
  constructor(idx) {
    this.idx = idx;
    this.reset();
  }

  reset() {
    this.amp   = Math.random() * 55 + 35;
    this.freq  = Math.random() * 0.0022 + 0.0008;
    this.speed = Math.random() * 0.004 + 0.001;
    this.phase = Math.random() * Math.PI * 2;
    this.yBase = (canvas.height / (WAVE_COUNT + 1)) * (this.idx + 1);
    this.hue   = [210, 225, 258, 160, 195, 240][this.idx % 6];
    this.alpha = Math.random() * 0.045 + 0.018;
    this.thick = Math.random() * 90 + 50;
    this.mouseInfluence = Math.random() * 30 + 10;
  }

  draw(t) {
    const W  = canvas.width;
    const H  = canvas.height;
    const mx = (canvasMouseX / W - 0.5) * this.mouseInfluence;

    ctx.beginPath();
    for (let x = 0; x <= W; x += 3) {
      const y = this.yBase
        + Math.sin(x * this.freq + t * this.speed + this.phase) * this.amp
        + Math.sin(x * this.freq * 2.1 - t * this.speed * 1.3) * (this.amp * 0.4)
        + mx;
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();

    const grd = ctx.createLinearGradient(0, this.yBase - this.amp, 0, this.yBase + this.thick);
    grd.addColorStop(0,   `hsla(${this.hue},100%,62%,${this.alpha})`);
    grd.addColorStop(0.5, `hsla(${this.hue},90%,55%,${this.alpha * 0.5})`);
    grd.addColorStop(1,   'transparent');
    ctx.fillStyle = grd;
    ctx.fill();
  }
}

function initAurora() {
  for (let i = 0; i < WAVE_COUNT; i++) auroraWaves.push(new AuroraWave(i));
}
initAurora();

/* ── Particle class ── */
class Particle {
  constructor() { this.reset(true); }

  reset(initial = false) {
    this.x     = Math.random() * canvas.width;
    this.y     = initial ? Math.random() * canvas.height : (Math.random() > 0.5 ? -5 : canvas.height + 5);
    this.vx    = (Math.random() - 0.5) * 0.22;
    this.vy    = (Math.random() - 0.5) * 0.22;
    this.size  = Math.random() * 1.2 + 0.3;
    this.alpha = Math.random() * 0.4 + 0.08;
    this.pulse = Math.random() * Math.PI * 2;
    this.pulseSpeed = Math.random() * 0.01 + 0.005;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.pulse += this.pulseSpeed;

    /* Subtle mouse repulsion */
    const dx   = this.x - canvasMouseX;
    const dy   = this.y - canvasMouseY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist < 80) {
      const force = (80 - dist) / 80 * 0.3;
      this.x += dx / dist * force;
      this.y += dy / dist * force;
    }

    if (this.x < -10 || this.x > canvas.width + 10 ||
        this.y < -10 || this.y > canvas.height + 10) {
      this.reset();
    }
  }

  draw() {
    const a = this.alpha * (0.75 + 0.25 * Math.sin(this.pulse));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `hsla(210,100%,65%,${a})`;
    ctx.fill();
  }
}

function initParticles() {
  const count = Math.min(100, Math.floor(canvas.width * canvas.height / 12000));
  for (let i = 0; i < count; i++) particles.push(new Particle());
}
initParticles();

/* Optimised connection drawing */
function drawConnections() {
  const len      = particles.length;
  const MAX_DIST = 100;

  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const dx   = particles[i].x - particles[j].x;
      const dy   = particles[i].y - particles[j].y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < MAX_DIST) {
        const alpha = (1 - dist / MAX_DIST) * 0.09;
        ctx.beginPath();
        ctx.moveTo(particles[i].x, particles[i].y);
        ctx.lineTo(particles[j].x, particles[j].y);
        ctx.strokeStyle = `hsla(210,100%,65%,${alpha})`;
        ctx.lineWidth   = 0.6;
        ctx.stroke();
      }
    }
  }
}

/* Main render loop */
(function animateCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  auroraT++;

  /* Aurora waves (drawn first, behind everything) */
  auroraWaves.forEach(w => w.draw(auroraT));

  /* Constellation particles + connections */
  particles.forEach(p => { p.update(); p.draw(); });
  drawConnections();

  requestAnimationFrame(animateCanvas);
})();

/* ===========================
   UTILITY
=========================== */

const toggle = el => el?.classList.toggle('active');
const add    = el => el?.classList.add('active');
const remove = el => el?.classList.remove('active');

/* ===========================
   SIDEBAR
=========================== */

const sidebar    = document.querySelector('[data-sidebar]');
const sidebarBtn = document.querySelector('[data-sidebar-btn]');

if (sidebarBtn && sidebar) {
  sidebarBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggle(sidebar);
  });
}

document.addEventListener('click', (e) => {
  if (sidebar?.classList.contains('active') &&
      !sidebar.contains(e.target) &&
      !sidebarBtn?.contains(e.target)) {
    remove(sidebar);
  }
});

/* ===========================
   ESC KEY
=========================== */

const modalContainer = document.querySelector('[data-modal-container]');
const overlay        = document.querySelector('[data-overlay]');

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    remove(sidebar);
    remove(modalContainer);
    remove(overlay);
  }
});

/* ===========================
   MODAL — spring animation
=========================== */

const modalCloseBtn = document.querySelector('[data-modal-close-btn]');
const modalTitle    = document.querySelector('[data-modal-title]');
const modalText     = document.querySelector('[data-modal-text]');

const openModal = () => {
  add(modalContainer);
  add(overlay);
  document.body.style.overflow = 'hidden';
};

const closeModal = () => {
  remove(modalContainer);
  remove(overlay);
  document.body.style.overflow = '';
};

modalCloseBtn?.addEventListener('click', closeModal);
overlay?.addEventListener('click', closeModal);

/* ===========================
   FILTER SYSTEM
=========================== */

const select      = document.querySelector('[data-select]');
const selectItems = document.querySelectorAll('[data-select-item]');
const selectValue = document.querySelector('[data-selecct-value]');
const filterItems = document.querySelectorAll('[data-filter-item]');
const filterBtns  = document.querySelectorAll('[data-filter-btn]');

const filterFunc = (value) => {
  filterItems.forEach((item, i) => {
    const match = value === 'all' || item.dataset.category === value;
    if (match) {
      item.classList.add('active');
      item.style.animationDelay = `${i * 0.06}s`;
    } else {
      item.classList.remove('active');
    }
  });
};

select?.addEventListener('click', () => toggle(select));

selectItems.forEach(item => {
  item.addEventListener('click', () => {
    const value = item.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = item.innerText;
    remove(select);
    filterFunc(value);
  });
});

let lastFilterBtn = filterBtns[0];

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.innerText.toLowerCase();
    if (selectValue) selectValue.innerText = btn.innerText;
    filterFunc(value);
    remove(lastFilterBtn);
    add(btn);
    lastFilterBtn = btn;
    createRipple(btn, btn.getBoundingClientRect());
  });
});

/* ===========================
   FORM
=========================== */

const form       = document.querySelector('[data-form]');
const formInputs = document.querySelectorAll('[data-form-input]');
const formBtn    = document.querySelector('[data-form-btn]');

if (form && formBtn) {
  formInputs.forEach(input => {
    input.addEventListener('input', () => {
      formBtn.disabled = !form.checkValidity();
    });

    input.addEventListener('focus', () => {
      input.closest('.input-group')?.classList.add('focused');
    });
    input.addEventListener('blur', () => {
      input.closest('.input-group')?.classList.remove('focused');
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const status = document.querySelector('[data-form-status]');
    formBtn.disabled = true;
    formBtn.innerHTML = '<ion-icon name="hourglass-outline"></ion-icon><span>Sending…</span>';

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (res.ok) {
        status.textContent = '✓ Message sent! I\'ll get back to you soon.';
        status.style.color = '#22c55e';
        form.reset();
        formBtn.disabled = true;
      } else throw new Error();
    } catch {
      status.textContent = '✗ Something went wrong. Please try again.';
      status.style.color = 'hsl(0,60%,55%)';
      formBtn.disabled = false;
    }

    formBtn.innerHTML = '<ion-icon name="paper-plane"></ion-icon><span>Send Message</span><div class="btn-shine"></div>';
  });
}

/* ===========================
   ACTIVE NAVBAR ON SCROLL
=========================== */

const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar-link');

const updateNavLink = () => {
  let current = '';
  sections.forEach(section => {
    const top = section.offsetTop - window.innerHeight / 3;
    if (window.scrollY >= top && window.scrollY < top + section.offsetHeight) {
      current = section.getAttribute('id');
    }
  });
  navLinks.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
  });
};

window.addEventListener('scroll', updateNavLink, { passive: true });
updateNavLink();

/* ===========================
   SMOOTH SCROLL — NAVBAR LINKS
=========================== */

navLinks.forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) target.scrollIntoView({ behavior: 'smooth' });
  });
});

/* ===========================
   SCROLL REVEAL — IntersectionObserver
=========================== */

const revealEls = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right, .reveal-scale');

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

revealEls.forEach(el => revealObserver.observe(el));

/* ===========================
   COUNTER ANIMATION — eased counting
=========================== */

const counters = document.querySelectorAll('.kpi-num[data-count], .highlight-num[data-count]');

const easeOutCubic = t => 1 - Math.pow(1 - t, 3);

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el  = entry.target;
    const end = parseInt(el.dataset.count, 10);
    const dur = 1400;
    const start = performance.now();

    const tick = (now) => {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / dur, 1);
      const eased    = easeOutCubic(progress);
      el.textContent = Math.round(end * eased);
      if (progress < 1) requestAnimationFrame(tick);
      else el.textContent = end;
    };

    requestAnimationFrame(tick);
    countObserver.unobserve(el);
  });
}, { threshold: 0.5 });

counters.forEach(el => countObserver.observe(el));

/* ===========================
   SKILL CATEGORY STAGGER
=========================== */

const skillCats = document.querySelectorAll('.skill-cat');

const skillObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = [...skillCats].indexOf(entry.target);
      setTimeout(() => {
        entry.target.style.opacity    = '1';
        entry.target.style.transform  = 'none';
        entry.target.style.filter     = 'blur(0)';
      }, idx * 80);
      skillObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08 });

skillCats.forEach(cat => {
  cat.style.opacity   = '0';
  cat.style.transform = 'translateY(30px)';
  cat.style.filter    = 'blur(4px)';
  cat.style.transition = 'opacity 0.6s cubic-bezier(0.16,1,0.3,1), transform 0.6s cubic-bezier(0.16,1,0.3,1), filter 0.6s';
  skillObserver.observe(cat);
});

/* ===========================
   PROJECT STAGGER
=========================== */

const projectObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      document.querySelectorAll('.project-item.active').forEach((item, i) => {
        item.style.animationDelay = `${i * 0.08}s`;
      });
      projectObserver.disconnect();
    }
  });
}, { threshold: 0.05 });

const projectList = document.querySelector('.project-list');
if (projectList) projectObserver.observe(projectList);

/* ===========================
   3D TILT — TOOL CARDS
=========================== */

document.querySelectorAll('[data-tilt]').forEach(card => {
  let currentRotX = 0, currentRotY = 0;
  let targetRotX  = 0, targetRotY  = 0;
  let animFrame   = null;
  let isHovered   = false;

  const tiltLerp = 0.12;

  function animateTilt() {
    currentRotX += (targetRotX - currentRotX) * tiltLerp;
    currentRotY += (targetRotY - currentRotY) * tiltLerp;

    card.style.transform = `perspective(700px) rotateX(${currentRotX}deg) rotateY(${currentRotY}deg) scale(${isHovered ? 1.04 : 1})`;

    if (Math.abs(currentRotX - targetRotX) > 0.01 ||
        Math.abs(currentRotY - targetRotY) > 0.01 || isHovered) {
      animFrame = requestAnimationFrame(animateTilt);
    } else {
      cancelAnimationFrame(animFrame);
    }
  }

  card.addEventListener('mousemove', e => {
    isHovered = true;
    const rect = card.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    targetRotX = -((e.clientY - cy) / (rect.height / 2)) * 10;
    targetRotY =  ((e.clientX - cx) / (rect.width  / 2)) * 10;

    const glow = card.querySelector('.tool-card-glow');
    if (glow) {
      const mx = ((e.clientX - rect.left) / rect.width)  * 100;
      const my = ((e.clientY - rect.top)  / rect.height) * 100;
      glow.style.setProperty('--mx', `${mx}%`);
      glow.style.setProperty('--my', `${my}%`);
    }

    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(animateTilt);
  });

  card.addEventListener('mouseleave', () => {
    isHovered  = false;
    targetRotX = 0;
    targetRotY = 0;
    card.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s, border-color 0.3s';
    cancelAnimationFrame(animFrame);
    animFrame = requestAnimationFrame(animateTilt);
    setTimeout(() => { card.style.transition = ''; }, 600);
  });
});

/* ===========================
   3D TILT — KPI CARDS
=========================== */

document.querySelectorAll('.kpi-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const dx   = ((e.clientX - rect.left) / rect.width  - 0.5) * 24;
    const dy   = ((e.clientY - rect.top)  / rect.height - 0.5) * 24;
    card.style.transform  = `perspective(300px) rotateX(${-dy}deg) rotateY(${dx}deg) translateY(-4px) scale(1.05)`;
    card.style.transition = 'transform 0.05s linear';
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform  = '';
    card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.4s ease, border-color 0.25s, background 0.25s';
  });
});

/* ===========================
   SERVICE ITEM 3D TILT
=========================== */

document.querySelectorAll('.service-item').forEach(item => {
  item.addEventListener('mousemove', e => {
    const rect = item.getBoundingClientRect();
    const dy   = ((e.clientY - rect.top) / rect.height - 0.5) * 10;
    item.style.transform  = `translateX(6px) translateY(-3px) rotateX(${-dy}deg)`;
    item.style.transition = 'transform 0.07s linear, border-color 0.3s, box-shadow 0.3s';
  });

  item.addEventListener('mouseleave', () => {
    item.style.transform  = '';
    item.style.transition = 'transform 0.55s cubic-bezier(0.34,1.56,0.64,1), border-color 0.3s, box-shadow 0.5s';
  });
});

/* ===========================
   RIPPLE EFFECT
=========================== */

function createRipple(el, rect) {
  const r    = document.createElement('span');
  const size = Math.max(rect.width, rect.height) * 2;
  r.style.cssText = `
    position:absolute;
    width:${size}px;
    height:${size}px;
    border-radius:50%;
    background:rgba(255,255,255,0.18);
    transform:scale(0);
    animation:rippleAnim 0.55s ease-out forwards;
    left:50%;
    top:50%;
    margin-left:-${size/2}px;
    margin-top:-${size/2}px;
    pointer-events:none;
    z-index:0;
  `;
  el.style.position = 'relative';
  el.style.overflow = 'hidden';
  el.appendChild(r);
  setTimeout(() => r.remove(), 600);
}

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `@keyframes rippleAnim { to { transform: scale(1); opacity: 0; } }`;
document.head.appendChild(rippleStyle);

document.querySelectorAll('.stag').forEach(tag => {
  tag.addEventListener('click', function() {
    createRipple(this, this.getBoundingClientRect());
  });
});

document.querySelectorAll('.btn-primary, .btn-secondary, .form-btn').forEach(btn => {
  btn.addEventListener('click', function() {
    createRipple(this, this.getBoundingClientRect());
  });
});

/* ===========================
   TITLE LINE REVEAL — staggered blur
=========================== */

document.querySelectorAll('.title-line').forEach((line, i) => {
  line.style.opacity    = '0';
  line.style.transform  = 'translateY(28px)';
  line.style.filter     = 'blur(8px)';
  line.style.transition = `opacity 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.25 + 1.5}s, transform 0.8s cubic-bezier(0.16,1,0.3,1) ${i * 0.25 + 1.5}s, filter 0.8s ${i * 0.25 + 1.5}s`;

  setTimeout(() => {
    line.style.opacity   = '1';
    line.style.transform = 'none';
    line.style.filter    = 'blur(0)';
  }, i * 250 + 1500);
});

/* ===========================
   MAGNETIC BUTTONS
=========================== */

document.querySelectorAll('.btn-primary, .btn-secondary').forEach(btn => {
  btn.addEventListener('mousemove', e => {
    const rect = btn.getBoundingClientRect();
    const cx   = rect.left + rect.width  / 2;
    const cy   = rect.top  + rect.height / 2;
    const dx   = (e.clientX - cx) * 0.22;
    const dy   = (e.clientY - cy) * 0.22;
    btn.style.transform = `translateY(-4px) scale(1.03) translate(${dx}px, ${dy}px)`;
  });

  btn.addEventListener('mouseleave', () => {
    btn.style.transform = '';
  });
});

/* ===========================
   PARALLAX SECTIONS — subtle depth on scroll
=========================== */

const parallaxEls = document.querySelectorAll('.home-dashboard, .home-eyebrow');

const handleParallax = () => {
  const scrollY = window.scrollY;
  parallaxEls.forEach((el, i) => {
    const speed = (i + 1) * 0.04;
    el.style.transform = `translateY(${scrollY * speed}px)`;
  });
};

window.addEventListener('scroll', handleParallax, { passive: true });

/* ===========================
   SCROLL PROGRESS INDICATOR
=========================== */

const progressBar = document.createElement('div');
progressBar.style.cssText = `
  position: fixed;
  top: 0; left: 0;
  height: 2px;
  width: 0%;
  background: linear-gradient(90deg, hsl(210,100%,62%), hsl(258,78%,68%), hsl(160,84%,49%));
  background-size: 200% 100%;
  z-index: 10000;
  transition: width 0.1s linear;
  animation: gradientFlow 3s linear infinite;
`;

const progressStyle = document.createElement('style');
progressStyle.textContent = `@keyframes gradientFlow { 0% { background-position: 0 0; } 100% { background-position: 200% 0; } }`;
document.head.appendChild(progressStyle);
document.body.appendChild(progressBar);

window.addEventListener('scroll', () => {
  const scrolled  = window.scrollY;
  const maxScroll = document.body.scrollHeight - window.innerHeight;
  const pct       = Math.min((scrolled / maxScroll) * 100, 100);
  progressBar.style.width = pct + '%';
}, { passive: true });

/* ===========================
   TECH PILL HOVER STAGGER
=========================== */

const techStrip = document.querySelector('.tech-strip');
if (techStrip) {
  const pills = techStrip.querySelectorAll('.tech-pill');
  pills.forEach((pill, i) => { pill.style.transitionDelay = `${i * 0.03}s`; });

  techStrip.addEventListener('mouseleave', () => {
    pills.forEach(pill => { pill.style.transitionDelay = '0s'; });
  });
  techStrip.addEventListener('mouseenter', () => {
    pills.forEach((pill, i) => { pill.style.transitionDelay = `${i * 0.03}s`; });
  });
}

/* ===========================
   ACTIVITY CARD — entrance animation
=========================== */

const activityCards = document.querySelectorAll('.activity-card');
const acObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      entry.target.style.opacity   = '0';
      entry.target.style.transform = 'translateY(24px) scale(0.95)';
      entry.target.style.filter    = 'blur(4px)';
      entry.target.style.transition = `opacity 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, transform 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 0.1}s, filter 0.6s ${i * 0.1}s`;

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          entry.target.style.opacity   = '1';
          entry.target.style.transform = '';
          entry.target.style.filter    = 'blur(0)';
        });
      });

      acObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

activityCards.forEach((card, i) => {
  card.style.opacity   = '0';
  card.style.transform = 'translateY(24px) scale(0.95)';
  card.style.filter    = 'blur(4px)';
  acObserver.observe(card);
});

/* ===========================
   SECTION TRANSITION EFFECT
=========================== */

const sectionEls = document.querySelectorAll('.section');

const sectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
    } else {
      if (entry.intersectionRatio < 0.05) {
        entry.target.style.opacity = '0.92';
      }
    }
  });
}, { threshold: [0, 0.05, 0.1] });

sectionEls.forEach(s => sectionObserver.observe(s));

/* ===========================
   KEYBOARD NAV ENHANCEMENTS
=========================== */

document.addEventListener('keydown', e => {
  if (e.altKey && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
    e.preventDefault();
    const sArr    = Array.from(sectionEls);
    const current = sArr.findIndex(s => {
      const rect = s.getBoundingClientRect();
      return rect.top >= -10 && rect.top <= window.innerHeight / 2;
    });
    const next = e.key === 'ArrowDown'
      ? Math.min(current + 1, sArr.length - 1)
      : Math.max(current - 1, 0);
    sArr[next]?.scrollIntoView({ behavior: 'smooth' });
  }
});

/* ===========================
   CLEANUP — remove cursor on touch devices
=========================== */

window.addEventListener('touchstart', () => {
  cursor.style.display         = 'none';
  cursorFollower.style.display = 'none';
  cancelAnimationFrame(rafId);
}, { once: true });

/* ===========================
   MORPHING TYPEWRITER
=========================== */

(function initMorphText() {
  const el = document.getElementById('morph-text');
  if (!el) return;

  const phrases = [
    'Data Analyst',
    'BI Developer',
    'Dashboard Builder',
    'SQL Specialist',
    'Python Enthusiast',
    'Insight Engineer',
    'Storyteller with Data',
  ];

  let phraseIdx  = 0;
  let charIdx    = 0;
  let isDeleting = false;
  let isPaused   = false;

  const GLITCH_CHARS  = '!@#%^&*<>?/\\|~=+';
  const TYPE_SPEED    = 68;
  const DELETE_SPEED  = 32;
  const PAUSE_AFTER   = 1800;
  const PAUSE_BEFORE  = 320;

  function glitchChar(char) {
    return Math.random() < 0.25
      ? GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]
      : char;
  }

  function renderText(text) {
    el.innerHTML = text
      .split('')
      .map((c, i) => {
        const isEdge = !isDeleting && i >= text.length - 2;
        return `<span class="morph-char${isEdge ? ' glitch' : ''}">${isEdge ? glitchChar(c) : c}</span>`;
      })
      .join('');

    if (!isDeleting) {
      setTimeout(() => {
        el.querySelectorAll('.morph-char.glitch').forEach((s, i) => {
          setTimeout(() => {
            s.classList.remove('glitch');
            s.textContent = text[text.length - 2 + i] ?? s.textContent;
          }, i * 30);
        });
      }, 60);
    }
  }

  function tick() {
    const current = phrases[phraseIdx];

    if (isPaused) {
      isPaused   = false;
      isDeleting = true;
      el.classList.remove('paused');
      el.classList.add('deleting');
      setTimeout(tick, PAUSE_BEFORE);
      return;
    }

    if (!isDeleting) {
      charIdx++;
      renderText(current.slice(0, charIdx));

      if (charIdx === current.length) {
        isPaused = true;
        el.classList.add('paused');
        setTimeout(tick, PAUSE_AFTER);
        return;
      }

      setTimeout(tick, TYPE_SPEED + Math.random() * 30);

    } else {
      charIdx--;
      renderText(current.slice(0, charIdx));

      if (charIdx === 0) {
        isDeleting = false;
        el.classList.remove('deleting');
        phraseIdx = (phraseIdx + 1) % phrases.length;
        setTimeout(tick, PAUSE_BEFORE);
        return;
      }

      setTimeout(tick, DELETE_SPEED);
    }
  }

  setTimeout(tick, 2000);
})();

/* ===========================
   CURSOR SPARK TRAIL
=========================== */

(function initSparkTrail() {
  const COLORS    = [
    'hsla(210,100%,62%,0.85)',
    'hsla(258,78%,68%,0.75)',
    'hsla(160,84%,49%,0.7)',
  ];
  const POOL_SIZE = 28;
  const pool      = [];

  for (let i = 0; i < POOL_SIZE; i++) {
    const s = document.createElement('div');
    s.className = 'spark';
    s.style.cssText = 'opacity:0;width:0;height:0;';
    document.body.appendChild(s);
    pool.push({ el: s, free: true });
  }

  function getFreeSpark() {
    return pool.find(p => p.free) ?? pool[0];
  }

  let lastX = -999, lastY = -999;
  let frameCount = 0;
  const SPAWN_EVERY = 3;

  document.addEventListener('mousemove', (e) => {
    frameCount++;
    if (frameCount % SPAWN_EVERY !== 0) return;

    const dx    = e.clientX - lastX;
    const dy    = e.clientY - lastY;
    const speed = Math.sqrt(dx * dx + dy * dy);
    if (speed < 3) return;

    lastX = e.clientX;
    lastY = e.clientY;

    const spark   = getFreeSpark();
    const size    = Math.random() * 4 + 2;
    const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
    const offsetX = (Math.random() - 0.5) * 10;
    const offsetY = (Math.random() - 0.5) * 10;
    const dur     = 420 + Math.random() * 220;

    spark.free = false;

    const s = spark.el;
    s.style.cssText = `
      left: ${e.clientX + offsetX}px;
      top:  ${e.clientY + offsetY}px;
      width:  ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${color};
      animation: sparkFade ${dur}ms cubic-bezier(0.16,1,0.3,1) forwards;
    `;

    void s.offsetWidth;

    setTimeout(() => {
      spark.free      = true;
      s.style.opacity = '0';
    }, dur);
  });

  document.addEventListener('mousedown', (e) => {
    const burstCount = 10;
    for (let i = 0; i < burstCount; i++) {
      const spark = getFreeSpark();
      const angle = (i / burstCount) * Math.PI * 2;
      const dist  = Math.random() * 22 + 8;
      const size  = Math.random() * 5 + 2;
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur   = 500 + Math.random() * 300;

      spark.free = false;

      const s = spark.el;
      s.style.cssText = `
        left: ${e.clientX + Math.cos(angle) * dist}px;
        top:  ${e.clientY + Math.sin(angle) * dist}px;
        width:  ${size}px;
        height: ${size}px;
        background: ${color};
        box-shadow: 0 0 ${size * 3}px ${color};
        animation: sparkFade ${dur}ms cubic-bezier(0.16,1,0.3,1) forwards;
      `;

      void s.offsetWidth;

      setTimeout(() => {
        spark.free      = true;
        s.style.opacity = '0';
      }, dur);
    }
  });

  window.addEventListener('touchstart', () => {
    pool.forEach(p => p.el.remove());
  }, { once: true });
})();

/* ===========================
   PARALLAX DEPTH SCROLL
   — Multi-speed floating orbs + bi-directional
     blur-reveal on section cards
=========================== */

(function initParallaxDepth() {

  /* Inject floating depth orbs */
  const orbDefs = [
    { top: '15vh',  left: '-10vw',  size: '45vw', color: 'hsla(210,100%,62%,0.04)',  speed: 0.18 },
    { top: '55vh',  right: '-8vw',  size: '35vw', color: 'hsla(258,78%,68%,0.05)',   speed: 0.28 },
    { top: '130vh', left: '8vw',    size: '28vw', color: 'hsla(160,84%,49%,0.04)',   speed: 0.22 },
    { top: '210vh', right: '6vw',   size: '38vw', color: 'hsla(210,100%,62%,0.035)', speed: 0.14 },
    { top: '320vh', left: '-5vw',   size: '30vw', color: 'hsla(258,78%,68%,0.04)',   speed: 0.20 },
  ];

  orbDefs.forEach(o => {
    const el = document.createElement('div');
    el.style.cssText = `
      position: fixed;
      top: ${o.top};
      ${o.left  ? 'left:'  + o.left  + ';' : ''}
      ${o.right ? 'right:' + o.right + ';' : ''}
      width:  ${o.size};
      height: ${o.size};
      max-width: 700px;
      max-height: 700px;
      background: radial-gradient(circle, ${o.color}, transparent 65%);
      border-radius: 50%;
      pointer-events: none;
      z-index: 0;
      will-change: transform;
    `;
    document.body.appendChild(el);
    o.el = el;
  });

  /* RAF-throttled scroll handler */
  let ticking = false;

  function updateDepthOrbs() {
    const sy = window.scrollY;
    orbDefs.forEach(o => {
      o.el.style.transform = `translateY(${-sy * o.speed}px)`;
    });
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateDepthOrbs);
      ticking = true;
    }
  }, { passive: true });

  /* Bi-directional blur-reveal for cards */
  const blurCards = document.querySelectorAll(
    '.skill-cat, .project-item.active, .service-item, .tool-card, .kpi-card'
  );

  blurCards.forEach(el => {
    el.style.transition = 'opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1), filter 0.7s';
    el.style.opacity    = '0';
    el.style.transform  = 'translateY(28px) scale(0.97)';
    el.style.filter     = 'blur(6px)';
  });

  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity   = '1';
        entry.target.style.transform = 'none';
        entry.target.style.filter    = 'blur(0)';
      } else {
        /* Re-hide only when scrolling back past the element */
        const rect = entry.boundingClientRect;
        if (rect.top > window.innerHeight * 0.85) {
          entry.target.style.opacity   = '0';
          entry.target.style.transform = 'translateY(28px) scale(0.97)';
          entry.target.style.filter    = 'blur(6px)';
        }
      }
    });
  }, { threshold: 0.10, rootMargin: '0px 0px -40px 0px' });

  blurCards.forEach(el => cardObserver.observe(el));

})();