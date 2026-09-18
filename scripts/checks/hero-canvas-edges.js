// Run in the browser console on the portfolio homepage after the cube loads.
// Samples the actual WebGL output while scrolling, independent of DOM overlays.
(async () => {
  const source = document.querySelector("header canvas");
  if (!source) throw new Error("Open the homepage and wait for the hero canvas.");
  const probe = document.createElement("canvas");
  probe.width = source.width;
  probe.height = source.height;
  const context = probe.getContext("2d", { willReadFrequently: true });
  const originalY = window.scrollY;
  const originalBehavior = document.documentElement.style.scrollBehavior;
  document.documentElement.style.scrollBehavior = "auto";
  const band = Math.max(1, Math.round(source.width / source.clientWidth * 8));
  const regions = [
    [0, 0, band, probe.height],
    [probe.width - band, 0, band, probe.height],
    [0, 0, probe.width, band],
    [0, probe.height - band, probe.width, band],
  ];
  let maxAlpha = 0;
  let hasDrawing = false;
  let didScroll = false;
  try {
    for (const fraction of [0, 0.25, 0.45, 0]) {
      window.scrollTo(0, source.clientHeight * fraction);
      didScroll ||= window.scrollY > source.clientHeight * 0.2;
      for (let frame = 0; frame < 80; frame++) {
        await new Promise(requestAnimationFrame);
        if (frame < 40 || frame % 5 !== 0) continue;
        context.clearRect(0, 0, probe.width, probe.height);
        context.drawImage(source, 0, 0);
        // Sample every frame while at the top: drawImage on a WebGL canvas
        // without preserveDrawingBuffer races the compositor, so a single
        // sample can land on a cleared buffer. Max alpha over frames is the
        // deterministic signal that the cube actually painted.
        if (fraction === 0) {
          const fullFrame = context.getImageData(0, 0, probe.width, probe.height).data;
          for (let i = 3; i < fullFrame.length; i += 4) {
            if (fullFrame[i] > 0) { hasDrawing = true; break; }
          }
        }
        for (const region of regions) {
          const pixels = context.getImageData(...region).data;
          for (let i = 3; i < pixels.length; i += 4) maxAlpha = Math.max(maxAlpha, pixels[i]);
        }
      }
    }
  } finally {
    window.scrollTo(0, originalY);
    document.documentElement.style.scrollBehavior = originalBehavior;
  }
  if (!hasDrawing || !didScroll) throw new Error("Check requires a rendered cube and working page scroll.");
  if (maxAlpha !== 0) throw new Error(`Hero paints into its clipping edge: alpha ${maxAlpha}/255`);
  return { pass: true, maxEdgeAlpha: maxAlpha, drawingBuffer: [probe.width, probe.height] };
})();
