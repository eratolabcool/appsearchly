<script lang="ts">
  export let data;

  $: tool = data.tool;
  $: metadata = tool.metadata ?? {};
  $: useCases = Array.isArray(metadata.use_cases) ? metadata.use_cases : [];
  $: targetUsers = Array.isArray(metadata.target_users) ? metadata.target_users : [];
  $: integrations = Array.isArray(metadata.integrations) ? metadata.integrations : [];
  $: platforms = Array.isArray(metadata.platforms) ? metadata.platforms : [];
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
    applicationCategory: tool.categories[0]?.name ?? 'AI Software',
    url: tool.websiteUrl,
    image: tool.logoUrl ?? tool.faviconUrl ?? undefined,
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
</script>

<svelte:head>
  <title>{tool.name} - AI Tool Details | AppSearchly</title>
  <meta name="description" content={tool.shortDescription || tool.description} />
  <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
</svelte:head>

<main class="bg-slate-50 text-slate-900">
  <section class="border-b bg-white">
    <div class="mx-auto grid max-w-6xl gap-8 px-6 py-12 lg:grid-cols-[1fr_auto] lg:items-center">
      <div class="flex gap-5">
        <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border bg-slate-100 text-2xl font-bold">
          {#if tool.logoUrl || tool.faviconUrl}
            <img class="h-14 w-14 rounded object-contain" src={tool.logoUrl ?? tool.faviconUrl} alt="{tool.name} logo" />
          {:else}
            {tool.name.slice(0, 1)}
          {/if}
        </div>
        <div>
          <div class="mb-3 flex flex-wrap items-center gap-2">
            {#if tool.isVerified}
              <span class="rounded border border-emerald-200 bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">Verified</span>
            {/if}
            {#if tool.pricingType}
              <span class="rounded border px-2 py-1 text-xs font-semibold uppercase text-slate-600">{tool.pricingType}</span>
            {/if}
          </div>
          <h1 class="text-4xl font-bold tracking-tight">{tool.name}</h1>
          <p class="mt-4 max-w-3xl text-lg leading-8 text-slate-600">{tool.description}</p>
        </div>
      </div>
      <a class="inline-flex items-center justify-center rounded-md bg-slate-950 px-5 py-3 font-semibold text-white hover:bg-slate-800" href={tool.affiliateUrl ?? tool.websiteUrl} rel="nofollow sponsored noopener" target="_blank">
        Visit Website
      </a>
    </div>
  </section>

  <section class="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[2fr_1fr]">
    <div class="space-y-8">
      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-xl font-semibold">Features</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each tool.features as feature}
            <a class="rounded border bg-slate-50 px-3 py-2 text-sm hover:bg-slate-100" href="/search?feature={feature.slug}">{feature.name}</a>
          {:else}
            <p class="text-slate-500">Feature data is being verified.</p>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-xl font-semibold">Pricing</h2>
        <div class="mt-4 grid gap-3 sm:grid-cols-2">
          {#each tool.pricing as plan}
            <div class="rounded-md border p-4">
              <h3 class="font-semibold">{plan.planName}</h3>
              <p class="mt-2 text-2xl font-bold">
                {plan.price === null ? 'Custom' : `${plan.currency ?? 'USD'} ${plan.price}`}
              </p>
              <p class="text-sm text-slate-500">{plan.billingPeriod ?? 'period not listed'}</p>
            </div>
          {:else}
            <p class="text-slate-500">Pricing verification is pending.</p>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-xl font-semibold">Use Cases</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each useCases as item}
            <span class="rounded bg-blue-50 px-3 py-2 text-sm text-blue-800">{item}</span>
          {:else}
            <p class="text-slate-500">Use cases will be expanded as AppSearchly verifies this tool.</p>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-xl font-semibold">Alternatives</h2>
        <div class="mt-4 grid gap-3">
          {#each tool.alternatives as alternative}
            <a class="rounded-md border p-4 hover:bg-slate-50" href="/tools/{alternative.slug}">
              <h3 class="font-semibold">{alternative.name}</h3>
              <p class="mt-1 text-sm text-slate-600">{alternative.shortDescription}</p>
            </a>
          {:else}
            <p class="text-slate-500">Similar tools are being indexed.</p>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-xl font-semibold">FAQ</h2>
        <div class="mt-4 divide-y">
          {#each faq as item}
            <details class="py-3">
              <summary class="cursor-pointer font-medium">{item.question}</summary>
              <p class="mt-2 text-slate-600">{item.answer}</p>
            </details>
          {/each}
        </div>
      </section>
    </div>

    <aside class="space-y-6">
      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">Categories</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each tool.categories as category}
            <a class="rounded border px-3 py-2 text-sm hover:bg-slate-50" href="/category/{category.slug}">{category.icon ?? ''} {category.name}</a>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">Who Uses It</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each targetUsers as item}
            <span class="rounded bg-slate-100 px-3 py-2 text-sm">{item}</span>
          {:else}
            <span class="text-sm text-slate-500">Audience data pending.</span>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">Platforms</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each platforms as platform}
            <span class="rounded bg-slate-100 px-3 py-2 text-sm">{platform}</span>
          {:else}
            <span class="text-sm text-slate-500">Platform data pending.</span>
          {/each}
        </div>
      </section>

      <section class="rounded-lg border bg-white p-6">
        <h2 class="text-lg font-semibold">Integrations</h2>
        <div class="mt-4 flex flex-wrap gap-2">
          {#each integrations as integration}
            <span class="rounded bg-slate-100 px-3 py-2 text-sm">{integration}</span>
          {:else}
            <span class="text-sm text-slate-500">Integration data pending.</span>
          {/each}
        </div>
      </section>
    </aside>
  </section>
</main>
