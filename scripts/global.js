/*--------------------------cargar Navbar-------------------------------------------------*/
fetch('navbar.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('navbar-container').innerHTML = data;
  });

/*--------------------------Cargar Footer-------------------------------------------------*/
fetch('footer.html')
  .then(res => res.text())
  .then(data => {
    document.getElementById('footer-container').innerHTML = data;
  });

/*-------------------------------------Transicion de cada seccion--------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  const elementos = document.querySelectorAll('.oculto-scroll');

  const mostrarAlScroll = () => {
    const triggerBottom = window.innerHeight * 0.85;

    elementos.forEach(el => {
      const boxTop = el.getBoundingClientRect().top;

      if (boxTop < triggerBottom) {
        el.classList.add('mostrar-scroll');
      }
    });
  };

  // Inicial y en scroll
  window.addEventListener('scroll', mostrarAlScroll);
  mostrarAlScroll();
});

/*--------------------------Efecto de seccion Porque estudiar con nosotros-------------------------------------------------*/
document.addEventListener("DOMContentLoaded", () => {
  const bars = document.querySelectorAll(".bar");


  // Activa la primera por defecto
  bars[0].classList.add("active");

  bars.forEach(bar => {
    bar.addEventListener("mouseenter", () => {
      // Remueve la clase activa de todas
      bars.forEach(b => b.classList.remove("active"));
      // Añade la clase activa solo a la que está siendo pasada con el mouse
      bar.classList.add("active");
    });
  });
});

/*--------------------------------------Mostrar Lineas en Titulo-------------------------------------------*/
document.addEventListener("DOMContentLoaded", function () {
  function activarLinea() {
    var fuentes = document.querySelectorAll('.fuente');
    fuentes.forEach(function (fuente) {
      var rect = fuente.getBoundingClientRect();
      if (
        rect.top < window.innerHeight &&
        rect.bottom > 0 &&
        !fuente.classList.contains('linea-activa')
      ) {
        fuente.classList.add('linea-activa');
        console.log('Clase linea-activa agregada:', fuente);
      }
    });
  }
  window.addEventListener('scroll', activarLinea);
  activarLinea();
});

/*--------------------------Navbar Fijo-------------------------------------------------*/
// Global.js v5 — Fijo justo al terminar el header, robusto a cambio de pestaña/BFCache
(function () {
  const root = document.documentElement;

  // Espera a que #mainNav exista (si el navbar se inyecta como parcial)
  function waitFor(selector, timeout = 8000) {
    return new Promise((resolve, reject) => {
      const hit = document.querySelector(selector);
      if (hit) return resolve(hit);
      const mo = new MutationObserver(() => {
        const el = document.querySelector(selector);
        if (el) { mo.disconnect(); resolve(el); }
      });
      mo.observe(document.body || document.documentElement, { childList: true, subtree: true });
      setTimeout(() => { mo.disconnect(); reject(new Error('Timeout esperando ' + selector)); }, timeout);
    });
  }

  function px(n) { return `${Math.max(0, Math.round(n || 0))}px`; }

  function init(nav) {
    // Elementos base
    const header = document.querySelector('.primera-fila'); // puede no existir (móvil)
    // Sentinel: marca fin del header
    let sentinel = document.getElementById('nav-sentinel');
    if (!sentinel) {
      sentinel = document.createElement('div');
      sentinel.id = 'nav-sentinel';
      if (header) header.insertAdjacentElement('afterend', sentinel);
      else nav.insertAdjacentElement('beforebegin', sentinel);
    }
    // Spacer: evita saltos cuando el nav se fija
    let spacer = document.getElementById('nav-spacer');
    if (!spacer) {
      spacer = document.createElement('div');
      spacer.id = 'nav-spacer';
      nav.insertAdjacentElement('afterend', spacer);
    }

    nav.classList.add('nav-fixed'); // estilo fijo controlado por CSS

    // Utils de medidas
    const navH = () => (nav.getBoundingClientRect().height || nav.offsetHeight || 64);

    function setSpacerHeight(h) { if (spacer.style.height !== h) spacer.style.height = h; }

    // Estado
    let raf = null;
    let io = null;
    let lastFixed = null; // evita reflows innecesarios

    // Lógica: fijar o soltar
    function fixNav(shouldFix) {
      if (lastFixed === shouldFix) return; // nada que cambiar
      lastFixed = shouldFix;
      if (shouldFix) {
        setSpacerHeight(px(navH()));
        nav.classList.add('is-fixed');
      } else {
        nav.classList.remove('is-fixed');
        setSpacerHeight('0px');
      }
    }

    // Cálculo principal (throttled con rAF)
    function recalc() {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;

        // sombra sutil
        nav.classList.toggle('shadow-sm', (window.scrollY || window.pageYOffset) > 2);

        // Si el sentinel está por encima del viewport ⇒ header terminó ⇒ fijar
        const rect = sentinel.getBoundingClientRect();
        const shouldFix = rect.top <= 0; // robusto a re-entradas desde BFCache
        fixNav(shouldFix);
      });
    }

    // (Re)armar IntersectionObserver — algunos navegadores lo “duermen” al cambiar de pestaña
    function attachObserver() {
      if (io) { io.disconnect(); io = null; }
      if (!('IntersectionObserver' in window)) return;

      // rootMargin con -1px en bottom para evitar parpadeos de frontera
      io = new IntersectionObserver(([entry]) => {
        // Cuando deja de intersectar, el sentinel ya pasó ⇒ fijar
        const shouldFix = entry.isIntersecting === false && entry.boundingClientRect.top <= 0;
        fixNav(shouldFix);
        // Asegura que sombra/espaciado se actualicen
        nav.classList.toggle('shadow-sm', (window.scrollY || window.pageYOffset) > 2);
        // Tras un tick, recalculamos (por si el layout cambió)
        requestAnimationFrame(() => recalc());
      }, { threshold: [0], rootMargin: '0px 0px -1px 0px' });

      io.observe(sentinel);
    }

    // Handlers globales
    const onScroll = () => recalc();
    const onResize = () => {
      // Si ya está fijo, actualiza altura del spacer a la nueva altura del nav
      if (nav.classList.contains('is-fixed')) setSpacerHeight(px(navH()));
      recalc();
    };

    // Eventos normales
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('orientationchange', onResize);
    document.addEventListener('shown.bs.collapse', onResize);
    document.addEventListener('hidden.bs.collapse', onResize);

    // *** Eventos clave para tu caso ***
    // 1) Al volver visible la pestaña, reanclamos IO y recalculamos
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        attachObserver();
        // fuerza un doble recalc para capturar cambios de layout diferidos
        recalc();
        setTimeout(recalc, 50);
      }
    });
    // 2) BFCache: al volver con "Atrás/Siguiente", pageshow puede traer DOM “congelado”
    window.addEventListener('pageshow', (e) => {
      if (e.persisted) {
        attachObserver();
        recalc();
        setTimeout(recalc, 50);
      }
    });

    // Primera configuración
    attachObserver();
    // Recalc inicial (doble pasada para asegurar medidas correctas)
    recalc();
    setTimeout(recalc, 0);
  }

  // Arranque seguro
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    waitFor('#mainNav').then(init).catch(() => {});
  } else {
    window.addEventListener('DOMContentLoaded', () => {
      waitFor('#mainNav').then(init).catch(() => {});
    });
  }
})();



