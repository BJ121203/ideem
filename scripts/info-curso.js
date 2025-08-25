(function () {
    "use strict";

    const FORM_URL = "contactanos.html";

    const $ = (sel, ctx = document) => ctx.querySelector(sel);
    const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
    const norm = (t) => (t || "").trim().toUpperCase();

    function addOrReplaceQuery(url, key, value) {
        try {
            // Cambia rutas html a raiz/nombre.html si corresponde
            let base = url || FORM_URL;
            base = base.replace(/^\/?([a-zA-Z0-9_-]+)\.html$/, "/$1.html");
            const u = new URL(base, location.origin);
            u.searchParams.set(key, value);
            return u.pathname + (u.search || "") + (u.hash || "");
        } catch {
            let base = url || FORM_URL;
            base = base.replace(/^\/?([a-zA-Z0-9_-]+)\.html$/, "/$1.html");
            const sep = base.includes("?") ? "&" : "?";
            return `${base}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
    }

    function getCursosData() {
        if (Array.isArray(window.CURSOS)) return Promise.resolve(window.CURSOS);
        if (Array.isArray(window.cursos)) return Promise.resolve(window.cursos);
        return fetch("scripts/cursos.json", { cache: "no-store" })
            .then(r => r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status)))
            .catch(() => []);
    }

    function getParamId() {
        try {
            const u = new URL(location.href);
            const id = u.searchParams.get("id");
            if (id == null) return null;
            const n = Number(id);
            return Number.isFinite(n) ? n : id;
        } catch { return null; }
    }

    function money(n) { return `US $${Number(n || 0).toFixed(2)}`; }

    function findH5ByText(ctx, title) {
        return ($$("h5", ctx).find(h => norm(h.textContent) === norm(title))) || null;
    }

    function formatHora(h) {
        if (!h) return "";
        if (/[ap]\.?m\.?$/i.test(h.trim())) return h.replace(/\s+/g, " ").toLowerCase();
        const m = /^(\d{1,2}):(\d{2})$/.exec(h.trim());
        if (!m) return h;
        let H = parseInt(m[1], 10), M = m[2];
        const suf = H >= 12 ? "pm" : "am";
        H = ((H + 11) % 12) + 1;
        return `${H}:${M} ${suf}`;
    }

    function renderBanner(curso) {
        const banner = $(".banner-curso");
        if (!banner) return;
        const url = curso?.img || curso?.imagen || curso?.imagenCertificado;
        if (url) {
            banner.style.backgroundImage = `url("${url}")`;
            banner.setAttribute("role", "img");
            banner.setAttribute("aria-label", curso.titulo ? `Imagen del curso: ${curso.titulo}` : "Imagen del curso");
        }
    }
    function renderMiga(curso) {
        const li = $(".separador-curso ol li.ms-1");
        if (li) li.textContent = curso.titulo || "Curso";
    }
    function renderDescripcion(curso) {
        const datos = $(".datos-curso");
        const h = findH5ByText(datos, "DESCRIPCIÓN");
        if (h && h.nextElementSibling) h.nextElementSibling.innerHTML = (curso.descripcion || "").toString();
    }
    function renderDirigidoA(curso) {
        const datos = $(".datos-curso");
        const h = findH5ByText(datos, "DIRIGIDO A");
        if (!h || !h.nextElementSibling) return;
        const icon = `<i class="fa-solid fa-square" style="font-size: 0.5rem; color: var(--azul-fuerte); margin-right: 0.5rem;"></i>`;
        const val = curso.dirigidoA;
        if (Array.isArray(val)) {
            h.nextElementSibling.outerHTML = val.map(t => `<p class="mb-2">${icon}${t}</p>`).join("");
        } else {
            h.nextElementSibling.innerHTML = `${icon}${val || ""}`;
        }
    }
    function renderRequisitos(curso) {
        const datos = $(".datos-curso");
        const h = findH5ByText(datos, "REQUISITOS");
        if (!h || !h.nextElementSibling) return;
        const icon = `<i class="fa-solid fa-square" style="font-size: 0.5rem; color: var(--azul-fuerte); margin-right: 0.5rem;"></i>`;
        const val = curso.requisitos;
        if (Array.isArray(val)) {
            h.nextElementSibling.outerHTML = val.map(t => `<p class="mb-2">${icon}${t}</p>`).join("");
        } else {
            h.nextElementSibling.innerHTML = `${icon}${val || ""}`;
        }
    }
    function renderContenido(curso) {
        const acc = $("#accordionExample"); if (!acc) return;
        const items = (curso.contenido || []).map((it, idx) => {
            const num = String(it.n ?? (idx + 1)).padStart(2, "0");
            const id = `collapse${num}`;
            const show = idx === 0 ? "show" : "";
            const collapsed = idx === 0 ? "" : "collapsed";
            return `
        <div class="accordion-item acordion-principal">
          <h2 class="accordion-header">
            <button class="accordion-button ${collapsed}" type="button" data-bs-toggle="collapse"
              data-bs-target="#${id}" aria-expanded="${idx === 0}" aria-controls="${id}">
              <strong style="color: black; margin-right: 2rem; font-family: Montserrat-Regular; font-size: 1.2rem;">${num}</strong>
              ${it.tema || ""}
            </button>
          </h2>
          <div id="${id}" class="accordion-collapse collapse ${show}" data-bs-parent="#accordionExample">
            <div class="accordion-body">${it.descripcion || ""}</div>
          </div>
        </div>`;
        }).join("");
        acc.innerHTML = items;
    }
    function renderAprenderas(curso) {
        const datos = $(".datos-curso");
        const h = findH5ByText(datos, "LO QUE APRENDERÁS"); if (!h) return;
        const wrap = h.parentElement;
        const icon = `<i class="fa-solid fa-square" style="font-size: 0.5rem; color: var(--azul-fuerte); margin-right: 0.5rem;"></i>`;
        const list = (curso.aprenderas || curso.aprendras || [])
            .map(t => `<p class="col-6 mb-3">${icon}${t}</p>`).join("");
        wrap.innerHTML = `<h5>LO QUE APRENDERÁS</h5>${list}`;
    }
    function renderCamposAplicacion(curso) {
        const datos = $(".datos-curso");
        const h = findH5ByText(datos, "CAMPOS DE APLICACIÓN"); if (!h) return;
        const wrap = h.parentElement;
        const icon = `<i class="fa-solid fa-square" style="font-size: 0.5rem; color: var(--azul-fuerte); margin-right: 0.5rem;"></i>`;
        const list = (curso.camposAplicacion || [])
            .map(t => `<p class="mb-3 col-6">${icon}${t}</p>`).join("");
        wrap.innerHTML = `<h5>CAMPOS DE APLICACIÓN</h5>${list}`;
    }
    function renderHorarios(curso) {
        const dl = $(".precio-curso dl.row.mb-1"); if (!dl) return;
        const dias = Array.isArray(curso.diasSemana) ? curso.diasSemana.join(", ") : String(curso.diasSemana || "");
        const horas = [formatHora(curso.horaInicio), formatHora(curso.horaFin)].filter(Boolean).join(" - ");
        dl.innerHTML = `
      <dt class="col-5">Inicio:</dt>
      <dd class="col-7 text-muted">${curso.fecha || ""}</dd>
      <dt class="col-5">Duración:</dt>
      <dd class="col-7 text-muted">${curso.duracion || ""}</dd>
      <dt class="mb-1">Horarios ${curso.modalidad || ""}</dt>
      <dd class="col-5 text-muted">${dias || ""}</dd>
      <dd class="col-7 text-muted ">${horas || ""}</dd>`;
    }
    function renderPrecios(curso) {
        const pa = $(".precio-anterior"); if (pa) pa.textContent = money(curso.precioAnterior ?? 0);
        const pn = $(".precio-nuevo"); if (pn) pn.textContent = money(curso.precioActual ?? curso.precio ?? 0);
    }
    function renderRecursos(curso) {
        const h = $$(".precio-curso h5").find(x => norm(x.textContent) === "RECURSOS");
        if (!h || !h.nextElementSibling) return;
        const dd = h.nextElementSibling.querySelector("dd"); if (!dd) return;
        let items = curso.recursosIncluye;
        if (typeof items === "string") items = items.split(",").map(s => s.trim()).filter(Boolean);
        if (!Array.isArray(items)) items = [];
        dd.textContent = items.join(", ");
    }
    function renderCertificado(curso) {
        if (!curso.imagenCertificado) return;
        const thumb = $(".img-hover-container img");
        const modalImg = $("#miModal .modal-body img");
        if (thumb) thumb.src = curso.imagenCertificado;
        if (modalImg) modalImg.src = curso.imagenCertificado;
    }

    document.addEventListener("DOMContentLoaded", async () => {
        const cursos = await getCursosData();
        if (!Array.isArray(cursos) || cursos.length === 0) return;

        const id = getParamId();
        const curso = (id == null ? cursos[0] : (cursos.find(c => String(c.id) === String(id)) || cursos[0]));

        renderBanner(curso);
        renderMiga(curso);
        renderDescripcion(curso);
        renderDirigidoA(curso);
        renderRequisitos(curso);
        renderContenido(curso);
        renderAprenderas(curso);
        renderCamposAplicacion(curso);
        renderHorarios(curso);
        renderPrecios(curso);
        renderRecursos(curso);
        renderCertificado(curso);

        const selectedId = (id != null ? id : (curso && curso.id != null ? curso.id : null));
        if (selectedId != null) {
            const btns = [
                "#btn-ir-form",
                ".btn-ir-form",
                ".btn-mas-info"
            ].flatMap(sel => $$(sel));

            btns.forEach(btn => {
                let baseHref = btn.getAttribute("href") || FORM_URL;
                // Ya no es necesario reemplazar aquí, se hace en addOrReplaceQuery
                const href = addOrReplaceQuery(baseHref, "id", selectedId);
                btn.setAttribute("href", href);
            });

            sessionStorage.setItem("selectedCursoId", String(selectedId));
        }
    });
})();
