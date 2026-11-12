/* SAMKANELI · Informe de imagen pública — menú por bloques + portada interactiva */
(function () {
  const $  = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reducir = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Menú de bloques (1 al 9) ---------- */
  const cards = $$('.m-card'), panels = $$('.panel'), bar = $('.prog i');
  const prev = $('#prev'), next = $('#next');
  let cur = 0;

  function show(i, scroll) {
    cur = Math.max(0, Math.min(panels.length - 1, i));
    cards.forEach((c, k) => { c.setAttribute('aria-selected', k === cur); c.tabIndex = k === cur ? 0 : -1; });
    panels.forEach((p, k) => p.classList.toggle('on', k === cur));
    if (bar) bar.style.width = ((cur + 1) / panels.length * 100) + '%';
    if (prev) prev.hidden = cur === 0;
    if (next) next.hidden = cur === panels.length - 1;
    $$('.rev', panels[cur]).forEach((e, k) => {
      e.classList.remove('vis');
      setTimeout(() => e.classList.add('vis'), 80 + k * 90);
    });
    history.replaceState(null, '', '#seccion-' + (cur + 1));
    if (scroll) panels[cur].scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  if (cards.length && panels.length) {
    cards.forEach((c, k) => {
      c.addEventListener('click', () => show(k, true));
      c.addEventListener('keydown', e => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); show(k + 1); cards[cur].focus(); }
        if (e.key === 'ArrowLeft'  || e.key === 'ArrowUp')   { e.preventDefault(); show(k - 1); cards[cur].focus(); }
      });
    });
    if (prev) prev.addEventListener('click', () => show(cur - 1, true));
    if (next) next.addEventListener('click', () => show(cur + 1, true));
    const m = location.hash.match(/seccion-(\d)/);
    show(m ? +m[1] - 1 : 0, false);
  }

  /* ---------- Portada: botones que abren cada bloque ---------- */
  $$('[data-ir]').forEach(b =>
    b.addEventListener('click', () => show(+b.dataset.ir, true)));

  /* ---------- Portada: el mouse mueve la foto, las hojas y la mascota ---------- */
  const portada = $('.portada');
  if (portada && !reducir) {
    portada.addEventListener('pointermove', e => {
      const r = portada.getBoundingClientRect();
      portada.style.setProperty('--mx', ((e.clientX - r.left) / r.width  - .5).toFixed(3));
      portada.style.setProperty('--my', ((e.clientY - r.top)  / r.height - .5).toFixed(3));
    });
    portada.addEventListener('pointerleave', () => {
      portada.style.setProperty('--mx', 0);
      portada.style.setProperty('--my', 0);
    });
  }

  /* ---------- Globo de la mascota: cambia de palabra al tocarlo ---------- */
  const globo = $('.burbuja');
  if (globo) {
    const palabras = ['Imagen pública', 'Reputación', 'Experiencia', 'Posicionamiento'];
    let n = 0;
    globo.addEventListener('click', () => {
      n = (n + 1) % palabras.length;
      globo.classList.remove('cambia'); void globo.offsetWidth;
      globo.classList.add('cambia');
      setTimeout(() => { globo.textContent = palabras[n]; }, 180);
    });
  }
})();
