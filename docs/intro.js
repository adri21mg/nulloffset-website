// Home logo intro: the two squares spin into place, the second L rises, and the words slide out of it.
// The SVG markup is the finished logo, so without JavaScript (or with reduced motion) nothing is hidden.
(() => {
  const svg = document.querySelector('.intro-logo');
  if (!svg) return;
  const $ = id => svg.querySelector('#' + id);
  const hero = svg.closest('.studio-hero');
  const clamp = v => Math.min(1, Math.max(0, v));
  const ease = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const phase = (t, start, length) => clamp((t - start) / length);
  const DURATION = 4200, TAGLINE_AT = 3500;

  // Squares start centred on the second L, then travel home while spinning.
  const START_X = 987 - 176.6, PIVOT = '140.7 140.4';
  const SMALL_C = '70.46 70.46', BIG_C = '246.83 246.17';

  function frame(t) {
    const appear = ease(phase(t, 0, 450));
    const travel = easeInOut(phase(t, 1000, 1300));
    const lUp = ease(phase(t, 2000, 800));
    const wings = ease(phase(t, 2650, 1100));

    $('squares').setAttribute('opacity', appear);
    $('squares').setAttribute('transform', `translate(${START_X * (1 - travel)} 0) rotate(${-360 * travel} ${PIVOT})`);
    $('sq-small').setAttribute('transform', `rotate(${180 * travel} ${SMALL_C})`);
    $('sq-big').setAttribute('transform', `rotate(${180 * travel} ${BIG_C})`);

    // The L rises from below; its gradient edge climbs with it.
    $('ell').setAttribute('transform', `translate(0 ${160 * (1 - lUp)})`);
    const edge = 358 - 450 * lUp;
    $('g-l').setAttribute('y1', edge + 90);
    $('g-l').setAttribute('y2', edge);

    // "Nul" and "Offset" slide out of a soft fade beside the L.
    $('nul').setAttribute('transform', `translate(${140 * (1 - wings)} 0)`);
    $('offset').setAttribute('transform', `translate(${-140 * (1 - wings)} 0)`);
    const left = 952 - 850 * wings, right = 1022 + 1350 * wings;
    $('g-left').setAttribute('x1', left); $('g-left').setAttribute('x2', left + 150);
    $('g-right').setAttribute('x1', right); $('g-right').setAttribute('x2', right - 150);
    const near = 220 * (1 - wings) + .01, nearOpacity = wings * wings;
    $('g-left-near').setAttribute('x1', 952.56 - near); $('s-left-near').setAttribute('stop-opacity', nearOpacity);
    $('g-right-near').setAttribute('x1', 1021.7 + near); $('s-right-near').setAttribute('stop-opacity', nearOpacity);

    hero?.classList.toggle('intro-done', t >= TAGLINE_AT);
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  hero?.classList.add('intro-playing');
  frame(0);
  let start;
  const loop = now => {
    start ??= now;
    const t = now - start;
    frame(Math.min(t, DURATION));
    if (t < DURATION) requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();
