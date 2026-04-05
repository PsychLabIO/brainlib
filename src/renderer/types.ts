export interface Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;
}

export const Color = {
  white: { r: 1,   g: 1,   b: 1,   a: 1 } as Color,
  black: { r: 0,   g: 0,   b: 0,   a: 1 } as Color,
  gray:  { r: 0.5, g: 0.5, b: 0.5, a: 1 } as Color,
  red:   { r: 1,   g: 0,   b: 0,   a: 1 } as Color,
  green: { r: 0,   g: 1,   b: 0,   a: 1 } as Color,
  blue:  { r: 0,   g: 0,   b: 1,   a: 1 } as Color,

  rgb(r: number, g: number, b: number): Color {
    return { r, g, b, a: 1 };
  },
  rgba(r: number, g: number, b: number, a: number): Color {
    return { r, g, b, a };
  },
  rgb255(r: number, g: number, b: number): Color {
    return { r: r / 255, g: g / 255, b: b / 255, a: 1 };
  },
} as const;

export interface TextOptions {
  size: number;
  color: Color;
  align?: 'left' | 'center' | 'right';
  baseline?: 'top' | 'middle' | 'bottom';
}
