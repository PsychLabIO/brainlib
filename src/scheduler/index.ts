import type { Clock } from '../clock/index.js';
import type { IRenderer } from '../renderer/IRenderer.js';
import { Color } from '../renderer/types.js';
import type { DataWriter } from '../data/index.js';
import type { Response, KeyCode } from '../io/index.js';

type RenderFn = () => void;

interface DurationWaiter {
  kind: 'duration';
  deadline: number;
  resolve: () => void;
}

interface ResponseWaiter {
  kind: 'response';
  keys: ReadonlySet<KeyCode>;
  deadline: number;
  resolve: (r: Response | null) => void;
}

type Waiter = DurationWaiter | ResponseWaiter;

export class RunContext {
  private renderFn: RenderFn = () => {};
  private waiter: Waiter | null = null;

  constructor(
    readonly renderer: IRenderer,
    readonly clock: Clock,
    readonly data: DataWriter,
  ) {}

  tick(): void {
    const now = this.clock.now();

    this.renderer.beginFrame(now);
    this.renderer.clear(Color.black);
    this.renderFn();
    this.renderer.endFrame();

    if (this.waiter === null) return;

    if (now >= this.waiter.deadline) {
      const w = this.waiter;
      this.waiter = null;
      if (w.kind === 'response') {
        w.resolve(null); // timeout
      } else {
        w.resolve();
      }
    }
  }

  attachBrowserInput(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (this.waiter?.kind !== 'response') return;
      if (!this.waiter.keys.has(e.code)) return;
      const w = this.waiter;
      this.waiter = null;
      w.resolve({ key: e.code, timestamp: this.clock.now() });
    });
  }

  show(render: RenderFn, durationMs: number): Promise<void> {
    this.renderFn = render;
    const deadline = this.clock.now() + durationMs;
    return new Promise<void>(resolve => {
      this.waiter = { kind: 'duration', deadline, resolve };
    });
  }

  waitResponse(
    render: RenderFn,
    keys: KeyCode[],
    timeoutMs: number,
  ): Promise<Response | null> {
    this.renderFn = render;
    const deadline = this.clock.now() + timeoutMs;
    return new Promise<Response | null>(resolve => {
      this.waiter = { kind: 'response', keys: new Set(keys), deadline, resolve };
    });
  }
}
