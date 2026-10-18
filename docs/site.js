document.querySelectorAll('[data-year]').forEach(node => { node.textContent = new Date().getFullYear(); });

const steamUrl = window.NULLOFFSET_CONTENT?.steamUrl;
if (steamUrl) {
  try {
    const url = new URL(steamUrl);
    if (url.protocol === 'https:' && url.hostname === 'store.steampowered.com' && /^\/app\/\d+(\/|$)/.test(url.pathname)) {
      document.querySelectorAll('[data-steam-link]').forEach(link => { link.href = url.href; link.hidden = false; });
      document.querySelectorAll('[data-steam-pending]').forEach(node => { node.hidden = true; });
    }
  } catch { /* An unset or malformed store address must never become a broken link. */ }
}

// Brief horizontal logo cuts, separated by long, irregular quiet intervals.
const glitchLogo = document.querySelector('.logo-glitch');
if (glitchLogo) {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer;
  let endTimer;
  const stop = () => { clearTimeout(timer); clearTimeout(endTimer); glitchLogo.classList.remove('glitching'); };
  const schedule = () => {
    stop();
    if (reduced.matches || document.hidden) return;
    timer = setTimeout(() => {
      const bounds = glitchLogo.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < innerHeight) glitchLogo.classList.add('glitching');
      endTimer = setTimeout(schedule, 240);
    }, 6500 + Math.random() * 6000);
  };
  reduced.addEventListener('change', schedule);
  document.addEventListener('visibilitychange', schedule);
  schedule();
}

// Native dialog: keyboard focus trapping, Escape, and ordinary image links without JS.
const galleryLinks = [...document.querySelectorAll('[data-gallery]')];
const viewer = document.querySelector('.image-viewer');
if (viewer && typeof viewer.showModal === 'function') {
  let index = 0;
  const photo = viewer.querySelector('[data-gallery-image]');
  const show = next => {
    index = (next + galleryLinks.length) % galleryLinks.length;
    const source = galleryLinks[index];
    photo.src = source.href;
    photo.alt = source.querySelector('img').alt;
    viewer.querySelector('[data-gallery-caption]').textContent = photo.alt;
    viewer.querySelector('[data-gallery-counter]').textContent = `${index + 1} / ${galleryLinks.length}`;
  };
  galleryLinks.forEach((link, number) => link.addEventListener('click', event => {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    show(number);
    viewer.showModal();
    document.body.classList.add('viewer-open');
  }));
  viewer.querySelector('[data-gallery-close]').addEventListener('click', () => viewer.close());
  viewer.querySelector('[data-gallery-previous]').addEventListener('click', () => show(index - 1));
  viewer.querySelector('[data-gallery-next]').addEventListener('click', () => show(index + 1));
  viewer.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); show(index + (event.key === 'ArrowRight' ? 1 : -1)); }
  });
  viewer.addEventListener('click', event => { if (event.target === viewer) viewer.close(); });
  viewer.addEventListener('close', () => document.body.classList.remove('viewer-open'));
}

// The trailer is user-controlled. Gameplay uses genuine, continuously looping GIFs.
const videos = [...document.querySelectorAll('video')];
videos.forEach(video => video.addEventListener('play', () => {
  videos.forEach(other => { if (other !== video) other.pause(); });
}));
document.addEventListener('visibilitychange', () => {
  if (document.hidden) videos.forEach(video => video.pause());
});

// A maximum of three pixels of cursor-follow movement. No touch or reduced-motion effect.
const artwork = document.querySelector('.game-art');
if (artwork) {
  const motion = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const reset = () => { artwork.style.removeProperty('--image-x'); artwork.style.removeProperty('--image-y'); };
  artwork.addEventListener('pointermove', event => {
    if (!motion.matches || event.pointerType !== 'mouse') return;
    const bounds = artwork.getBoundingClientRect();
    const x = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const y = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    artwork.style.setProperty('--image-x', `${(x * 3).toFixed(2)}px`);
    artwork.style.setProperty('--image-y', `${(y * 3).toFixed(2)}px`);
  });
  artwork.addEventListener('pointerleave', reset);
  motion.addEventListener('change', reset);
}
