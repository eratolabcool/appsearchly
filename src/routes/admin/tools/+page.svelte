<script lang="ts">
  type AdminTool = {
    id: string;
    name: string;
    slug: string;
    website_url: string;
    pricing_type: string | null;
    status: string;
    is_verified: boolean;
    data_confidence: number;
    categories: Array<{ id: string; name: string; slug: string }>;
  };

  let tools: AdminTool[] = [];
  let loading = true;
  let message = '';

  async function loadTools() {
    loading = true;
    const response = await fetch('/api/admin/tools');
    const data = await response.json();
    tools = data.items ?? [];
    loading = false;
  }

  async function updateTool(tool: AdminTool) {
    const response = await fetch(`/api/admin/tools/${tool.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        status: tool.status,
        pricingType: tool.pricing_type,
        isVerified: tool.is_verified,
        dataConfidence: Number(tool.data_confidence)
      })
    });

    message = response.ok ? 'Saved' : 'Save failed';
    await loadTools();
  }

  loadTools();
</script>

<svelte:head>
  <title>Admin Tool Management | AppSearchly</title>
</svelte:head>

<main class="mx-auto max-w-7xl px-6 py-8">
  <div class="mb-6 flex items-center justify-between">
    <div>
      <h1 class="text-3xl font-bold">Tool Management</h1>
      <p class="mt-2 text-slate-600">Review, verify, and tune AI tool records.</p>
    </div>
    <a class="rounded border px-4 py-2" href="/admin/submissions">Submissions</a>
  </div>

  {#if message}
    <p class="mb-4 rounded border bg-slate-50 px-4 py-2 text-sm">{message}</p>
  {/if}

  {#if loading}
    <p>Loading tools...</p>
  {:else}
    <div class="overflow-x-auto rounded-lg border bg-white">
      <table class="w-full min-w-[900px] text-left text-sm">
        <thead class="border-b bg-slate-50">
          <tr>
            <th class="p-3">Tool</th>
            <th class="p-3">Categories</th>
            <th class="p-3">Pricing</th>
            <th class="p-3">Status</th>
            <th class="p-3">Score</th>
            <th class="p-3">Verified</th>
            <th class="p-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each tools as tool}
            <tr class="border-b align-top">
              <td class="p-3">
                <a class="font-semibold text-blue-700" href="/tools/{tool.slug}">{tool.name}</a>
                <div class="mt-1 text-xs text-slate-500">{tool.website_url}</div>
              </td>
              <td class="p-3">
                {tool.categories.map((category) => category.name).join(', ') || 'Uncategorized'}
              </td>
              <td class="p-3">
                <select class="rounded border px-2 py-1" bind:value={tool.pricing_type}>
                  <option value="free">free</option>
                  <option value="freemium">freemium</option>
                  <option value="paid">paid</option>
                  <option value="subscription">subscription</option>
                  <option value="usage_based">usage_based</option>
                  <option value="contact_sales">contact_sales</option>
                  <option value="unknown">unknown</option>
                </select>
              </td>
              <td class="p-3">
                <select class="rounded border px-2 py-1" bind:value={tool.status}>
                  <option value="draft">draft</option>
                  <option value="needs_review">needs_review</option>
                  <option value="published">published</option>
                  <option value="suspended">suspended</option>
                  <option value="archived">archived</option>
                </select>
              </td>
              <td class="p-3">
                <input class="w-20 rounded border px-2 py-1" type="number" min="0" max="100" bind:value={tool.data_confidence} />
              </td>
              <td class="p-3">
                <input type="checkbox" bind:checked={tool.is_verified} />
              </td>
              <td class="p-3">
                <button class="rounded bg-slate-950 px-3 py-2 text-white" on:click={() => updateTool(tool)}>Save</button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
</main>
