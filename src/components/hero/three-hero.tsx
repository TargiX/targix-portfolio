"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/examples/jsm/geometries/RoundedBoxGeometry.js";
import { Text } from "troika-three-text";

export type HeroLayout = {
  /** screen-space rect (CSS px, top-left origin) of the "open the lab" link */
  link: { x: number; y: number; w: number; h: number };
};

type Props = {
  accent?: string;
  className?: string;
  onStatus?: (status: "ready" | "failed") => void;
  /** time string for the status line, e.g. "09:46:35" */
  time?: string;
  /** reports screen-space positions of interactive bits so the DOM can overlay them */
  onLayout?: (l: HeroLayout) => void;
};

const FONT_SANS = "/fonts/Geist-Medium.woff";
const FONT_MONO = "/fonts/GeistMono-Regular.woff";

const C_FG = 0xf2f3f4;
const C_MUTED = 0x9499a1;
const C_DIM = 0x6b7079;
const C_GREEN = 0x9fe05a;

// ── background shader (ported from the Pixi metaball hero, look unchanged) ──
const BG_VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const BG_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform vec2  uResolution;
uniform vec2  uMouse;
uniform float uMouseActive;
uniform vec3  uAccent;
uniform float uTime;

float hash21(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}
float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.0-2.0*f);
  float a=hash21(i),b=hash21(i+vec2(1,0)),c=hash21(i+vec2(0,1)),d=hash21(i+vec2(1,1));
  return mix(mix(a,b,u.x),mix(c,d,u.x),u.y);}
float fbm(vec2 p){float s=0.0,a=0.5;mat2 r=mat2(0.8,-0.6,0.6,0.8);
  for(int i=0;i<4;i++){s+=a*vnoise(p);p=r*p*2.0;a*=0.5;}return s;}
float grain(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}

void main(){
  vec2 p = vec2(vUv.x, 1.0 - vUv.y) * uResolution;
  vec2 uv = p / max(uResolution.x, uResolution.y);
  float t = uTime * 0.08;
  vec2 q = vec2(fbm(uv*2.0+vec2(0.0,t)), fbm(uv*2.0+vec2(5.2,t*0.9)));
  vec2 r = vec2(fbm(uv*2.0+3.0*q+vec2(1.7,9.2)+t), fbm(uv*2.0+3.0*q+vec2(8.3,2.8)+t*1.1));
  float aurora = smoothstep(0.35, 0.85, fbm(uv*2.0+3.5*r));

  float gridSize = 26.0;
  vec2 g = fract(p/gridSize) - 0.5;
  float gridDot = smoothstep(2.2, 0.6, length(g)*gridSize);
  float dotBright = 0.18 + aurora*0.65;

  float mDist = length(p - uMouse);
  float mGlow = exp(-mDist*mDist/42000.0);
  float mLocal = exp(-mDist*mDist/120000.0);

  vec3 baseDot = vec3(0.32,0.34,0.40);
  vec3 dotColor = mix(baseDot, uAccent, 0.35 + mLocal*uMouseActive*0.85);
  vec3 col = vec3(0.0);
  col += gridDot * dotColor * dotBright * (0.55 + mLocal*uMouseActive*0.5);
  col += uAccent * aurora*aurora * 0.05;
  col += uAccent * mGlow * uMouseActive * 0.42;
  col += (grain(p+uTime*13.0)-0.5) * 0.006;
  vec2 vc = p/uResolution - 0.5;
  col *= 0.45 + (1.0 - smoothstep(0.30,0.85,length(vc))) * 0.55;

  vec3 pageBg = vec3(0.052,0.055,0.062);
  gl_FragColor = vec4(pageBg + col, 1.0);
}
`;

const COMPOSITE_FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform sampler2D uScene;
void main(){ gl_FragColor = texture2D(uScene, vUv); }
`;

// ── glass cubes: refraction + scene reflection, lit by face angle ──
const CUBE_VERT = /* glsl */ `
varying vec3 vN;   // view-space normal
varying vec3 vP;   // view-space position
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
uniform float uReveal;

void main(){
  vec3 N = normalize(vN);
  vec3 V = normalize(-vP);                       // camera at origin in view space
  float fres = pow(1.0 - clamp(dot(N, V), 0.0, 1.0), 2.4);

  vec2 suv = gl_FragCoord.xy / uRes;
  // refraction — peek at the scene shifted along the face normal
  vec2 refrUV = clamp(suv + N.xy * 0.16, 0.002, 0.998);
  vec3 refr = texture2D(uScene, refrUV).rgb;
  // reflection — mirrored shift, so angled faces catch the typography
  vec2 reflUV = clamp(suv - N.xy * 0.34, 0.002, 0.998);
  vec3 refl = texture2D(uScene, reflUV).rgb;

  vec3 col = mix(refr, refl, fres * 0.85);
  col += uAccent * fres * 0.16;                  // accent on grazing edges
  col += vec3(0.04, 0.045, 0.05);                // faint cool body
  col *= 0.74 + 0.26 * clamp(N.z * 0.5 + 0.5, 0.0, 1.0);  // form shading
  col += vec3(0.7, 0.74, 0.8) * pow(fres, 2.0) * 0.5;     // bright rim

  float alpha = (0.85 + fres * 0.15) * uReveal;
  gl_FragColor = vec4(col, alpha);
}
`;

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

function paintRange(
  ranges: Record<number, number>,
  haystack: string,
  needle: string,
  color: number,
  back: number,
) {
  const i = haystack.indexOf(needle);
  if (i < 0) return;
  ranges[i] = color;
  ranges[i + needle.length] = back;
}

export function ThreeHero({ accent = "#a3e635", className, onStatus, time, onLayout }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(time ?? "");
  timeRef.current = time ?? "";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const accentRgb = hexToRgb(accent);

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
    } catch {
      onStatus?.("failed");
      return;
    }
    if (!renderer.getContext()) {
      onStatus?.("failed");
      return;
    }

    const pr = Math.min(window.devicePixelRatio || 1, 2);
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
      new THREE.WebGLRenderTarget(Math.max(1, (W * pr) | 0), Math.max(1, (H * pr) | 0), {
        magFilter: THREE.LinearFilter,
        minFilter: THREE.LinearFilter,
      });
    let sceneRT = makeRT();

    const fsCamera = new THREE.Camera();
    const fsGeo = new THREE.PlaneGeometry(2, 2);

    const bgMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: BG_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: {
        uResolution: { value: new THREE.Vector2(W, H) },
        uMouse: { value: new THREE.Vector2(W / 2, H / 2) },
        uMouseActive: { value: 0 },
        uAccent: { value: new THREE.Vector3(...accentRgb) },
        uTime: { value: 0 },
      },
    });
    const bgScene = new THREE.Scene();
    bgScene.add(new THREE.Mesh(fsGeo, bgMat));

    const compMat = new THREE.ShaderMaterial({
      vertexShader: BG_VERT,
      fragmentShader: COMPOSITE_FRAG,
      depthTest: false,
      depthWrite: false,
      uniforms: { uScene: { value: sceneRT.texture } },
    });
    const compScene = new THREE.Scene();
    compScene.add(new THREE.Mesh(fsGeo, compMat));

    const ortho = new THREE.OrthographicCamera(-W / 2, W / 2, H / 2, -H / 2, -1000, 1000);
    ortho.position.z = 10;

    // ── typography ──
    const textScene = new THREE.Scene();
    const mkText = (font: string, size: number, color: number, ls = 0) => {
      const t = new Text();
      t.font = font;
      t.fontSize = size;
      t.color = color;
      t.letterSpacing = ls;
      t.anchorX = "left";
      t.anchorY = "top";
      t.fillOpacity = 0;
      textScene.add(t);
      return t;
    };

    const PARA = "Senior frontend engineer with fullstack\nchops and UI/UX roots.\nBuilding products, not pages.";
    const META = "based  vietnam → remote      years  12+      stack  vue · react · node      status  open to roles";

    const status = mkText(FONT_MONO, 13, C_MUTED, 0.02);
    const eyebrow = mkText(FONT_MONO, 12, C_DIM, 0.3);
    eyebrow.text = "—   IM / portfolio · v1.0";
    const h1 = mkText(FONT_SANS, 88, C_FG, -0.03);
    h1.text = "Ilya Moskovkin";
    h1.outlineColor = C_FG;
    const para = mkText(FONT_MONO, 19, C_MUTED, 0);
    para.text = PARA;
    para.lineHeight = 1.5;
    {
      const ranges: Record<number, number> = { 0: C_MUTED };
      paintRange(ranges, PARA, "frontend", C_FG, C_MUTED);
      paintRange(ranges, PARA, "UI/UX", C_FG, C_MUTED);
      // @ts-expect-error troika runtime prop
      para.colorRanges = ranges;
    }
    const meta = mkText(FONT_MONO, 13, C_DIM, 0.04);
    meta.text = META;
    {
      const ranges: Record<number, number> = { 0: C_DIM };
      paintRange(ranges, META, "vietnam → remote", C_FG, C_DIM);
      paintRange(ranges, META, "12+", C_FG, C_DIM);
      paintRange(ranges, META, "vue · react · node", C_FG, C_DIM);
      paintRange(ranges, META, "open to roles", C_GREEN, C_DIM);
      // @ts-expect-error troika runtime prop
      meta.colorRanges = ranges;
    }
    const LINK = "here for the visual / motion work? open the lab →";
    const link = mkText(FONT_MONO, 14, 0xc2c7cf, 0.04);
    link.text = LINK;
    {
      const ranges: Record<number, number> = { 0: 0xc2c7cf };
      paintRange(ranges, LINK, "open the lab →", C_GREEN, 0xc2c7cf);
      // @ts-expect-error troika runtime prop
      link.colorRanges = ranges;
    }

    const dot = new THREE.Mesh(
      new THREE.CircleGeometry(4, 24),
      new THREE.MeshBasicMaterial({ color: C_GREEN, transparent: true, opacity: 0 }),
    );
    textScene.add(dot);

    // ── glass cube cluster (3×3×3) ──
    const cubeScene = new THREE.Scene();
    const cubeCam = new THREE.PerspectiveCamera(30, W / H, 0.1, 100);
    cubeCam.position.set(0, 0, 6);

    const cubeMat = new THREE.ShaderMaterial({
      vertexShader: CUBE_VERT,
      fragmentShader: CUBE_FRAG,
      transparent: true,
      depthTest: true,
      depthWrite: true,
      uniforms: {
        uScene: { value: sceneRT.texture },
        uRes: { value: new THREE.Vector2(W * pr, H * pr) },
        uAccent: { value: new THREE.Vector3(...accentRgb) },
        uReveal: { value: 0 },
      },
    });

    const cubeGroup = new THREE.Group();
    const CUBE = 0.84;
    const GAP = 0.92; // centre-to-centre spacing (small gap between cubes)
    const cubeGeo = new RoundedBoxGeometry(CUBE, CUBE, CUBE, 5, 0.17);
    // each cube tracks its logical grid coord (g) + baked orientation (q),
    // so the occasional layer twist can permute a slice and stay consistent
    type Cube = { mesh: THREE.Mesh; g: THREE.Vector3; q: THREE.Quaternion; dir: THREE.Vector3 };
    const cubes: Cube[] = [];
    let dirPick = 0;
    for (let gx = -1; gx <= 1; gx++) {
      for (let gy = -1; gy <= 1; gy++) {
        for (let gz = -1; gz <= 1; gz++) {
          const mesh = new THREE.Mesh(cubeGeo, cubeMat);
          cubeGroup.add(mesh);
          // explode straight along one of the cube's outward face normals
          // (axis-aligned). Edge/corner cubes have 2–3 open faces → alternate
          // which one. The centre cube has no open face, so it stays put.
          const cands: THREE.Vector3[] = [];
          if (gx !== 0) cands.push(new THREE.Vector3(Math.sign(gx), 0, 0));
          if (gy !== 0) cands.push(new THREE.Vector3(0, Math.sign(gy), 0));
          if (gz !== 0) cands.push(new THREE.Vector3(0, 0, Math.sign(gz)));
          const dir = cands.length ? cands[dirPick++ % cands.length] : new THREE.Vector3();
          cubes.push({ mesh, g: new THREE.Vector3(gx, gy, gz), q: new THREE.Quaternion(), dir });
        }
      }
    }
    cubeScene.add(cubeGroup);
    const EXPLODE = 5.0; // cube-local units at full scroll
    let scrollSmooth = 0;

    // occasional, calm layer twist
    const AXES = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)];
    const _q = new THREE.Quaternion();
    const _p = new THREE.Vector3();
    const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
    let twist: { axisIdx: number; layer: number; dir: number; t0: number; dur: number } | null = null;
    let nextTwistAt = 4.0;

    function placeCluster() {
      cubeCam.aspect = W / H;
      cubeCam.updateProjectionMatrix();
      const vFOV = (cubeCam.fov * Math.PI) / 180;
      const visH = 2 * Math.tan(vFOV / 2) * cubeCam.position.z;
      const visW = visH * (W / H);
      const fracX = 0.73;
      const fracY = 0.46;
      cubeGroup.position.set((fracX - 0.5) * visW, (0.5 - fracY) * visH, 0);
      const clusterScale = (Math.min(visH, visW) * 0.36) / 3.0;
      cubeGroup.scale.setScalar(clusterScale);
    }
    placeCluster();

    // ── layout (typography column, vertically centred) ──
    const reportLayout = () => {
      const lx = W / 2 + link.position.x;
      const ly = H / 2 - link.position.y;
      onLayout?.({ link: { x: lx, y: ly, w: 440, h: 26 } });
    };

    function layout() {
      const padLeft = Math.max(24, (W - 1280) / 2 + 32);
      const colLeft = -W / 2 + padLeft;
      const fontH1 = Math.max(52, Math.min(88, W * 0.058));
      h1.fontSize = fontH1;

      const paraSize = 19;
      const paraH = paraSize * 1.5 * 3;
      const gapStatus = 56;
      const gapEyebrow = 24;
      const gapH1 = 28;
      const gapPara = 28;
      const gapMeta = 32;
      const total = 15 + gapStatus + 14 + gapEyebrow + fontH1 + gapH1 + paraH + gapPara + 15 + gapMeta + 18;

      let y = total / 2;
      const place = (t: { position: THREE.Object3D["position"] }, h: number, gap: number) => {
        t.position.set(colLeft, y, 0);
        y -= h + gap;
      };
      status.position.set(colLeft + 20, y, 0);
      dot.position.set(colLeft + 5, y - 8, 1);
      y -= 15 + gapStatus;
      place(eyebrow, 14, gapEyebrow);
      place(h1, fontH1, gapH1);
      place(para, paraH, gapPara);
      place(meta, 15, gapMeta);
      place(link, 18, 0);

      status.sync();
      eyebrow.sync();
      h1.sync();
      para.sync();
      meta.sync();
      link.sync();

      placeCluster();
      reportLayout();
    }
    layout();

    // ── pointer / touch ──
    const isTouch = typeof window !== "undefined" && window.matchMedia?.("(pointer: coarse)").matches;
    const mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, active: 0, touching: 0 };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      const rect = host.getBoundingClientRect();
      mouse.tx = e.clientX - rect.left;
      mouse.ty = e.clientY - rect.top;
      mouse.active = 1;
      mouse.touching = 0;
    };
    const onLeave = () => { if (!isTouch) mouse.active = 0; };
    const onTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      const rect = host.getBoundingClientRect();
      mouse.tx = t.clientX - rect.left;
      mouse.ty = t.clientY - rect.top;
      mouse.touching = 1;
    };
    const onTouchEnd = () => { mouse.touching = 0; };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerleave", onLeave);
    if (isTouch) {
      window.addEventListener("touchmove", onTouch, { passive: true });
      window.addEventListener("touchstart", onTouch, { passive: true });
      window.addEventListener("touchend", onTouchEnd, { passive: true });
    }

    const ro = new ResizeObserver(() => {
      if (disposed) return;
      W = host.clientWidth || W;
      H = host.clientHeight || H;
      renderer.setSize(W, H, false);
      sceneRT.dispose();
      sceneRT = makeRT();
      compMat.uniforms.uScene.value = sceneRT.texture;
      cubeMat.uniforms.uScene.value = sceneRT.texture;
      cubeMat.uniforms.uRes.value.set(W * pr, H * pr);
      bgMat.uniforms.uResolution.value.set(W, H);
      ortho.left = -W / 2; ortho.right = W / 2; ortho.top = H / 2; ortho.bottom = -H / 2;
      ortho.updateProjectionMatrix();
      layout();
    });
    ro.observe(host);

    onStatus?.("ready");

    const start = performance.now();
    let raf = 0;
    let lastTime = "";
    const items: Array<{ t: { fillOpacity: number; position: { y: number } }; base: number; delay: number }> = [];

    const tick = () => {
      if (disposed) return;
      raf = requestAnimationFrame(tick);
      const elapsed = (performance.now() - start) / 1000;
      bgMat.uniforms.uTime.value = elapsed;

      if (items.length === 0) {
        items.push(
          { t: status, base: status.position.y, delay: 0 },
          { t: eyebrow, base: eyebrow.position.y, delay: 0.06 },
          { t: h1, base: h1.position.y, delay: 0.12 },
          { t: para, base: para.position.y, delay: 0.22 },
          { t: meta, base: meta.position.y, delay: 0.3 },
          { t: link, base: link.position.y, delay: 0.36 },
        );
      }

      if (timeRef.current && timeRef.current !== lastTime) {
        lastTime = timeRef.current;
        status.text = `available for work   ·   vietnam, ict ${timeRef.current}`;
        status.sync();
      }

      // mouse → bg glow
      let targetActive = mouse.active;
      if (isTouch && !mouse.touching) {
        const sp = Math.min(1, Math.max(0, (window.scrollY || 0) / Math.max(1, H)));
        mouse.tx = W * 0.5 + Math.cos(elapsed * 0.45) * W * 0.3;
        mouse.ty = H * 0.5 + Math.sin(elapsed * 0.6) * H * 0.16 + (sp - 0.4) * H * 0.7;
        targetActive = 0.65;
      } else if (isTouch && mouse.touching) {
        targetActive = 1;
      }
      const lerp = mouse.touching ? 0.18 : 0.08;
      mouse.x += (mouse.tx - mouse.x) * lerp;
      mouse.y += (mouse.ty - mouse.y) * lerp;
      bgMat.uniforms.uMouse.value.set(mouse.x, mouse.y);
      const cur = bgMat.uniforms.uMouseActive.value as number;
      bgMat.uniforms.uMouseActive.value = cur + (targetActive - cur) * 0.06;

      // staggered reveal of text
      for (const it of items) {
        const local = Math.min(1, Math.max(0, (elapsed - it.delay) / 0.6));
        const e = 1 - Math.pow(1 - local, 3);
        it.t.fillOpacity = e;
        it.t.position.y = it.base + (1 - e) * 10;
      }
      const h1e = Math.min(1, Math.max(0, (elapsed - 0.12) / 0.6));
      const h1ease = 1 - Math.pow(1 - h1e, 3);
      h1.outlineBlur = (1 - h1ease) * (h1.fontSize as number) * 0.18;
      h1.outlineOpacity = (1 - h1ease) * 0.9;
      const dotMat = dot.material as THREE.MeshBasicMaterial;
      dotMat.opacity = h1ease * (0.6 + 0.4 * Math.sin(elapsed * 3.0));

      // ── cube cluster: reveal, slow spin, breathe ──
      const reveal = 1 - Math.pow(1 - Math.min(1, elapsed / 1.1), 3);
      cubeMat.uniforms.uReveal.value = reveal;

      const mActive = bgMat.uniforms.uMouseActive.value as number;
      const mx = mouse.x / W - 0.5;
      const my = mouse.y / H - 0.5;
      cubeGroup.rotation.y = elapsed * 0.3 + mx * 0.8;
      cubeGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.22 + my * 0.5;
      cubeGroup.rotation.z = Math.sin(elapsed * 0.22) * 0.07;

      const spread = GAP * (1.0 + 0.05 * Math.sin(elapsed * 1.1) + 0.12 * mActive);
      const popIn = 0.6 + 0.4 * reveal;

      // scroll drives explode (down) / reassemble (up); 0 at top → 1 below
      const scrollTarget = Math.min(1, Math.max(0, (window.scrollY || 0) / Math.max(1, H * 0.85)));
      scrollSmooth += (scrollTarget - scrollSmooth) * 0.12;
      const atTop = scrollSmooth < 0.02;

      // layer twists only run at the top; abandon any in-flight twist once scrolling
      if (!atTop && twist) twist = null;
      if (atTop && !twist && reveal > 0.95 && elapsed >= nextTwistAt) {
        twist = {
          axisIdx: (Math.random() * 3) | 0,
          layer: [-1, 0, 1][(Math.random() * 3) | 0],
          dir: Math.random() < 0.5 ? 1 : -1,
          t0: elapsed,
          dur: 0.9,
        };
      }

      let prog = 1;
      let angle = 0;
      if (twist) {
        prog = Math.min(1, (elapsed - twist.t0) / twist.dur);
        angle = twist.dir * (Math.PI / 2) * easeInOut(prog);
      }
      _q.setFromAxisAngle(twist ? AXES[twist.axisIdx] : AXES[0], angle);

      for (const c of cubes) {
        _p.copy(c.g).multiplyScalar(spread);
        if (twist && Math.round(c.g.getComponent(twist.axisIdx)) === twist.layer) {
          _p.applyQuaternion(_q); // rotate the slice
          c.mesh.quaternion.copy(_q).multiply(c.q);
        } else {
          c.mesh.quaternion.copy(c.q);
        }
        // scroll explode: slide straight out along the face normal, no spin
        if (scrollSmooth > 0.001) {
          _p.addScaledVector(c.dir, EXPLODE * scrollSmooth);
        }
        c.mesh.position.copy(_p);
        c.mesh.scale.setScalar(popIn);
      }

      // bake the 90° permutation into grid coords + orientation, schedule next
      if (twist && prog >= 1) {
        const R90 = new THREE.Quaternion().setFromAxisAngle(AXES[twist.axisIdx], twist.dir * (Math.PI / 2));
        for (const c of cubes) {
          if (Math.round(c.g.getComponent(twist.axisIdx)) === twist.layer) {
            c.g.applyQuaternion(R90).round();
            c.q.premultiply(R90);
          }
        }
        nextTwistAt = elapsed + 4.5 + Math.random() * 3.5; // rare + calm
        twist = null;
      }

      // ── render: scene (bg+text) → RT, composite → screen, cubes on top ──
      renderer.setRenderTarget(sceneRT);
      renderer.clear(true, true, true);
      renderer.render(bgScene, fsCamera);
      renderer.render(textScene, ortho);

      renderer.setRenderTarget(null);
      renderer.clear(true, true, true);
      renderer.render(compScene, fsCamera);
      renderer.clearDepth();
      renderer.render(cubeScene, cubeCam);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerleave", onLeave);
      if (isTouch) {
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("touchend", onTouchEnd);
      }
      ro.disconnect();
      [status, eyebrow, h1, para, meta, link].forEach((t) => t.dispose());
      dot.geometry.dispose();
      (dot.material as THREE.Material).dispose();
      fsGeo.dispose();
      cubeGeo.dispose();
      bgMat.dispose();
      compMat.dispose();
      cubeMat.dispose();
      sceneRT.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accent, onStatus, onLayout]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

export default ThreeHero;
