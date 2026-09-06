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
  let searchQuery = '';
  let searchTerms = [];
  let randomMealCount = 4;
  let randomMealIds = new Set();
  const effortOrder = { easy: 1, medium: 2, hard: 3 };
  const randomCategoryKeys = new Set(categories.slice(0, 9).map(({ key }) => key));

  function jumpToExport() {
    footerEl?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function clearSearch() {
    searchQuery = '';
  }

  function chooseRandomMeal(candidates) {
    const easyMeals = candidates.filter((meal) => meal.effort === 'easy');
    const pool = easyMeals.length > 0 && Math.random() < 0.75 ? easyMeals : candidates;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function selectRandomMeals() {
    const chosen = [];
    const usedCategories = new Set();
    const shuffledCategories = [...randomCategoryKeys].sort(() => Math.random() - 0.5);

    for (const categoryKey of shuffledCategories) {
      if (chosen.length >= randomMealCount) break;

      const candidates = meals.filter(
        (meal) =>
          meal.categories.includes(categoryKey) &&
          meal.categories.every((category) => randomCategoryKeys.has(category)) &&
          (meal.effort === 'easy' || meal.effort === 'medium') &&
          meal.categories.every((category) => !usedCategories.has(category))
      );
      if (candidates.length === 0) continue;

      const meal = chooseRandomMeal(candidates);
      chosen.push(meal);
      meal.categories.forEach((category) => usedCategories.add(category));
    }

    clearSearch();
    clearSelection();
    selectedIds.set(new Set(chosen.map((meal) => meal.id)));
    randomMealIds = new Set(chosen.map((meal) => meal.id));
  }

  $: searchTerms = searchQuery.trim().toLocaleLowerCase('de').split(/\s+/).filter(Boolean);
  $: selectionCount = $selectedMeals.filter(
    (meal) => meal.id !== weeklyShopping.id && !meal.categories.includes('backen')
  ).length;

  function matchesSearch(meal, terms) {
    if (terms.length === 0) return true;
    const searchableText = [meal.name, ...meal.ingredients.map((ingredient) => ingredient.name)]
      .join(' ')
      .toLocaleLowerCase('de');
    return terms.every((term) => searchableText.includes(term));
  }

  // group meals by category, preserving the display order from categories.js
  $: groups = categories
    .map(({ key, label }) => ({
      key,
      label,
      meals: meals
        .filter((m) => m.categories.includes(key))
        .filter((meal) => matchesSearch(meal, searchTerms))
        .sort(
          (a, b) =>
            (effortOrder[a.effort] ?? Number.MAX_SAFE_INTEGER) -
              (effortOrder[b.effort] ?? Number.MAX_SAFE_INTEGER) ||
            a.name.localeCompare(b.name, 'de')
        )
    }))
    .filter((g) => g.meals.length > 0);
</script>

<SelectionBadge count={selectionCount} onJump={jumpToExport} />

<main>
  <h1>Menu</h1>

  <div class="search-wrap">
    <input
      class="search-input"
      type="search"
      placeholder="Gerichte oder Zutaten suchen"
      aria-label="Gerichte oder Zutaten suchen"
      bind:value={searchQuery}
    />
    {#if searchQuery}
      <button class="search-clear" type="button" aria-label="Suche leeren" on:click={clearSearch}></button>
    {/if}
  </div>

    <div class="random-picker">
      <button class="random-button" type="button" on:click={selectRandomMeals}>Ich weiß nicht</button>
      <div class="random-count" aria-label="Anzahl zufälliger Gerichte">
        <button
          class="count-button"
          type="button"
          aria-label="Weniger Gerichte"
          on:click={() => (randomMealCount = Math.max(1, randomMealCount - 1))}
          disabled={randomMealCount === 1}
        >
          −
        </button>
        <span>{randomMealCount}</span>
        <button
          class="count-button"
          type="button"
          aria-label="Mehr Gerichte"
          on:click={() => (randomMealCount = Math.min(9, randomMealCount + 1))}
          disabled={randomMealCount === 9}
        >
          +
        </button>
      </div>
    </div>

  {#each groups as group (group.key)}
    <CategorySection
      title={group.label}
      meals={group.meals}
      selectedIds={$selectedIds}
      onToggle={toggleMeal}
      forceOpen={
        searchTerms.length > 0 || group.meals.some((meal) => randomMealIds.has(meal.id))
      }
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

  .search-wrap {
    position: relative;
    margin-bottom: 1.2rem;
  }

  .search-input {
    display: block;
    box-sizing: border-box;
    width: 100%;
    padding: 0.65rem 0.8rem;
    padding-right: 2.4rem;
    border: 2px solid transparent;
    border-radius: var(--radius);
    background: var(--color-surface);
    color: var(--color-text);
    font-family: var(--font-body);
    font-size: 0.95rem;
  }

  .search-input::placeholder {
    color: var(--color-text-muted);
  }

  .search-input::-webkit-search-cancel-button {
    appearance: none;
  }

  .search-clear {
    all: unset;
    position: absolute;
    top: 50%;
    right: 0.75rem;
    width: 1.1rem;
    height: 1.1rem;
    cursor: pointer;
    transform: translateY(-50%);
  }

  .search-clear::before,
  .search-clear::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 1px;
    height: 0.9rem;
    background: var(--color-text-muted);
  }

  .search-clear::before {
    transform: translate(-50%, -50%) rotate(45deg);
  }

  .search-clear::after {
    transform: translate(-50%, -50%) rotate(-45deg);
  }

  .search-clear:focus-visible {
    outline: 1px solid var(--color-accent);
  }

  .search-input:focus {
    outline: none;
    border-color: color-mix(in srgb, var(--color-accent) 65%, white);
  }

  .random-picker {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    margin-bottom: 1.2rem;
  }

  .random-button,
  .count-button {
    border: none;
    border-radius: var(--radius);
    background: var(--color-accent);
    color: var(--color-accent-contrast);
    font-family: var(--font-body);
    cursor: pointer;
  }

  .random-button {
    padding: 0.45rem 0.8rem;
    font-size: 0.9rem;
  }

  .random-count {
    display: flex;
    align-items: center;
    gap: 0.65rem;
    color: var(--color-text);
    font-family: var(--font-body);
    font-weight: 600;
  }

  .count-button {
    width: 1.65rem;
    height: 1.65rem;
    padding: 0;
    font-size: 1.1rem;
    line-height: 1;
  }

  .random-button:disabled,
  .count-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
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
