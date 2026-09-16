// Run in the homepage browser console. Measures final WebGL paints, not RAF callbacks.
(async () => {
  const canvas = document.querySelector('header canvas');
  if (!canvas) throw new Error('Hero canvas missing');
  const proto = WebGL2RenderingContext.prototype;
  const original = proto.clear;
  const initialScroll = window.scrollY;
  let paints = 0;
  proto.clear = function (...args) {
    if (this.canvas === canvas && !this.getParameter(this.FRAMEBUFFER_BINDING)) paints++;
    return original.apply(this, args);
  };
  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  try {
    window.scrollTo({ top: 0, behavior: 'instant' });
    await wait(500);
    paints = 0;
    const start = performance.now();
    await wait(2000);
    const fps = paints * 1000 / (performance.now() - start);
    if (fps < 1 || fps > 32) throw new Error(`Unexpected hero paint rate: ${fps}`);
    const hero = canvas.closest('header');
    const areaRatio = canvas.width * canvas.height / (hero.clientWidth * hero.clientHeight);
    if (areaRatio > 0.5) throw new Error(`Drawing buffer too large: ${areaRatio}`);
    window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' });
    await wait(600);
    paints = 0;
    await wait(1000);
    if (paints !== 0) throw new Error(`Offscreen hero painted ${paints} times`);
    window.scrollTo({ top: 0, behavior: 'instant' });
    await wait(600);
    if (paints === 0) throw new Error('Hero did not resume');
    return { fps, areaRatio, offscreenPaints: 0, resumed: true };
  } finally {
    proto.clear = original;
    window.scrollTo({ top: initialScroll, behavior: 'instant' });
  }
})();
