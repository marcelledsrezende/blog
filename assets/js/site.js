/* Efeitos visuais do site (versão estática, sem Firebase):
   partículas de fundo, menu que some ao rolar, GIF do hero e troca de idioma. */

function initAntigravity() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, mx = window.innerWidth / 2, my = window.innerHeight / 2;

  function resize() {
    W = window.innerWidth;
    H = window.innerHeight;
    canvas.width = W;
    canvas.height = H;
  }
  window.addEventListener('resize', resize);
  resize();

  const COLORS = ['#0f62fe', '#4589ff', '#78a9ff', '#a6c8ff', '#d0e2ff', '#0043ce', '#002d9c', '#e5f0ff'];
  const particles = [];
  for (let i = 0; i < 150; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
      size: Math.random() * 3 + 1.5,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      alpha: Math.random() * .6 + .2,
      shape: Math.random() > .5 ? 'rect' : 'oval',
      angle: Math.random() * Math.PI * 2,
      spin: (Math.random() - .5) * .02,
    });
  }

  document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      const dx = p.x - mx, dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy) || 1;
      if (dist < 150) {
        const force = (150 - dist) / 150 * 0.5;
        p.vx += (dx / dist) * force;
        p.vy += (dy / dist) * force;
      }
      p.vx += (Math.random() - .5) * 0.02;
      p.vy += (Math.random() - .5) * 0.02;
      p.vx *= 0.98; p.vy *= 0.98;
      p.x += p.vx; p.y += p.vy;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
      if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      p.angle += p.spin;

      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size * 1.5, -p.size * .5, p.size * 3, p.size);
      } else {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size * 1.4, p.size * .7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
  }
  (function loop() { draw(); requestAnimationFrame(loop); })();
}

/* Idiomas */
const langs = ['pt', 'en', 'es'];
const nextFlags = { pt: '🇺🇸', en: '🇪🇸', es: '🇧🇷' };
let currentLang = 'pt';
try { currentLang = localStorage.getItem('site_lang') || 'pt'; } catch (e) {}

const dict = {
  pt: {
    nav: ['HOME', 'POSTS', 'RESUMOS', 'CERTIFICAÇÕES', 'SOBRE MIM', 'GALERIA'],
    hero1: 'Bem-vindo ao meu blog!',
    hero2: 'Aqui eu documento minha jornada e meus estudos, dividindo cada passo da minha evolução no mundo da tecnologia, além de compartilhar um pouquinho da BigBlue.',
    btn1: 'Ver publicações', btn2: 'Conhecer Marcelle', feed: 'Conteúdos Recentes',
    more: 'Ver post completo →', back: '← Voltar para Posts'
  },
  en: {
    nav: ['HOME', 'POSTS', 'SUMMARIES', 'CERTIFICATIONS', 'ABOUT ME', 'GALLERY'],
    hero1: 'Welcome to my blog!',
    hero2: 'Here I document my journey and studies, sharing every step of my evolution in the tech world, along with a bit of BigBlue.',
    btn1: 'View posts', btn2: 'Know Marcelle', feed: 'Recent Content',
    more: 'Read full post →', back: '← Back to Posts'
  },
  es: {
    nav: ['INICIO', 'POSTS', 'RESÚMENES', 'CERTIFICACIONES', 'SOBRE MÍ', 'GALERÍA'],
    hero1: '¡Bienvenido a mi blog!',
    hero2: 'Aquí documento mi viaje y mis estudios, compartiendo cada paso de mi evolución en el mundo de la tecnología, además de compartir un poco de BigBlue.',
    btn1: 'Ver publicaciones', btn2: 'Conocer a Marcelle', feed: 'Contenido Reciente',
    more: 'Ver publicación completa →', back: '← Volver a Posts'
  }
};

function toggleLanguage() {
  currentLang = langs[(langs.indexOf(currentLang) + 1) % langs.length];
  try { localStorage.setItem('site_lang', currentLang); } catch (e) {}
  applyLanguage();
}

function applyLanguage() {
  const d = dict[currentLang] || dict.pt;
  const btn = document.getElementById('langToggleBtn');
  if (btn) btn.textContent = nextFlags[currentLang];

  const h1 = document.querySelector('.hero-wrapper h1');
  if (h1) h1.textContent = d.hero1;
  const hp = document.querySelector('.hero-wrapper p');
  if (hp) hp.textContent = d.hero2;
  const heroLinks = document.querySelectorAll('.hero-buttons a');
  if (heroLinks.length >= 2) { heroLinks[0].textContent = d.btn1; heroLinks[1].textContent = d.btn2; }

  document.querySelectorAll('.nav-links a').forEach((a, i) => { if (d.nav[i]) a.textContent = d.nav[i]; });
  const feedH2 = document.querySelector('.feed-header');
  if (feedH2) feedH2.textContent = d.feed;
  document.querySelectorAll('.post-more').forEach(a => { a.textContent = d.more; });
  const back = document.querySelector('.back-link');
  if (back) back.textContent = d.back;
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) menu.classList.toggle('mobile-active');
}

/* GIF do hero: toca, pausa no último quadro por 1-3 s e recomeça */
function initHeroGif() {
  const img = document.getElementById('heroGif');
  if (!img) return;
  const gifSrc = img.getAttribute('src');
  const gifDuration = 1440;

  const canvas = document.createElement('canvas');
  canvas.id = 'heroGifCanvas';
  canvas.setAttribute('style', img.getAttribute('style'));
  canvas.style.visibility = 'hidden';
  canvas.style.pointerEvents = 'none';
  canvas.style.cursor = 'default';
  img.parentNode.insertBefore(canvas, img.nextSibling);
  const ctx = canvas.getContext('2d');

  function cycle() {
    canvas.style.visibility = 'hidden';
    img.style.visibility = 'visible';
    img.src = '';
    img.src = gifSrc;
    setTimeout(function () {
      if (img.naturalWidth > 0 && img.naturalHeight > 0) {
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        ctx.drawImage(img, 0, 0);
        img.style.visibility = 'hidden';
        canvas.style.visibility = 'visible';
      }
      setTimeout(cycle, Math.floor(Math.random() * 2000) + 1000);
    }, gifDuration);
  }
  cycle();

  requestAnimationFrame(() => {
    [img, canvas].forEach(el => { if (el.style.opacity === '0') el.style.opacity = '1'; });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initAntigravity();
  initHeroGif();
  applyLanguage();

  let lastScrollY = window.scrollY;
  const nav = document.querySelector('nav');
  window.addEventListener('scroll', () => {
    if (!nav) return;
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 50);
    nav.classList.toggle('hidden', y > lastScrollY && y > 100);

    const h1Hero = document.querySelector('.hero-wrapper h1');
    const heroEls = [document.getElementById('heroGif'), document.getElementById('heroGifCanvas')];
    if (h1Hero && heroEls.some(Boolean)) {
      const rect = h1Hero.getBoundingClientRect();
      const fadeStart = window.innerHeight * 0.55;
      const fadeEnd = window.innerHeight * 0.1;
      const raw = (fadeStart - rect.bottom) / (fadeStart - fadeEnd);
      const progress = y < 30 ? 0 : Math.max(0, Math.min(1, raw));
      heroEls.forEach(el => {
        if (!el) return;
        el.style.opacity = String(1 - progress);
        el.style.pointerEvents = progress >= 1 ? 'none' : 'auto';
      });
    }
    lastScrollY = y;
  });
});
