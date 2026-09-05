<script>
  export let meal;
  export let selected = false;
  export let onToggle = () => {};

  let expanded = false;

  const effortLabel = { easy: 'einfach', medium: 'mittel', hard: 'aufwändig' };

  function handleKeydown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      expanded = !expanded;
    }
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
    <ul class="ingredient-list">
      {#each meal.ingredients as ing}
        <li>{ing.qty > 1 ? `${ing.name} (${ing.qty})` : ing.name}</li>
      {/each}
    </ul>
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

  .ingredient-list {
    margin: 0.2rem 0 0;
    padding-left: 1.1rem;
    font-size: 0.82rem;
    color: #555;
    line-height: 1.4;
    columns: 2;
    column-gap: 1rem;
  }

  .ingredient-list li {
    break-inside: avoid;
  }
</style>
