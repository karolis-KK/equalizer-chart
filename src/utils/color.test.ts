import { describe, expect, it } from 'vitest';
import {
  gradientColorAt,
  interpolateColor,
  normalizeStops,
  parseColor,
  toRgb,
} from '../utils/color';

describe('parseColor', () => {
  it('parses 6-digit hex', () => {
    expect(parseColor('#ff8800')).toEqual({ r: 255, g: 136, b: 0 });
  });

  it('parses 3-digit shorthand hex', () => {
    expect(parseColor('#abc')).toEqual({ r: 170, g: 187, b: 204 });
  });

  it('parses 8-digit hex (ignores alpha)', () => {
    expect(parseColor('#112233ff')).toEqual({ r: 17, g: 34, b: 51 });
  });

  it('parses rgb()', () => {
    expect(parseColor('rgb(10, 20, 30)')).toEqual({ r: 10, g: 20, b: 30 });
  });

  it('parses rgba()', () => {
    expect(parseColor('rgba(10, 20, 30, 0.5)')).toEqual({
      r: 10,
      g: 20,
      b: 30,
    });
  });

  it('returns null for unsupported input', () => {
    expect(parseColor('tomato')).toBeNull();
    expect(parseColor('#12')).toBeNull();
    expect(parseColor('not-a-color')).toBeNull();
  });
});

describe('interpolateColor / toRgb', () => {
  it('rounds and formats to rgb()', () => {
    expect(toRgb({ r: 1.4, g: 2.6, b: 255 })).toBe('rgb(1, 3, 255)');
  });

  it('interpolates halfway between two colors', () => {
    expect(
      interpolateColor({ r: 0, g: 0, b: 0 }, { r: 255, g: 255, b: 255 }, 0.5),
    ).toBe('rgb(128, 128, 128)');
  });

  it('clamps out-of-range t values', () => {
    expect(
      interpolateColor({ r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, -3),
    ).toBe('rgb(0, 0, 0)');
    expect(
      interpolateColor({ r: 0, g: 0, b: 0 }, { r: 255, g: 0, b: 0 }, 9),
    ).toBe('rgb(255, 0, 0)');
  });
});

describe('normalizeStops', () => {
  it('assigns evenly spaced offsets', () => {
    const result = normalizeStops([
      { color: 'red' },
      { color: 'lime' },
      { color: 'blue' },
    ]);
    expect(result.map((s) => s.offset)).toEqual([0, 0.5, 1]);
  });

  it('respects explicit offsets and sorts them', () => {
    const result = normalizeStops([
      { color: 'blue', offset: 1 },
      { color: 'red', offset: 0 },
    ]);
    expect(result.map((s) => s.color)).toEqual(['red', 'blue']);
  });

  it('falls back to a default stop for empty input', () => {
    expect(normalizeStops([])).toHaveLength(1);
  });
});

describe('gradientColorAt', () => {
  const stops = [
    { color: '#000000', offset: 0 },
    { color: '#ffffff', offset: 1 },
  ];

  it('returns the first color at t=0', () => {
    expect(gradientColorAt(stops, 0)).toBe('#000000');
  });

  it('returns the last color at t=1', () => {
    expect(gradientColorAt(stops, 1)).toBe('#ffffff');
  });

  it('clamps values outside [0, 1]', () => {
    expect(gradientColorAt(stops, -5)).toBe('#000000');
    expect(gradientColorAt(stops, 5)).toBe('#ffffff');
  });

  it('interpolates between stops', () => {
    expect(gradientColorAt(stops, 0.5)).toBe('rgb(128, 128, 128)');
  });

  it('handles a single stop', () => {
    expect(gradientColorAt([{ color: 'red', offset: 0 }], 0.4)).toBe('red');
  });
});
