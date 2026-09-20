import { writeFile } from 'node:fs/promises';

const OUTPUT_PATH = 'worker-entry.mjs';

const source = `import svelteWorker from './.svelte-kit/cloudflare/_worker.js';
import { runDailyCron, runWeeklyArticleCron } from './src/lib/server/cron.ts';
import { runRadarCron } from './src/lib/server/radar/pipeline.ts';

async function runScheduledJob(controller, env) {
  try {
    if (controller.cron === '30 0 * * 1') {
      const result = await runWeeklyArticleCron({ env });
      console.log('AppSearchly weekly article cron completed:', JSON.stringify(result));
      return;
    }
    if (controller.cron === '0 2 * * *') {
      const digest = await runRadarCron(env);
      console.log('AppSearchly radar cron completed:', JSON.stringify(digest));
      return;
    }
    const report = await runDailyCron({ env });
    console.log('AppSearchly daily cron completed:', JSON.stringify(report));
  } catch (error) {
    console.error('AppSearchly scheduled cron failed:', error);
  }
}

export default {
  fetch(request, env, context) {
    return svelteWorker.fetch(request, env, context);
  },

  scheduled(controller, env, context) {
    context.waitUntil(runScheduledJob(controller, env));
  }
};
`;

await writeFile(OUTPUT_PATH, source, { mode: 0o644 });
console.log(`Generated ${OUTPUT_PATH} with AppSearchly scheduled cron handlers.`);
