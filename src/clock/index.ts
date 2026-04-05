export type Ms = number;

export class Clock {
  private readonly origin: number;

  constructor() {
    this.origin = performance.now();
  }

  now(): Ms {
    return performance.now() - this.origin;
  }

  elapsed(since: Ms): Ms {
    return this.now() - since;
  }
}
