"use client";

import { useEffect, useRef } from "react";
import {
  Application,
  Sprite,
  Texture,
  Filter,
  GlProgram,
} from "pixi.js";

type Props = {
  /** CSS hex like "#a3e635" */
  accent?: string;
  className?: string;
};

const VERT = /* glsl */ `#version 300 es
precision highp float;

in vec2 aPosition;
out vec2 vTextureCoord;

uniform vec4 uInputSize;
uniform vec4 uOutputFrame;
uniform vec4 uOutputTexture;

vec4 filterVertexPosition(void) {
  vec2 position = aPosition * uOutputFrame.zw + uOutputFrame.xy;
  position.x = position.x * (2.0 / uOutputTexture.x) - 1.0;
  position.y = position.y * (2.0 * uOutputTexture.z / uOutputTexture.y) - uOutputTexture.z;
  return vec4(position, 0.0, 1.0);
}

vec2 filterTextureCoord(void) {
  return aPosition * (uOutputFrame.zw * uInputSize.zw);
}

void main(void) {
  gl_Position = filterVertexPosition();
  vTextureCoord = filterTextureCoord();
}
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;

in vec2 vTextureCoord;
uniform sampler2D uTexture;

uniform vec2 uResolution;
uniform vec2 uMouse;
uniform float uMouseActive;
uniform vec3 uAccent;
uniform float uTime;

out vec4 fragColor;

// ─── hash + value noise ──────────────────────────────────────
float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float sum = 0.0;
  float amp = 0.5;
  mat2 rot = mat2(0.8, -0.6, 0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    sum += amp * vnoise(p);
    p = rot * p * 2.0;
    amp *= 0.5;
  }
  return sum;
}

// ─── grain ───────────────────────────────────────────────────
float grain(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
  vec2 p = vTextureCoord * uResolution;

  // normalized coords for noise — independent of pixel density
  vec2 uv = p / max(uResolution.x, uResolution.y);
  float t = uTime * 0.08;

  // ─── aurora: domain-warped FBM noise ───────────────────────
  vec2 q = vec2(
    fbm(uv * 2.0 + vec2(0.0, t)),
    fbm(uv * 2.0 + vec2(5.2, t * 0.9))
  );
  vec2 r = vec2(
    fbm(uv * 2.0 + 3.0 * q + vec2(1.7, 9.2) + t),
    fbm(uv * 2.0 + 3.0 * q + vec2(8.3, 2.8) + t * 1.1)
  );
  float aurora = fbm(uv * 2.0 + 3.5 * r);

  // remap aurora to give it more contrast at the peaks
  aurora = smoothstep(0.35, 0.85, aurora);

  // ─── dot grid ──────────────────────────────────────────────
  float gridSize = 26.0;
  vec2 gp = p / gridSize;
  vec2 g = fract(gp) - 0.5;
  // distance to nearest grid point in pixel space
  float dotR = length(g) * gridSize;
  float gridDot = smoothstep(2.2, 0.6, dotR);

  // dots brighten where the aurora field is dense
  float dotBright = 0.18 + aurora * 0.65;

  // ─── mouse glow ────────────────────────────────────────────
  vec2 mDir = (p - uMouse);
  float mDist = length(mDir);
  // wider, softer falloff so the glow reads as a real pool of light
  float mGlow = exp(-mDist * mDist / 42000.0);
  // distance-modulated dot brightness (cursor "wakes up" nearby dots)
  float mLocal = exp(-mDist * mDist / 120000.0);

  // ─── compose ───────────────────────────────────────────────
  vec3 baseDot   = vec3(0.32, 0.34, 0.40);
  // near the cursor, dots shift hard toward the accent green
  vec3 dotColor  = mix(baseDot, uAccent, 0.35 + mLocal * uMouseActive * 0.85);
  vec3 col       = vec3(0.0);

  // dot grid layer — brighten dots a touch where the cursor is
  col += gridDot * dotColor * dotBright * (0.55 + mLocal * uMouseActive * 0.5);

  // soft aurora wash (extremely faint, only at noise peaks)
  col += uAccent * aurora * aurora * 0.05;

  // cursor glow on top — stronger green pool
  col += uAccent * mGlow * uMouseActive * 0.42;

  // very faint film grain
  float gr = grain(p + uTime * 13.0) - 0.5;
  col += gr * 0.006;

  // vignette: keep edges dark so it feels held by the page
  vec2 vc = (p / uResolution) - 0.5;
  float vig = 1.0 - smoothstep(0.30, 0.85, length(vc));
  col *= 0.45 + vig * 0.55;

  // alpha: bg shows through everywhere, dots add a little opacity
  float a = clamp(max(max(col.r, col.g), col.b) * 1.6, 0.0, 0.85);
  fragColor = vec4(col, a);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function PixiMetaballHero({
  accent = "#a3e635",
  className,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let inited = false;
    let app: Application | null = null;
    let filter: Filter | null = null;
    let sprite: Sprite | null = null;
    let ro: ResizeObserver | null = null;
    let onMove: ((e: PointerEvent) => void) | null = null;
    let onLeave: (() => void) | null = null;
    let onTouch: ((e: TouchEvent) => void) | null = null;
    let onTouchEnd: (() => void) | null = null;

    // Touch devices have no cursor, so the glow would sit dead. On those we
    // drive the glow with a slow auto-orbit + scroll position so it stays alive,
    // and let a finger drag override it directly.
    const isTouch =
      typeof window !== "undefined" &&
      window.matchMedia?.("(pointer: coarse)").matches;

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: 0, touching: 0 };

    function safeDestroy(a: Application) {
      try {
        a.destroy(true, { children: true, texture: false });
      } catch (err) {
        if (process.env.NODE_ENV !== "production") {
          console.warn("[PixiMetaballHero] destroy threw:", err);
        }
      }
    }

    (async () => {
      app = new Application();
      const canvas = document.createElement("canvas");
      host.appendChild(canvas);

      await app.init({
        canvas,
        resizeTo: host,
        backgroundAlpha: 0,
        antialias: false,
        preference: "webgl",
        powerPreference: "high-performance",
        resolution: Math.min(window.devicePixelRatio, 2),
        autoDensity: true,
      });

      if (disposed) {
        safeDestroy(app);
        app = null;
        return;
      }
      inited = true;

      const w = app.renderer.width / app.renderer.resolution;
      const h = app.renderer.height / app.renderer.resolution;

      filter = new Filter({
        glProgram: GlProgram.from({ vertex: VERT, fragment: FRAG }),
        resources: {
          metaUniforms: {
            uResolution: { type: "vec2<f32>", value: new Float32Array([w, h]) },
            uMouse: { type: "vec2<f32>", value: new Float32Array([w / 2, h / 2]) },
            uMouseActive: { type: "f32", value: 0 },
            uAccent: { type: "vec3<f32>", value: new Float32Array(hexToRgb(accent)) },
            uTime: { type: "f32", value: 0 },
          },
        },
      });

      sprite = new Sprite(Texture.WHITE);
      sprite.width = w;
      sprite.height = h;
      sprite.filters = [filter];
      app.stage.addChild(sprite);

      onMove = (e: PointerEvent) => {
        if (e.pointerType === "touch") return; // touch handled separately
        const rect = host.getBoundingClientRect();
        mouse.tx = e.clientX - rect.left;
        mouse.ty = e.clientY - rect.top;
        mouse.active = 1;
        mouse.touching = 0;
      };
      onLeave = () => {
        if (!isTouch) mouse.active = 0;
      };
      onTouch = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;
        const rect = host.getBoundingClientRect();
        mouse.tx = touch.clientX - rect.left;
        mouse.ty = touch.clientY - rect.top;
        mouse.touching = 1;
      };
      onTouchEnd = () => {
        mouse.touching = 0;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);
      if (isTouch) {
        window.addEventListener("touchmove", onTouch, { passive: true });
        window.addEventListener("touchstart", onTouch, { passive: true });
        window.addEventListener("touchend", onTouchEnd, { passive: true });
      }

      ro = new ResizeObserver(() => {
        if (!app || !sprite || !filter) return;
        const W = app.renderer.width / app.renderer.resolution;
        const H = app.renderer.height / app.renderer.resolution;
        sprite.width = W;
        sprite.height = H;
        const uRes = filter.resources.metaUniforms.uniforms.uResolution as Float32Array;
        uRes[0] = W;
        uRes[1] = H;
      });
      ro.observe(host);

      app.ticker.add((ticker) => {
        if (!app || !filter) return;
        const dt = ticker.deltaTime;
        const W = app.renderer.width / app.renderer.resolution;
        const H = app.renderer.height / app.renderer.resolution;
        const uniforms = filter.resources.metaUniforms.uniforms as Record<string, unknown>;

        const t = ((uniforms.uTime as number) ?? 0) + dt / 60;
        uniforms.uTime = t;

        let targetActive = mouse.active;

        if (isTouch) {
          if (mouse.touching) {
            // finger drag — follow it directly, full glow
            targetActive = 1;
          } else {
            // ambient: slow orbit, biased vertically by scroll so the orbs
            // visibly drift as the user scrolls the hero
            const cx = W * 0.5;
            const cy = H * 0.5;
            const scrollProg = Math.min(
              1,
              Math.max(0, (window.scrollY || 0) / Math.max(1, H)),
            );
            mouse.tx = cx + Math.cos(t * 0.45) * W * 0.3;
            mouse.ty =
              cy + Math.sin(t * 0.6) * H * 0.16 + (scrollProg - 0.4) * H * 0.7;
            targetActive = 0.65; // always-on baseline glow on touch
          }
        }

        if (mouse.tx > -1000) {
          const lerp = mouse.touching ? 0.18 : 0.08;
          mouse.x += (mouse.tx - mouse.x) * lerp;
          mouse.y += (mouse.ty - mouse.y) * lerp;
        }
        const uMouse = uniforms.uMouse as Float32Array;
        uMouse[0] = mouse.x;
        uMouse[1] = mouse.y;
        const curActive = (uniforms.uMouseActive as number) ?? 0;
        uniforms.uMouseActive = curActive + (targetActive - curActive) * 0.06;
      });
    })();

    return () => {
      disposed = true;
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onLeave) window.removeEventListener("pointerleave", onLeave);
      if (onTouch) {
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchstart", onTouch);
      }
      if (onTouchEnd) window.removeEventListener("touchend", onTouchEnd);
      if (ro) ro.disconnect();
      if (app && inited) {
        safeDestroy(app);
        app = null;
      }
    };
  }, [accent]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}

export default PixiMetaballHero;
