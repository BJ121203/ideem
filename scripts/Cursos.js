
document.addEventListener('DOMContentLoaded', init);

async function init() {
  const ROW = document.getElementById('cursos-row');
  const BUSCADOR = document.querySelector('.buscador-input');
  const OPCIONES = document.querySelectorAll('.cursos-selector .opcion');

  if (!ROW) {
    console.warn('[curso.js] No existe #cursos-row en el DOM.');
    return;
  }
  ROW.classList.add('justify-content-center');

  let cursos = [];
  let filtroTipo = 'TODOS';
  let q = '';

 
  let cols = ROW?.dataset.cols || '4'; 
  let colClass = cols === '3' ? 'col-lg-4 col-xl-4' : 'col-lg-3 col-xl-3';

  try {
    cursos = await fetchCursos();
    render();
  } catch (e) {
    console.error('No se pudieron cargar los cursos:', e);
    ROW.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">No se pudieron cargar los cursos.</div>
      </div>`;
    return;
  }

  function render() {
    const term = (q || '').trim().toLowerCase();

    const list = cursos
      .filter(c => {
        const pasaTipo = filtroTipo === 'TODOS' ? true : (String(c.tipo || '').toUpperCase() === filtroTipo);
        const hit = !term ? true : [c.titulo, c.categoria, c.modalidad]
          .some(v => (v || '').toLowerCase().includes(term));
        return pasaTipo && hit;
      })
      .slice(0, 12);

    if (!list.length) {
      ROW.innerHTML = `
        <div class="col-12"><div class="alert alert-warning mb-0">No hay cursos.</div></div>`;
      return;
    }

    function addOrReplaceQuery(url, key, value) {
      try {
        const u = new URL(url || "info-curso.html", location.origin);
        u.searchParams.set(key, value);
        return u.pathname + (u.search || "") + (u.hash || "");
      } catch {
        const base = url || "info-curso.html";
        const sep = base.includes("?") ? "&" : "?";
        return `${base}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
      }
    }

    function buildDetailLink(c) {
      const base = c.link && c.link !== "#" ? c.link : "info-curso.html";
      return addOrReplaceQuery(base, "id", c.id);
    }

    ROW.innerHTML = list.map(c => `
  <div class="col-12 col-md-6 ${colClass} mb-4">
    <div class="d-flex flex-column h-100">
      <p class="cursos-categoria">${esc(c.categoria || 'Sin categoría')}</p>
      <div class="card h-100 curso-vista">
        <img src="${escAttr(c.img)}" class="card-img-top" alt="${escAttr(c.titulo || 'Curso')}">
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${esc(c.titulo || '')}</h5>
          <p class="card-text">${esc(c.modalidad || '')}</p>
          <div class="curso-botones d-flex flex-column">
            <a href="${escAttr(buildDetailLink(c))}" class="curso-boton">
              Más información
            </a>
          </div>
        </div>
      </div>
    </div>
  </div>
`).join('');

    BUSCADOR?.addEventListener('input', (e) => { q = e.target.value || ''; render(); });

    OPCIONES.forEach(op => {
      op.addEventListener('click', () => {
        OPCIONES.forEach(o => o.classList.remove('activa'));
        op.classList.add('activa');
        filtroTipo = op.textContent.trim().toUpperCase();
        render();
      });
    });

    document.addEventListener('click', async (e) => {
      const btn = e.target.closest('[data-add-cart]');
      if (!btn) return;
      e.preventDefault();
      try {
        await addToCart(btn.dataset.id);

        const badge = document.querySelector('[data-cart-badge]');
        if (badge) badge.textContent = getCart().length;

        const originalText = btn.textContent;
        btn.textContent = 'Añadido ✓';
        btn.classList.add('disabled');
        setTimeout(() => {
          btn.textContent = originalText;
          btn.classList.remove('disabled');
        }, 1200);
      } catch (err) {
        console.error(err);
        alert('No se pudo añadir este curso.');
      }
    });

    function esc(s) {
      return String(s)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
    }
    function escAttr(s) { return esc(s).replaceAll('`', '&#96;'); }
  }

  async function fetchCursos() {
    try {
      const resp = await fetch('scripts/cursos.json', { cache: 'no-store' });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      return await resp.json();
    } catch {
      return [];
    }
  }
}
