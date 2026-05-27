import * as THREE from "three";
import { Text } from "troika-three-text";

import { C_DIM, C_FG, C_GREEN, C_MUTED, FONT_MONO, FONT_SANS, paintRange } from "./three-hero-utils";

type TextWithColorRanges = Text & { colorRanges?: Record<number, number> };

const PARA = "Senior frontend engineer with fullstack\nchops and UI/UX roots.\nBuilding products, not pages.";
const META = "based  vietnam → remote      years  12+      stack  vue · react · node      status  open to roles";
const LINK = "interactive experiments — open the lab →";

const applyColorRanges = (text: Text, ranges: Record<number, number>) => {
  (text as TextWithColorRanges).colorRanges = ranges;
};

export function createHeroTextObjects() {
  const scene = new THREE.Scene();

  const mkText = (font: string, size: number, color: number, ls = 0) => {
    const t = new Text();
    t.font = font;
    t.fontSize = size;
    t.color = color;
    t.letterSpacing = ls;
    t.anchorX = "left";
    t.anchorY = "top";
    t.fillOpacity = 0;
    scene.add(t);
    return t;
  };

  const status = mkText(FONT_MONO, 13, C_MUTED, 0.02);

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
    applyColorRanges(para, ranges);
  }

  const meta = mkText(FONT_MONO, 13, C_DIM, 0.04);
  meta.text = META;
  {
    const ranges: Record<number, number> = { 0: C_DIM };
    paintRange(ranges, META, "vietnam → remote", C_FG, C_DIM);
    paintRange(ranges, META, "12+", C_FG, C_DIM);
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
