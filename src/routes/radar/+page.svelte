<script lang="ts">
  import { Activity } from 'lucide-svelte';
  import { DECISION_BADGES, DECISION_LABELS } from './display';
  import type { RadarPageData } from './+page.server';

  export let data: RadarPageData;

  function velocityLabel(v: Record<string, number | null> | null): string {
    if (!v) return '—';
    const val = v.v7d;
    if (val == null) return '—';
    return `${val > 0 ? '+' : ''}${val} (7d)`;
  }
</script>

<svelte:head>
  <title>Game Opportunity Radar | AppSearchly</title>
  <meta
    name="description"
    content="Daily radar of trending game opportunities across Steam, Roblox, itch.io, Coco and Playhop — scored by demand, lifecycle and SERP gaps."
  />
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400 font-semibold text-sm mb-4">
        <Activity size={15} />
        <span>Radar</span>
      </div>
      <h1 class="text-4xl font-bold tracking-tight">Game Opportunity Radar</h1>
      <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">
        Daily scan across Steam, Roblox, itch.io, Coco and Playhop — surfaced games scored by search demand, lifecycle and SEO gaps.
      </p>
    </div>
  </section>

  <section class="mx-auto max-w-6xl px-6 py-10 space-y-6">
    {#if data.report}
      <div class="rounded-xl border bg-white dark:bg-slate-800 p-6">
        <div class="flex flex-wrap items-center gap-3">
          <h2 class="text-xl font-bold">Latest report — {data.report.report_date}</h2>
          <span class="text-xs font-bold px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-700 {data.report.status === 'success' ? 'text-emerald-700 dark:text-emerald-400' : data.report.status === 'partial' ? 'text-amber-700 dark:text-amber-400' : 'text-rose-700 dark:text-rose-400'}">
            {data.report.status}
          </span>
          <span class="text-sm text-slate-500 dark:text-slate-400">{data.report.opportunity_count} opportunities</span>
        </div>
        {#if data.report.sources_health?.length}
          <p class="mt-3 text-sm text-slate-500 dark:text-slate-400">
            Sources:
            {#each data.report.sources_health as s (s.id)}
              <span class="mr-2">{s.id}: {s.ok ? s.count : 'error'}</span>
            {/each}
          </p>
        {/if}
      </div>

      {#if data.top.length > 0}
        <div class="grid gap-4 sm:grid-cols-2">
          {#each data.top as game (game.slug)}
            <a class="group block rounded-xl border bg-white dark:bg-slate-800 p-6 hover:border-indigo-300 hover:shadow-sm transition-all" href="/radar/games">
              <div class="flex items-start justify-between gap-3">
                <h3 class="text-lg font-bold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{game.display_title}</h3>
                <span class="shrink-0 text-lg font-bold text-indigo-600 dark:text-indigo-400">{game.score}</span>
              </div>
              <div class="mt-2 flex flex-wrap gap-2 text-xs">
                <span class="font-bold px-2 py-0.5 rounded-md {DECISION_BADGES[game.decision] ?? DECISION_BADGES.IGNORE}">
                  {DECISION_LABELS[game.decision] ?? game.decision}
                </span>
                <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                  {velocityLabel(game.velocity)}
                </span>
                {#each game.platforms ?? [] as p (p)}
                  <span class="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{p}</span>
                {/each}
              </div>
              {#if game.seo_gap?.missingAssets?.length}
                <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
                  Gaps: {game.seo_gap.missingAssets.slice(0, 3).join(', ')}
                </p>
              {/if}
            </a>
          {/each}
        </div>
      {:else}
        <div class="rounded-xl border bg-white dark:bg-slate-800 p-10 text-center text-slate-500 dark:text-slate-400">
          No opportunities recorded yet. The radar runs daily at 02:00 UTC — check back after the next run.
        </div>
      {/if}
    {:else}
      <div class="rounded-xl border bg-white dark:bg-slate-800 p-10 text-center">
        <p class="text-lg font-semibold text-slate-600 dark:text-slate-300">No radar report available yet.</p>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {#if data.configured}
            The radar has not run yet — first report lands after the next scheduled run at 02:00 UTC.
          {:else}
            Database is not configured in this environment.
          {/if}
        </p>
      </div>
    {/if}

    <div class="text-center">
      <a class="inline-block rounded-lg bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-500" href="/radar/games">
        View full opportunity list →
      </a>
    </div>
  </section>
</main>
