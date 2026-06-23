"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import { hexToRgb } from "./three-hero-utils";

const BG_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}
`;

const BG_FRAG = /* glsl */ `
precision mediump float;
varying vec2 vUv;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uMouseActive;
uniform vec3  uAccent;
uniform vec3  uAccent2;
uniform vec3  uPageBg;
uniform vec3  uBaseDot;
uniform float uLight;
uniform float uTime;

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float softBlob(vec2 p, vec2 c, float r) {
  float d = length(p - c);
  return exp(-(d * d) / max(0.0001, r));
}

void main() {
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 aspect = vec2(uResolution.x / max(1.0, uResolution.y), 1.0);
  vec2 uv = (vUv - 0.5) * aspect;
  float t = uTime * 0.16;

  vec2 c1 = vec2(0.34 + 0.06 * sin(t * 1.4), 0.08 + 0.05 * cos(t * 1.1)) * aspect;
  vec2 c2 = vec2(0.18 + 0.05 * cos(t * 0.9), -0.24 + 0.04 * sin(t * 1.7)) * aspect;
  vec2 c3 = vec2(0.54 + 0.04 * sin(t * 1.9), -0.03 + 0.06 * cos(t * 1.3)) * aspect;

  float a1 = softBlob(uv, c1 - 0.5 * aspect, 0.16);
  float a2 = softBlob(uv, c2 - 0.5 * aspect, 0.12);
  float a3 = softBlob(uv, c3 - 0.5 * aspect, 0.20);
  float side = smoothstep(0.22, 0.94, vUv.x);

  vec3 cMint = vec3(0.70, 0.98, 0.76);
  vec3 cAqua = vec3(0.48, 0.93, 0.88);
  vec3 cBlue = vec3(0.58, 0.78, 0.98);
  vec3 aurora = cMint * a1 + cAqua * a2 + cBlue * a3;
  vec3 bg = mix(uPageBg, uPageBg + aurora * mix(0.20, 0.82, uLight), side);

  float gridSize = 26.0;
  vec2 g = fract(p / gridSize) - 0.5;
  float gridDot = smoothstep(2.2, 0.55, length(g) * gridSize);
  float wave = 0.55 + 0.45 * sin((p.x + p.y) * 0.006 + uTime * 0.45);
  vec3 dotColor = mix(uBaseDot, mix(uAccent, uAccent2, wave), 0.34);
  bg += gridDot * dotColor * mix(0.10, 0.19, uLight);

  float mDist = length(p - uMouse);
  float mGlow = exp(-mDist * mDist / 52000.0) * uMouseActive;
  bg += mix(uAccent * 0.12, vec3(0.55, 0.98, 0.70) * 0.18, uLight) * mGlow;

  float grain = hash21(p + uTime * 17.0) - 0.5;
  bg += grain * 0.004;

  vec2 vc = vUv - 0.5;
  float vignette = 1.0 - smoothstep(0.58, 0.96, length(vc)) * mix(0.28, 0.06, uLight);
  gl_FragColor = vec4(bg * vignette, 1.0);
}
`;

type Props = {
  accent?: string;
  accent2?: string;
  surface?: "light" | "dark";
  className?: string;
  onStatus?: (status: "ready" | "failed") => void;
};

export function WebglHeroBackground({
  accent = "#a3e635",
  accent2 = "#2dd4bf",
  surface = "dark",
  className,
  onStatus,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    let raf = 0;
    let visible = true;
    let ready = false;
    let lastPaint = 0;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const accentRgb = hexToRgb(accent);
    const accent2Rgb = hexToRgb(accent2);
    const isLightSurface = surface === "light";
    const pageBgRgb = isLightSurface ? [0.981, 0.981, 0.984] : [0.052, 0.055, 0.062];
    const baseDotRgb = isLightSurface ? [0.50, 0.53, 0.58] : [0.32, 0.34, 0.4];

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: false,
        powerPreference: "low-power",
      });
    } catch {
      onStatus?.("failed");
      return;
    }

    if (!renderer.getContext()) {
      onStatus?.("failed");
      return;
    }

    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);

    let W = host.clientWidth || window.innerWidth;
    let H = host.clientHeight || window.innerHeight;
    const pr = Math.min(window.devicePixelRatio || 1, 1.35);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    renderer.setSize(W, H, false);

    const scene = new THREE.Scene();
    const camera = new THREE.Camera();
    const geo = new THREE.PlaneGeometry(2, 2);
    const mat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: new THREE.Vector2(W, H) },
        uMouse: { value: new THREE.Vector2(W / 2, H / 2) },
        uMouseActive: { value: 0 },
        uAccent: { value: new THREE.Vector3(...accentRgb) },
        uAccent2: { value: new THREE.Vector3(...accent2Rgb) },
        uPageBg: { value: new THREE.Vector3(...pageBgRgb) },
        uBaseDot: { value: new THREE.Vector3(...baseDotRgb) },
        uLight: { value: isLightSurface ? 1 : 0 },
        uTime: { value: reduce ? 2.4 : 0 },
      },
    });
    scene.add(new THREE.Mesh(geo, mat));

    const mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, active: 0 };
    const start = performance.now();

    const paint = (now: number) => {
      if (disposed) return;

      const minFrameMs = reduce ? Infinity : 1000 / 30;
      if (!reduce && now - lastPaint < minFrameMs) {
        raf = requestAnimationFrame(paint);
        return;
      }
      lastPaint = now;

      const elapsed = reduce ? 2.4 : (now - start) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;
      const active = mat.uniforms.uMouseActive.value as number;
      mat.uniforms.uMouseActive.value = active + (mouse.active - active) * 0.06;
      mat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      mat.uniforms.uTime.value = elapsed;
      renderer.render(scene, camera);

      if (!ready) {
        ready = true;
        requestAnimationFrame(() => onStatus?.("ready"));
      }

      if (!reduce && visible) {
        raf = requestAnimationFrame(paint);
      } else {
        raf = 0;
      }
    };

    const queuePaint = () => {
      if (!raf && !disposed) raf = requestAnimationFrame(paint);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      mouse.tx = event.clientX - rect.left;
      mouse.ty = event.clientY - rect.top;
      mouse.active = 1;
      queuePaint();
    };
    const onLeave = () => {
      mouse.active = 0;
      queuePaint();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    const resize = new ResizeObserver(() => {
      W = host.clientWidth || W;
      H = host.clientHeight || H;
      renderer.setSize(W, H, false);
      mat.uniforms.uResolution.value.set(W, H);
      mouse.x = mouse.tx = W / 2;
      mouse.y = mouse.ty = H / 2;
      queuePaint();
    });
    resize.observe(host);

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) queuePaint();
      },
      { rootMargin: "100px 0px" },
    );
    visibility.observe(host);

    queuePaint();

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      resize.disconnect();
      visibility.disconnect();
      geo.dispose();
      mat.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [accent, accent2, surface, onStatus]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, transform: "translateZ(0)" }}
    />
  );
}

export default WebglHeroBackground;
