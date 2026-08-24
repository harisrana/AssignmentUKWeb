/** Picks black or white text for readable contrast against an arbitrary #RRGGBB background. */
export function contrastTextColor(hex: string): string {
  const clean = hex.replace('#', '');
  if (clean.length !== 6) {
    return '#FFFFFF';
  }
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  // Perceived luminance (ITU-R BT.601).
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance > 150 ? '#1F2937' : '#FFFFFF';
}
