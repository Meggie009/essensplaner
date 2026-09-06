<script>
  import MealCard from './MealCard.svelte';

  export let title;
  export let meals = [];
  export let selectedIds; // Set
  export let onToggle;

  let open = false;
</script>

<section class="category">
  <button class="header" on:click={() => (open = !open)} aria-expanded={open}>
    <span class="chevron" class:open>▶</span>
    <h2>{title}</h2>
    <span class="count">{meals.length}</span>
  </button>

  {#if open}
    <div class="grid">
      {#each meals as meal (meal.id)}
        <MealCard {meal} selected={selectedIds.has(meal.id)} {onToggle} />
      {/each}
    </div>
  {/if}
</section>

<style>
  .category {
    margin-bottom: 1rem;
  }

  .header {
    all: unset;
    box-sizing: border-box;
    cursor: pointer;
    position: sticky;
    top: 0;
    z-index: 10;
    display: flex;
    align-items: center;
    gap: 0.6rem;
    width: 100%;
    background: var(--color-bg);
    padding: 0.6rem 0.2rem;
  }

  .chevron {
    display: inline-block;
    color: var(--color-accent);
    transition: transform 0.15s ease;
    font-size: 0.8rem;
  }

  .chevron.open {
    transform: rotate(90deg);
  }

  h2 {
    margin: 0;
    color: var(--color-text);
    font-family: var(--font-body);
    font-weight: 700;
    text-transform: uppercase;
    font-size: 1.25rem;
  }

  .count {
    margin-left: auto;
    font-family: var(--font-body);
    font-size: 0.78rem;
    color: var(--color-text-muted);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.7rem;
    padding-top: 0.8rem;
  }
</style>
