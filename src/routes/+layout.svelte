
<script lang="ts">
  import '../app.css';
  import Header from '$lib/components/Header.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<div class="flex flex-col min-h-screen bg-slate-50 text-slate-800">
  <Header />

  <main class="flex-1 w-full">
    <slot />
  </main>

  <Footer />
</div>