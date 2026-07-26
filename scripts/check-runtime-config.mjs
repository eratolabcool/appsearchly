import { readFile } from 'node:fs/promises';

const requiredFiles = {
  packageJson: 'package.json',
  svelteConfig: 'svelte.config.js',
  wranglerConfig: 'wrangler.jsonc',
  healthRoute: 'src/routes/api/health/+server.ts',
  submitRoute: 'src/routes/api/submit-app/+server.ts',
  databaseClient: 'src/lib/server/db.ts',
  productionConfig: 'scripts/render-production-config.mjs',
  workerEntryWriter: 'scripts/write-worker-entry.mjs'
};

const contents = Object.fromEntries(
  await Promise.all(
    Object.entries(requiredFiles).map(async ([key, file]) => [key, await readFile(file, 'utf8')])
  )
);

const packageJson = JSON.parse(contents.packageJson);
const failures = [];

function requireCondition(condition, message) {
  if (!condition) failures.push(message);
}

requireCondition(
  packageJson.devDependencies?.['@sveltejs/adapter-cloudflare'],
  'Cloudflare adapter dependency is missing.'
);
requireCondition(packageJson.dependencies?.pg, 'PostgreSQL pg dependency is missing.');
requireCondition(packageJson.devDependencies?.wrangler, 'Wrangler dependency is missing.');
requireCondition(
  !packageJson.devDependencies?.['@sveltejs/adapter-static'],
  'Static adapter must be removed from the runtime branch.'
);
requireCondition(
  contents.svelteConfig.includes("from '@sveltejs/adapter-cloudflare'"),
  'svelte.config.js is not using the Cloudflare adapter.'
);
requireCondition(
  contents.wranglerConfig.includes('.svelte-kit/cloudflare/_worker.js'),
  'Wrangler main entry does not target the generated SvelteKit Worker.'
);
requireCondition(
  contents.wranglerConfig.includes('"triggers"') && contents.wranglerConfig.includes('"0 0 * * *"'),
  'Wrangler config must schedule the acquisition cron for daily 00:00 UTC.'
);
requireCondition(
  contents.productionConfig.includes("main: 'worker-entry.mjs'") &&
    contents.productionConfig.includes("triggers: { crons: ['0 0 * * *'] }"),
  'Production Wrangler config must deploy the generated scheduled Worker entry.'
);
requireCondition(
  contents.workerEntryWriter.includes("./.svelte-kit/cloudflare/_worker.js") &&
    contents.workerEntryWriter.includes('scheduled(') &&
    contents.workerEntryWriter.includes('runDiscovery'),
  'Worker entry writer must delegate SvelteKit fetch and expose the acquisition scheduled handler.'
);
requireCondition(
  contents.wranglerConfig.includes('nodejs_compat'),
  'Wrangler nodejs_compat flag is required for pg.'
);
requireCondition(
  contents.databaseClient.includes('HYPERDRIVE') && contents.databaseClient.includes("from 'pg'"),
  'Database client must use pg through the Hyperdrive binding.'
);
requireCondition(
  !contents.submitRoute.includes('file-storage'),
  'Submission route still imports filesystem persistence.'
);
requireCondition(
  contents.submitRoute.includes('createSubmission'),
  'Submission route is not using the PostgreSQL repository.'
);
requireCondition(
  contents.healthRoute.includes('probeDatabase') && contents.healthRoute.includes('prerender = false'),
  'Health route must perform a live database probe.'
);

if (failures.length > 0) {
  console.error('Runtime configuration audit failed:');
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Runtime configuration audit passed.');
