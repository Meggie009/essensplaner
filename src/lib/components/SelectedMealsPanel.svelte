<script>
  import { copyToClipboard } from '../utils/clipboard.js';

  export let meals = []; // list of {id, name}

  let copied = false;
  $: text = meals.map((m) => m.name).join('\n');

  async function handleExport() {
    const ok = await copyToClipboard(text);
    if (ok) {
      copied = true;
      setTimeout(() => (copied = false), 1500);
    }
  }
</script>

<div class="panel">
  <div class="header">
    <h3>Ausgewählte Gerichte ({meals.length})</h3>
    <button class="export" on:click={handleExport} disabled={meals.length === 0}>
      {copied ? 'Kopiert ✓' : 'In Zwischenablage kopieren'}
    </button>
  </div>
  <textarea readonly rows="6" value={text} placeholder="Noch keine Gerichte ausgewählt"></textarea>
</div>

<style>
  .panel {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
  }

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  h3 {
    margin: 0;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: inherit;
    font-size: 0.9rem;
    padding: 0.6rem;
    border-radius: 8px;
    border: 1px solid #ddd;
    resize: vertical;
  }

  .export {
    background: #d97706;
    color: white;
    border: none;
    border-radius: 6px;
    padding: 0.45rem 0.9rem;
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .export:disabled {
    background: #e5c9a3;
    cursor: not-allowed;
  }
</style>
