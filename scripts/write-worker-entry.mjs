import { writeFile } from 'node:fs/promises';

const OUTPUT_PATH = 'worker-entry.mjs';

const source = `import svelteWorker from './.svelte-kit/cloudflare/_worker.js';
import { withDatabase } from './src/lib/server/db.ts';
import { runDiscovery } from './src/lib/server/acquisition/pipeline.ts';

async function runScheduledDiscovery(env) {
  if (!env?.HYPERDRIVE?.connectionString) {
    console.warn('AppSearchly acquisition cron skipped: database is not configured.');
    return;
  }

  const summary = await withDatabase({ env }, (client) =>
    runDiscovery(client, {
      sourceLimit: 6,
      itemLimit: 100,
      extractorEndpoint: env.AI_EXTRACTOR_ENDPOINT,
      extractorApiKey: env.AI_EXTRACTOR_API_KEY
    })
  );
  console.log('AppSearchly acquisition cron completed:', JSON.stringify(summary));
}

export default {
  fetch(request, env, context) {
    return svelteWorker.fetch(request, env, context);
  },

  scheduled(_controller, env, context) {
    context.waitUntil(runScheduledDiscovery(env));
  }
};
`;

await writeFile(OUTPUT_PATH, source, { mode: 0o644 });
console.log(`Generated ${OUTPUT_PATH} with AppSearchly acquisition cron handler.`);
