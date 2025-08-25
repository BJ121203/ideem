(function () {
  "use strict";

  const DATA_URL = "scripts/cursos.json";
  const ROW = document.getElementById("cursos-row");
  if (!ROW) return;

  const buscador = document.querySelector(".buscador-input");
  const filtrosWrap = document.querySelector(".filtro-curso");
  const btnVerTodos = document.querySelector(".btn-ver-cursos-center");
  const selectOrden = document.querySelector(".select-cursos");
  const resultadosH6 = document.querySelector(".cursos-resultados h6");

  const $all = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

  // --- NUEVO: marcar checkbox de área recibido en ?area= ---


  function diac(s) {
    return String(s || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/ñ/gi, "n")
      .toLowerCase()
      .trim();
  }

  function esc(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }
  function escAttr(str) {
    return String(str || "")
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
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

  function money(n) {
    const num = Number(n || 0);
    return `US $${num.toFixed(2)}`;
  }

  function parseSpanishDate(s) {
    if (!s) return null;
    const meses = {
      "enero": 0, "febrero": 1, "marzo": 2, "abril": 3, "mayo": 4, "junio": 5,
      "julio": 6, "agosto": 7, "septiembre": 8, "setiembre": 8, "sep": 8,
      "octubre": 9, "oct": 9, "noviembre": 10, "nov": 10, "diciembre": 11, "dic": 11
    };
    const t = diac(s).replace(/,/g, "").split(/\s+/);
    if (t.length >= 3) {
      const d = parseInt(t[0], 10);
      const m = meses[t[1]];
      const y = parseInt(t[2], 10);
      if (Number.isFinite(d) && m != null && Number.isFinite(y)) {
        return new Date(y, m, d);
      }
    }
    const d2 = new Date(s);
    return isNaN(d2) ? null : d2;
  }

  function getColClass() {
    const cols = parseInt(ROW.getAttribute("data-cols") || "3", 10);
    switch (cols) {
      case 1: return "col-lg-12";
      case 2: return "col-lg-6";
      case 4: return "col-lg-3";
      default: return "col-lg-4";
    }
  }

  async function getCursos() {
    if (Array.isArray(window.CURSOS)) return window.CURSOS;
    if (Array.isArray(window.cursos)) return window.cursos;
    try {
      const res = await fetch(DATA_URL, { cache: "no-store" });
      if (!res.ok) throw new Error("HTTP " + res.status);
      const json = await res.json();
      if (!Array.isArray(json)) throw new Error("JSON no es array");
      return json;
    } catch (err) {
      console.error("No se pudo cargar cursos.json", err);
      return [];
    }
  }

  function prepare(cursos) {
    return cursos.map(c => {
      const contenidoTxt = Array.isArray(c.contenido)
        ? c.contenido.map(x => [x.tema, x.descripcion].join(" ")).join(" ")
        : "";
      const recursosTxt = Array.isArray(c.recursosIncluye) ? c.recursosIncluye.join(", ")
        : (typeof c.recursosIncluye === "string" ? c.recursosIncluye : "");
      const haystack = diac([
        c.titulo, c.descripcion, c.categoria, c.modalidad, contenidoTxt, recursosTxt
      ].filter(Boolean).join(" "));
      return Object.assign({}, c, { __haystack: haystack, __fecha: parseSpanishDate(c.fecha) });
    });
  }

  function renderCards(list) {
    const colClass = getColClass();
    ROW.innerHTML = list.map(c => `
      <div class="col-12 col-md-6 ${colClass} mb-4">
        <div class="d-flex flex-column h-100">
          <p class="cursos-categoria">${esc(c.categoria || 'Sin categoría')}</p>
          <div class="card h-100 curso-vista">
            ${c.img ? `<img src="${escAttr(c.img)}" class="card-img-top" alt="${escAttr(c.titulo || 'Curso')}">` : ""}
            <div class="card-body d-flex flex-column">
              <h5 class="card-title">${esc(c.titulo || '')}</h5>
              <p class="card-text">${esc(c.modalidad || '')}</p>
              <div class="curso-botones d-flex flex-column">
                <a href="${escAttr(buildDetailLink(c))}" class="curso-boton">Más información</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join("");
    if (resultadosH6) resultadosH6.textContent = `${list.length} resultados`;
  }

  function readFilters() {
    const q = diac(buscador ? buscador.value : "");
    const checks = $all(".filtro-curso input[type=checkbox]");
    const modalidad = [];
    const areas = [];
    checks.forEach(chk => {
      if (!chk.checked) return;
      const label = chk.nextElementSibling ? chk.nextElementSibling.textContent : "";
      const group = chk.closest(".filtro-div");
      const groupName = group ? diac(group.querySelector("h6")?.textContent) : "";
      if (groupName.includes("modalidad")) modalidad.push(diac(label));
      else if (groupName.includes("areas") || groupName.includes("conocimiento")) areas.push(diac(label));
    });
    const ordenTxt = diac(selectOrden ? selectOrden.value || selectOrden.options[selectOrden.selectedIndex]?.text : "");
    return { q, modalidad, areas, ordenTxt };
  }

  function applyFilters(data, f) {
    let out = data.filter(c => f.q ? c.__haystack.includes(f.q) : true);

    if (f.modalidad.length) {
      out = out.filter(c => f.modalidad.includes(diac(c.modalidad)));
    }

    if (f.areas.length) {
      out = out.filter(c => f.areas.includes(diac(c.categoria)));
    }

    if (f.ordenTxt.includes("descendente")) {
      out.sort((a, b) => {
        const da = a.__fecha ? a.__fecha.getTime() : -Infinity;
        const db = b.__fecha ? b.__fecha.getTime() : -Infinity;
        return db - da; 
      });
    } else if (f.ordenTxt.includes("ascendente")) {
      out.sort((a, b) => {
        const da = a.__fecha ? a.__fecha.getTime() : Infinity;
        const db = b.__fecha ? b.__fecha.getTime() : Infinity;
        return da - db; 
      });
    } else if (f.ordenTxt.includes("a-z")) {
      out.sort((a, b) => diac(a.titulo).localeCompare(diac(b.titulo)));
    } else if (f.ordenTxt.includes("z-a")) {
      out.sort((a, b) => diac(b.titulo).localeCompare(diac(a.titulo)));
    }

    return out;
  }

  function debounce(fn, ms = 250) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  function clearFilters() {
    if (buscador) buscador.value = "";
    $all(".filtro-curso input[type=checkbox]").forEach(chk => chk.checked = false);
    if (selectOrden) selectOrden.selectedIndex = 0;
  }

  // ---------- NUEVO: preselección de área desde ?area= ----------
  function preselectAreaFromURL() {
  const params = new URLSearchParams(location.search);
  const id = params.get("area"); // ej: area4
  if (!id) return false;

  const chk = document.getElementById(id);
  if (!chk) return false;

 
  document.querySelectorAll(".filtro-curso input[type=checkbox]")
    .forEach(x => x.checked = false);

  chk.checked = true;
  return true;          
}

  // --------------------------------------------------------------


  document.addEventListener("DOMContentLoaded", async () => {
  const base = prepare(await getCursos());

  // 1) Marca el checkbox ANTES del primer render
  const preselected = preselectAreaFromURL();

  // 2) Primer render ya leyendo lo marcado
  renderCards(applyFilters(base, readFilters()));

  // 3) Ahora sí, listeners para cambios manuales
  if (buscador) buscador.addEventListener("input", debounce(() => {
    renderCards(applyFilters(base, readFilters()));
  }, 200));

  if (filtrosWrap) filtrosWrap.addEventListener("change", (e) => {
    if (e.target && e.target.matches("input[type=checkbox]")) {
      renderCards(applyFilters(base, readFilters()));
    }
  });

  if (selectOrden) selectOrden.addEventListener("change", () => {
    renderCards(applyFilters(base, readFilters()));
  });

  if (btnVerTodos) btnVerTodos.addEventListener("click", (e) => {
    e.preventDefault();
    if (buscador) buscador.value = "";
    document.querySelectorAll(".filtro-curso input[type=checkbox]").forEach(x => x.checked = false);
    if (selectOrden) selectOrden.selectedIndex = 0;
    renderCards(applyFilters(base, readFilters()));
    if (buscador) buscador.focus();
  });

  // 4) (defensivo) si el filtro se crea tarde, re-render en el siguiente tick
  if (preselected) {
    setTimeout(() => {
      renderCards(applyFilters(base, readFilters()));
    }, 0);
  }
});

})();
