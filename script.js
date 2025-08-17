/* ===== Utilities & Globals ===== */
const $ = (q, ctx = document) => ctx.querySelector(q);
const $$ = (q, ctx = document) => Array.from(ctx.querySelectorAll(q));

/* ===== Year ===== */
$("#year").textContent = new Date().getFullYear();

/* ===== Animated Background (Particles + Parallax) ===== */
const canvas = $("#bg-canvas");
const ctx = canvas.getContext("2d");
let W, H, particles;

function resize() {
  W = canvas.width = window.innerWidth;
  H = canvas.height = window.innerHeight;
  initParticles();
}
window.addEventListener("resize", resize);

function initParticles() {
  const count = Math.min(140, Math.floor((W * H) / 18000));
  particles = [...Array(count)].map(() => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: Math.random() * 1.8 + 0.3,
    vx: (Math.random() - 0.5) * 0.35,
    vy: (Math.random() - 0.5) * 0.35,
  }));
}
function draw() {
  ctx.clearRect(0, 0, W, H);
  // vignette
  const grd = ctx.createRadialGradient(W * 0.8, H * -0.1, 0, W * 0.8, H * -0.1, Math.max(W, H));
  grd.addColorStop(0, "rgba(167,139,250,0.08)");
  grd.addColorStop(1, "rgba(10,10,15,0)");
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // particles
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = "rgba(167,139,250,0.9)";
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > W) p.vx *= -1;
    if (p.y < 0 || p.y > H) p.vy *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // connecting lines
  ctx.strokeStyle = "rgba(139,92,246,0.15)";
  for (let i = 0; i < particles.length; i++) {
    for (let j = i + 1; j < particles.length; j++) {
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d2 = dx * dx + dy * dy;
      if (d2 < 120 * 120) {
        ctx.lineWidth = 0.6 - (d2 / (120 * 120)) * 0.5;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  ctx.globalCompositeOperation = "source-over";
  requestAnimationFrame(draw);
}
resize(); draw();

/* ===== Cursor Blob (eased follow) ===== */
const blob = $("#cursor-blob");
let targetX = window.innerWidth / 2, targetY = window.innerHeight / 2;
let bx = targetX, by = targetY;

window.addEventListener("pointermove", e => { targetX = e.clientX; targetY = e.clientY; });
function animateBlob() {
  bx += (targetX - bx) * 0.08;
  by += (targetY - by) * 0.08;
  blob.style.transform = `translate(${bx}px, ${by}px)`;
  requestAnimationFrame(animateBlob);
}
animateBlob();

/* ===== Scroll Reveal ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) e.target.classList.add("in");
  });
}, { threshold: 0.12 });
$$("[data-animate]").forEach(el => io.observe(el));

/* ===== Tilt Cards ===== */
$$(".tilt").forEach(card => {
  let rAF = null;
  const state = { rx: 0, ry: 0, sx: 0, sy: 0 };
  function onMove(e) {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    state.ry = (x - 0.5) * 12;
    state.rx = (0.5 - y) * 12;
    state.sx = (x - 0.5) * 8;
    state.sy = (y - 0.5) * 8;
    if (!rAF) rAF = requestAnimationFrame(update);
  }
  function update() {
    card.style.transform = `perspective(800px) rotateX(${state.rx}deg) rotateY(${state.ry}deg) translateZ(6px)`;
    card.style.boxShadow = `0 ${8 + state.sy}px ${30 + Math.abs(state.sx)}px rgba(139,92,246,0.15), inset 0 0 0 1px rgba(255,255,255,.03)`;
    rAF = null;
  }
  card.addEventListener("mousemove", onMove);
  card.addEventListener("mouseleave", () => {
    card.style.transform = "";
    card.style.boxShadow = "";
  });
});

/* ===== Magnetic Buttons ===== */
$$(".magnet").forEach(btn => {
  const m = { x: 0, y: 0 };
  let raf = null;
  function onMove(e){
    const r = btn.getBoundingClientRect();
    const x = e.clientX - (r.left + r.width/2);
    const y = e.clientY - (r.top + r.height/2);
    m.x = x * .15; m.y = y * .15;
    if(!raf) raf = requestAnimationFrame(update);
  }
  function update(){
    btn.style.transform = `translate(${m.x}px, ${m.y}px)`;
    raf = null;
  }
  btn.addEventListener("mousemove", onMove);
  btn.addEventListener("mouseleave", ()=> btn.style.transform = "");
});

/* ===== Smooth internal anchor focus ===== */
$$("a[href^='#']").forEach(a=>{
  a.addEventListener("click", e=>{
    const id = a.getAttribute("href").slice(1);
    const el = document.getElementById(id);
    if(el){
      e.preventDefault();
      el.scrollIntoView({behavior:"smooth", block:"start"});
      el.focus?.();
    }
  });
});

/* ===== Faux Contact (opens email client) ===== */
function sendMail(e){
  e.preventDefault();
  const fd = new FormData(e.target);
  const name = fd.get("name"); const email = fd.get("email"); const message = fd.get("message");
  const subject = encodeURIComponent(`Portfolio message from ${name}`);
  const body = encodeURIComponent(`From: ${name} <${email}>\n\n${message}`);
  window.location.href = `mailto:jvravichandra03@gmail.com?subject=${subject}&body=${body}`;
  e.target.reset();
  return false;
}
window.sendMail = sendMail;
