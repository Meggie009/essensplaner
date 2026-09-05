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

  const effortLabel = { easy: 'schnell', medium: 'mittel', hard: 'aufwändig' };

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
    <span class="effort effort-{meal.effort}">{effortLabel[meal.effort] ?? meal.effort}</span>
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
    background: #fafafa;
    border: 2px solid #eee;
    border-radius: 8px;
    padding: 0.6rem 0.9rem;
    transition: border-color 0.15s, background 0.15s;
  }

  .card:hover {
    border-color: #d97706;
  }

  .card.selected {
    background: #fff7ed;
    border-color: #d97706;
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

  .checkbox-wrap input {
    width: 1.05rem;
    height: 1.05rem;
    cursor: pointer;
  }

  .name {
    flex: 1;
    font-weight: 600;
    font-size: 1rem;
  }

  .effort {
    flex-shrink: 0;
    font-size: 0.72rem;
    font-weight: 600;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    white-space: nowrap;
  }

  .effort-easy { background: #dcfce7; color: #166534; }
  .effort-medium { background: #fef3c7; color: #92400e; }
  .effort-hard { background: #fee2e2; color: #991b1b; }

  .expanded-content {
    cursor: default;
  }

  .ingredient-list {
    list-style: none;
    margin: 0.3rem 0 0;
    padding: 0;
    font-size: 0.82rem;
    color: #444;
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
    flex-shrink: 0;
    cursor: pointer;
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
    font-size: 0.82rem;
    padding: 0.25rem 0.5rem;
    border: 1px solid #ddd;
    border-radius: 5px;
  }

  .add-ingredient button {
    all: unset;
    cursor: pointer;
    background: #d97706;
    color: white;
    width: 1.6rem;
    height: 1.6rem;
    border-radius: 5px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.95rem;
    line-height: 1;
  }
</style>
