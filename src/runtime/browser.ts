import { Clock } from "../clock/index.js";
import { DataWriter } from "../data/index.js";
import { RunContext } from "../scheduler/index.js";
import type { Node } from "../nodes/index.js";
import type { IRenderer } from "../renderer/IRenderer.js";

export interface ExperimentConfig {
  participantId: string;
  experimentId: string;
  [key: string]: unknown;
}

export async function runBrowser(
  renderer: IRenderer,
  root: Node,
  config: ExperimentConfig,
): Promise<DataWriter> {
  const { participantId, experimentId, ...extra } = config;
  const clock = new Clock();
  const data = new DataWriter({
    participantId,
    experimentId,
    startTime: new Date().toISOString(),
    ...extra,
  });
  const ctx = new RunContext(renderer, clock, data);
  ctx.attachBrowserInput();

  let done = false;
  const finished = root.run(ctx).then(() => {
    done = true;
  });

  await new Promise<void>((resolveLoop) => {
    function frame(): void {
      ctx.tick();
      if (done) {
        resolveLoop();
      } else {
        requestAnimationFrame(frame);
      }
    }
    requestAnimationFrame(frame);
  });

  await finished;
  return data;
}
