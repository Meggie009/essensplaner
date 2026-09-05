<script>
  import MealCard from './MealCard.svelte';

  export let title;
  export let meals = [];
  export let selectedIds; // Set
  export let onToggle;
</script>

<section class="category">
  <h2>{title}</h2>
  <div class="grid">
    {#each meals as meal (meal.id)}
      <MealCard {meal} selected={selectedIds.has(meal.id)} {onToggle} />
    {/each}
  </div>
</section>

<style>
  .category {
    margin-bottom: 2rem;
  }

  h2 {
    border-bottom: 2px solid #d97706;
    color: #b45309;
    padding-bottom: 0.3rem;
    margin-bottom: 0.8rem;
    text-transform: capitalize;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 0.7rem;
  }
</style>
