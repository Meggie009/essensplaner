<script>
  export let meal;
  export let selected = false;
  export let onToggle = () => {};

  const effortLabel = { easy: 'einfach', medium: 'mittel', hard: 'aufwändig' };
</script>

<button
  class="card"
  class:selected
  on:click={() => onToggle(meal.id)}
  aria-pressed={selected}
>
  <div class="name">{meal.name}</div>
  <div class="ingredients">
    {meal.ingredients.length}
    {meal.ingredients.length === 1 ? 'Zutat' : 'Zutaten'}
  </div>
  <div class="effort effort-{meal.effort}">{effortLabel[meal.effort] ?? meal.effort}</div>
</button>

<style>
  .card {
    all: unset;
    cursor: pointer;
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
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

  .name {
    font-weight: 600;
    font-size: 1rem;
  }

  .ingredients {
    font-size: 0.78rem;
    color: #777;
  }

  .effort {
    font-size: 0.72rem;
    font-weight: 600;
    align-self: flex-start;
    padding: 0.05rem 0.4rem;
    border-radius: 999px;
    margin-top: 0.15rem;
  }

  .effort-easy { background: #dcfce7; color: #166534; }
  .effort-medium { background: #fef3c7; color: #92400e; }
  .effort-hard { background: #fee2e2; color: #991b1b; }
</style>
