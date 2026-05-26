"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";

type Props = {
  className?: string;
};

const MODEL_URL = "/models/jellyfish.glb";
const TILT = 0.28; // lean so it reads as drifting up-right

export function FooterJellyfish({ className }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" });
    } catch {
      return; // no WebGL → footer just stays plain, no harm
    }
    if (!renderer.getContext()) return;

    const pr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(pr);
    renderer.setClearColor(0x000000, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.85; // overall brightness — lower = darker
    const canvas = renderer.domElement;
    canvas.style.cssText = "display:block;width:100%;height:100%";
    host.appendChild(canvas);

    let W = host.clientWidth || 1;
    let H = host.clientHeight || 1;
    renderer.setSize(W, H, false);

    const scene = new THREE.Scene();
    // a longer lens (low FOV, camera pushed back) keeps perspective flat so the
    // wide footer aspect doesn't fish-eye-stretch the model horizontally
    const camera = new THREE.PerspectiveCamera(24, W / H, 0.1, 100);
    camera.position.set(0, 0, 8.5);

    // image-based lighting so the glass material reflects/refracts something
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.5; // strength of glass reflections — lower = less white glare

    const jelly = new THREE.Group(); // we drive placement + drift on this
    scene.add(jelly);

    let mixer: THREE.AnimationMixer | null = null;
    let loaded = false;
    let loading = false;
    let last = performance.now() / 1000;
    let elapsed = 0;

    const loadModel = () => {
      if (loaded || loading) return;
      loading = true;
      const draco = new DRACOLoader();
      draco.setDecoderPath("/draco/gltf/");
      const loader = new GLTFLoader();
      loader.setDRACOLoader(draco);
      loader.load(
        MODEL_URL,
        (gltf) => {
          const model = gltf.scene;
          // normalize: centre the model and scale it to a consistent height
          const box = new THREE.Box3().setFromObject(model);
          const size = new THREE.Vector3();
          const center = new THREE.Vector3();
          box.getSize(size);
          box.getCenter(center);

          // brand tint: recolor the *albedo* with a vertical lime→teal gradient
          // BEFORE lighting (in <color_fragment>), so env reflections, specular
          // and surface detail are computed on top and survive. Modulating by the
          // original luminance keeps the texture/normal detail instead of flattening.
          const lime = new THREE.Color(0xa3e635);
          const teal = new THREE.Color(0x2dd4bf);
          const ymin = box.min.y;
          const ymax = box.max.y;
          const tint = (mat: THREE.Material) => {
            mat.onBeforeCompile = (shader) => {
              shader.uniforms.uLime = { value: lime };
              shader.uniforms.uTeal = { value: teal };
              shader.uniforms.uYmin = { value: ymin };
              shader.uniforms.uYmax = { value: ymax };
              shader.vertexShader = shader.vertexShader
                .replace("#include <common>", "#include <common>\nvarying float vGradY;")
                .replace("#include <begin_vertex>", "#include <begin_vertex>\nvGradY = transformed.y;");
              shader.fragmentShader = shader.fragmentShader
                .replace(
                  "#include <common>",
                  "#include <common>\nvarying float vGradY;\nuniform vec3 uLime;\nuniform vec3 uTeal;\nuniform float uYmin;\nuniform float uYmax;",
                )
                .replace(
                  "#include <color_fragment>",
                  "#include <color_fragment>\n" +
                    "float gf = clamp((vGradY - uYmin) / max(0.001, uYmax - uYmin), 0.0, 1.0);\n" +
                    "vec3 grad = mix(uTeal, uLime, gf);\n" +
                    "float lum = dot(diffuseColor.rgb, vec3(0.299, 0.587, 0.114));\n" +
                    "diffuseColor.rgb = grad * (0.2 + lum * 0.8);\n", // base brightness floor — lower = darker
                );
            };
            mat.needsUpdate = true;
          };
          model.traverse((o) => {
            const m = o as THREE.Mesh;
            if (!m.isMesh) return;
            const mats = Array.isArray(m.material) ? m.material : [m.material];
            mats.forEach(tint);
          });

          model.position.sub(center);
          const wrap = new THREE.Group();
          wrap.add(model);
          wrap.scale.setScalar(2.8 / (size.y || 1));
          jelly.add(wrap);
          if (gltf.animations.length) {
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(gltf.animations[0]).play();
          }
          loaded = true;
          draco.dispose();
          if (reduce || !running) renderFrame(); // ensure at least one painted frame
        },
        undefined,
        (err) => {
          console.error("[footer-jellyfish] model load failed", err);
          draco.dispose();
        },
      );
    };

    const renderFrame = () => {
      const now = performance.now() / 1000;
      const dt = Math.min(now - last, 0.05);
      last = now;
      elapsed += dt;
      const t = elapsed;
      if (mixer) mixer.update(dt);
      // centered between the two columns by default; only a very wide container
      // has free room on the left, so move it there
      const halfW = Math.tan(((camera.fov * Math.PI) / 180) / 2) * camera.position.z * (W / H);
      // content is capped at 1280; when the viewport is wider there's free margin,
      // so let the jellyfish bleed out to the container's left edge. No margin
      // (narrow screens) → keep it centered between the columns.
      const marginPx = (W - Math.min(1280, W)) / 2;
      const baseX = marginPx > 120 ? (marginPx / W - 0.5) * 2 * halfW : 0;
      jelly.rotation.z = -TILT + Math.sin(t * 0.22) * 0.05;
      jelly.rotation.y = Math.sin(t * 0.15) * 0.2;
      jelly.position.x = baseX + Math.sin(t * 0.18) * 0.12;
      jelly.position.y = 0.1 + Math.sin(t * 0.6) * 0.1;
      renderer.render(scene, camera);
    };

    let disposed = false;
    let raf = 0;
    let running = false;
    const loop = () => {
      if (disposed) return;
      raf = requestAnimationFrame(loop);
      renderFrame();
    };

    // lazy: don't fetch the 3.9 MB model (or animate) until the footer is near
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          loadModel();
          if (!reduce && !running) {
            running = true;
            last = performance.now() / 1000; // reset so we don't jump after a pause
            raf = requestAnimationFrame(loop);
          }
        } else if (running) {
          running = false;
          cancelAnimationFrame(raf);
        }
      },
      { rootMargin: "200px" },
    );
    io.observe(host);

    const ro = new ResizeObserver(() => {
      if (disposed) return;
      W = host.clientWidth || W;
      H = host.clientHeight || H;
      renderer.setSize(W, H, false);
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      if (reduce || !running) renderFrame();
    });
    ro.observe(host);

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mixer?.stopAllAction();
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.isMesh) {
          m.geometry?.dispose();
          const mat = m.material;
          if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
          else mat?.dispose();
        }
      });
      scene.environment?.dispose();
      pmrem.dispose();
      renderer.dispose();
      if (canvas.parentNode) canvas.parentNode.removeChild(canvas);
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 0 }}
    />
  );
}

export default FooterJellyfish;
