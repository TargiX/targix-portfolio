"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

type Props = {
  src: string;
  alt: string;
  /** target render width in CSS pixels — the canvas internally upscales for retina */
  width?: number;
  /** target render height in CSS pixels */
  height?: number;
  /** Accent color used to tint the "on" pixels. Hex like #a3e635. */
  accent?: string;
  /** Background color behind "off" pixels (where the page bg shows through is fine, default transparent). */
  bgAlpha?: number;
  /** Dot/pixel size in image-space pixels. Larger = chunkier dither. Default 1. */
  pixelSize?: number;
  className?: string;
};

// Ordered Bayer 4x4 threshold matrix, normalized to 0..1.
// Classic ordered-dither pattern — gives that crosshatch / printed-zine feel
// instead of error-diffusion's grainier look. Better for photos with detail.
const BAYER_4X4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16));

const ASSEMBLE_MS = 1300; // how long the "build from pixels" animation runs

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// Precomputed dither for one image: the on/off mask + a per-pixel reveal order
// (so the animation can pop pixels in over time) + the scratch canvas to scale from.
type Prepared = {
  sampleW: number;
  sampleH: number;
  on: Uint8Array; // 1 = accent pixel, 0 = background pixel
  reveal: Float32Array; // 0..1 — pixel appears once progress passes this
  off: HTMLCanvasElement;
  offCtx: CanvasRenderingContext2D;
  outW: number;
  outH: number;
  accentRgb: [number, number, number];
  bgAlpha: number;
};

/** Sample + dither `img` once, returning the mask/reveal data the animation replays. */
function prepare(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  opts: { width: number; height: number; accent: string; pixelSize: number; bgAlpha: number },
): Prepared | null {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // Sample the image at a lower resolution so the dither pattern reads.
  const sampleW = Math.max(8, Math.round(opts.width / opts.pixelSize));
  const sampleH = Math.max(8, Math.round(opts.height / opts.pixelSize));

  const off = document.createElement("canvas");
  off.width = sampleW;
  off.height = sampleH;
  const offCtx = off.getContext("2d");
  if (!offCtx) return null;

  // Fit image inside the sample bounds preserving aspect ratio.
  const ar = img.naturalWidth / img.naturalHeight;
  const targetAr = sampleW / sampleH;
  let drawW = sampleW;
  let drawH = sampleH;
  let drawX = 0;
  let drawY = 0;
  if (ar > targetAr) {
    drawH = sampleH;
    drawW = drawH * ar;
    drawX = (sampleW - drawW) / 2;
  } else {
    drawW = sampleW;
    drawH = drawW / ar;
    drawY = (sampleH - drawH) / 2;
  }
  offCtx.imageSmoothingEnabled = true;
  offCtx.drawImage(img, drawX, drawY, drawW, drawH);

  const data = offCtx.getImageData(0, 0, sampleW, sampleH).data;
  const on = new Uint8Array(sampleW * sampleH);
  const reveal = new Float32Array(sampleW * sampleH);

  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const p = y * sampleW + x;
      const i = p * 4;
      const lum = (0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2]) / 255;
      // Gentle contrast lift so the dither isn't muddy — kept soft so the
      // pattern reads as texture rather than a harsh two-tone stamp.
      const contrasted = Math.max(0, Math.min(1, (lum - 0.5) * 1.05 + 0.5));
      on[p] = contrasted > BAYER_4X4[y & 3][x & 3] ? 1 : 0;
      // random per-pixel reveal order → scattered "materialise from pixels" dissolve
      reveal[p] = Math.random();
    }
  }

  const outW = Math.round(opts.width * dpr);
  const outH = Math.round(opts.height * dpr);
  canvas.width = outW;
  canvas.height = outH;
  canvas.style.width = opts.width + "px";
  canvas.style.height = opts.height + "px";

  return { sampleW, sampleH, on, reveal, off, offCtx, outW, outH, accentRgb: hexToRgb(opts.accent), bgAlpha: opts.bgAlpha };
}

/** Paint the dither at a given assemble progress (0 = empty, 1 = full image). */
function renderAt(canvas: HTMLCanvasElement, p: Prepared, progress: number) {
  const { sampleW, sampleH, on, reveal, off, offCtx, outW, outH, accentRgb, bgAlpha } = p;
  const [aR, aG, aB] = accentRgb;
  const offBg = Math.round(255 * bgAlpha);
  const imageData = offCtx.createImageData(sampleW, sampleH);
  const d = imageData.data;
  for (let idx = 0; idx < sampleW * sampleH; idx++) {
    const i = idx * 4;
    if (progress >= reveal[idx]) {
      if (on[idx]) {
        d[i] = aR;
        d[i + 1] = aG;
        d[i + 2] = aB;
        d[i + 3] = 255;
      } else {
        d[i + 3] = offBg; // rgb already 0
      }
    } // else: not yet assembled → stays fully transparent
  }
  offCtx.putImageData(imageData, 0, 0);

  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.clearRect(0, 0, outW, outH);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(off, 0, 0, outW, outH);
}

export function DitheredPhoto({
  src,
  alt,
  width = 340,
  height = 440,
  accent = "#a3e635",
  bgAlpha = 0,
  pixelSize = 2,
  className,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const figureRef = useRef<HTMLElement>(null);
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const figure = figureRef.current;
    if (!canvas || !figure) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    let prepared: Prepared | null = null;
    let visible = false;
    let assembled = false;
    let raf = 0;

    // progress drives the dither: 1 = full dither (no photo), 0 = dither gone
    // (color photo shows through). One tween handles both the scroll-in assemble
    // and the hover dissolve, so they interrupt each other cleanly.
    let current = 0;
    let from = 0;
    let to = 0;
    let start = 0;
    let dur = 1;
    const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = () => {
      const t = dur <= 0 ? 1 : Math.min(1, (performance.now() - start) / dur);
      current = from + (to - from) * easeOut(t);
      if (prepared) renderAt(canvas, prepared, current);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    const tweenTo = (target: number, ms: number) => {
      from = current;
      to = target;
      start = performance.now();
      dur = reduce ? 0 : ms;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    // re-randomise the per-pixel order so each hover scatters/reshuffles freshly
    const reshuffle = () => {
      if (!prepared) return;
      for (let i = 0; i < prepared.reveal.length; i++) prepared.reveal[i] = Math.random();
    };

    const assemble = () => {
      if (assembled || !prepared || !visible) return;
      assembled = true;
      tweenTo(1, ASSEMBLE_MS); // build up from pixels
    };

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      prepared = prepare(canvas, img, { width, height, accent, pixelSize, bgAlpha });
      setLoaded(true);
      if (prepared) renderAt(canvas, prepared, 0); // start empty, no flash
      assemble();
    };
    img.onerror = () => setErrored(true);
    img.src = src;

    // assemble when the photo scrolls into view (About is below the fold)
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          visible = true;
          assemble();
        }
      },
      { threshold: 0.25 },
    );
    io.observe(figure);

    // hover: run the dither out → reveal the real photo; reverse on leave
    const onEnter = () => {
      if (!prepared || !assembled) return;
      reshuffle();
      tweenTo(0, 600);
    };
    const onLeave = () => {
      if (!prepared) return;
      tweenTo(1, 750);
    };
    figure.addEventListener("pointerenter", onEnter);
    figure.addEventListener("pointerleave", onLeave);

    return () => {
      img.onload = null;
      img.onerror = null;
      cancelAnimationFrame(raf);
      io.disconnect();
      figure.removeEventListener("pointerenter", onEnter);
      figure.removeEventListener("pointerleave", onLeave);
    };
  }, [src, width, height, accent, pixelSize, bgAlpha]);

  return (
    <figure
      ref={figureRef}
      className={cn(
        "group/photo relative overflow-hidden rounded-md border border-line-soft bg-bg-2/40",
        className,
      )}
      style={{ width, height }}
    >
      {/* loading shimmer */}
      {!loaded && !errored && (
        <div className="absolute inset-0 animate-pulse bg-bg-2/60" aria-hidden="true" />
      )}

      {/* color photo — sits underneath, fades in on hover */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        className="pointer-events-none absolute inset-0 size-full select-none object-cover opacity-0 transition-opacity duration-700 ease-out group-hover/photo:opacity-100"
        onError={() => setErrored(true)}
      />

      {/* dithered canvas on top, hides on hover */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={cn(
          // hover dissolve is driven per-pixel in JS, not via opacity
          "relative block size-full transition-opacity duration-700 ease-out",
          !loaded && "opacity-0",
        )}
        style={{ imageRendering: "pixelated" }}
      />

      {errored && (
        <div className="absolute inset-0 flex items-center justify-center px-4 text-center font-mono text-[10px] lowercase tracking-[0.06em] text-fg-dim">
          add a photo at <br />
          <code className="mt-1 text-fg-muted">{src}</code>
        </div>
      )}

      {/* tiny caption that reveals on hover */}
      <figcaption className="pointer-events-none absolute bottom-2 left-2 right-2 flex items-center justify-between rounded-sm bg-bg/70 px-2 py-1 font-mono text-[10px] lowercase tracking-[0.06em] text-fg-muted opacity-0 backdrop-blur-sm transition-opacity duration-500 group-hover/photo:opacity-100">
        <span>{alt}</span>
        <span className="text-fg-dim">hover · color</span>
      </figcaption>
    </figure>
  );
}
