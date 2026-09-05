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
    <div class="name">{meal.name}</div>
  </div>

  <div class="meta">
    <span class="effort effort-{meal.effort}">{effortLabel[meal.effort] ?? meal.effort}</span>
  </div>

  {#if expanded}
    <div class="ingredient-list">
      {meal.ingredients.map((ing) => (ing.qty > 1 ? `${ing.name} (${ing.qty})` : ing.name)).join(', ')}
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
    align-items: flex-start;
    gap: 0.5rem;
  }

  .checkbox-wrap {
    display: flex;
    align-items: center;
    padding-top: 0.15rem;
    cursor: pointer;
  }

  .checkbox-wrap input {
    width: 1.05rem;
    height: 1.05rem;
    cursor: pointer;
  }

  .name {
    font-weight: 600;
    font-size: 1rem;
  }

  .meta {
    display: flex;
    justify-content: flex-end;
  }

  .effort {
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
    margin-top: 0.2rem;
    font-size: 0.82rem;
    color: #555;
    line-height: 1.4;
  }
</style>
