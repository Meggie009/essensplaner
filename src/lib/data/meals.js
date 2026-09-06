// Loads every meal from ./meals/*.md at build time.
//
// Expected file format:
//
//   ---
//   category: kartoffeln          <- comma-separated for multiple, e.g. "nudeln, linsen"
//   effort: easy                  <- easy | medium | hard
//   ---
//   # Meal Name
//
//   - Ingredient
//   - Ingredient (2)               <- optional quantity in parentheses
//
// The meal's `id` is derived from the filename (without .md), so it doesn't
// need to be repeated inside the file. There is no ingredient catalog to
// maintain anymore — ingredient names are written directly, and are matched
// up across meals for aggregation by normalizing (trim + lowercase).

const files = import.meta.glob('./meals/*.md', {
  query: '?raw',
  import: 'default',
  eager: true
});
import weeklyShoppingRaw from './weekly-shopping.md?raw';

const FRONTMATTER_RE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;
const HEADING_RE = /^#\s+(.+)\s*$/m;
const BULLET_RE = /^\s*-\s+(.+?)\s*$/;
const QTY_RE = /^(.*?)\s*\((\d+)\)\s*$/;

function parseFrontmatter(block) {
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const sep = line.indexOf(':');
    if (sep === -1) continue;
    data[line.slice(0, sep).trim()] = line.slice(sep + 1).trim();
  }
  return data;
}

function parseIngredients(body) {
  const ingredients = [];
  for (const line of body.split(/\r?\n/)) {
    const bullet = line.match(BULLET_RE);
    if (!bullet) continue;
    const text = bullet[1];
    const withQty = text.match(QTY_RE);
    if (withQty) {
      ingredients.push({ name: withQty[1].trim(), qty: Number(withQty[2]) });
    } else {
      ingredients.push({ name: text.trim(), qty: 1 });
    }
  }
  return ingredients;
}

function parseMeal(path, raw) {
  const id = path.split('/').pop().replace(/\.md$/, '');

  const match = raw.match(FRONTMATTER_RE);
  if (!match) {
    throw new Error(
      `Meal file "${path}" is missing frontmatter. It must start with a "---" ` +
        `block containing "category" and "effort" before the "# Name" heading.`
    );
  }
  const [, frontmatterBlock, body] = match;
  const frontmatter = parseFrontmatter(frontmatterBlock);

  const categories = (frontmatter.category ?? '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  if (categories.length === 0) {
    throw new Error(`Meal file "${path}" has no "category" set in its frontmatter.`);
  }

  const effort = frontmatter.effort?.trim() || 'medium';

  const headingMatch = body.match(HEADING_RE);
  const name = headingMatch ? headingMatch[1].trim() : id;

  const ingredients = parseIngredients(body);

  return { id, name, categories, effort, ingredients };
}

const weeklyShopping = {
  id: 'weekly-shopping',
  name: 'Jede Woche',
  categories: [],
  effort: null,
  ingredientsUncheckedByDefault: true,
  excludeFromMealExport: true,
  ingredients: parseIngredients(weeklyShoppingRaw)
};

export const meals = Object.entries(files)
  .map(([path, raw]) => parseMeal(path, raw))
  .concat(weeklyShopping)
  .sort((a, b) => a.name.localeCompare(b.name, 'de'));

export { weeklyShopping };
