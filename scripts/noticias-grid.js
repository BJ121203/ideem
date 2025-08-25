/* Render de HERO + GRID desde blog.json
   - Orden por fecha descendente (más reciente → más antiguo)
   - HERO navega solo por las 5 noticias más recientes (ordenadas desc)
   - GRID muestra el resto, también en orden descendente
*/

const DATA_URL = '/scripts/noticias.json';
const heroEl   = document.getElementById('hero-section');
const gridEl   = document.getElementById('news-grid');
const pillsEl  = document.getElementById('grid-filters');

let POSTS = [];          // todos los posts ordenados (desc)
let HERO_POOL = [];      // top 5 por fecha (desc)
let heroIndex = 0;       // índice dentro de HERO_POOL

/* ====== INIT ====== */
(async function init(){
  try{
    const raw = Array.isArray(window.articles) && window.articles.length
      ? window.articles
      : await fetch(DATA_URL, {cache:'no-store'}).then(r => r.json());

    // Ordena DESC por fecha (y con desempates estables)
    POSTS = raw.slice().sort(cmpPostsDesc);

    // Toma SOLO las últimas 5 para el hero (manteniendo el orden DESC)
    HERO_POOL = POSTS.slice(0, Math.min(5, POSTS.length));
    heroIndex = 0;

    renderHero(HERO_POOL[heroIndex] || null);
    renderFilters(POSTS);
    renderGrid(POSTS);

  }catch(err){
    console.error('No se pudo cargar noticias.json:', err);
    heroEl.innerHTML = `<div class="alert alert-danger mb-0">No se pudo cargar <code>${DATA_URL}</code>.</div>`;
  }
})();

/* ====== COMPARATOR: más reciente primero ====== */
function cmpPostsDesc(a, b){
  const da = parseDate(a?.date), db = parseDate(b?.date);
  if (db !== da) return db - da; // DESC por fecha
  // Desempates estables:
  const ca = Date.parse(a?.createdAt || '') || 0;
  const cb = Date.parse(b?.createdAt || '') || 0;
  if (cb !== ca) return cb - ca; // DESC por createdAt si existe
  return (a?.title || '').localeCompare(b?.title || '', 'es', {sensitivity:'base'});
}

/* ====== RENDER HERO (limitado a HERO_POOL) ====== */
function renderHero(post){
  if (!post) { heroEl.innerHTML = ''; return; }

  const excerpt = makeExcerpt(post.excerpt || post.content || '', 180);
  const html = `
    <div class="hero-media">
      <img src="${esc(post.image)}" alt="${esc(post.title)}">
      <span class="hero-category">${esc(post.category || 'General')}</span>

      <div class="hero-arrows">
        <button type="button" aria-label="Anterior" id="hero-prev"><i class="fa-solid fa-chevron-left"></i></button>
        <button type="button" aria-label="Siguiente" id="hero-next"><i class="fa-solid fa-chevron-right"></i></button>
      </div>
    </div>

    <aside class="hero-copy">
      <h2 class="hero-title h2">${esc(post.title)}</h2>
      <div class="hero-meta">
        ${esc(post.date || '')} · ${esc(post.readTime || '')}
      </div>
      <p class="hero-excerpt">${esc(excerpt)}</p>
      <a href="#" class="hero-link" id="hero-readmore">Leer más <i class="fa-solid fa-arrow-right-long"></i></a>
    </aside>
  `;
  heroEl.innerHTML = html;

  // Interacciones: leer más y flechas
  document.getElementById('hero-readmore')?.addEventListener('click', (e)=>{
    e.preventDefault();
    openPost(post.slug);
  });

  document.getElementById('hero-prev')?.addEventListener('click', ()=>{
    if (!HERO_POOL.length) return;
    heroIndex = (heroIndex - 1 + HERO_POOL.length) % HERO_POOL.length;
    renderHero(HERO_POOL[heroIndex]);
  });

  document.getElementById('hero-next')?.addEventListener('click', ()=>{
    if (!HERO_POOL.length) return;
    heroIndex = (heroIndex + 1) % HERO_POOL.length;
    renderHero(HERO_POOL[heroIndex]);
  });
}

/* ====== RENDER FILTROS ====== */
function renderFilters(data){
  const cats = Array.from(new Set(data.map(x => x.category).filter(Boolean)));
  const frag = document.createDocumentFragment();
  frag.appendChild(pill('Todas','all', true));
  cats.forEach(c => frag.appendChild(pill(c,c)));
  pillsEl.innerHTML = '';
  pillsEl.appendChild(frag);

  pillsEl.addEventListener('click', (e)=>{
    const btn = e.target.closest('.pill');
    if(!btn) return;
    pillsEl.querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.news-tile').forEach(card=>{
      card.style.display = (f === 'all' || card.dataset.cat === f) ? '' : 'none';
    });
  });
}

function pill(text, value, active=false){
  const b = document.createElement('button');
  b.className = `pill${active ? ' active' : ''}`;
  b.textContent = text;
  b.dataset.filter = value;
  return b;
}

/* ====== RENDER GRID ====== */
function renderGrid(all){
  // Excluye las noticias del HERO_POOL (las 5 más recientes) y muestra el resto en DESC
  const start = HERO_POOL.length; // 0..4 para hero → grid desde 5
  const items = all.slice(start); // ya vienen ordenados desc por cmpPostsDesc

  gridEl.innerHTML = items.map(post => {
    const ov = overlayByCategory(post.category); // opcional
    const ovAttrs = ov ? `data-ov data-ov-opacity style="--ov-color:${ov.color};--ov-opacity:${ov.opacity};"` : '';
    return `
      <article class="tile news-tile" data-cat="${esc(post.category || '')}" data-slug="${esc(post.slug)}" ${ovAttrs}>
        <div class="tile-media">
          <img src="${esc(post.image)}" alt="${esc(post.title)}" loading="lazy">
          <span class="tile-plus"><i class="fa-solid fa-plus"></i></span>
        </div>
        <div class="tile-meta">
          <div>
            <p class="tile-title mb-1">${esc(post.title)}</p>
            <p class="tile-sub mb-0">${esc(post.category || 'General')}</p>
          </div>
        </div>
      </article>
    `;
  }).join('');

  // click en tarjeta
  gridEl.querySelectorAll('.news-tile').forEach(card=>{
    card.addEventListener('click', ()=>{
      openPost(card.getAttribute('data-slug'));
    });
  });
}

/* ====== NAVEGACIÓN A DETALLE ====== */
function openPost(slug){
  if (typeof window.renderDetail === 'function') {
    history.pushState({slug}, '', `#/${encodeURIComponent(slug)}`);
    window.renderDetail(slug);
    window.scrollTo({top:0, behavior:'smooth'});
  } else {
    location.href = `noticias.html#/${encodeURIComponent(slug)}`;
  }
}

/* ====== UTILS ====== */
function esc(s=''){
  return String(s)
    .replaceAll('&','&amp;').replaceAll('<','&lt;')
    .replaceAll('>','&gt;').replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
function makeExcerpt(text='', n=180){
  const t = text.replace(/\s+/g,' ').trim();
  return t.length > n ? t.slice(0, n-1).trim() + '…' : t;
}

/* Soporta ISO, dd/mm/yyyy, yyyy-mm-dd y “27 Septiembre 2025” */
function parseDate(s=''){
  if (!s) return 0;
  const d1 = Date.parse(s);
  if (!Number.isNaN(d1)) return d1;

  const m1 = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/.exec(s);
  if (m1) {
    const [_, d, m, y] = m1.map(Number);
    return new Date(y, m-1, d).getTime();
  }

  const meses = {
    'enero':0,'febrero':1,'marzo':2,'abril':3,'mayo':4,'junio':5,
    'julio':6,'agosto':7,'septiembre':8,'setiembre':8,'octubre':9,'noviembre':10,'diciembre':11
  };
  const m2 = /^(\d{1,2})\s+([A-Za-zñáéíóúü]+)\s+(\d{4})$/i.exec(s.trim());
  if (m2) {
    const d = Number(m2[1]);
    const month = meses[m2[2].toLowerCase()];
    const y = Number(m2[3]);
    if (month != null) return new Date(y, month, d).getTime();
  }
  return 0;
}

/* Overlay sugerido por categoría (puedes editar libremente) */
function overlayByCategory(cat){
  const map = {
    'IA':          { color:'rgba(0,146,205,.35)', opacity:.35 },
    'Concepts':    { color:'rgba(202,184,129,.30)', opacity:.30 },
    'Print Design':{ color:'rgba(0,42,86,.35)',   opacity:.35 },
    'Web Design':  { color:'rgba(0,106,181,.35)', opacity:.35 },
    'Photoshop':   { color:'rgba(0,0,0,.28)',     opacity:.28 },
  };
  return map[cat] || null;
}
