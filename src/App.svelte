<script>
  import { meals } from './lib/data/meals.js';
  import { categories } from './lib/data/categories.js';
  import CategorySection from './lib/components/CategorySection.svelte';
  import SelectedMealsPanel from './lib/components/SelectedMealsPanel.svelte';
  import IngredientsPanel from './lib/components/IngredientsPanel.svelte';
  import SelectionBadge from './lib/components/SelectionBadge.svelte';
  import { selectedIds, toggleMeal, clearSelection, selectedMeals, aggregatedIngredients } from './lib/stores/selection.js';

  let footerEl;
  function jumpToExport() {
    footerEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // group meals by category, preserving the display order from categories.js
  $: groups = categories
    .map(({ key, label }) => ({
      key,
      label,
      meals: meals.filter((m) => m.categories.includes(key))
    }))
    .filter((g) => g.meals.length > 0);
</script>

<SelectionBadge count={$selectedMeals.length} onJump={jumpToExport} />

<main>
  <h1>🍽️ Essensplan</h1>

  {#each groups as group (group.key)}
    <CategorySection
      title={group.label}
      meals={group.meals}
      selectedIds={$selectedIds}
      onToggle={toggleMeal}
    />
  {/each}

  <footer bind:this={footerEl}>
    <div class="footer-header">
      <h2>Auswahl</h2>
      {#if $selectedMeals.length > 0}
        <button class="clear" on:click={clearSelection}>Auswahl leeren</button>
      {/if}
    </div>
    <div class="panels">
      <SelectedMealsPanel meals={$selectedMeals} />
      <IngredientsPanel ingredients={$aggregatedIngredients} />
    </div>
  </footer>
</main>

<div class="impressum">
  <p>Made by <a href="https://github.com/Meggie009/essensplaner" target="_blank" rel="noopener noreferrer">Magdalena</a></p>
</div>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem;
    font-family: system-ui, sans-serif;
    color: #222;
  }

  h1 {
    text-align: center;
    margin-bottom: 2rem;
  }

  footer {
    margin-top: 2.5rem;
    border-top: 1px solid #eee;
    padding-top: 1.5rem;
  }

  .footer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .footer-header h2 {
    margin: 0;
  }

  .clear {
    background: none;
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 0.3rem 0.7rem;
    font-size: 0.8rem;
    cursor: pointer;
    color: #555;
  }

  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

    .impressum {
    text-align: center;
    padding: 2rem 1.5rem 1.5rem;
    font-size: 0.75rem;
    color: #999;
  }
  
  .impressum a {
    color: #999;
    text-decoration: none;
  }
  
  .impressum a:hover {
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    .panels {
      grid-template-columns: 1fr;
    }
  }
</style>
