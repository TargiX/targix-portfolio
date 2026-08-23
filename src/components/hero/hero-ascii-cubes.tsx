"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

import {
  CUBE_AXES,
  CUBE_EXPLODE,
  CUBE_GAP,
  CUBE_TWIST_DUR,
  createCubeCluster,
  easeInOut,
} from "./three-hero-cubes";

const FS_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// cheap animated haze rendered into the refraction feed — the glass cubes need
// *something* behind them to bend, otherwise the faces read as flat black and
// the ASCII pass has no luminance to quantise.
const REFRACT_BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3  uAccent;
uniform vec3  uAccent2;
uniform float uTime;
uniform float uLight;

float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float s=0.0,a=0.5;mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<3;i++){s+=a*vnoise(p);p=r*p*2.0;a*=0.5;}return s;}

void main(){
  float t = uTime * 0.06;
  float a = fbm(vUv * 2.2 + vec2(t, -t * 0.7));
  float b = fbm(vUv * 3.1 - vec2(t * 1.3, t));
  vec3 base = mix(vec3(0.06, 0.07, 0.075), vec3(0.14, 0.17, 0.18), a);
  vec3 col = base + uAccent * pow(b, 2.0) * 0.75 + uAccent2 * pow(a, 2.4) * 0.55;
  col = mix(col, vec3(0.90, 0.94, 0.92) + uAccent * 0.06, uLight);
  gl_FragColor = vec4(col, 1.0);
}
`;

const CUBE_VERT = /* glsl */ `
varying vec3 vN;
varying vec3 vP;
void main(){
  vN = normalize(normalMatrix * normal);
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  vP = mv.xyz;
  gl_Position = projectionMatrix * mv;
}
`;

const CUBE_FRAG = /* glsl */ `
precision highp float;
varying vec3 vN;
varying vec3 vP;
uniform sampler2D uScene;
uniform vec2  uRes;
uniform vec3  uAccent;
uniform float uLight;
uniform float uReveal;

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(-vP);
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

  vec2 suv = gl_FragCoord.xy / uRes;
  vec3 refr = texture2D(uScene, clamp(suv + N.xy * 0.16, 0.002, 0.998)).rgb;
  vec3 refl = texture2D(uScene, clamp(suv - N.xy * 0.34, 0.002, 0.998)).rgb;
  vec3 col = mix(refr, refl, fres * 0.85);

  float facing = clamp(N.z * 0.5 + 0.5, 0.0, 1.0);
  col += uAccent * fres * mix(0.16, 0.05, uLight);
  col += mix(vec3(0.04, 0.045, 0.05), vec3(0.0), uLight);
  col *= mix(0.74, 0.9, uLight) + mix(0.26, 0.1, uLight) * facing;
  vec3 rim = vec3(0.7, 0.74, 0.8);
  col += rim * pow(fres, 2.0) * mix(0.5, 0.32, uLight);
  col = clamp(col, 0.0, 1.0);

  float alpha = (0.85 + fres * 0.15) * uReveal;
  gl_FragColor = vec4(col, alpha);
}
`;

const GLOW_VERT = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const GLOW_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec3 uColor;
uniform float uIntensity;

void main() {
  vec2 uv = vUv * 2.0 - 1.0;
  float dist = length(uv);
  if (dist > 1.0) discard;
  float alpha = 1.0 - smoothstep(0.0, 1.0, dist);
  float glow = pow(alpha, 1.8) * 0.85;
  gl_FragColor = vec4(uColor * glow * uIntensity, glow * uIntensity);
}
`;

// the trendy bit: everything above renders into an offscreen target, and this
// pass re-draws it as a monospace glyph field. luminance picks the glyph,
// alpha keeps the field tight to the cluster so the DOM copy stays clean.
const ASCII_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
uniform sampler2D uGlyphs;
uniform vec2  uRes;
uniform float uCell;
uniform float uGlyphCount;
uniform vec3  uAccent;
uniform vec3  uAccent2;
uniform float uTime;
uniform float uLight;

float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}

void main(){
  vec2 px = vUv * uRes;
  vec2 cell = floor(px / uCell);
  vec2 cellUv = (cell + 0.5) * uCell / uRes;
  vec4 src = texture2D(uScene, cellUv);

  float lum = dot(src.rgb, vec3(0.2126, 0.7152, 0.0722));
  float cov = smoothstep(0.08, 0.5, src.a);

  // contrast lift so faces spread across the glyph ramp instead of pooling
  // in the faint end, plus a slow per-cell shimmer so the field feels alive
  float n = hash21(cell);
  float l = pow(clamp(lum * 1.55, 0.0, 1.0), 0.8);
  l = clamp(l + 0.05 * sin(uTime * 1.6 + n * 6.28318) * cov, 0.0, 1.0);

  float idx = floor(l * (uGlyphCount - 1.0) + 0.5);
  vec2 local = fract(px / uCell);
  float glyph = texture2D(uGlyphs, vec2((idx + local.x) / uGlyphCount, local.y)).a;

  // schematic palette: graphite body like the page's dot lattice, accent only
  // where the glass is actually bright (edges, specular) — kills the
  // green-rain association while keeping the accent meaningful
  vec3 graphite = mix(vec3(0.42, 0.45, 0.47), vec3(0.35, 0.38, 0.40), uLight);
  vec3 ink = mix(graphite, vec3(0.78, 0.82, 0.84), smoothstep(0.25, 0.7, l));
  ink = mix(ink, mix(uAccent, vec3(0.93, 0.98, 0.95), 0.25), smoothstep(0.62, 0.95, l));

  float aGlyph = glyph * cov * (0.38 + 0.62 * l);

  // a whisper of the raw glass render underneath, for depth
  vec4 raw = texture2D(uScene, vUv);
  float aRaw = raw.a * 0.10;

  float outA = aGlyph + aRaw * (1.0 - aGlyph);
  vec3 outC = (ink * aGlyph + raw.rgb * aRaw * (1.0 - aGlyph)) / max(outA, 1e-4);
  gl_FragColor = vec4(outC, outA);
}
`;

// glyph ramp, sparse → dense. Schematic vocabulary (dots, plus-marks, crosses)
// rather than a code stream — reads as a technical drawing, not Matrix rain.
const GLYPHS = " ··::++××##";

function makeGlyphAtlas() {
  const cell = 64;
  const canvas = document.createElement("canvas");
  canvas.width = cell * GLYPHS.length;
  canvas.height = cell;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#fff";
  ctx.font = `600 ${Math.round(cell * 0.78)}px ui-monospace, "GeistMono", Menlo, monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < GLYPHS.length; i++) {
    ctx.fillText(GLYPHS[i], i * cell + cell / 2, cell / 2 + cell * 0.04);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.minFilter = THREE.LinearFilter;
  tex.magFilter = THREE.LinearFilter;
  return tex;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

type Props = {
  className?: string;
};

export function HeroAsciiCubes({ className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    const rootStyles = getComputedStyle(document.documentElement);
    const accent = rootStyles.getPropertyValue("--accent").trim() || "#a3e635";
    const accent2 = rootStyles.getPropertyValue("--accent-2").trim() || "#2dd4bf";
    const dataTheme = document.documentElement.dataset.theme;
    const isLight =
      dataTheme === "light" ||
      (dataTheme !== "dark" && window.matchMedia?.("(prefers-color-scheme: light)").matches);
    const accentRgb = hexToRgb(accent);
    const accent2Rgb = hexToRgb(accent2);
    const uLight = isLight ? 1 : 0;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "high-performance" });
    } catch {
      return;
    }
    if (!renderer.getContext()) return;

    const glyphTex = makeGlyphAtlas();
    if (!glyphTex) {
      renderer.dispose();
      return;
    }

    // touch devices get a tighter pixel-ratio cap: three passes per frame add up
    const coarse = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const pr = Math.min(window.devicePixelRatio || 1, coarse ? 1.5 : 2);
    // offscreen targets at half res: the ASCII pass samples ~9px cells anyway,
    // so full-res glass buys nothing — this halves fragment work twice over
    const RT_SCALE = 0.5;
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    renderer.autoClear = false;
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);

    let W = host.clientWidth || window.innerWidth;
    let H = host.clientHeight || window.innerHeight;
    renderer.setSize(W, H, false);

    const makeRT = () =>
      new THREE.WebGLRenderTarget(
        Math.max(1, (W * pr * RT_SCALE) | 0),
        Math.max(1, (H * pr * RT_SCALE) | 0),
        {
          magFilter: THREE.LinearFilter,
          minFilter: THREE.LinearFilter,
        },
      );
    let feedRT = makeRT(); // refraction feed: haze + glow
    let cubesRT = makeRT(); // glass render, ascii-fied to screen

    const fsCamera = new THREE.Camera();
    const fsGeo = new THREE.PlaneGeometry(2, 2);

    const feedMat = new THREE.ShaderMaterial({
      vertexShader: FS_VERT,
      fragmentShader: REFRACT_BG_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uAccent: { value: new THREE.Vector3(...accentRgb) },
        uAccent2: { value: new THREE.Vector3(...accent2Rgb) },
        uTime: { value: 0 },
        uLight: { value: uLight },
      },
    });
    const feedScene = new THREE.Scene();
    feedScene.add(new THREE.Mesh(fsGeo, feedMat));

    const cubeMat = new THREE.ShaderMaterial({
      vertexShader: CUBE_VERT,
      fragmentShader: CUBE_FRAG,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      uniforms: {
        uScene: { value: feedRT.texture },
        // uRes must match the target the cubes render into (gl_FragCoord space)
        uRes: { value: new THREE.Vector2(W * pr * RT_SCALE, H * pr * RT_SCALE) },
        uAccent: { value: new THREE.Vector3(...accentRgb) },
        uLight: { value: uLight },
        uReveal: { value: 0 },
      },
    });

    const {
      camera: cubeCam,
      scene: cubeScene,
      group: cubeGroup,
      cubes,
      geometry: cubeGeo,
      place: placeCluster,
    } = createCubeCluster(cubeMat, W, H);

    const glowMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: false,
      uniforms: {
        uColor: { value: new THREE.Vector3(...accentRgb) },
        uIntensity: { value: 0.0 },
      },
    });
    const glowGeo = new THREE.PlaneGeometry(8, 8);
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    const glowScene = new THREE.Scene();
    glowScene.add(glowMesh);

    const CELL_CSS = 9; // glyph cell in CSS px
    const asciiMat = new THREE.ShaderMaterial({
      vertexShader: FS_VERT,
      fragmentShader: ASCII_FRAG,
      transparent: true,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uScene: { value: cubesRT.texture },
        uGlyphs: { value: glyphTex },
        uRes: { value: new THREE.Vector2(W * pr, H * pr) },
        uCell: { value: CELL_CSS * pr },
        uGlyphCount: { value: GLYPHS.length },
        uAccent: { value: new THREE.Vector3(...accentRgb) },
        uAccent2: { value: new THREE.Vector3(...accent2Rgb) },
        uTime: { value: 0 },
        uLight: { value: uLight },
      },
    });
    const asciiScene = new THREE.Scene();
    asciiScene.add(new THREE.Mesh(fsGeo, asciiMat));

    const layout = () => {
      const isMobile = W < 768;
      const compact = W < 1280; // laptop-ish: keep the cluster clear of the copy
      placeCluster(
        W,
        H,
        isMobile
          ? { fracX: 0.84, fracY: 0.19, scaleK: 0.13 }
          : compact
            ? { fracX: 0.77, fracY: 0.44, scaleK: 0.29 }
            : { fracX: 0.71, fracY: 0.45, scaleK: 0.44 },
      );
    };
    layout();

    // ── pointer ──
    const isTouch = window.matchMedia?.("(pointer: coarse)").matches ?? false;
    const mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, active: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
      mouse.active = 1;
    };
    const onLeave = () => {
      if (!isTouch) mouse.active = 0;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);

    const ro = new ResizeObserver(() => {
      if (disposed) return;
      W = host.clientWidth || W;
      H = host.clientHeight || H;
      renderer.setSize(W, H, false);
      feedRT.dispose();
      cubesRT.dispose();
      feedRT = makeRT();
      cubesRT = makeRT();
      cubeMat.uniforms.uScene.value = feedRT.texture;
      asciiMat.uniforms.uScene.value = cubesRT.texture;
      cubeMat.uniforms.uRes.value.set(W * pr * RT_SCALE, H * pr * RT_SCALE);
      asciiMat.uniforms.uRes.value.set(W * pr, H * pr);
      layout();
      if (reduce) {
        reduceFrames = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    });
    ro.observe(host);

    // reduced motion: paint the assembled cluster once, then stop the loop
    const REDUCE_T = 3.0;
    const start = performance.now() - (reduce ? REDUCE_T * 1000 : 0);
    let reduceFrames = 0;

    // pause the loop while the hero is off-screen
    let visible = true;
    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible && !disposed && !raf) {
          raf = requestAnimationFrame(tick);
        }
      },
      { rootMargin: "100px 0px" },
    );
    visibility.observe(host);

    // occasional calm layer twist
    const _q = new THREE.Quaternion();
    const _p = new THREE.Vector3();
    let twist: { axisIdx: number; layer: number; dir: number; t0: number; dur: number } | null = null;
    let nextTwistAt = 3.0;
    let scrollSmooth = 0;

    const raycaster = new THREE.Raycaster();
    const _ndc = new THREE.Vector2();
    const _plane = new THREE.Plane();
    const _cameraForward = new THREE.Vector3();
    const _intersectPoint = new THREE.Vector3();
    const _localIntersectPoint = new THREE.Vector3();
    const _pushVec = new THREE.Vector3();

    let raf = 0;
    const tick = () => {
      if (disposed) return;
      if (visible && (!reduce || reduceFrames < 8)) {
        raf = requestAnimationFrame(tick);
      } else {
        raf = 0;
      }
      reduceFrames++;
      const elapsed = reduce ? REDUCE_T : (performance.now() - start) / 1000;
      feedMat.uniforms.uTime.value = elapsed;
      asciiMat.uniforms.uTime.value = elapsed;

      mouse.x += (mouse.tx - mouse.x) * 0.08;
      mouse.y += (mouse.ty - mouse.y) * 0.08;

      // ── cluster: reveal, slow spin, breathe ──
      const reveal = 1 - Math.pow(1 - Math.min(1, elapsed / 1.1), 3);
      cubeMat.uniforms.uReveal.value = reveal;

      const mx = mouse.x / W - 0.5;
      const my = mouse.y / H - 0.5;
      cubeGroup.rotation.y = elapsed * 0.3 + mx * 0.8;
      cubeGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.22 + my * 0.5;
      cubeGroup.rotation.z = Math.sin(elapsed * 0.22) * 0.07;

      const spread = CUBE_GAP * (1.0 + 0.05 * Math.sin(elapsed * 1.1) + 0.12 * mouse.active);
      const popIn = 0.6 + 0.4 * reveal;

      // scroll explode (down) / reassemble (up)
      const scrollTarget = reduce ? 0 : Math.min(1, Math.max(0, (window.scrollY || 0) / Math.max(1, H * 0.85)));
      scrollSmooth += (scrollTarget - scrollSmooth) * 0.12;
      const atTop = scrollSmooth < 0.02;

      if (!atTop && twist) twist = null;
      if (atTop && !twist && reveal > 0.95 && elapsed >= nextTwistAt) {
        twist = {
          axisIdx: (Math.random() * 3) | 0,
          layer: [-1, 0, 1][(Math.random() * 3) | 0],
          dir: Math.random() < 0.5 ? 1 : -1,
          t0: elapsed,
          dur: CUBE_TWIST_DUR,
        };
      }

      let prog = 1;
      let angle = 0;
      if (twist) {
        prog = Math.min(1, (elapsed - twist.t0) / twist.dur);
        angle = twist.dir * (Math.PI / 2) * easeInOut(prog);
      }
      _q.setFromAxisAngle(twist ? CUBE_AXES[twist.axisIdx] : CUBE_AXES[0], angle);

      // hover bulge: raycast to the cluster plane
      _cameraForward.set(0, 0, 1).transformDirection(cubeCam.matrixWorld);
      _plane.setFromNormalAndCoplanarPoint(_cameraForward, cubeGroup.position);
      _ndc.set((mouse.x / W) * 2 - 1, -(mouse.y / H) * 2 + 1);
      raycaster.setFromCamera(_ndc, cubeCam);
      const hitPlane = raycaster.ray.intersectPlane(_plane, _intersectPoint);
      if (hitPlane) {
        _localIntersectPoint.copy(_intersectPoint);
        cubeGroup.worldToLocal(_localIntersectPoint);
      }

      glowMesh.position.copy(cubeGroup.position);
      glowMesh.scale.copy(cubeGroup.scale);
      glowMesh.quaternion.copy(cubeCam.quaternion);

      let maxBulge = 0;
      const isHovering = mouse.active > 0 && _localIntersectPoint.lengthSq() < 16.0;

      for (const c of cubes) {
        _p.copy(c.g).multiplyScalar(spread);
        if (twist && Math.round(c.g.getComponent(twist.axisIdx)) === twist.layer) {
          _p.applyQuaternion(_q);
          c.mesh.quaternion.copy(_q).multiply(c.q);
        } else {
          c.mesh.quaternion.copy(c.q);
        }

        let targetBulge = 0;
        if (hitPlane && isHovering) {
          const dist = _p.distanceTo(_localIntersectPoint);
          const radius = 3.2;
          if (dist < radius) {
            targetBulge = Math.pow(1 - dist / radius, 2) * 1.2 * popIn;
          }
        }
        c.bulge += (targetBulge - c.bulge) * 0.12;
        if (c.bulge > 0.001) {
          if (_p.lengthSq() > 0.01) {
            _pushVec.copy(_p).normalize().multiplyScalar(c.bulge);
          } else {
            _pushVec.set(0, 0, 1).multiplyScalar(c.bulge);
          }
          _p.add(_pushVec);
        }
        if (c.bulge > maxBulge) maxBulge = c.bulge;

        if (scrollSmooth > 0.001) {
          _p.addScaledVector(c.dir, CUBE_EXPLODE * scrollSmooth);
        }
        c.mesh.position.copy(_p);
        c.mesh.scale.setScalar(popIn);
      }

      // bake the 90° permutation, schedule the next twist
      if (twist && prog >= 1) {
        const R90 = new THREE.Quaternion().setFromAxisAngle(CUBE_AXES[twist.axisIdx], twist.dir * (Math.PI / 2));
        for (const c of cubes) {
          if (Math.round(c.g.getComponent(twist.axisIdx)) === twist.layer) {
            c.g.applyQuaternion(R90).round();
            c.q.premultiply(R90);
            c.dir.applyQuaternion(R90).round();
          }
        }
        nextTwistAt = elapsed + 4.5 + Math.random() * 3.5;
        twist = null;
      }

      glowMat.uniforms.uIntensity.value = maxBulge * 0.9;

      // ── render: haze+glow → feedRT, glass → cubesRT, ascii → screen ──
      renderer.setRenderTarget(feedRT);
      renderer.clear(true, true, true);
      renderer.render(feedScene, fsCamera);
      renderer.render(glowScene, cubeCam);

      renderer.setRenderTarget(cubesRT);
      renderer.clear(true, true, true);
      renderer.render(glowScene, cubeCam);
      renderer.clearDepth();
      renderer.render(cubeScene, cubeCam);

      renderer.setRenderTarget(null);
      renderer.clear(true, true, true);
      renderer.render(asciiScene, fsCamera);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      ro.disconnect();
      visibility.disconnect();
      fsGeo.dispose();
      cubeGeo.dispose();
      glowGeo.dispose();
      feedMat.dispose();
      cubeMat.dispose();
      glowMat.dispose();
      asciiMat.dispose();
      glyphTex.dispose();
      feedRT.dispose();
      cubesRT.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
    />
  );
}
