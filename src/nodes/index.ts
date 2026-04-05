import type { RunContext } from '../scheduler/index.js';

export abstract class Node {
  abstract run(ctx: RunContext): Promise<void>;
}

export class SequenceNode extends Node {
  constructor(readonly children: readonly Node[]) { super(); }

  async run(ctx: RunContext): Promise<void> {
    for (const child of this.children) {
      await child.run(ctx);
    }
  }
}

export class RepeatNode extends Node {
  constructor(
    readonly child: Node,
    readonly count: number,
    readonly shuffle = false,
  ) { super(); }

  async run(ctx: RunContext): Promise<void> {
    const indices = Array.from({ length: this.count }, (_, i) => i);
    if (this.shuffle) fisherYates(indices);
    for (const _i of indices) {
      await this.child.run(ctx);
    }
  }
}

export class FunctionNode extends Node {
  constructor(private readonly fn: (ctx: RunContext) => Promise<void>) { super(); }

  run(ctx: RunContext): Promise<void> {
    return this.fn(ctx);
  }
}

function fisherYates(arr: unknown[]): void {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
}
