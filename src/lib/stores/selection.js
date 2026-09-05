import { writable, derived } from 'svelte/store';
import meals from '../data/meals.json';
import ingredients from '../data/ingredients.json';

// Set of selected meal ids. No persistence (resets on reload) by design.
export const selectedIds = writable(new Set());

export function toggleMeal(id) {
  selectedIds.update((set) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    return next;
  });
}

export function clearSelection() {
  selectedIds.set(new Set());
}

export const selectedMeals = derived(selectedIds, ($ids) =>
  meals.filter((m) => $ids.has(m.id))
);

export const aggregatedIngredients = derived(selectedMeals, ($meals) => {
  const counts = {};
  for (const meal of $meals) {
    for (const ing of meal.ingredients) {
      counts[ing.id] = (counts[ing.id] || 0) + (ing.qty ?? 1);
    }
  }
  return Object.entries(counts)
    .map(([id, qty]) => ({ id, name: ingredients[id] ?? id, qty }))
    .sort((a, b) => a.name.localeCompare(b.name, 'de'));
});
