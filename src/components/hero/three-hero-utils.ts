export const FONT_SANS = "/fonts/Geist-Medium.woff";
export const FONT_MONO = "/fonts/GeistMono-Regular.woff";

export const C_FG = 0xf2f3f4;
export const C_MUTED = 0x9499a1;
export const C_DIM = 0x6b7079;
export const C_GREEN = 0x9fe05a;

export function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([a-f0-9]{6})$/i.exec(hex.trim());
  if (!m) return [1, 1, 1];
  const n = parseInt(m[1], 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function paintRange(
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
