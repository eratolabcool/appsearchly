<script lang="ts">
  export let language = 'en';

  // Simple font loading without complex dependencies
  $: fontUrl = getFontUrl(language);

  function getFontUrl(lang: string) {
    switch (lang) {
      case 'zh':
      case 'zh-CN':
        return 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;600;700&display=swap';
      case 'ja':
        return 'https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@300;400;500;600;700&display=swap';
      case 'ko':
        return 'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap';
      default:
        return 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap';
    }
  }
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href={fontUrl} rel="stylesheet">
</svelte:head>

<style>
  :global(html) {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    line-height: 1.5;
    color: #1d1d1f;
    background: #ffffff;
  }

  :global(body) {
    margin: 0;
    padding: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* Apple system font stack */
  :global(.font-system) {
    font-family: -apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  }

  /* Font weights */
  :global(.font-light) { font-weight: 300; }
  :global(.font-normal) { font-weight: 400; }
  :global(.font-medium) { font-weight: 500; }
  :global(.font-semibold) { font-weight: 600; }
  :global(.font-bold) { font-weight: 700; }
</style>