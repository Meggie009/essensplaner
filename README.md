# Essensplan — Meal Planner

A small Svelte app to browse meals, select what you want to cook, and export
the selected meals plus their combined shopping list to the clipboard.

---

## 1. Project structure

```
meal-planner/
├── src/
│   ├── App.svelte                     # top-level layout, groups meals by category
│   ├── main.js                        # Vite/Svelte entry point
│   └── lib/
│       ├── data/
│       │   ├── meals/                 # one markdown file per meal — see section 3
│       │   ├── meals.js               # parses meals/*.md at build time
│       │   └── categories.js          # the list of valid categories — see section 2
│       ├── stores/
│       │   └── selection.js           # selection state + derived stores
│       ├── utils/
│       │   └── clipboard.js           # copy-to-clipboard helper
│       └── components/
│           ├── MealCard.svelte        # one meal: checkbox to select, click to expand ingredients
│           ├── CategorySection.svelte # a category's foldable, sticky-header grid of MealCards
│           ├── SelectionBadge.svelte  # floating selected-count badge + jump-to-export button
│           ├── SelectedMealsPanel.svelte
│           └── IngredientsPanel.svelte
├── index.html
├── vite.config.js                     # sets `base` for GitHub Pages
├── package.json
├── .github/workflows/deploy.yml       # auto-deploy to GitHub Pages
└── README.md
```

---

## 2. Categories

All valid categories live in **`src/lib/data/categories.js`** — this is the
single source of truth both for what shows up as a section on the page and
for which `category:` values a meal file can use. Current list:

| key          | label          |
|--------------|----------------|
| `nudeln`     | Nudeln         |
| `kartoffeln` | Kartoffeln     |
| `linsen`     | Linsen         |
| `reis`       | Reis           |
| `couscous`   | Couscous       |
| `teig`       | Teig / Gebäck  |
| `feiertag`   | Feiertag       |
| `suppen`     | Suppen & Eintöpfe |
| `hülsenfrüchte`     | Hülsenfrüchte |
| `gemüse`     | Gemüse        |


The order of this list is also the display order of the sections on the
page.

**To add a new category:** add a `{ key: '...', label: '...' }` entry to
`categories.js`. That's the only code change needed — meal files can then use
the new `key` right away.

---

## 3. Meal data structure

Each meal is its own file in **`src/lib/data/meals/`** [here](https://github.com/Meggie009/essensplaner/tree/main/src/lib/data/meals), parsed automatically
at build time (`src/lib/data/meals.js`) — there's no central list to edit or
break, no ids to invent, and no separate ingredient catalog to keep in sync.

### File format

```markdown
---
category: kartoffeln
effort: easy
---
# Kartoffelsalat

- Kartoffeln
- Zwiebel
- Senf
- Apfelessig
```

- **`category`** — one key from the table above. For more than one, separate
  with commas: `category: nudeln, linsen`.
- **`effort`** — one of `easy`, `medium`, `hard`.
- **`# Heading`** — becomes the meal's display name.
- **Ingredient list** — one ingredient per bullet, plain text, no ids to
  look up. Add a quantity in parentheses if you need more than one of
  something, e.g. `- Zwiebel (2)`. Ingredient names are matched across meals
  by trimmed/lowercased text for the shopping-list count, so keep spelling
  consistent (`Zwiebel` and `zwiebel` count as the same ingredient;
  `Zwiebel` and `Zwiebeln` do not).
- The meal's internal id is taken from the **filename** (without `.md`), so
  it must be unique — e.g. `kartoffelsalat.md`.

### Template — copy this to create a new meal

Save as `src/lib/data/meals/<a-unique-filename>.md`:

```markdown
---
category: sonstige
effort: medium
---
# Meal Name

- Ingredient
- Ingredient
- Ingredient (2)
```

Then:
1. Set `category` to one (or more, comma-separated) key from the table in
   section 2.
2. Set `effort` to `easy`, `medium`, or `hard`.
3. Replace `# Meal Name` with the actual dish name.
4. List the ingredients as plain bullets, adding `(n)` after any that need
   more than one.

No other files need to change — the meal shows up automatically the next
time the app builds.

---

## 4. Local development

```bash
npm install
npm run dev
```

## 5. Building & deploying to GitHub Pages

1. Push this repo to GitHub.
2. In the repo's **Settings → Pages**, set the source to **GitHub Actions**.
3. In `vite.config.js`, set `base: '/your-repo-name/'` to match your actual
   repository name (required so asset URLs resolve correctly under
   `username.github.io/repo-name/`).
4. Push to `main`. `.github/workflows/deploy.yml` builds the app with
   `npm run build` and publishes the `dist/` folder automatically.

