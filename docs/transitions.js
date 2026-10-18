// Tiny cross-page pixel wipe. Navigation still works with JavaScript/storage disabled.
(() => {
  const key = 'nulloffset-page-wipe';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let arriving = false;
  try {
    const previous = JSON.parse(sessionStorage.getItem(key) || 'null');
    sessionStorage.removeItem(key);
    arriving = previous?.path === location.pathname && Date.now() - previous.time < 5000 && !reducedMotion.matches;
  } catch { /* Storage is optional, including when opening the files directly. */ }
  if (arriving) document.documentElement.classList.add('page-entering');
  // Never leave content hidden if initialization fails or a page is restored from history.
  const unlock = () => {
    document.documentElement.classList.remove('page-entering');
    document.querySelectorAll('.pixel-wipe').forEach(layer => layer.remove());
  };
  const safety = setTimeout(unlock, 1600);

  function wipe(reveal) {
    const layer = document.createElement('div');
    layer.className = 'pixel-wipe';
    layer.setAttribute('aria-hidden', 'true');
    const columns = innerWidth < 600 ? 8 : 14;
    const rows = Math.ceil(columns * innerHeight / innerWidth);
    layer.style.setProperty('--wipe-columns', columns);
    layer.style.setProperty('--wipe-rows', rows);
    const tiles = [];
    for (let i = 0; i < columns * rows; i++) {
      const tile = document.createElement('span');
      tile.style.opacity = reveal ? '1' : '0';
      layer.append(tile);
      tiles.push(tile);
    }
    document.body.append(layer);
    document.documentElement.classList.remove('page-entering');
    const animations = tiles.map((tile, i) => {
      // Four scattered seeds spread out into the rest of the grid.
      const rank = (i * 47) % tiles.length;
      const delay = rank < 4 ? rank * 22 : 80 + rank / tiles.length * 300;
      return tile.animate([{ opacity: reveal ? 1 : 0 }, { opacity: reveal ? 0 : 1 }], {
        duration: 65, delay, easing: 'steps(1, end)', fill: 'forwards'
      }).finished;
    });
    return Promise.all(animations).then(() => { if (reveal) layer.remove(); });
  }

  document.addEventListener('DOMContentLoaded', () => {
    if (arriving && !reducedMotion.matches) wipe(true).catch(unlock);
    else unlock();
    clearTimeout(safety);
    let leaving = false;
    document.addEventListener('click', event => {
      const link = event.target.closest('a[href]');
      if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target || link.hasAttribute('download') || reducedMotion.matches) return;
      const target = new URL(link.href, location.href);
      if (target.origin !== location.origin || !['http:', 'https:', 'file:'].includes(target.protocol) || !/\/(index|about|trappist-1|lmms-collab)\.html$/.test(target.pathname) || target.pathname === location.pathname) return;
      if (leaving) { event.preventDefault(); return; }
      event.preventDefault();
      leaving = true;
      const navigate = () => {
        try { sessionStorage.setItem(key, JSON.stringify({ path: target.pathname, time: Date.now() })); } catch { /* Navigation remains available. */ }
        location.assign(target.href);
      };
      // Bounded fail-safe: the transition can never strand the user on an overlay.
      const fallback = setTimeout(navigate, 800);
      wipe(false).catch(() => {}).finally(() => { clearTimeout(fallback); navigate(); });
    });
    window.addEventListener('pageshow', event => { if (event.persisted) { leaving = false; unlock(); } });
  });
})();
