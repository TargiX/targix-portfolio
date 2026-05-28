export const FONT_SANS = "/fonts/Geist-Medium.woff";
export const FONT_MONO = "/fonts/GeistMono-Regular.woff";

// matched to the CSS tokens (--fg / --fg-muted / --fg-dim) so the SDF hero text
// reads the same greyish body + soft-white emphasis as the DOM copy, rather than
// an over-bright near-white that flattened the keyword highlights.
export const C_FG = 0xeff2f5; // --fg
export const C_MUTED = 0x848689; // --fg-muted (greyish body)
export const C_DIM = 0x535558; // --fg-dim
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
