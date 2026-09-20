<script lang="ts">
  import { Activity } from 'lucide-svelte';
  import { DECISION_BADGES, DECISION_LABELS } from '../display';
  import type { RadarGamesPageData } from './+page.server';

  export let data: RadarGamesPageData;

  const gateLabels: Record<string, string> = { g1: 'Demand', g2: 'Lifecycle', g3: 'SERP' };

  function velocityLabel(v: Record<string, number | null> | null): string {
    if (!v) return '—';
    const val = v.v7d;
    if (val == null) return '—';
    return `${val > 0 ? '+' : ''}${val}`;
  }
</script>

<svelte:head>
  <title>Game Opportunity List | AppSearchly</title>
  <meta
    name="description"
    content="Full ranked list of game opportunities from the daily radar — scores, build decisions, gates and SEO asset gaps."
  />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold text-sm mb-4">
        <Activity size={15} />
        <span>Radar</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight">Game Opportunity List</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
        Ranked by composite score: heat, growth, SEO gaps, multi-source presence, velocity and freshness.
      </p>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-10 space-y-4">
    {#if data.games.length === 0}
      <div class="rounded-xl border bg-white dark:bg-slate-800 p-10 text-center">
        <p class="text-lg font-semibold text-slate-600 dark:text-slate-300">No opportunities recorded yet.</p>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {#if data.configured}
            The radar has not run yet — first report lands after the next scheduled run at 02:00 UTC.
          {:else}
            Database is not configured in this environment.
          {/if}
        </p>
      </div>
    {:else}
      {#each data.games as game (game.slug)}
        <div class="rounded-xl border bg-white dark:bg-slate-800 p-6">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-bold">{game.display_title}</h2>
              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <span class="font-bold px-2 py-0.5 rounded-md {DECISION_BADGES[game.decision] ?? DECISION_BADGES.IGNORE}">
                  {DECISION_LABELS[game.decision] ?? game.decision}
                </span>
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  velocity {velocityLabel(game.velocity)}
                </span>
                {#each game.platforms ?? [] as p (p)}
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{p}</span>
                {/each}
                {#if game.seo_gap?.seoDifficulty}
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                    SEO: {game.seo_gap.seoDifficulty}
                  </span>
                {/if}
              </div>
            </div>
            <span class="shrink-0 text-2xl font-bold text-indigo-600 dark:text-indigo-400">{game.score}</span>
          </div>

          <div class="mt-3 flex flex-wrap gap-2 text-xs">
            {#each Object.entries(gateLabels) as [key, label] (key)}
              {#if game.gates?.[key as keyof typeof game.gates]}
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400">
                  {label}:
                  <span class="font-bold {game.gates[key as keyof typeof game.gates] === 'PASS' ? 'text-emerald-600 dark:text-emerald-400' : game.gates[key as keyof typeof game.gates] === 'PARTIAL' ? 'text-amber-600 dark:text-amber-400' : 'text-rose-600 dark:text-rose-400'}">
                    {game.gates[key as keyof typeof game.gates]}
                  </span>
                </span>
              {/if}
            {/each}
          </div>

          {#if game.seo_gap?.missingAssets?.length}
            <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Missing assets:
              {#each game.seo_gap.missingAssets as asset (asset)}
                <span class="mr-1 inline-block px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-xs">{asset}</span>
              {/each}
            </p>
          {/if}
          {#if game.seo_gap?.thesis}
            <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">{game.seo_gap.thesis}</p>
          {/if}
        </div>
      {/each}
    {/if}
  </section>
</main>
