<script>
  import {
    mealCustomizations,
    toggleIngredient,
    addExtraIngredient,
    toggleExtraIngredient,
    removeExtraIngredient
  } from '../stores/selection.js';

  export let meal;
  export let selected = false;
  export let onToggle = () => {};

  let expanded = false;
  let newIngredientText = '';

  const effortLabel = { easy: 'einfach', medium: 'mittel', hard: 'aufwändig' };
  const effortLevel = { easy: 1, medium: 2, hard: 3 };

  $: customization = $mealCustomizations.get(meal.id) ?? { unchecked: new Set(), extra: [] };
  $: baseIngredients = meal.ingredients.map((ing) => ({
    name: ing.name,
    qty: ing.qty,
    checked: !customization.unchecked.has(ing.name.trim().toLowerCase())
  }));
  $: extraIngredients = customization.extra;

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      expanded = !expanded;
    }
  }

  function handleAddIngredient() {
    if (!newIngredientText.trim()) return;
    addExtraIngredient(meal.id, newIngredientText);
    newIngredientText = '';
  }
</script>

<div
  class="card"
  class:selected
  role="button"
  tabindex="0"
  aria-expanded={expanded}
  on:click={() => (expanded = !expanded)}
  on:keydown={handleKeydown}
>
  <div class="top-row">
    <div class="name">{meal.name}</div>
    <span
      class="effort effort-{meal.effort}"
      aria-label={effortLabel[meal.effort] ?? meal.effort}
      title={effortLabel[meal.effort] ?? meal.effort}
    >
      {#each Array(effortLevel[meal.effort] ?? 0) as dot}
        <span class="effort-dot"></span>
      {/each}
    </span>
    <!-- svelte-ignore a11y-label-has-associated-control -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <label class="checkbox-wrap" on:click|stopPropagation>
      <input
        type="checkbox"
        checked={selected}
        on:change={() => onToggle(meal.id)}
        aria-label={`${meal.name} auswählen`}
      />
    </label>
  </div>

  {#if expanded}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <div class="expanded-content" role="group" on:click|stopPropagation on:keydown|stopPropagation>
      <ul class="ingredient-list">
        {#each baseIngredients as ing}
          <li>
            <label>
              <input
                type="checkbox"
                checked={ing.checked}
                on:change={() => toggleIngredient(meal.id, ing.name)}
              />
              <span>{ing.qty > 1 ? `${ing.name} (${ing.qty})` : ing.name}</span>
            </label>
          </li>
        {/each}
        {#each extraIngredients as ing, index}
          <li class="extra">
            <label>
              <input
                type="checkbox"
                checked={ing.checked}
                on:change={() => toggleExtraIngredient(meal.id, index)}
              />
              <span>{ing.qty > 1 ? `${ing.name} (${ing.qty})` : ing.name}</span>
            </label>
            <button
              class="remove"
              on:click={() => removeExtraIngredient(meal.id, index)}
              aria-label={`${ing.name} entfernen`}
            >
              ×
            </button>
          </li>
        {/each}
      </ul>

      <form class="add-ingredient" on:submit|preventDefault={handleAddIngredient}>
        <input type="text" placeholder="Zutat hinzufügen…" bind:value={newIngredientText} />
        <button type="submit" aria-label="Zutat hinzufügen">+</button>
      </form>
    </div>
  {/if}
</div>

<style>
  .card {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    background: var(--color-surface);
    border-radius: var(--radius);
    padding: 0.6rem 0.9rem;
    transition: background 0.15s;
  }

  .card.selected {
    background: var(--color-surface-selected);
  }

  .top-row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .checkbox-wrap {
    display: flex;
    align-items: center;
    cursor: pointer;
  }

  .name {
    flex: 1;
    font-family: var(--font-body);
    font-weight: 400;
    font-size: 0.92rem;
    color: var(--color-text);
  }

  .effort {
    flex-shrink: 0;
    white-space: nowrap;
    display: flex;
    gap: 0.15rem;
    color: color-mix(in srgb, var(--color-accent) 65%, white);
  }

  .effort-dot {
    width: 0.45rem;
    height: 0.45rem;
    border-radius: 50%;
    background: currentColor;
  }

  .expanded-content {
    cursor: default;
  }

  .ingredient-list {
    list-style: none;
    margin: 0.3rem 0 0;
    padding: 0;
    font-family: var(--font-body);
    font-size: 0.82rem;
    color: var(--color-text);
    line-height: 1.5;
    columns: 2;
    column-gap: 1rem;
  }

  .ingredient-list li {
    break-inside: avoid;
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .ingredient-list label {
    display: flex;
    align-items: center;
    gap: 0.35rem;
    cursor: pointer;
    flex: 1;
    min-width: 0;
  }

  .ingredient-list input[type='checkbox'] {
    appearance: none;
    -webkit-appearance: none;
    width: 0.85rem;
    height: 0.85rem;
    border: 2px solid var(--color-accent);
    border-radius: 50%;
    background: transparent;
    flex-shrink: 0;
  }

  .ingredient-list input[type='checkbox']:checked {
    background: var(--color-accent);
    border-color: var(--color-accent);
  }

  .ingredient-list input[type='checkbox']:checked::after {
    display: none;
  }

  .ingredient-list .remove {
    all: unset;
    cursor: pointer;
    color: #b91c1c;
    font-size: 0.9rem;
    padding: 0 0.2rem;
    flex-shrink: 0;
  }

  .add-ingredient {
    display: flex;
    gap: 0.4rem;
    margin-top: 0.5rem;
  }

  .add-ingredient input {
    flex: 1;
    font-family: var(--font-body);
    font-size: 0.82rem;
    padding: 0.25rem 0.5rem;
    border: none;
    border-radius: var(--radius);
    background: var(--color-bg);
    color: var(--color-text);
  }

  .add-ingredient button {
    all: unset;
    cursor: pointer;
    background: var(--color-accent);
    color: var(--color-accent-contrast);
    width: 1.6rem;
    height: 1.6rem;
    border-radius: var(--radius);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    line-height: 1;
  }
</style>
