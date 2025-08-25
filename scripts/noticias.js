const shareButtons = document.getElementById('share-buttons');
const blogContent = document.getElementById('blog-content');
const noticias = document.getElementById('Noticias');
const miniaturas = document.getElementById('news-grid-section');

// ===== Extracción del JSON =====
const JSON_URL = 'scripts/noticias.json';
let articles = [];


const isNoticiasPage = () => /(^|\/)noticias\.html(\?|#|$)/i.test(location.pathname);

// ===== Cionfiguraciones de Carrusel infinito
const GAP = 16, SPEED = 350, AUTOPLAY_MS = 4000;

function visibleCount() {
  const w = window.innerWidth;
  return w >= 992 ? 3 : w >= 576 ? 2 : 1;
}

//======Extración de contenido individual de cada slide 
function slideTemplate(p) {
  return `
    <article class="news-card" data-slug="${p.slug}">
      <div class="news-bg" style="background-image:url('${p.image}')"></div>
      <div class="news-gradient"></div>
      <div class="news-content">
        <span class="badge-soft">${p.category || 'General'}</span>
        <h3 class="news-title">IDEEM presenta<br>${p.title || ''}</h3>
      </div>
    </article>
  `;
}


function InfiniteCarousel({ mount, items }) {
  const wrap = document.querySelector(mount);
  if (!wrap) return;

  const viewport = wrap.querySelector('.carousel-viewport');
  const track = wrap.querySelector('.carousel-track');
  const prevBtn = wrap.querySelector('.nav-prev');
  const nextBtn = wrap.querySelector('.nav-next');

  if (!viewport || !track) return;

  let data = items.slice();   // TODAS
  let vis = visibleCount();
  let index = 0;
  let autoplayId = null;
  let resizing = false;

  function bindClicks() {
    track.querySelectorAll('.news-card').forEach(card => {
      card.addEventListener('click', () => {
        const slug = card.getAttribute('data-slug');

        if (isNoticiasPage()) {
          // Ya estamos en noticias.html → SPA
          renderDetail(slug);
          history.pushState({ slug }, '', `#/${encodeURIComponent(slug)}`);
        } else {
          // Venimos desde otra página → redirigir a noticias.html con hash
          window.location.href = `noticias.html#/${encodeURIComponent(slug)}`;
        }
      });
    });
  }

  function setWidths() {
    vis = visibleCount();
    const vw = viewport.clientWidth;
    const slideW = (vw - GAP * (vis - 1)) / vis;
    [...track.children].forEach(s => s.style.width = `${slideW}px`);
  }

  function currentOffset() {
    const s = track.children[0];
    const w = s ? s.getBoundingClientRect().width : 0;
    return w + GAP;
  }

  function jumpTo(realIdx) {
    const x = -(currentOffset() * (vis + realIdx));
    track.style.transitionDuration = '0ms';
    track.style.transform = `translateX(${x}px)`;
    requestAnimationFrame(() => track.style.transitionDuration = `${SPEED}ms`);
  }

  function moveTo(realIdx) {
    index = realIdx;
    const x = -(currentOffset() * (vis + index));
    track.style.transform = `translateX(${x}px)`;
  }

  function next() { moveTo(index + 1); }
  function prev() { moveTo(index - 1); }

  function buildTrack() {
    track.innerHTML = '';
    track.style.transitionDuration = '0ms';

    const clonesHead = data.slice(-vis);
    const clonesTail = data.slice(0, vis);
    const all = [...clonesHead, ...data, ...clonesTail];

    for (const p of all) {
      const slide = document.createElement('div');
      slide.className = 'slide';
      slide.innerHTML = slideTemplate(p);
      track.appendChild(slide);
    }
    setWidths();
    jumpTo(index);
    requestAnimationFrame(() => track.style.transitionDuration = `${SPEED}ms`);
    bindClicks();
  }

  track.addEventListener('transitionend', () => {
    const n = data.length;
    if (index >= n) { index = 0; jumpTo(index); }
    else if (index < 0) { index = n - 1; jumpTo(index); }
  });

  window.addEventListener('resize', () => {
    if (resizing) return; resizing = true;
    setTimeout(() => {
      const newVis = visibleCount();
      if (newVis !== vis) buildTrack(); else { setWidths(); jumpTo(index); }
      resizing = false;
    }, 150);
  });

  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);

  function startAutoplay() {
    if (!AUTOPLAY_MS) return;
    stopAutoplay();
    autoplayId = setInterval(next, AUTOPLAY_MS);
  }
  function stopAutoplay() { if (autoplayId) clearInterval(autoplayId); }

  wrap.addEventListener('mouseenter', stopAutoplay);
  wrap.addEventListener('mouseleave', startAutoplay);

  buildTrack();
  startAutoplay();
}

// ===== Render de detalle =====
function renderDetail(slug) {
  window.scrollTo({top:0, behavior:'smooth'});
  noticias?.classList.add('d-none');

  const post = articles.find(a => a.slug === slug);
  if (!post) return;



  const related = articles
    .filter(a => a.slug !== slug && a.section === post.section && a.category === post.category)
    .slice(0, 4);

  blogContent.innerHTML = `
  <div class="banner-section position-relative text-white">
    <img src="${post.image}" class="imagen-banner" loading="lazy" alt="${post.title}">
    <div class="banner-overlay position-absolute top-0 start-0 w-100 h-100"></div>
  </div>

  <div class="container">
    <div class="row  my-5">
      <div class="col-md-12">
        <div class="blog-container">

          <a href="noticias.html" class="dropdown-item px-0">Noticias</a>
          <p class="d-inline"> / ${post.slug}</p>

          <p class="text-muted"><br>Categoría: ${post.category} · Lectura: ${post.readTime} · ${post.date}</p>

          <h2 class="mb-3">${post.title}</h2>
          <p class="text-justify">${post.content}</p>

          <!-- Botones para compartir -->
          <div class="share-buttons" id="share-buttons-container">
            <span>COMPARTIR NOTICIA</span>
            <a href="#" id="share-facebook"  target="_blank" title="Compartir en Facebook"><i class="fab fa-facebook-f"></i></a>
            <a href="#" id="share-x"        target="_blank" title="Compartir en X (Twitter)"><i class="fab fa-x-twitter"></i></a>
            <a href="#" id="share-linkedin" target="_blank" title="Compartir en LinkedIn"><i class="fab fa-linkedin-in"></i></a>
            <a href="#" id="share-email"    target="_blank" title="Compartir por Email"><i class="fas fa-envelope"></i></a>
            <a href="#" id="share-whatsapp" target="_blank" title="Compartir por WhatsApp"><i class="fab fa-whatsapp"></i></a>
          </div>
        </div>
      </div>

     
      
        <div class="mt-3">
        <h5 class= "mt-3 mb-5 fuente">Noticias relacionadas</h5>
          <div class="related-grid">
            ${related.map(item => `
              <a href="#"
                class="related-card leer-mas"
                data-slug="${item.slug}"
                aria-label="${item.title}">
                <img src="${item.image}" alt="${item.title}">
                <span class="related-badge">${item.category}</span>
                <div class="related-title">${item.title}</div>
              </a>
            `).join('')}
          </div>
        </div>

      
    </div>
  </div>
  `;

  // Compartir con URL (usa hash actual)
  const pageUrl = encodeURIComponent(location.href);
  const encodedTitle = encodeURIComponent(post.title);
  const fb = document.getElementById("share-facebook");
  const tw = document.getElementById("share-x");
  const li = document.getElementById("share-linkedin");
  const em = document.getElementById("share-email");
  const wa = document.getElementById("share-whatsapp");

  if (fb) fb.href = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
  if (tw) tw.href = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${encodedTitle}`;
  if (li) li.href = `https://www.linkedin.com/sharing/share-offsite/?url=${pageUrl}`;
  if (em) em.href = `mailto:?subject=${encodedTitle}&body=${pageUrl}`;
  if (wa) wa.href = `https://wa.me/?text=${encodedTitle}%20${pageUrl}`;

  addLeerMasListeners();
}

// Reasigna listeners para “relacionadas”
function addLeerMasListeners() {
  document.querySelectorAll('.leer-mas').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const slug = a.getAttribute('data-slug');

      if (isNoticiasPage()) {
        renderDetail(slug);
        history.pushState({ slug }, '', `#/${encodeURIComponent(slug)}`);
      } else {
        window.location.href = `noticias.html#/${encodeURIComponent(slug)}`;
      }
    });
  });
}


function renderHome() {
  shareButtons?.classList.add('d-none');
  blogContent.innerHTML = '';
  contenido1.classList.remove('d-none');
  miniaturas.classList.remove('d-none')
}

// ===== Boot =====
document.addEventListener('DOMContentLoaded', async () => {
  try {
    const res = await fetch(JSON_URL, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    articles = await res.json();

    // Inicia carrusel con TODAS las entradas (si existe en la vista actual)
    InfiniteCarousel({ mount: '#json-carousel', items: articles });

    // Router inicial por hash
    const slug = location.hash.startsWith('#/') ? decodeURIComponent(location.hash.slice(2)) : '';
    if (isNoticiasPage()) {
      if (slug) renderDetail(slug); else renderHome();
    } else {
      if (slug) renderDetail(slug); else renderHome();
    }

    // Back/forward del navegador
    window.addEventListener('popstate', () => {
      const s = location.hash.startsWith('#/') ? decodeURIComponent(location.hash.slice(2)) : '';
      if (isNoticiasPage()) {
        if (s) renderDetail(s); else renderHome();
      } else {
        if (s) renderDetail(s); else renderHome();
      }
    });
  } catch (err) {
    console.error('Error cargando noticias.json:', err);
    const cont = document.getElementById('blog-content') || document.querySelector('#json-carousel');

  }
});
