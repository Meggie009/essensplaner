import { writable, derived } from 'svelte/store';
import { meals } from '../data/meals.js';

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
  // Group by normalized (trimmed, lowercased) name, since ingredients are now
  // just plain text per meal file rather than references into a shared
  // catalog. The first-seen casing is kept for display.
  const counts = new Map();
  for (const meal of $meals) {
    for (const ing of meal.ingredients) {
      const key = ing.name.trim().toLowerCase();
      const existing = counts.get(key);
      if (existing) {
        existing.qty += ing.qty ?? 1;
      } else {
        counts.set(key, { name: ing.name.trim(), qty: ing.qty ?? 1 });
      }
    }
  }
  return [...counts.values()].sort((a, b) => a.name.localeCompare(b.name, 'de'));
});
