"use client";

import { useEffect, useRef } from "react";
import { Application, Sprite, Texture, Filter, GlProgram } from "pixi.js";

type Props = { accent?: string; className?: string };

const BALLS = 6;

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
vec2 filterTextureCoord(void) { return aPosition * (uOutputFrame.zw * uInputSize.zw); }
void main(void) { gl_Position = filterVertexPosition(); vTextureCoord = filterTextureCoord(); }
`;

const FRAG = /* glsl */ `#version 300 es
precision highp float;
in vec2 vTextureCoord;
uniform sampler2D uTexture;
uniform vec2 uResolution;
uniform float uTime;
uniform vec3 uAccent;
uniform vec4 uBalls[${BALLS}]; // xy = px pos, z = radius px
out vec4 fragColor;

float field(vec2 p) {
  float s = 0.0;
  for (int i = 0; i < ${BALLS}; i++) {
    vec2 d = p - uBalls[i].xy;
    float r = uBalls[i].z;
    s += (r * r) / max(dot(d, d), 1.0);
  }
  return s;
}

void main() {
  vec2 p = vTextureCoord * uResolution;
  float f = field(p);
  float mask = smoothstep(0.80, 1.04, f);
  if (mask < 0.002) { fragColor = vec4(0.0); return; }

  // surface normal from the field gradient, faked into 3D
  float e = 1.6;
  float fx = field(p + vec2(e, 0.0)) - field(p - vec2(e, 0.0));
  float fy = field(p + vec2(0.0, e)) - field(p - vec2(0.0, e));
  vec3 n = normalize(vec3(-fx, -fy, 0.85));

  vec3 viewDir = vec3(0.0, 0.0, 1.0);
  float fres = pow(1.0 - clamp(dot(n, viewDir), 0.0, 1.0), 2.2);

  // iridescent thin-film sheen (the "переливы")
  vec3 irid = 0.5 + 0.5 * cos(6.28318 * (fres * 1.35 + n.x * 0.6 + n.y * 0.25 + uTime * 0.04 + vec3(0.0, 0.33, 0.67)));

  // fake chrome environment: vertical gradient sampled by the normal
  float envT = clamp(n.y * 0.5 + 0.5 + n.x * 0.18, 0.0, 1.0);
  vec3 env = mix(vec3(0.035, 0.045, 0.07), vec3(0.58, 0.66, 0.78), envT);
  // a brighter band near the top for a "studio light" streak
  env += smoothstep(0.7, 1.0, envT) * 0.25;

  // specular hot spot
  vec3 lightDir = normalize(vec3(0.42, 0.7, 0.85));
  float spec = pow(max(dot(reflect(-lightDir, n), viewDir), 0.0), 36.0);

  vec3 col = env;
  col = mix(col, irid, 0.42 + 0.38 * fres);
  col += vec3(1.0) * spec * 1.15;

  // accent kiss in the iridescence + a green rim at the silhouette
  col = mix(col, col * (0.55 + uAccent * 1.1), 0.14);
  col += uAccent * fres * 0.5;

  // depth: darken the interior a touch
  col *= 0.82 + 0.3 * (1.0 - fres);

  fragColor = vec4(col, mask);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function LiquidMetal({ accent = "#a3e635", className }: Props) {
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

    // simulation
    type Ball = { x: number; y: number; vx: number; vy: number; ox: number; oy: number; r: number; ph: number };
    const balls: Ball[] = [];
    const data = new Float32Array(BALLS * 4);
    const mouse = { x: -9999, y: -9999, px: -9999, py: -9999, vx: 0, vy: 0, on: 0 };

    const seed = (w: number, h: number) => {
      balls.length = 0;
      const cx = w / 2;
      const cy = h / 2;
      const R = Math.min(w, h) * 0.16;
      const rad = Math.min(w, h) * 0.135;
      for (let i = 0; i < BALLS; i++) {
        const a = (i / BALLS) * Math.PI * 2;
        const ox = Math.cos(a) * R * (i === 0 ? 0 : 1);
        const oy = Math.sin(a) * R * (i === 0 ? 0 : 1);
        balls.push({
          x: cx + ox,
          y: cy + oy,
          vx: 0,
          vy: 0,
          ox,
          oy,
          r: rad * (i === 0 ? 1.15 : 0.85 + Math.random() * 0.25),
          ph: Math.random() * Math.PI * 2,
        });
      }
    };

    function safeDestroy(a: Application) {
      try {
        a.destroy(true, { children: true, texture: false });
      } catch {
        /* partially-inited */
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
        antialias: true,
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
      seed(w, h);

      filter = new Filter({
        glProgram: GlProgram.from({ vertex: VERT, fragment: FRAG }),
        resources: {
          metalUniforms: {
            uResolution: { type: "vec2<f32>", value: new Float32Array([w, h]) },
            uTime: { type: "f32", value: 0 },
            uAccent: { type: "vec3<f32>", value: new Float32Array(hexToRgb(accent)) },
            uBalls: { type: "vec4<f32>", value: data, size: BALLS },
          },
        },
      });

      sprite = new Sprite(Texture.WHITE);
      sprite.width = w;
      sprite.height = h;
      sprite.filters = [filter];
      app.stage.addChild(sprite);

      onMove = (e: PointerEvent) => {
        const rect = host.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        mouse.on = 1;
      };
      onLeave = () => {
        mouse.on = 0;
      };
      window.addEventListener("pointermove", onMove, { passive: true });
      window.addEventListener("pointerleave", onLeave);

      ro = new ResizeObserver(() => {
        if (!app || !sprite || !filter) return;
        const W = app.renderer.width / app.renderer.resolution;
        const H = app.renderer.height / app.renderer.resolution;
        sprite.width = W;
        sprite.height = H;
        const u = filter.resources.metalUniforms.uniforms.uResolution as Float32Array;
        u[0] = W;
        u[1] = H;
        seed(W, H);
      });
      ro.observe(host);

      app.ticker.add((ticker) => {
        if (!app || !filter) return;
        const dt = Math.min(ticker.deltaTime, 2);
        const W = app.renderer.width / app.renderer.resolution;
        const H = app.renderer.height / app.renderer.resolution;
        const u = filter.resources.metalUniforms.uniforms as Record<string, unknown>;
        const t = ((u.uTime as number) ?? 0) + dt / 60;
        u.uTime = t;

        // mouse velocity (for "cut harder when swiping fast")
        if (mouse.px > -1000 && mouse.on) {
          mouse.vx = mouse.x - mouse.px;
          mouse.vy = mouse.y - mouse.py;
        } else {
          mouse.vx *= 0.8;
          mouse.vy *= 0.8;
        }
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        const mouseSpeed = Math.hypot(mouse.vx, mouse.vy);

        const anchorX = W / 2 + Math.sin(t * 0.3) * W * 0.04;
        const anchorY = H / 2 + Math.cos(t * 0.23) * H * 0.05;
        const repelR = Math.min(W, H) * 0.42;

        for (let i = 0; i < balls.length; i++) {
          const b = balls[i];
          // breathing home target so the mass gently churns
          const tx = anchorX + b.ox * (1 + 0.12 * Math.sin(t * 0.6 + b.ph));
          const ty = anchorY + b.oy * (1 + 0.12 * Math.cos(t * 0.5 + b.ph));
          // spring back = surface tension / recombine
          b.vx += (tx - b.x) * 0.012 * dt;
          b.vy += (ty - b.y) * 0.012 * dt;

          // mouse repulsion = cut / split
          if (mouse.on) {
            const dx = b.x - mouse.x;
            const dy = b.y - mouse.y;
            const d = Math.hypot(dx, dy) || 1;
            if (d < repelR) {
              const force = (1 - d / repelR) * (0.6 + mouseSpeed * 0.12);
              b.vx += (dx / d) * force * dt * 6;
              b.vy += (dy / d) * force * dt * 6;
            }
          }

          b.vx *= 0.9;
          b.vy *= 0.9;
          b.x += b.vx * dt;
          b.y += b.vy * dt;

          data[i * 4 + 0] = b.x;
          data[i * 4 + 1] = b.y;
          data[i * 4 + 2] = b.r;
          data[i * 4 + 3] = 0;
        }
      });
    })();

    return () => {
      disposed = true;
      if (onMove) window.removeEventListener("pointermove", onMove);
      if (onLeave) window.removeEventListener("pointerleave", onLeave);
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
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}

export default LiquidMetal;
