<script lang="ts">
  let name = '';
  let website = '';
  let description = '';
  let email = '';
  let message = '';

  async function submit() {
    const response = await fetch('/api/submissions', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name, website, description, email })
    });

    const result = await response.json();
    message = result.success ? 'Submitted for review.' : result.error;
  }
</script>

<h1>Submit an AI Tool</h1>

<input bind:value={name} placeholder="Tool name" />
<input bind:value={website} placeholder="Website URL" />
<textarea bind:value={description} placeholder="Description"></textarea>
<input bind:value={email} placeholder="Email" />
<button on:click={submit}>Submit</button>

<p>{message}</p>
