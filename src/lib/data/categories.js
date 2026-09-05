// The list of valid meal categories, in the order they're displayed on the
// page. To add a new category: add an entry here, then use its `key` in a
// meal's frontmatter `category:` field (see src/lib/data/meals/ and the
// README for the meal file format).
export const categories = [
  { key: 'nudeln', label: 'Nudeln' },
  { key: 'kartoffeln', label: 'Kartoffeln' },
  { key: 'hülsenfrüchte', label: 'Hülsenfrüchte' },
  { key: 'reis', label: 'Reis' },
  { key: 'suppen', label: 'Suppen & Eintöpfe' },
  { key: 'gemüse', label: 'Gemüse' },
  { key: 'couscous', label: 'Couscous' },
  { key: 'teig', label: 'Teig' },
  { key: 'feiertag', label: 'Feiertag' }
];
