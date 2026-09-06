import { writable, derived, get } from 'svelte/store';
import { meals } from '../data/meals.js';
import { categories } from '../data/categories.js';

const categoryOrder = new Map(categories.map(({ key }, index) => [key, index]));

function mealCategoryOrder(meal) {
  return Math.min(...meal.categories.map((category) => categoryOrder.get(category) ?? Infinity));
}

function compareSelectedMeals(a, b) {
  const categoryDifference = mealCategoryOrder(a) - mealCategoryOrder(b);
  return categoryDifference || a.name.localeCompare(b.name, 'de');
}

function createInitialMealCustomizations() {
  return new Map(
    meals
      .filter((meal) => meal.ingredientsUncheckedByDefault)
      .map((meal) => [
        meal.id,
        {
          unchecked: new Set(meal.ingredients.map((ingredient) => ingredient.name.trim().toLowerCase())),
          extra: []
        }
      ])
  );
}

// Set of selected meal ids. No persistence (resets on reload) by design.
export const selectedIds = writable(new Set());

// Per-meal customization of the ingredient checklist:
//   unchecked: Set<normalizedName> - base ingredients (from the meal file)
//              that are excluded from the shopping list for this instance
//   extra:     { name, qty, checked }[] - ingredients added on top of the
//              meal's own list, just for this planning session
// Not persisted across reloads, same as selectedIds.
// Map<mealId, { unchecked: Set<string>, extra: Array }>
export const mealCustomizations = writable(createInitialMealCustomizations());

function withEntry(map, mealId, updater) {
  const next = new Map(map);
  const current = next.get(mealId) ?? { unchecked: new Set(), extra: [] };
  next.set(mealId, updater(current));
  return next;
}

function selectMealWhenIngredientIsChecked(mealId) {
  const meal = meals.find((item) => item.id === mealId);
  if (!meal?.ingredientsUncheckedByDefault) return;

  selectedIds.update((set) => {
    if (set.has(mealId)) return set;
    const next = new Set(set);
    next.add(mealId);
    return next;
  });
}

function syncWeeklyMealSelection(mealId) {
  const meal = meals.find((item) => item.id === mealId);
  if (!meal?.ingredientsUncheckedByDefault) return;

  const customization = get(mealCustomizations).get(mealId);
  const hasCheckedIngredient =
    meal.ingredients.some(
      (ingredient) => !customization?.unchecked.has(ingredient.name.trim().toLowerCase())
    ) || customization?.extra.some((ingredient) => ingredient.checked);

  selectedIds.update((set) => {
    const shouldBeSelected = Boolean(hasCheckedIngredient);
    if (set.has(mealId) === shouldBeSelected) return set;
    const next = new Set(set);
    if (shouldBeSelected) next.add(mealId);
    else next.delete(mealId);
    return next;
  });
}

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
  mealCustomizations.set(createInitialMealCustomizations());
}

export function toggleIngredient(mealId, name) {
  const key = name.trim().toLowerCase();
  const current = get(mealCustomizations).get(mealId);
  if (current?.unchecked.has(key)) {
    selectMealWhenIngredientIsChecked(mealId);
  }
  mealCustomizations.update((map) =>
    withEntry(map, mealId, (entry) => {
      const unchecked = new Set(entry.unchecked);
      if (unchecked.has(key)) {
        unchecked.delete(key);
      } else {
        unchecked.add(key);
      }
      return { ...entry, unchecked };
    })
  );
  syncWeeklyMealSelection(mealId);
}

export function addExtraIngredient(mealId, name) {
  const trimmed = name.trim();
  if (!trimmed) return;
  selectMealWhenIngredientIsChecked(mealId);
  mealCustomizations.update((map) =>
    withEntry(map, mealId, (entry) => ({
      ...entry,
      extra: [...entry.extra, { name: trimmed, qty: 1, checked: true }]
    }))
  );
  syncWeeklyMealSelection(mealId);
}

export function toggleExtraIngredient(mealId, index) {
  const current = get(mealCustomizations).get(mealId);
  if (current?.extra[index] && !current.extra[index].checked) {
    selectMealWhenIngredientIsChecked(mealId);
  }
  mealCustomizations.update((map) =>
    withEntry(map, mealId, (entry) => ({
      ...entry,
      extra: entry.extra.map((ing, i) => (i === index ? { ...ing, checked: !ing.checked } : ing))
    }))
  );
  syncWeeklyMealSelection(mealId);
}

export function removeExtraIngredient(mealId, index) {
  mealCustomizations.update((map) =>
    withEntry(map, mealId, (entry) => ({
      ...entry,
      extra: entry.extra.filter((_, i) => i !== index)
    }))
  );
}

export const selectedMeals = derived(selectedIds, ($ids) =>
  meals.filter((m) => $ids.has(m.id)).sort(compareSelectedMeals)
);

export const aggregatedIngredients = derived(
  [selectedMeals, mealCustomizations],
  ([$meals, $customizations]) => {
    // Group by normalized (trimmed, lowercased) name, since ingredients are
    // plain text per meal file rather than references into a shared catalog.
    // The first-seen casing is kept for display.
    const counts = new Map();
    for (const meal of $meals) {
      const custom = $customizations.get(meal.id) ?? { unchecked: new Set(), extra: [] };
      const active = [
        ...meal.ingredients.filter((ing) => !custom.unchecked.has(ing.name.trim().toLowerCase())),
        ...custom.extra.filter((ing) => ing.checked)
      ];
      for (const ing of active) {
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
  }
);
