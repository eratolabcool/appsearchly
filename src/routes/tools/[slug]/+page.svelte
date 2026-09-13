<script lang="ts">
  import { Star, ArrowUpRight, Users, TrendingUp, Globe, ChevronRight, Building2 } from 'lucide-svelte';

  export let data;

  $: tool = data.tool;
  $: metadata = tool.metadata ?? {};
  $: useCases = Array.isArray(metadata.use_cases) ? metadata.use_cases : [];
  $: targetUsers = Array.isArray(metadata.target_users) ? metadata.target_users : [];
  $: integrations = Array.isArray(metadata.integrations) ? metadata.integrations : [];
  $: platforms = Array.isArray(metadata.platforms) ? metadata.platforms : [];
  $: rootCategory = tool.categories?.[0] ?? null;
  $: featureList = Array.isArray(tool.features) && tool.features.length > 0 ? tool.features : useCases.map((item) => ({ name: item, slug: item.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));

  $: faq = [
    {
      question: `What is ${tool.name}?`,
      answer: tool.description
    },
    {
      question: `How much does ${tool.name} cost?`,
      answer: tool.pricing.length
        ? `${tool.name} has ${tool.pricing.map((plan) => plan.planName).join(', ')} pricing options.`
        : `${tool.name} pricing information is being verified.`
    },
    {
      question: `Who uses ${tool.name}?`,
      answer: targetUsers.length ? targetUsers.join(', ') : 'AI software buyers, teams, and operators comparing tools.'
    }
  ];

  $: jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: tool.name,
    description: tool.description,
    applicationCategory: rootCategory?.name ?? 'AI Software',
    url: tool.websiteUrl,
    image: tool.logoUrl ?? tool.faviconUrl ?? undefined,
    ...(typeof tool.rating === 'number' && typeof tool.reviewCount === 'number'
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: tool.rating,
            reviewCount: tool.reviewCount
          }
        }
      : {}),
    offers: tool.pricing.length
      ? tool.pricing.map((plan) => ({
          '@type': 'Offer',
          name: plan.planName,
          price: plan.price ?? 0,
          priceCurrency: plan.currency ?? 'USD'
        }))
      : {
          '@type': 'Offer',
          price: tool.pricingType === 'free' ? 0 : undefined,
          priceCurrency: 'USD'
        },
    mainEntity: faq.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  function formatNumber(num: number | undefined): string {
    if (num == null) return '';
    if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
    if (num >= 1_000) return `${(num / 1_000).toFixed(0)}K`;
    return String(num);
  }

  function pricingLabel(type: string | null): string | null {
    if (type === 'free') return 'Free';
    if (type === 'freemium') return 'Freemium';
    if (type === 'subscription') return 'Subscription';
    if (type === 'one_time') return 'One-time';
    return type ?? null;
  }
</script>

<svelte:head>
  <title>{tool.name} - AI Tool Details | AppSearchly</title>
  <meta name="description" content={tool.shortDescription || tool.description} />
  <link rel="canonical" href={`https://www.appsearchly.com/tools/${tool.slug}`} />
  <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
</svelte:head>

<main class="bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
  <!-- Header -->
  <section class="border-b bg-white dark:bg-slate-900 dark:border-slate-700">
    <div class="mx-auto max-w-6xl px-6 py-12">
      <!-- Breadcrumb -->
      <nav class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400" aria-label="Breadcrumb">
        <a class="hover:text-blue-600 dark:hover:text-blue-400 font-medium" href="/">Home</a>
        <ChevronRight size={14} class="text-slate-300 dark:text-slate-600" />
        <a class="hover:text-blue-600 dark:hover:text-blue-400 font-medium" href="/categories">Categories</a>
        {#if rootCategory}
          <ChevronRight size={14} class="text-slate-300 dark:text-slate-600" />
          <a class="hover:text-blue-600 dark:hover:text-blue-400 font-medium" href="/category/{rootCategory.slug}">{rootCategory.name}</a>
        {/if}
        <ChevronRight size={14} class="text-slate-300 dark:text-slate-600" />
        <span class="text-slate-900 dark:text-slate-100 font-semibold">{tool.name}</span>
      </nav>

      <div class="mt-6 flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div class="flex gap-5">
          <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-slate-100 dark:bg-slate-700 text-2xl font-bold">
            {#if tool.logoUrl || tool.faviconUrl}
              <img class="h-14 w-14 rounded object-contain" src={tool.logoUrl ?? tool.faviconUrl} alt="{tool.name} logo" />
            {:else if tool.icon}
              <span>{tool.icon}</span>
            {:else}
              {tool.name.slice(0, 1)}
            {/if}
          </div>
          <div>
            <div class="mb-3 flex flex-wrap items-center gap-2">
              {#if tool.isVerified}
                <span class="rounded border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300">Verified</span>
              {/if}
              {#if pricingLabel(tool.pricingType)}
                <span class="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-semibold uppercase text-slate-600 dark:text-slate-300">
                  {pricingLabel(tool.pricingType)}
                </span>
              {/if}
              {#if rootCategory}
                <a href="/category/{rootCategory.slug}" class="rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-blue-600 dark:text-blue-400 hover:border-blue-300 transition-colors">
                  {rootCategory.name}
                </a>
              {/if}
            </div>
            <h1 class="text-4xl font-bold tracking-tight">{tool.name}</h1>
            <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600 dark:text-slate-400">{tool.description}</p>

            <!-- Rating + traffic quick stats -->
            <div class="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
              {#if typeof tool.rating === 'number'}
                <div class="flex items-center gap-2">
                  <div class="flex items-center gap-0.5">
                    {#each Array(5) as _, i}
                      <Star
                        size={16}
                        class={i < Math.round(tool.rating) ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'}
                      />
                    {/each}
                  </div>
                  <span class="font-bold">{tool.rating}</span>
                  {#if typeof tool.reviewCount === 'number'}
                    <span class="text-sm text-slate-500 dark:text-slate-400">({tool.reviewCount.toLocaleString()} reviews)</span>
                  {/if}
                </div>
              {/if}
              {#if typeof tool.monthlyVisits === 'number'}
                <div class="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <Users size={15} class="text-slate-400" />
                  <span class="font-semibold text-slate-700 dark:text-slate-200">{formatNumber(tool.monthlyVisits)}</span> visits/mo
                  {#if typeof tool.growth === 'number' && tool.growth > 0}
                    <span class="text-emerald-600 dark:text-emerald-400 font-semibold">+{formatNumber(tool.growth)}</span>
                  {/if}
                </div>
              {/if}
            </div>
          </div>
        </div>

        <a
          class="inline-flex shrink-0 items-center justify-center gap-2 rounded-md bg-slate-950 dark:bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-slate-800 dark:hover:bg-blue-500 transition-colors"
          href={tool.affiliateUrl ?? tool.websiteUrl}
          rel="nofollow sponsored noopener"
          target="_blank"
        >
          <Globe size={17} />
          Visit Website
          <ArrowUpRight size={15} />
        </a>
      </div>
    </div>
  </section>

  <section class="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[2fr_1fr]">
    <div class="space-y-8">
      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-xl font-semibold">Features</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each featureList as feature}
            <a class="rounded border bg-slate-50 dark:bg-slate-700 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors" href="/search?q={encodeURIComponent(feature.name)}">{feature.name}</a>
          {:else}
            <p class="text-slate-500 dark:text-slate-400">Feature data is being verified.</p>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-xl font-semibold">Pricing</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          {#each tool.pricing as plan}
            <div class="rounded-md border p-4">
              <h3 class="font-semibold">{plan.planName}</h3>
              <p class="mt-2 text-2xl font-bold">
                {plan.price === null ? 'Custom' : `${plan.currency ?? 'USD'} ${plan.price}`}
              </p>
              <p class="text-sm text-slate-500 dark:text-slate-400">{plan.billingPeriod ?? 'period not listed'}</p>
            </div>
          {:else}
            <p class="text-slate-500 dark:text-slate-400">Pricing verification is pending.</p>
          {/each}
        </div>
      </section>

      {#if useCases.length > 0}
        <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
          <h2 class="text-xl font-semibold">Use Cases</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            {#each useCases as item}
              <span class="rounded bg-blue-50 dark:bg-blue-500/15 px-3 py-2 text-sm text-blue-800 dark:text-blue-200">{item}</span>
            {/each}
          </div>
        </section>
      {/if}

      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-xl font-semibold">Alternatives</h2>
        <div class="mt-4 grid gap-3">
          {#each tool.alternatives as alternative}
            <a class="rounded-md border p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" href="/tools/{alternative.slug}">
              <h3 class="font-semibold">{alternative.name}</h3>
              <p class="mt-1 text-sm text-slate-600 dark:text-slate-400">{alternative.shortDescription}</p>
            </a>
          {:else}
            <p class="text-slate-500 dark:text-slate-400">Similar tools are being indexed.</p>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-xl font-semibold">FAQ</h2>
        <div class="mt-4 divide-y divide-slate-100 dark:divide-slate-700">
          {#each faq as item}
            <details class="py-3">
              <summary class="cursor-pointer font-medium">{item.question}</summary>
              <p class="mt-2 text-slate-600 dark:text-slate-400">{item.answer}</p>
            </details>
          {/each}
        </div>
      </section>
    </div>

    <aside class="space-y-6">
      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-lg font-semibold">Quick Facts</h2>
        <dl class="mt-4 space-y-3 text-sm">
          {#if typeof tool.monthlyVisits === 'number'}
            <div class="flex items-center justify-between">
              <dt class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Users size={14} /> Monthly visits</dt>
              <dd class="font-semibold">{formatNumber(tool.monthlyVisits)}</dd>
            </div>
          {/if}
          {#if typeof tool.rating === 'number'}
            <div class="flex items-center justify-between">
              <dt class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Star size={14} /> Rating</dt>
              <dd class="font-semibold">{tool.rating}{typeof tool.reviewCount === 'number' ? ` (${tool.reviewCount.toLocaleString()})` : ''}</dd>
            </div>
          {/if}
          {#if tool.companyName}
            <div class="flex items-center justify-between">
              <dt class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Building2 size={14} /> Company</dt>
              <dd class="font-semibold text-right">{tool.companyName}</dd>
            </div>
          {/if}
          {#if platforms.length > 0}
            <div class="flex items-center justify-between">
              <dt class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><Globe size={14} /> Platforms</dt>
              <dd class="font-semibold">{platforms.join(', ')}</dd>
            </div>
          {/if}
          {#if tool.pricingType}
            <div class="flex items-center justify-between">
              <dt class="flex items-center gap-1.5 text-slate-500 dark:text-slate-400"><TrendingUp size={14} /> Pricing</dt>
              <dd class="font-semibold">{pricingLabel(tool.pricingType)}</dd>
            </div>
          {/if}
        </dl>
      </section>

      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-lg font-semibold">Categories</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each tool.categories as category}
            <a class="rounded border px-3 py-2 text-sm hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors" href="/category/{category.slug}">{category.icon ?? ''} {category.name}</a>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
        <h2 class="text-lg font-semibold">Who Uses It</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each targetUsers as item}
            <span class="rounded bg-slate-100 dark:bg-slate-700 px-3 py-2 text-sm">{item}</span>
          {:else}
            <span class="text-sm text-slate-500 dark:text-slate-400">Audience data pending.</span>
          {/each}
        </div>
      </section>

      {#if integrations.length > 0}
        <section class="rounded-lg border bg-white dark:bg-slate-800 p-6">
          <h2 class="text-lg font-semibold">Integrations</h2>
          <div class="mt-4 flex flex-wrap gap-2">
            {#each integrations as integration}
              <span class="rounded bg-slate-100 dark:bg-slate-700 px-3 py-2 text-sm">{integration}</span>
            {/each}
          </div>
        </section>
      {/if}
    </aside>
  </section>
</main>
