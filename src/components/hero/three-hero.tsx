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
  type HeroCube,
} from "./three-hero-cubes";
import { BG_FRAG, BG_VERT, COMPOSITE_FRAG, CUBE_FRAG, CUBE_VERT, GLOW_FRAG, GLOW_VERT } from "./three-hero-shaders";
import { createHeroTextObjects, textUniforms } from "./three-hero-text";
import { C_GREEN, hexToRgb } from "./three-hero-utils";

export type HeroLayout = {
  /** screen-space rect (CSS px, top-left origin) of the "jump to work" link */
  link: { x: number; y: number; w: number; h: number };
};

type Props = {
  accent?: string;
  /** teal companion — blends with `accent` for the blue-green flow */
  accent2?: string;
  surface?: "light" | "dark";
  className?: string;
  onStatus?: (status: "ready" | "failed") => void;
  /** time string for the status line, e.g. "09:46:35" */
  time?: string;
  /** reports screen-space positions of interactive bits so the DOM can overlay them */
  onLayout?: (l: HeroLayout) => void;
  /**
   * Narrow viewport: the SDF typography doesn't reflow, so on mobile the copy is
   * rendered in the DOM instead and the cube cluster floats lower-centre.
   */
  mobile?: boolean;
  /** Hide only the in-canvas SDF text while preserving desktop cube placement. */
  suppressText?: boolean;
};

export function ThreeHero({
  accent = "#a3e635",
  accent2 = "#2dd4bf",
  surface = "dark",
  className,
  onStatus,
  time,
  onLayout,
  mobile = false,
  suppressText = false,
}: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const timeRef = useRef(time ?? "");
  timeRef.current = time ?? "";

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let disposed = false;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    const accentRgb = hexToRgb(accent);
    const accent2Rgb = hexToRgb(accent2);
    const isLightSurface = surface === "light";
    const pageBgRgb = isLightSurface ? [0.981, 0.981, 0.984] : [0.052, 0.055, 0.062];
    const baseDotRgb = isLightSurface ? [0.50, 0.53, 0.58] : [0.32, 0.34, 0.4];

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
        uAccent2: { value: new THREE.Vector3(...accent2Rgb) },
        uPageBg: { value: new THREE.Vector3(...pageBgRgb) },
        uBaseDot: { value: new THREE.Vector3(...baseDotRgb) },
        uLight: { value: isLightSurface ? 1 : 0 },
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

    const {
      scene: textScene,
      h1,
      para,
      meta,
      link,
    } = createHeroTextObjects(surface);

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
        uAccent2: { value: new THREE.Vector3(...accent2Rgb) },
        uLight: { value: isLightSurface ? 1 : 0 },
        uReveal: { value: 0 },
      },
    });

    const {
      scene: cubeScene,
      camera: cubeCam,
      group: cubeGroup,
      cubes,
      geometry: cubeGeo,
      place: placeCluster,
    } = createCubeCluster(cubeMat, W, H);

    const glowMat = new THREE.ShaderMaterial({
      vertexShader: GLOW_VERT,
      fragmentShader: GLOW_FRAG,
      transparent: true,
      blending: isLightSurface ? THREE.NormalBlending : THREE.AdditiveBlending,
      depthWrite: false,
      depthTest: true,
      uniforms: {
        uColor: { value: new THREE.Vector3(...accentRgb) },
        uIntensity: { value: 0.0 },
        uLight: { value: isLightSurface ? 1 : 0 },
        uTime: { value: 0.0 },
      },
    });

    const glowGeo = new THREE.PlaneGeometry(8, 8);
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    const glowScene = new THREE.Scene();
    glowScene.add(glowMesh);

    let scrollSmooth = 0;

    // occasional, calm layer twist
    const _q = new THREE.Quaternion();
    const _p = new THREE.Vector3();
    let twist: { axisIdx: number; layer: number; dir: number; t0: number; dur: number } | null = null;
    let nextTwistAt = 4.0;

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
      const gapH1 = 28;
      const gapPara = 28;
      const gapMeta = 32;
      const total = fontH1 + gapH1 + paraH + gapPara + 15 + gapMeta + 18;

      let y = total / 2;
      const place = (t: { position: THREE.Object3D["position"] }, h: number, gap: number) => {
        t.position.set(colLeft, y, 0);
        y -= h + gap;
      };
      place(h1, fontH1, gapH1);
      place(para, paraH, gapPara);
      place(meta, 15, gapMeta);
      place(link, 18, 0);

      h1.sync();
      para.sync();
      meta.sync();
      link.sync();

      // Desktop uses the cluster's original placement. Mobile floats lower-centre
      // below the DOM copy.
      placeCluster(W, H, mobile ? { fracX: 0.5, fracY: 0.86, scaleK: 0.26 } : undefined);
      // only the in-canvas link needs a DOM overlay; on mobile the copy is real DOM
      if (!mobile) reportLayout();
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
      // loop is frozen under reduced motion — repaint a short burst after a resize
      if (reduce) {
        reduceFrames = 0;
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      }
    });
    ro.observe(host);

    onStatus?.("ready");

    // reduced motion: pin time so the scene paints fully assembled + revealed, then
    // stop the loop after a few frames (enough for troika's async glyph sync) so
    // nothing animates. resize re-kicks a short burst to repaint.
    const REDUCE_T = 3.0;
    const start = performance.now() - (reduce ? REDUCE_T * 1000 : 0);
    let reduceFrames = 0;

    // ── drag-to-rotate: grab a face and swipe; the slice turns in the swipe
    // direction, exactly like a 3D twisty-puzzle. Drag right on the bottom row →
    // it rolls right; drag up → that column tips up. Direction is yours, not a
    // heuristic. Reuses the ambient twist slot, so user + auto never collide.
    const raycaster = new THREE.Raycaster();
    const _ndc = new THREE.Vector2();
    const _faceN = new THREE.Vector3();
    const hitCube = (clientX: number, clientY: number): { c: HeroCube; faceN: THREE.Vector3 } | null => {
      const rect = host.getBoundingClientRect();
      _ndc.set(((clientX - rect.left) / W) * 2 - 1, -(((clientY - rect.top) / H) * 2 - 1));
      raycaster.setFromCamera(_ndc, cubeCam);
      const hit = raycaster.intersectObjects(cubeGroup.children, false)[0];
      if (!hit?.face) return null;
      const c = cubes.find((c) => c.mesh === hit.object);
      if (!c) return null;
      // face normal → cluster space (mesh orientation only, not the group spin)
      _faceN.copy(hit.face.normal).applyQuaternion(hit.object.quaternion);
      return { c, faceN: _faceN };
    };

    // screen-space direction (client px, y-down) of a cluster axis at a world anchor
    const _wa = new THREE.Vector3();
    const _pa = new THREE.Vector3();
    const _pb = new THREE.Vector3();
    const _cross = new THREE.Vector3();
    const _dFace = new THREE.Vector3();
    const _anchor = new THREE.Vector3();
    const tangentDir = (anchor: THREE.Vector3, axisIdx: number, out: { x: number; y: number }) => {
      _wa.copy(CUBE_AXES[axisIdx]).applyQuaternion(cubeGroup.quaternion);
      _pa.copy(anchor).project(cubeCam);
      _pb.copy(anchor).addScaledVector(_wa, 0.3).project(cubeCam);
      const dx = (_pb.x - _pa.x) * (W / 2);
      const dy = -(_pb.y - _pa.y) * (H / 2);
      const len = Math.hypot(dx, dy) || 1;
      out.x = dx / len;
      out.y = dy / len;
    };

    const DRAG_MIN = 7; // px before a swipe registers
    type Drag = {
      c: HeroCube;
      faceN: THREE.Vector3;
      t1: number; t2: number;          // the two cluster axes in the face plane
      s1: { x: number; y: number };    // their screen directions (y-down)
      s2: { x: number; y: number };
      x0: number; y0: number;
    };
    let drag: Drag | null = null;
    let hovering = false;

    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;
      drag = null;
      const elapsed = (performance.now() - start) / 1000;
      // one turn at a time, only on the assembled cluster, after the entrance
      if (twist || scrollSmooth > 0.02 || elapsed < 1.1) return;
      const hit = hitCube(e.clientX, e.clientY);
      if (!hit) return;
      const n = hit.faceN;
      const nAxis = Math.abs(n.x) >= Math.abs(n.y) && Math.abs(n.x) >= Math.abs(n.z) ? 0 : Math.abs(n.y) >= Math.abs(n.z) ? 1 : 2;
      const t1 = nAxis === 0 ? 1 : 0;
      const t2 = nAxis === 2 ? 1 : 2;
      hit.c.mesh.getWorldPosition(_anchor);
      const s1 = { x: 0, y: 0 };
      const s2 = { x: 0, y: 0 };
      tangentDir(_anchor, t1, s1);
      tangentDir(_anchor, t2, s2);
      drag = { c: hit.c, faceN: n.clone(), t1, t2, s1, s2, x0: e.clientX, y0: e.clientY };
    };
    window.addEventListener("pointerdown", onPointerDown);

    const onPointerMove = (e: PointerEvent) => {
      if (e.pointerType === "touch") return;

      // resolve a swipe into a slice turn
      if (drag && !twist) {
        const dx = e.clientX - drag.x0;
        const dy = e.clientY - drag.y0;
        if (Math.hypot(dx, dy) >= DRAG_MIN) {
          // which in-plane axis did the swipe follow, and which way
          const c1 = dx * drag.s1.x + dy * drag.s1.y;
          const c2 = dx * drag.s2.x + dy * drag.s2.y;
          const useT1 = Math.abs(c1) >= Math.abs(c2);
          const tAxis = useT1 ? drag.t1 : drag.t2;
          _dFace.copy(CUBE_AXES[tAxis]).multiplyScalar((useT1 ? c1 : c2) >= 0 ? 1 : -1);
          // rotation axis ω = faceNormal × swipeDir → the grabbed sticker moves with the swipe
          _cross.crossVectors(drag.faceN, _dFace);
          const ax = Math.abs(_cross.x), ay = Math.abs(_cross.y), az = Math.abs(_cross.z);
          const axisIdx = ax >= ay && ax >= az ? 0 : ay >= az ? 1 : 2;
          const dir = _cross.getComponent(axisIdx) >= 0 ? 1 : -1;
          const layer = Math.round(drag.c.g.getComponent(axisIdx));
          const elapsed = (performance.now() - start) / 1000;
          twist = { axisIdx, layer, dir, t0: elapsed, dur: CUBE_TWIST_DUR };
          nextTwistAt = elapsed + CUBE_TWIST_DUR + 4.5 + Math.random() * 3.5; // hold off the next auto turn
          drag = null;
        }
      }

      // pointer cursor while hovering the cluster, so it reads as interactive
      const over = scrollSmooth < 0.02 && !!hitCube(e.clientX, e.clientY);
      if (over !== hovering) {
        hovering = over;
        document.body.style.cursor = over ? "grab" : "";
      }
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    const onPointerUp = () => { drag = null; };
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerUp);

    let raf = 0;
    let lastTime = "";
    const items: Array<{ t: { fillOpacity: number; position: { y: number } }; base: number; delay: number }> = [];

    const _plane = new THREE.Plane();
    const _cameraForward = new THREE.Vector3();
    const _intersectPoint = new THREE.Vector3();
    const _localIntersectPoint = new THREE.Vector3();
    const _pushVec = new THREE.Vector3();

    const tick = () => {
      if (disposed) return;
      // under reduced motion run only a short burst (let troika sync), then freeze
      if (!reduce || reduceFrames < 8) raf = requestAnimationFrame(tick);
      reduceFrames++;
      const elapsed = reduce ? REDUCE_T : (performance.now() - start) / 1000;
      bgMat.uniforms.uTime.value = elapsed;

      if (items.length === 0) {
        items.push(
          { t: h1, base: h1.position.y, delay: 0.08 },
          { t: para, base: para.position.y, delay: 0.18 },
          { t: meta, base: meta.position.y, delay: 0.26 },
          { t: link, base: link.position.y, delay: 0.32 },
        );
      }

      // Time updates removed since status text is removed.

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
      
      textUniforms.uMouse.value.set(mouse.x * pr, mouse.y * pr);
      textUniforms.uResolution.value.set(W * pr, H * pr);

      // staggered reveal of text
      for (const it of items) {
        const local = Math.min(1, Math.max(0, (elapsed - it.delay) / 0.6));
        const e = 1 - Math.pow(1 - local, 3);
        it.t.fillOpacity = e;
        it.t.position.y = it.base + (1 - e) * 10;
      }
      
      // No dot to animate anymore

      // ── cube cluster: reveal, slow spin, breathe ──
      const reveal = 1 - Math.pow(1 - Math.min(1, elapsed / 1.1), 3);
      cubeMat.uniforms.uReveal.value = reveal;

      const mActive = bgMat.uniforms.uMouseActive.value as number;
      const mx = mouse.x / W - 0.5;
      const my = mouse.y / H - 0.5;
      cubeGroup.rotation.y = elapsed * 0.3 + mx * 0.8;
      cubeGroup.rotation.x = Math.sin(elapsed * 0.4) * 0.22 + my * 0.5;
      cubeGroup.rotation.z = Math.sin(elapsed * 0.22) * 0.07;

      const spread = CUBE_GAP * (1.0 + 0.05 * Math.sin(elapsed * 1.1) + 0.12 * mActive);
      const popIn = 0.6 + 0.4 * reveal;

      // scroll drives explode (down) / reassemble (up); 0 at top → 1 below.
      // reduced motion keeps the cluster assembled (no scroll-linked motion).
      const scrollTarget = reduce ? 0 : Math.min(1, Math.max(0, (window.scrollY || 0) / Math.max(1, H * 0.85)));
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

      // hover bulge effect: raycast to a plane at the cluster's position
      _cameraForward.set(0, 0, 1).transformDirection(cubeCam.matrixWorld);
      _plane.setFromNormalAndCoplanarPoint(_cameraForward, cubeGroup.position);
      _ndc.set((mouse.x / W) * 2 - 1, -(mouse.y / H) * 2 + 1);
      raycaster.setFromCamera(_ndc, cubeCam);
      const hitPlane = raycaster.ray.intersectPlane(_plane, _intersectPoint);
      if (hitPlane) {
        _localIntersectPoint.copy(_intersectPoint);
        cubeGroup.worldToLocal(_localIntersectPoint);
      }

      // Billboarding for the single glow mesh to face the camera properly
      glowMesh.position.copy(cubeGroup.position);
      glowMesh.scale.copy(cubeGroup.scale);
      glowMesh.quaternion.copy(cubeCam.quaternion);

      let maxBulge = 0;
      // Only trigger hover physics if the mouse is actually physically near the cluster's center
      const isHovering = (mouse.active > 0 || mouse.touching > 0) && _localIntersectPoint.lengthSq() < 16.0;

      for (const c of cubes) {
        _p.copy(c.g).multiplyScalar(spread);
        if (twist && Math.round(c.g.getComponent(twist.axisIdx)) === twist.layer) {
          _p.applyQuaternion(_q); // rotate the slice
          c.mesh.quaternion.copy(_q).multiply(c.q);
        } else {
          c.mesh.quaternion.copy(c.q);
        }

        // Apply hover bulge
        let targetBulge = 0;
        if (hitPlane && isHovering) {
          const dist = _p.distanceTo(_localIntersectPoint);
          const radius = 3.2; // effective radius in local coordinates
          if (dist < radius) {
            targetBulge = Math.pow(1 - dist / radius, 2) * 1.2 * popIn;
          }
        }

        // Smoothly interpolate the bulge to prevent jerkiness
        c.bulge += (targetBulge - c.bulge) * 0.12;

        if (c.bulge > 0.001) {
          if (_p.lengthSq() > 0.01) {
            _pushVec.copy(_p).normalize().multiplyScalar(c.bulge);
          } else {
            // center cube expands directly forward
            _pushVec.set(0, 0, 1).multiplyScalar(c.bulge);
          }
          _p.add(_pushVec);
        }

        if (c.bulge > maxBulge) maxBulge = c.bulge;

        // scroll explode: slide straight out along the face normal, no spin
        if (scrollSmooth > 0.001) {
          _p.addScaledVector(c.dir, CUBE_EXPLODE * scrollSmooth);
        }
        c.mesh.position.copy(_p);
        c.mesh.scale.setScalar(popIn);
      }

      // bake the 90° permutation into grid coords + orientation, schedule next
      if (twist && prog >= 1) {
        const R90 = new THREE.Quaternion().setFromAxisAngle(CUBE_AXES[twist.axisIdx], twist.dir * (Math.PI / 2));
        for (const c of cubes) {
          if (Math.round(c.g.getComponent(twist.axisIdx)) === twist.layer) {
            c.g.applyQuaternion(R90).round();
            c.q.premultiply(R90);
            // the explode vector is a face normal — it must follow the slice turn,
            // or after a twist the cube flies along a stale direction and overlaps
            // its neighbours instead of fanning out cleanly. round() keeps it an
            // exact axis-aligned unit vector despite float drift.
            c.dir.applyQuaternion(R90).round();
          }
        }
        nextTwistAt = elapsed + 4.5 + Math.random() * 3.5; // rare + calm
        twist = null;
      }

      glowMat.uniforms.uIntensity.value = maxBulge * (isLightSurface ? 0.32 : 0.75);
      glowMat.uniforms.uTime.value = elapsed;

      // ── render: scene (bg+text) → RT, composite → screen, cubes on top ──
      renderer.setRenderTarget(sceneRT);
      renderer.clear(true, true, true);
      renderer.render(bgScene, fsCamera);
      // mobile/light DOM copy owns the text; skip SDF only when requested
      if (!mobile && !suppressText) renderer.render(textScene, ortho);
      
      // Render the core glow into the scene texture so the glass cubes can refract it!
      renderer.render(glowScene, cubeCam);

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
      window.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      document.body.style.cursor = "";
      if (isTouch) {
        window.removeEventListener("touchmove", onTouch);
        window.removeEventListener("touchstart", onTouch);
        window.removeEventListener("touchend", onTouchEnd);
      }
      ro.disconnect();
      [h1, para, meta, link].forEach((t) => t.dispose());
      fsGeo.dispose();
      cubeGeo.dispose();
      glowGeo.dispose();
      bgMat.dispose();
      compMat.dispose();
      cubeMat.dispose();
      glowMat.dispose();
      sceneRT.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, [accent, accent2, surface, onStatus, onLayout, mobile, suppressText]);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0, transform: "translateZ(0)" }}
    />
  );
}

export default ThreeHero;
