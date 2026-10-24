import type { GradientStop } from '../types';

interface RGB {
  r: number;
  g: number;
  b: number;
}

/**
 * Parse a CSS color (hex #rgb/#rrggbb/#rrggbbaa or rgb()/rgba()) into RGB.
 * Returns null when the color cannot be parsed.
 */
export function parseColor(input: string): RGB | null {
  const str = input.trim();

  if (str.startsWith('#')) {
    let hex = str.slice(1);
    if (hex.length === 3 || hex.length === 4) {
      hex = hex
        .split('')
        .map((c) => c + c)
        .join('');
    }
    if (hex.length === 6 || hex.length === 8) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      if ([r, g, b].some((n) => Number.isNaN(n))) return null;
      return { r, g, b };
    }
    return null;
  }

  const rgbMatch = str.match(
    /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+)\s*)?\)$/i,
  );
  if (rgbMatch) {
    return {
      r: Math.min(255, parseFloat(rgbMatch[1])),
      g: Math.min(255, parseFloat(rgbMatch[2])),
      b: Math.min(255, parseFloat(rgbMatch[3])),
    };
  }

  return null;
}

/** Convert an RGB value back to a CSS `rgb()` string. */
export function toRgb({ r, g, b }: RGB): string {
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}

/** Linearly interpolate between two RGB colors. */
export function interpolateColor(a: RGB, b: RGB, t: number): string {
  const clamped = Math.max(0, Math.min(1, t));
  return toRgb({
    r: a.r + (b.r - a.r) * clamped,
    g: a.g + (b.g - a.g) * clamped,
    b: a.b + (b.b - a.b) * clamped,
  });
}

/** Normalize stops by giving them default offsets and sorting them. */
export function normalizeStops(stops: GradientStop[]): GradientStop[] {
  if (stops.length === 0) return [{ color: '#22c55e', offset: 0 }];
  const normalized = stops.map((stop, index) => ({
    color: stop.color,
    offset:
      stop.offset ?? (stops.length === 1 ? 0 : index / (stops.length - 1)),
  }));
  return normalized.sort((a, b) => a.offset - b.offset);
}

/** A gradient stop that is guaranteed to have a defined offset. */
type ResolvedStop = { color: string; offset: number };

/**
 * Resolve the color of a gradient at a position `t` in `[0, 1]`.
 * Falls back to the first stop's color when the gradient cannot be parsed.
 */
export function gradientColorAt(stops: GradientStop[], t: number): string {
  const normalized = normalizeStops(stops) as ResolvedStop[];
  const clamped = Math.max(0, Math.min(1, t));

  if (normalized.length === 1) return normalized[0].color;
  if (clamped <= normalized[0].offset) return normalized[0].color;
  if (clamped >= normalized[normalized.length - 1].offset) {
    return normalized[normalized.length - 1].color;
  }

  for (let i = 0; i < normalized.length - 1; i++) {
    const a = normalized[i];
    const b = normalized[i + 1];
    if (clamped >= a.offset && clamped <= b.offset) {
      const range = b.offset - a.offset || 1;
      const local = (clamped - a.offset) / range;
      const parsedA = parseColor(a.color);
      const parsedB = parseColor(b.color);
      if (parsedA && parsedB) return interpolateColor(parsedA, parsedB, local);
      return local < 0.5 ? a.color : b.color;
    }
  }

  return normalized[normalized.length - 1].color;
}
