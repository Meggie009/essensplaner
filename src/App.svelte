<script>
  import { meals } from './lib/data/meals.js';
  import { weeklyShopping } from './lib/data/meals.js';
  import { categories } from './lib/data/categories.js';
  import CategorySection from './lib/components/CategorySection.svelte';
  import MealCard from './lib/components/MealCard.svelte';
  import SelectedMealsPanel from './lib/components/SelectedMealsPanel.svelte';
  import IngredientsPanel from './lib/components/IngredientsPanel.svelte';
  import SelectionBadge from './lib/components/SelectionBadge.svelte';
  import { selectedIds, toggleMeal, clearSelection, selectedMeals, aggregatedIngredients } from './lib/stores/selection.js';

  let footerEl;
  const effortOrder = { easy: 1, medium: 2, hard: 3 };

  function jumpToExport() {
    footerEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // group meals by category, preserving the display order from categories.js
  $: groups = categories
    .map(({ key, label }) => ({
      key,
      label,
      meals: meals
        .filter((m) => m.categories.includes(key))
        .sort(
          (a, b) =>
            (effortOrder[a.effort] ?? Number.MAX_SAFE_INTEGER) -
              (effortOrder[b.effort] ?? Number.MAX_SAFE_INTEGER) ||
            a.name.localeCompare(b.name, 'de')
        )
    }))
    .filter((g) => g.meals.length > 0);
</script>

<SelectionBadge count={$selectedMeals.length} onJump={jumpToExport} />

<main>
  <h1>Menu</h1>

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
    <div class="weekly-shopping">
      <MealCard
        meal={weeklyShopping}
        selected={$selectedIds.has(weeklyShopping.id)}
        onToggle={toggleMeal}
      />
    </div>
    <div class="panels">
      <SelectedMealsPanel meals={$selectedMeals} />
      <IngredientsPanel ingredients={$aggregatedIngredients} />
    </div>
  </footer>

  <p class="impressum">
    made by Magdalena ·
    <a href="https://github.com/Meggie009/essensplaner" target="_blank" rel="noopener noreferrer">
      GitHub
    </a>
  </p>
</main>

<style>
  main {
    max-width: 900px;
    margin: 0 auto;
    padding: 1.5rem;
  }

  h1 {
    text-align: center;
    margin: 0 0 1.5rem;
    font-family: var(--font-display);
    text-transform: uppercase;
    font-size: clamp(3rem, 11vw, 5.5rem);
    line-height: 0.9;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  footer {
    margin-top: 2.5rem;
    padding-top: 1.5rem;
  }

  .weekly-shopping {
    margin-top: 0.8rem;
    margin-bottom: 1rem;
  }

  .footer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 1rem;
  }

  .footer-header h2 {
    margin: 0;
    font-family: var(--font-body);
    font-weight: 700;
    font-size: 1.2rem;
    text-transform: uppercase;
    color: var(--color-text);
  }

  .clear {
    all: unset;
    cursor: pointer;
    background: var(--color-surface);
    padding: 0.3rem 0.7rem;
    font-family: var(--font-body);
    font-size: 0.8rem;
    color: var(--color-text-muted);
  }

  .clear:hover {
    color: var(--color-accent);
  }

  .panels {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  @media (max-width: 640px) {
    .panels {
      grid-template-columns: 1fr;
    }
  }

  .impressum {
    margin-top: 2rem;
    text-align: center;
    font-size: 0.78rem;
    color: var(--color-text-muted);
  }

  .impressum a {
    color: var(--color-text-muted);
    text-decoration: underline;
  }

  .impressum a:hover {
    color: var(--color-accent);
  }
</style>
