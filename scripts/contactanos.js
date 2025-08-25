(function () {
  "use strict";

  const SELECT_ID = "curso";
  const DATA_URL = "scripts/cursos.json";

  document.addEventListener("DOMContentLoaded", init);

  async function init() {
    const form = document.querySelector(".needs-validation");
    if (form) setupValidation(form);

    const select = document.getElementById(SELECT_ID);
    if (select) {
      const cursos = await getCursos();
      if (Array.isArray(cursos) && cursos.length) {
        fillSelect(select, cursos);
        preselectFromQueryOrSession(select);
      }
    }

    if (new URLSearchParams(location.search).has("id")) {
      smoothScrollToForm();
    }
  }

  function setupValidation(form) {
    const globalAlert = document.getElementById("form-global-error");

    const requiredMap = {
      nombre: "Nombre",
      apellidos: "Apellidos",
      pais: "País",
      telefono: "Teléfono",
      email: "Correo electrónico"
    };

    form.addEventListener("input", (e) => maybeClearInvalid(e.target));
    form.addEventListener("change", (e) => maybeClearInvalid(e.target));

    form.addEventListener("reset", () => {
      form.classList.remove("was-validated");
      form.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));
      if (globalAlert) {
        globalAlert.classList.add("d-none");
        globalAlert.textContent = "";
      }
    });

    form.addEventListener("submit", (e) => {
      if (globalAlert) {
        globalAlert.classList.add("d-none");
        globalAlert.textContent = "";
      }

      const missing = [];
      Object.keys(requiredMap).forEach(id => {
        const el = form.querySelector("#" + id);
        if (!el) return;

        if (!el.checkValidity()) {
          el.classList.add("is-invalid");

          let fb = el.parentElement.querySelector(".invalid-feedback");
          if (!fb) {
            fb = document.createElement("div");
            fb.className = "invalid-feedback";
            el.parentElement.appendChild(fb);
          }
          if (el.value.trim() === "") {
            fb.textContent = "Este campo es obligatorio.";
          } else {
            if (el.type === "email") fb.textContent = "Ingresa un correo válido.";
            else if (el.id === "telefono") fb.textContent = "Ingresa un teléfono válido.";
          }
          missing.push(requiredMap[id]);
        }
      });

      if (missing.length > 0) {
        e.preventDefault();
        e.stopPropagation();

        if (globalAlert) {
          globalAlert.innerHTML = `
            <strong>Este formulario tiene errores.</strong><br>
            Por favor, completa los siguientes campos: ${missing.join(", ")}.
          `;
          globalAlert.classList.remove("d-none");
        }

        form.classList.add("was-validated");

        const firstInvalid = form.querySelector(".is-invalid");
        if (firstInvalid) firstInvalid.focus();
      }
    });
  }

  function maybeClearInvalid(el) {
    if (!el || !el.classList.contains("is-invalid")) return;
    if (el.checkValidity()) el.classList.remove("is-invalid");
  }

  function getCursos() {
    if (Array.isArray(window.CURSOS)) return Promise.resolve(window.CURSOS);
    if (Array.isArray(window.cursos)) return Promise.resolve(window.cursos);
    return fetch(DATA_URL, { cache: "no-store" })
      .then(r => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
      .catch(() => []);
  }

  function fillSelect(select, cursos) {
    const placeholder = select.querySelector('option[value=""]');
    select.innerHTML = "";
    if (placeholder) {
      select.appendChild(placeholder);
    } else {
      const opt = document.createElement("option");
      opt.value = "";
      opt.selected = true;
      opt.textContent = "Selecciona un curso (opcional)";
      select.appendChild(opt);
    }

    cursos
      .slice()
      .sort((a, b) => (a.titulo || "").localeCompare(b.titulo || "", "es", { sensitivity: "base" }))
      .forEach(c => {
        const opt = document.createElement("option");
        opt.value = String(c.id);
        opt.textContent = c.titulo || `Curso ${c.id}`;
        select.appendChild(opt);
      });
  }

  function preselectFromQueryOrSession(select) {
    const idFromQuery = getQueryId();
    const id = idFromQuery != null ? idFromQuery : sessionStorage.getItem("selectedCursoId");
    if (id == null) return;

    const val = String(id);
    const has = Array.from(select.options).some(o => o.value === val);
    if (has) {
      select.value = val;
      sessionStorage.removeItem("selectedCursoId");
    }
  }

  function getQueryId() {
    try {
      const u = new URL(location.href);
      const id = u.searchParams.get("id");
      if (id == null) return null;
      const n = Number(id);
      return Number.isFinite(n) ? n : id;
    } catch { return null; }
  }

  function smoothScrollToForm() {
    const form = document.querySelector(".form-card.needs-validation") ||
      document.querySelector("form.needs-validation");
    if (!form) return;

    const header = document.querySelector(".fixed-top, .navbar.fixed-top, header.sticky-top, .sticky-top");
    const offset = header ? header.getBoundingClientRect().height + 12 : 0;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const behavior = prefersReduced ? "auto" : "smooth";

    setTimeout(() => {
      const y = form.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: y, behavior });
      const first = form.querySelector("input, select, textarea, button");
      if (first) first.focus({ preventScroll: true });
    }, 150);
  }
})();
