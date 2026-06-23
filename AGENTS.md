# macro-longevity

Static HTML/CSS/JS site — no build step, zero dependencies. Deploys to Cloudflare Pages from root.

## Quick start

```sh
make serve       # kill old :8080, start python3 http.server
```

## Structure

```
index.html              Landing page
pages/
  health.html           Biomarkers, Fasting, Vaccinations, Supplements, Damage Control
  food.html             Meals (Breakfast, Lunch & Dinner), Marinades, Pantry, Food Lists
  finance.html          Investment Combos, FIRE Calculator + Passive Income Tracker
css/
  variables.css         Design tokens (colors, typography, spacing, radius, shadows)
  style.css             All component styles, responsive (768px, 480px breakpoints)
js/
  data.js               All content arrays
  render.js             Client-side rendering for all pages
  export.js             Markdown export for AI consumption
  components/
    card-swipe.js       Viewport-filling swipeable card stack (mobile)
scripts/
  validate-tokens.js    Validates token structure and hardcoded color usage
```

## Key render function calls

| Page | Function | Sub-tabs |
|------|----------|----------|
| `health.html` | `renderHealth()` | Biomarkers, Fasting, Vaccinations, Supplements, Damage Control |
| `food.html` | `renderFoods()` | Breakfast, Lunch & Dinner, Marinades, Pantry, Food Lists |
| `finance.html` | `renderInvestments()` + inline `calcFire()` | Investment Combos, FIRE Calculator |

## Data editing (`js/data.js`)

- Meals use `category: "breakfast"` or `"lunch"` (lunch includes dinner)
- Meals use `group` property for visual grouping (e.g., "Poultry", "Fish & Seafood", "Sides")
- 7 meals use `methods[]` for clickable cooking method switching
- Meals without methods use a flat `instructions[]` inside a `<details>` toggle
- Biomarker IDs referenced in meals must match `BIOMARKERS[].id`
- Air fryer instructions include: preheat time, temperature, flip/shake timing, visual doneness cues
- Ingredient pricing format: `(FairPrice: SGD X.XX)`. Supplement pricing: `costPerMonth: "SGD XX"`.
- Biomarker counts: 20. Meals: 36. Marinades: 8. Pantry: 9. Supplements: 10. Food Lists: 4.

## Design tokens (`css/variables.css`)

Follows DESIGN.md v1.0 — 4-size fluid typography with `clamp()`, DM Sans display font, 8px spacing grid.

```css
--text-sm:  clamp(0.8125rem, 0.75rem + 0.3vw, 0.9375rem);  /* captions */
--text-md:  clamp(1rem, 0.9rem + 0.5vw, 1.25rem);           /* body */
--text-lg:  clamp(1.375rem, 1.1rem + 1.2vw, 2rem);          /* headings */
--text-xl:  clamp(1.75rem, 1.2rem + 2.5vw, 3.5rem);         /* hero */
```

- Radius: sm=4px, md=8px, lg=16px, xl=24px
- Spacing: 8px grid (`--space-2` through `--space-20`)
- Never hardcode colors in style.css — use token variables

## Mobile UX

- Bottom tab bar on mobile (<768px): Home | Health | Food | Finance
- Swipeable card stacks for dense content (biomarkers, supplements, fasting, vaccines)
- Card-expand pattern: face view + "Show Details" button → detail section
- Desktop shows normal grids; mobile shows swipe cards via CSS media queries
- Sub-tab controls (meal-tabs, health tabs) hide buttons and show `<select>` dropdown on mobile
- Meal sub-tab bar is sticky (`top: 56px`) on mobile so tabs stay visible when scrolling
- Food lists show numeric columns (fiber/potassium) with daily targets above tables

## Export to AI

- `js/export.js` provides `exportData()` function
- Downloads `macro-longevity-data.md` — full knowledge base in Markdown format
- Includes: Biomarkers, Meals, Marinades, Pantry, Food Lists, Fasting, Vaccines, Supplements, Investments, Sugar Tips
- Button in footer of all pages

## After editing

No build step — just refresh the browser. Validate with:

```sh
node --check js/data.js
node --check js/render.js
node --check js/components/card-swipe.js
```
