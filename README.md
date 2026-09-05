# Essensplan — Meal Planner

A small Svelte app to browse meals, select what you want to cook, and export
the selected meals plus their combined shopping list to the clipboard.

---

## Local development

```bash
npm install
npm run dev
```

## Adding a new meal

Edit `src/lib/data/meals.json`. Each entry looks like:

```json
{
  "id": "unique-slug",
  "name": "Display Name",
  "categories": ["nudeln"],
  "effort": "easy",
  "ingredients": [
    { "id": "zwiebel", "qty": 1 }
  ]
}
```

- `categories`: one or more of `nudeln`, `kartoffeln`, `linsen`, `reis`,
  `couscous`, `teig`, `sonstige` (see `categoryLabels` in `src/App.svelte` to
  add a new category).
- `effort`: `"easy" | "medium" | "hard"`.
- `ingredients[].id` must exist in `src/lib/data/ingredients.json` — add new
  ingredients there first if needed.

## Deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings, under **Pages**, set the source to **GitHub Actions**.
3. Update `base` in `vite.config.js` to match your repo name
   (`/your-repo-name/`).
4. Push to `main` — the included workflow
   (`.github/workflows/deploy.yml`) builds the app and publishes it
   automatically.

Your site will be live at `https://<username>.github.io/<repo-name>/`.

----

## 1. Project structure

```
meal-planner/
├── src/
│   ├── App.svelte                     # top-level layout, groups meals by category
│   ├── main.js                        # Vite/Svelte entry point
│   └── lib/
│       ├── data/
│       │   ├── meals.json             # the meal database
│       │   └── ingredients.json       # ingredient id -> display name
│       ├── stores/
│       │   └── selection.js           # selection state + derived stores
│       ├── utils/
│       │   └── clipboard.js           # copy-to-clipboard helper
│       └── components/
│           ├── MealCard.svelte        # one clickable/highlightable meal
│           ├── CategorySection.svelte # a category's grid of MealCards
│           ├── SelectedMealsPanel.svelte
│           └── IngredientsPanel.svelte
├── index.html
├── vite.config.js                     # sets `base` for GitHub Pages
├── package.json
├── .github/workflows/deploy.yml       # auto-deploy to GitHub Pages
└── README.md
```

---

## 2. Data structure

Meals and ingredients are kept in **two separate JSON files** rather than one,
so that an ingredient's display name only has to be edited in one place, and
so a meal can reference an ingredient multiple times with a quantity instead
of needing a separately-named entry per quantity (the original data had
`Karotte`, `Karotte(2)`, `Karotte(3)` etc. as distinct strings — that's gone
now).

### `ingredients.json`

A flat dictionary: ingredient id → display name.

```json
{
  "zwiebel": "Zwiebel",
  "karotte": "Karotte",
  "kartoffeln": "Kartoffeln"
}
```

### `meals.json`

An array of meal objects:

```json
{
  "id": "nudeln-sojagranulat",
  "name": "Nudeln mit Sojagranulat",
  "categories": ["nudeln"],
  "effort": "medium",
  "ingredients": [
    { "id": "zwiebel", "qty": 1 },
    { "id": "nudeln", "qty": 1 },
    { "id": "karotte", "qty": 1 }
  ]
}
```

| Field         | Type       | Notes |
|---------------|------------|-------|
| `id`          | string     | Unique, URL/JS-safe slug. Used as the selection key — never reused across meals. |
| `name`        | string     | What's actually shown on the card. |
| `categories`  | string[]   | One or more tags. Currently used for grouping the page into sections (see below). An array (not a single string) so a meal can belong to more than one group later, e.g. a lentil-pasta bake tagged `["nudeln", "linsen"]`. |
| `effort`      | string     | One of `"easy" \| "medium" \| "hard"`. |
| `ingredients` | `{id, qty}[]` | `id` must exist in `ingredients.json`. `qty` defaults to `1` if omitted — only set it when the recipe needs more than one of something. |

### Current categories

`nudeln`, `kartoffeln`, `linsen`, `reis`, `couscous`, `teig` (dough-based:
quiche, pizza, pancakes, dumplings), `sonstige` (everything else: soups,
salads, egg dishes...). These are just the current section headers — see
["Adding a new category"](#adding-a-new-category) below to change them.

---

## 3. Decisions made (and why)

These came out of planning this together, recorded here so future-you (or
anyone else touching this repo) knows the reasoning:

- **Category meaning changed from weekday → main ingredient type.**
  The original Android app grouped meals by the weekday they were planned
  for. That's gone; `categories` now describes *what kind of dish* it is
  (pasta, potato, rice, ...), which is more useful for browsing and doesn't
  force a meal into a fixed day.
- **No persistence of selection across reloads.** Selection lives in a plain
  in-memory Svelte store (`Set` of meal ids). Refreshing the page clears it.
  This was a deliberate simplicity trade-off — no localStorage sync logic,
  no stale-selection edge cases to think about.
- **Free selection, no per-day/category limit.** You can select any number of
  meals from any categories at once; there's no "one meal per day" rule
  enforced anywhere.
- **Effort is a simple 3-level enum** (`easy`/`medium`/`hard`), not minutes or
  a star rating — easiest to assign consistently by hand when adding a new
  meal, and enough resolution to be useful when glancing at the grid.
- **Ingredients and meals are separate JSON files.** This keeps ingredient
  names centralized (rename an ingredient once, it updates everywhere) and
  lets ingredient aggregation work by id + summed quantity instead of fuzzy
  string matching.
- **Plain Vite + Svelte, not SvelteKit.** The app is a single page with no
  routing needs, so SvelteKit's adapter/prerendering setup would be pure
  overhead. Plain Vite builds a static `dist/` folder that GitHub Pages can
  serve directly.
- **GitHub Actions handles the GitHub Pages deploy**, rather than a manual
  `gh-pages` branch push — the workflow in `.github/workflows/deploy.yml`
  builds and publishes automatically on every push to `main`.

---

## 4. How to add a new meal

1. Check whether every ingredient the meal needs already exists in
   `src/lib/data/ingredients.json`. If not, add it:

   ```json
   "senf": "Senf"
   ```

2. Add an entry to the `meals.json` array:

   ```json
   {
     "id": "kartoffelsalat",
     "name": "Kartoffelsalat",
     "categories": ["kartoffeln"],
     "effort": "easy",
     "ingredients": [
       { "id": "kartoffeln", "qty": 1 },
       { "id": "zwiebel", "qty": 1 },
       { "id": "senf", "qty": 1 },
       { "id": "apfelessig", "qty": 1 }
     ]
   }
   ```

   - `id`: lowercase, hyphen-separated, must be unique in the file.
   - `categories`: pick from the existing list above, or add a new one (see
     next section). You can list more than one if it genuinely fits several.
   - `effort`: `"easy"`, `"medium"`, or `"hard"` — there's no formula, just
     judge it by how fiddly the recipe actually is.
   - `ingredients`: only set `qty` above `1` when you actually need more than
     one of that ingredient (e.g. two onions → `{ "id": "zwiebel", "qty": 2 }`).

3. Save, run `npm run dev` to check it shows up correctly in its category
   section and toggles/highlights on click.

No code changes needed for a normal new meal — this is the entire workflow.

### Adding a new category

If a meal doesn't fit any existing category:

1. Use the new category key in that meal's `categories` array, e.g.
   `"categories": ["suppe"]`.
2. Add a label for it in `src/App.svelte`, in the `categoryLabels` object:

   ```js
   const categoryLabels = {
     nudeln: 'Nudeln',
     kartoffeln: 'Kartoffeln',
     // ...
     suppe: 'Suppen'
   };
   ```

   The order of keys in this object is also the display order of the
   sections on the page.

---

## 5. Local development

```bash
npm install
npm run dev
```

## 6. Building & deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. In `vite.config.js`, set `base: '/your-repo-name/'` to match your actual
   repository name (required so asset URLs resolve correctly under
   `username.github.io/repo-name/`).
4. Push to `main`. `.github/workflows/deploy.yml` builds the app with
   `npm run build` and publishes the `dist/` folder automatically.

Your site will be live at `https://<username>.github.io/<repo-name>/`.
