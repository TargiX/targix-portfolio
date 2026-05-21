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

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [255, 255, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** Draw `img` into the canvas with 1-bit Bayer dither. Mutates the canvas in place. */
function ditherIntoCanvas(
  canvas: HTMLCanvasElement,
  img: HTMLImageElement,
  opts: { width: number; height: number; accent: string; pixelSize: number; bgAlpha: number },
) {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  // We sample the image at a lower resolution so the dither pattern reads.
  const sampleW = Math.max(8, Math.round(opts.width / opts.pixelSize));
  const sampleH = Math.max(8, Math.round(opts.height / opts.pixelSize));

  // Offscreen canvas to downsample the source.
  const off = document.createElement("canvas");
  off.width = sampleW;
  off.height = sampleH;
  const offCtx = off.getContext("2d");
  if (!offCtx) return;

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

  const imageData = offCtx.getImageData(0, 0, sampleW, sampleH);
  const data = imageData.data;
  const [aR, aG, aB] = hexToRgb(opts.accent);

  // Apply Bayer dither pixel by pixel.
  for (let y = 0; y < sampleH; y++) {
    for (let x = 0; x < sampleW; x++) {
      const i = (y * sampleW + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Perceptual luma — Rec. 709.
      const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
      // Slight contrast lift so the dither isn't muddy.
      const contrasted = Math.max(0, Math.min(1, (lum - 0.5) * 1.25 + 0.5));
      const threshold = BAYER_4X4[y & 3][x & 3];
      const on = contrasted > threshold;
      if (on) {
        data[i] = aR;
        data[i + 1] = aG;
        data[i + 2] = aB;
        data[i + 3] = 255;
      } else {
        data[i] = 0;
        data[i + 1] = 0;
        data[i + 2] = 0;
        data[i + 3] = Math.round(255 * opts.bgAlpha);
      }
    }
  }
  offCtx.putImageData(imageData, 0, 0);

  // Upsample the dithered low-res buffer to the canvas at devicePixelRatio resolution,
  // using pixelated rendering to keep dots crisp.
  const outW = Math.round(opts.width * dpr);
  const outH = Math.round(opts.height * dpr);
  canvas.width = outW;
  canvas.height = outH;
  canvas.style.width = opts.width + "px";
  canvas.style.height = opts.height + "px";
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
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
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      ditherIntoCanvas(canvas, img, { width, height, accent, pixelSize, bgAlpha });
      setLoaded(true);
    };
    img.onerror = () => setErrored(true);
    img.src = src;

    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [src, width, height, accent, pixelSize, bgAlpha]);

  return (
    <figure
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
          "relative block size-full transition-opacity duration-700 ease-out group-hover/photo:opacity-0",
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
