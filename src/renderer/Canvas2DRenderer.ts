import type { Color, TextOptions } from "./types.js";
import type { IRenderer } from "./IRenderer.js";

function css(c: Color): string {
  return `rgba(${Math.round(c.r * 255)},${Math.round(c.g * 255)},${Math.round(c.b * 255)},${c.a})`;
}

export class Canvas2DRenderer implements IRenderer {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly images = new Map<string, HTMLImageElement>();

  constructor(private readonly canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d");
    if (ctx === null)
      throw new Error("Canvas2DRenderer: failed to acquire 2D context");
    this.ctx = ctx;
  }

  get width(): number {
    return this.canvas.width;
  }
  get height(): number {
    return this.canvas.height;
  }

  /** No-op; requestAnimationFrame already provides vsync. */
  beginFrame(_timestamp: number): void {}
  /** No-op; the browser composites automatically. */
  endFrame(): void {}

  clear(color: Color): void {
    this.ctx.fillStyle = css(color);
    this.ctx.fillRect(0, 0, this.width, this.height);
  }

  drawRect(
    x: number,
    y: number,
    w: number,
    h: number,
    color: Color,
    cornerRadius = 0,
  ): void {
    this.ctx.fillStyle = css(color);
    if (cornerRadius > 0) {
      this.ctx.beginPath();
      this.ctx.roundRect(x, y, w, h, cornerRadius);
      this.ctx.fill();
    } else {
      this.ctx.fillRect(x, y, w, h);
    }
  }

  drawCircle(cx: number, cy: number, radius: number, color: Color): void {
    this.ctx.fillStyle = css(color);
    this.ctx.beginPath();
    this.ctx.arc(cx, cy, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }

  drawText(x: number, y: number, text: string, opts: TextOptions): void {
    const { size, color, align = "center", baseline = "middle" } = opts;
    this.ctx.fillStyle = css(color);
    this.ctx.font = `${size}px sans-serif`;
    this.ctx.textAlign = align;
    this.ctx.textBaseline = baseline;

    const lines = text.split("\n");
    if (lines.length === 1) {
      this.ctx.fillText(text, x, y);
      return;
    }

    const lineHeight = size * 1.4;
    const startY = baseline === "middle"
      ? y - ((lines.length - 1) * lineHeight) / 2
      : y;
    for (let i = 0; i < lines.length; i++) {
      this.ctx.fillText(lines[i]!, x, startY + i * lineHeight);
    }
  }

  drawFixation(
    x: number,
    y: number,
    size: number,
    thickness: number,
    color: Color,
  ): void {
    const half = size / 2;
    this.ctx.strokeStyle = css(color);
    this.ctx.lineWidth = thickness;
    this.ctx.beginPath();
    this.ctx.moveTo(x - half, y);
    this.ctx.lineTo(x + half, y);
    this.ctx.moveTo(x, y - half);
    this.ctx.lineTo(x, y + half);
    this.ctx.stroke();
  }

  drawImage(x: number, y: number, w: number, h: number, src: string): void {
    let img = this.images.get(src);
    if (img === undefined) {
      img = new Image();
      img.src = src;
      this.images.set(src, img);
    }
    if (img.complete && img.naturalWidth > 0) {
      this.ctx.drawImage(img, x, y, w, h);
    }
  }

  preload(srcs: string[]): Promise<void[]> {
    return Promise.all(
      srcs.map(
        (src) =>
          new Promise<void>((resolve, reject) => {
            const img = new Image();
            img.onload = () => {
              this.images.set(src, img);
              resolve();
            };
            img.onerror = () =>
              reject(new Error(`Failed to load image: ${src}`));
            img.src = src;
          }),
      ),
    );
  }
}
