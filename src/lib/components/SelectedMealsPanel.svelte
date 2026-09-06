<script>
  import { copyToClipboard } from '../utils/clipboard.js';
  import { mealCustomizations } from '../stores/selection.js';

  export let meals = []; // list of {id, name}

  let copied = false;

  $: exportMeals = meals.filter((meal) => !meal.excludeFromMealExport);

  $: text = exportMeals
    .map((m) => {
      const custom = $mealCustomizations.get(m.id);
      const extras = (custom?.extra ?? []).filter((e) => e.checked).map((e) => e.name);
      return extras.length ? `${m.name} (+${extras.join(', +')})` : m.name;
    })
    .join('\n');

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
    <h3>Ausgewählte Gerichte ({exportMeals.length})</h3>
    <button class="export" on:click={handleExport} disabled={exportMeals.length === 0}>
      {copied ? 'Kopiert ✓' : 'Kopieren'}
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
    font-family: var(--font-body);
    color: var(--color-text);
    font-weight: 700;
  }

  textarea {
    width: 100%;
    box-sizing: border-box;
    font-family: var(--font-body);
    font-size: 0.9rem;
    padding: 0.6rem;
    border-radius: var(--radius);
    border: none;
    background: var(--color-surface);
    color: var(--color-text);
    resize: vertical;
  }

  .export {
    background: var(--color-accent);
    color: var(--color-accent-contrast);
    border: none;
    border-radius: var(--radius);
    padding: 0.45rem 0.9rem;
    font-family: var(--font-body);
    font-size: 0.85rem;
    cursor: pointer;
    white-space: nowrap;
  }

  .export:disabled {
    background: var(--color-surface);
    color: var(--color-text-muted);
    cursor: not-allowed;
  }
</style>
