import * as THREE from "three";
import { Text } from "troika-three-text";

import { C_DIM, C_FG, C_GREEN, C_MUTED, FONT_MONO, FONT_SANS, paintRange } from "./three-hero-utils";

type TextWithColorRanges = Text & { colorRanges?: Record<number, number> };

const PARA = "Senior frontend engineer\nfor complex SaaS UI, AI workflows,\nand design systems.";
const META = "based  vietnam · remote      years  10+      stack  react · vue · node      status  open to roles";
const LINK = "jump to selected work ↓";

const applyColorRanges = (text: Text, ranges: Record<number, number>) => {
  (text as TextWithColorRanges).colorRanges = ranges;
};

export const textUniforms = {
  uMouse: { value: new THREE.Vector2(-9999, -9999) },
  uResolution: { value: new THREE.Vector2(1, 1) },
};

export function createHeroTextObjects(surface: "light" | "dark" = "dark") {
  const scene = new THREE.Scene();

  // Light theme needs dark glyphs so the SDF text reads on the pale field AND
  // shows up when the glass cubes refract the scene texture (that's the effect).
  const isLight = surface === "light";
  const P = isLight
    ? { fg: 0x0e0f12, muted: 0x3a3e44, dim: 0x676c74, green: 0x15803d, link: 0x6b7280 }
    : { fg: C_FG, muted: C_MUTED, dim: C_DIM, green: C_GREEN, link: 0xc2c7cf };
  // keyword lift: green accent in light (the page wanted accent colour), soft
  // white in dark (unchanged).
  const kw = isLight ? P.green : P.fg;

  const mkText = (font: string, size: number, color: number, ls = 0, allowGreenTint = true) => {
    const t = new Text();
    t.font = font;
    t.fontSize = size;
    t.color = color;
    t.letterSpacing = ls;
    t.anchorX = "left";
    t.anchorY = "top";
    t.fillOpacity = 0;
    
    // Inject a mask to darken the text when the background spotlight is under it
    const mat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, depthWrite: false });
    
    // Use userData to hold our custom uniform so we can update it uniquely per material instance
    mat.userData = {
      uAllowGreenTint: { value: allowGreenTint ? 1.0 : 0.0 }
    };
    
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.uMouse = textUniforms.uMouse;
      shader.uniforms.uResolution = textUniforms.uResolution;
      shader.uniforms.uAllowGreenTint = mat.userData.uAllowGreenTint;
      
      shader.fragmentShader = `
        uniform vec2 uMouse;
        uniform vec2 uResolution;
        uniform float uAllowGreenTint;
      ` + shader.fragmentShader;
      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <dithering_fragment>',
        `#include <dithering_fragment>
         vec2 mousePos = vec2(uMouse.x, uResolution.y - uMouse.y);
         float mDist = length(gl_FragCoord.xy - mousePos);
         float mLocal = exp(-mDist*mDist/120000.0);
         
         // If the text is a highlighted keyword (white or green), its green channel is > 0.6
         float isHighlight = step(0.6, gl_FragColor.g);
         
         // Near the cursor, text lifts toward the theme's highlight color
         // In light mode, use a dark brand green to match the rest of the site
         vec3 targetColor = mix(${isLight ? "vec3(0.09, 0.10, 0.11)" : "vec3(1.0)"}, ${isLight ? "vec3(0.08, 0.50, 0.24)" : "vec3(0.75, 1.0, 0.55)"}, isHighlight * uAllowGreenTint);
         
         gl_FragColor.rgb = mix(gl_FragColor.rgb, targetColor, mLocal * ${isLight ? "0.85" : "0.95"});
        `
      );
    };
    t.material = mat;

    scene.add(t);
    return t;
  };

  const h1 = mkText(FONT_SANS, 88, P.fg, -0.03, false);
  h1.text = "Ilya Moskovkin";
  h1.outlineColor = P.fg;

  const para = mkText(FONT_MONO, 19, P.muted, 0);
  para.text = PARA;
  para.lineHeight = 1.5;
  {
    const ranges: Record<number, number> = { 0: P.muted };
    // keywords get a soft lift against the body color
    paintRange(ranges, PARA, "complex", kw, P.muted);
    paintRange(ranges, PARA, "AI workflows", kw, P.muted);
    paintRange(ranges, PARA, "design", kw, P.muted);
    paintRange(ranges, PARA, "systems", kw, P.muted);
    applyColorRanges(para, ranges);
  }

  const meta = mkText(FONT_MONO, 13, P.dim, 0.04);
  meta.text = META;
  {
    const ranges: Record<number, number> = { 0: P.dim };
    paintRange(ranges, META, "vietnam · remote", P.fg, P.dim);
    paintRange(ranges, META, "10+", P.fg, P.dim);
    paintRange(ranges, META, "react · vue · node", P.fg, P.dim);
    paintRange(ranges, META, "open to roles", P.green, P.dim);
    applyColorRanges(meta, ranges);
  }

  const link = mkText(FONT_MONO, 14, P.link, 0.04);
  link.text = LINK;
  {
    const ranges: Record<number, number> = { 0: P.link };
    paintRange(ranges, LINK, "work", P.green, P.link);
    applyColorRanges(link, ranges);
  }

  return { scene, h1, para, meta, link };
}
