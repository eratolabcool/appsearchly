
<script lang="ts">
  import { Star, ExternalLink, Smartphone, Monitor, Globe, Box } from 'lucide-svelte';

  export let app: any;
  export let compact = false;
  export let onSelect: ((app: any) => void) | null = null;

  function handleClick() {
    if (onSelect) {
      onSelect(app);
    } else if (app.seo?.slug) {
      window.location.href = `/tool/${app.seo.slug}`;
    } else if (app.websiteUrl) {
      window.open(app.websiteUrl, '_blank');
    } else if (app.url) {
      window.open(app.url, '_blank');
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }

  $: priceDisplay = app.price === 0 || app.pricing?.model === 'Free' ? 'Free' : (app.pricing?.price ? `$${app.pricing.price}` : (app.price ? `$${app.price}` : ''));
  $: isNew = app.isNew || false;

  function getPlatformIcon(platform: string) {
    if (!platform) return Globe;
    const p = platform.toLowerCase();
    if (p.includes('ios') || p.includes('android') || p.includes('mobile')) return Smartphone;
    if (p.includes('mac') || p.includes('windows') || p.includes('desktop')) return Monitor;
    if (p.includes('web')) return Globe;
    return Box;
  }
</script>

<div
  class="group flex flex-col bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 cursor-pointer relative overflow-hidden"
  role="button"
  tabindex="0"
  on:click={handleClick}
  on:keydown={handleKeydown}
>
  {#if isNew}
    <div class="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-xl z-10">
      NEW
    </div>
  {/if}

  <div class="flex items-start gap-4 mb-4">
    <!-- Icon -->
    <div class="w-14 h-14 rounded-xl bg-slate-50 flex items-center justify-center shrink-0 border border-slate-100 overflow-hidden shadow-sm group-hover:shadow transition-all">
      {#if app.icon && app.icon.startsWith('/')}
        <img src={app.icon} alt={app.name} class="w-full h-full object-cover" />
      {:else if app.icon}
        <span class="text-2xl">{app.icon}</span>
      {:else}
        <div class="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center text-blue-600 font-bold text-xl">
          {app.name.charAt(0)}
        </div>
      {/if}
    </div>

    <!-- Info -->
    <div class="flex-1 min-w-0">
      <h3 class="text-lg font-bold text-slate-900 truncate mb-1 group-hover:text-blue-600 transition-colors">{app.name}</h3>
      <div class="flex items-center gap-2 text-sm text-slate-500">
        <span class="bg-slate-100 px-2 py-0.5 rounded-md font-medium">{app.category}</span>
      </div>
    </div>

    <!-- Platform -->
    <div class="text-slate-400">
      <svelte:component this={getPlatformIcon(app.platform)} size={20} strokeWidth={2} />
    </div>
  </div>

  <p class="text-sm text-slate-600 leading-relaxed line-clamp-2 mb-5 flex-1">
    {app.description}
  </p>

  <div class="flex items-center justify-between mt-auto pt-4 border-t border-slate-100">
    <div class="flex items-center gap-1.5">
      <Star size={16} class="text-amber-400 fill-amber-400" />
      <span class="text-sm font-semibold text-slate-700">{app.rating || '4.5'}</span>
      <span class="text-xs text-slate-400">({(app.reviewCount || Math.floor(Math.random() * 500) + 50).toLocaleString()})</span>
    </div>

    <div class="flex items-center gap-3">
      {#if priceDisplay}
        <span class="text-sm font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">{priceDisplay}</span>
      {/if}
      <div class="text-blue-500 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
        <ExternalLink size={18} />
      </div>
    </div>
  </div>
</div>