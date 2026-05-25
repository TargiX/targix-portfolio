declare module "troika-three-text" {
  import { Mesh } from "three";

  /**
   * Minimal typing for the bits of troika's Text mesh we use. Troika ships no
   * own declarations; this covers the SDF text properties touched in the hero.
   */
  export class Text extends Mesh {
    text: string;
    font: string | null;
    fontSize: number;
    color: number | string;
    letterSpacing: number;
    anchorX: number | "left" | "center" | "right" | string;
    anchorY: number | "top" | "middle" | "bottom" | string;
    maxWidth: number;
    lineHeight: number | "normal";
    fillOpacity: number;
    outlineColor: number | string;
    outlineWidth: number | string;
    outlineBlur: number | string;
    outlineOpacity: number;
    sync(callback?: () => void): void;
    dispose(): void;
  }

  export function preloadFont(
    options: { font: string; characters?: string | string[] },
    callback: () => void,
  ): void;
}
