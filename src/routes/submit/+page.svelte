<script lang="ts">
  import { onMount } from 'svelte';
  import type { PageData } from './$types';

  let { data }: { data: PageData } = $props();
  let name = $state('');
  let website = $state('');
  let description = $state('');
  let category = $state('');
  let email = $state('');
  let turnstileToken = $state('');
  let message = $state('');
  let messageType = $state<'success' | 'error' | 'info'>('info');
  let submitting = $state(false);

  let turnstilePending = $derived(Boolean(data.turnstileSiteKey) && !turnstileToken);
  let messageClass = $derived(
    messageType === 'success'
      ? 'mt-6 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700'
      : messageType === 'error'
        ? 'mt-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700'
        : 'mt-6 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-600'
  );
  let turnstileContainer: HTMLDivElement;

  onMount(() => {
    if (!data.turnstileSiteKey) return;
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      if (!window.turnstile || !turnstileContainer) return;
      window.turnstile.render(turnstileContainer, {
        sitekey: data.turnstileSiteKey,
        callback: (token) => (turnstileToken = token),
        'expired-callback': () => (turnstileToken = ''),
        'error-callback': () => (turnstileToken = '')
      });
    };
    document.head.appendChild(script);
    return () => script.remove();
  });

  async function submit(event: SubmitEvent) {
    event.preventDefault();
    message = '';
    submitting = true;
    try {
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name, website, description, category, email, turnstileToken })
      });
      const result = await response.json();
      if (!response.ok) {
        messageType = 'error';
        message =
          result.error === 'duplicate_domain'
            ? 'This domain is already in our review queue or directory.'
            : result.error === 'rate_limited'
              ? 'Submission limit reached. Please try again later.'
              : result.error === 'captcha_failed'
                ? 'Please complete the security check and try again.'
                : result.error === 'invalid_url'
                  ? 'We could not reach that website. Check the URL and try again.'
                  : 'We could not accept this submission. Check the details and try again.';
        return;
      }
      messageType = 'success';
      message = `Submitted for review. Quality score: ${result.qualityScore}/100. You can check back soon — we review submissions in the order received.`;
      name = website = description = category = email = turnstileToken = '';
      window.turnstile?.reset();
    } catch {
      messageType = 'error';
      message = 'The submission service is temporarily unavailable. Please try again in a moment.';
    } finally {
      submitting = false;
    }
  }
</script>

<svelte:head>
  <title>Submit an AI Tool | AppSearchly</title>
  <meta name="description" content="Submit an AI product for security checks, quality scoring, and editorial review on AppSearchly." />
</svelte:head>

<main class="mx-auto max-w-2xl px-6 py-16">
  <header class="mb-10">
    <p class="text-sm font-semibold uppercase tracking-wider">AppSearchly directory</p>
    <h1 class="mt-3 text-4xl font-bold">Submit an AI tool</h1>
    <p class="mt-4 text-base opacity-75">Every submission is checked for availability, security, duplication, and editorial quality before publication.</p>
  </header>

  <form class="space-y-6" onsubmit={submit}>
    <label class="block">Tool name
      <input class="mt-2 w-full rounded-lg border p-3" bind:value={name} minlength="2" maxlength="120" required />
    </label>
    <label class="block">Official HTTPS website
      <input class="mt-2 w-full rounded-lg border p-3" bind:value={website} type="url" pattern="https://.*" placeholder="https://example.com" required />
    </label>
    <label class="block">Description
      <textarea class="mt-2 min-h-36 w-full rounded-lg border p-3" bind:value={description} maxlength="2000" placeholder="Explain what the product does and who it helps."></textarea>
    </label>
    <label class="block">Category
      <input class="mt-2 w-full rounded-lg border p-3" bind:value={category} placeholder="AI Chat, Image, Video…" />
    </label>
    <label class="block">Contact email
      <input class="mt-2 w-full rounded-lg border p-3" bind:value={email} type="email" autocomplete="email" />
    </label>

    {#if data.turnstileSiteKey}
      <div bind:this={turnstileContainer} class="rounded-lg border border-slate-200 bg-slate-50 p-4"></div>
      {#if turnstilePending}
        <p class="text-sm text-slate-500">Complete the security check above to enable submission.</p>
      {/if}
    {:else}
      <p class="text-sm opacity-70">Security verification is disabled in this non-production environment.</p>
    {/if}

    <button class="rounded-lg border px-5 py-3 font-semibold disabled:opacity-50" type="submit" disabled={submitting || turnstilePending}>
      {submitting ? 'Checking…' : 'Submit tool'}
    </button>
  </form>

  {#if message}<p class="{messageClass}" role="status">{message}</p>{/if}
</main>
