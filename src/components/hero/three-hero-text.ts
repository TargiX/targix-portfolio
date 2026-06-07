import * as THREE from "three";
import { Text } from "troika-three-text";

import { C_DIM, C_FG, C_GREEN, C_MUTED, FONT_MONO, FONT_SANS, paintRange } from "./three-hero-utils";

type TextWithColorRanges = Text & { colorRanges?: Record<number, number> };

const PARA = "Senior frontend engineer with fullstack\nchops and UI/UX roots.\nBuilding experiences that matter.";
const META = "based  vietnam → remote      years  10+      stack  vue · react · node      status  open to roles";
const LINK = "interactive experiments — open the lab →";

const applyColorRanges = (text: Text, ranges: Record<number, number>) => {
  (text as TextWithColorRanges).colorRanges = ranges;
};

export const textUniforms = {
  uMouse: { value: new THREE.Vector2(-9999, -9999) },
  uResolution: { value: new THREE.Vector2(1, 1) },
};

export function createHeroTextObjects() {
  const scene = new THREE.Scene();

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
         
         // Highlighted text gets an acid-green tint, normal text gets pure white
         vec3 targetColor = mix(vec3(1.0), vec3(0.75, 1.0, 0.55), isHighlight * uAllowGreenTint);
         
         gl_FragColor.rgb = mix(gl_FragColor.rgb, targetColor, mLocal * 0.95);
        `
      );
    };
    t.material = mat;

    scene.add(t);
    return t;
  };

  const status = mkText(FONT_MONO, 13, C_MUTED, 0.02);

  const h1 = mkText(FONT_SANS, 88, C_FG, -0.03, false);
  h1.text = "Ilya Moskovkin";
  h1.outlineColor = C_FG;

  const para = mkText(FONT_MONO, 19, C_MUTED, 0);
  para.text = PARA;
  para.lineHeight = 1.5;
  {
    const ranges: Record<number, number> = { 0: C_MUTED };
    // keywords get a soft-white lift (not green) against the greyish body
    paintRange(ranges, PARA, "frontend", C_FG, C_MUTED);
    paintRange(ranges, PARA, "UI/UX", C_FG, C_MUTED);
    applyColorRanges(para, ranges);
  }

  const meta = mkText(FONT_MONO, 13, C_DIM, 0.04);
  meta.text = META;
  {
    const ranges: Record<number, number> = { 0: C_DIM };
    paintRange(ranges, META, "vietnam → remote", C_FG, C_DIM);
    paintRange(ranges, META, "10+", C_FG, C_DIM);
    paintRange(ranges, META, "vue · react · node", C_FG, C_DIM);
    paintRange(ranges, META, "open to roles", C_GREEN, C_DIM);
    applyColorRanges(meta, ranges);
  }

  const link = mkText(FONT_MONO, 14, 0xc2c7cf, 0.04);
  link.text = LINK;
  {
    const ranges: Record<number, number> = { 0: 0xc2c7cf };
    paintRange(ranges, LINK, "open the lab →", C_GREEN, 0xc2c7cf);
    applyColorRanges(link, ranges);
  }

  const dot = new THREE.Mesh(
    new THREE.CircleGeometry(4, 24),
    new THREE.MeshBasicMaterial({ color: C_GREEN, transparent: true, opacity: 0 }),
  );
  scene.add(dot);

  return { scene, status, h1, para, meta, link, dot };
}
