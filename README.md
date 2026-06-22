# macro-longevity

Static HTML/CSS/JS longevity optimization site for Singapore — biomarkers, nutrition, supplements, fasting, vaccines, and FIRE investing. Zero build step, zero dependencies.

## Quick start

```sh
make serve   # or: python3 -m http.server 8080
```

## How it works

- **No framework** — pure HTML/CSS/JS served from root
- **No backend** — all data hardcoded in `js/data.js`, rendered client-side
- **No build step** — edit files, refresh browser
- **Deploys to Cloudflare Pages** — push to GitHub, no config needed

## Structure

```
index.html                  Landing page
pages/
  health.html               5 sub-tabs: Biomarkers, Fasting, Vaccinations, Supplements, Damage Control
  food.html                 5 sub-tabs: Breakfast, Lunch & Dinner, Marinades, Pantry, Food Lists
  finance.html              2 sub-tabs: Investment Combos, FIRE Calculator
css/
  variables.css             Design tokens — colors, typography (4-size fluid), spacing (8px grid)
  style.css                 All component styles, responsive (768px, 480px)
js/
  data.js                   All content arrays (biomarkers, meals, supplements, etc.)
  render.js                 Client-side rendering for all pages
  components/card-swipe.js  Viewport-filling swipeable card stack for mobile
scripts/
  validate-tokens.js        Validates token structure and hardcoded color usage
```

## Data counts

| Array | Count | Notes |
|-------|-------|-------|
| `BIOMARKERS` | 20 | Grouped by category, with ranges and improvement plans |
| `MEALS` | ~51 | 7 use `methods[]` for cooking method switching |
| `MARINADES` | 8 | |
| `PANTRY` | 9 | |
| `SUPPLEMENTS` | 10 | Filterable by diet + tier |
| `FOOD_LISTS` | 4 | Fiber, potassium, and more |

## Design system

Follows `DESIGN.md` v1.0. Key tokens in `css/variables.css`:

- **Typography**: 4 sizes with `clamp()` fluid scaling (`--text-sm` through `--text-xl`)
- **Font pairing**: DM Sans (display) + Inter (body)
- **Spacing**: 8px grid (`--space-2` through `--space-20`)
- **Radius**: sm=4px, md=8px, lg=16px, xl=24px

## Mobile UX

- Bottom tab bar (<768px): Home | Health | Food | Finance
- Swipeable card stacks for dense content (biomarkers, supplements, fasting, vaccines)
- Card-expand pattern: face view + "Show Details" → detail section

## After editing

No build step. Validate JS syntax:

```sh
node --check js/data.js
node --check js/render.js
node --check js/components/card-swipe.js
```

## Pricing convention

- Ingredient costs: **SGD** referencing NTUC FairPrice
- Supplement costs: **iHerb SG**, format `"SGD XX"` for `costPerMonth`
- Update `PRICE_DISCLAIMER` date in `js/data.js` when refreshing prices

## License

MIT — Copyright (c) 2026 Richmond Goh.
