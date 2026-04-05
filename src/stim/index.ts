import type { IRenderer } from "../renderer/IRenderer.js";
import type { Color, TextOptions } from "../renderer/types.js";
import { Color as C } from "../renderer/types.js";

export type RenderFn = () => void;

export function fixation(
  renderer: IRenderer,
  opts: { size?: number; thickness?: number; color?: Color } = {},
): RenderFn {
  const { size = 20, thickness = 2, color = C.white } = opts;
  const cx = renderer.width / 2;
  const cy = renderer.height / 2;
  return () => renderer.drawFixation(cx, cy, size, thickness, color);
}

export function blank(renderer: IRenderer, color: Color = C.gray): RenderFn {
  return () => renderer.clear(color);
}

export function text(
  renderer: IRenderer,
  content: string,
  opts: Partial<TextOptions> & { x?: number; y?: number } = {},
): RenderFn {
  const x = opts.x ?? renderer.width / 2;
  const y = opts.y ?? renderer.height / 2;
  const resolved: TextOptions = {
    size: opts.size ?? 32,
    color: opts.color ?? C.white,
    align: opts.align ?? "center",
    baseline: opts.baseline ?? "middle",
  };
  return () => renderer.drawText(x, y, content, resolved);
}

export function rect(
  renderer: IRenderer,
  x: number,
  y: number,
  w: number,
  h: number,
  color: Color,
  cornerRadius = 0,
): RenderFn {
  return () => renderer.drawRect(x, y, w, h, color, cornerRadius);
}

export function circle(
  renderer: IRenderer,
  cx: number,
  cy: number,
  radius: number,
  color: Color,
): RenderFn {
  return () => renderer.drawCircle(cx, cy, radius, color);
}

export function image(
  renderer: IRenderer,
  src: string,
  x: number,
  y: number,
  w: number,
  h: number,
): RenderFn {
  return () => renderer.drawImage(x, y, w, h, src);
}

export function compose(...fns: RenderFn[]): RenderFn {
  return () => {
    for (const fn of fns) fn();
  };
}
