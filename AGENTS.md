# macro-longevity

Static HTML/CSS/JS site — no build step, zero dependencies. Deploys to Cloudflare Pages from root.

## Quick start

```sh
make serve       # kill old :8080, start python3 http.server
```

## Structure

- `index.html` — landing page, stays at root
- `pages/*.html` — each loads `js/data.js` + `js/render.js`, calls its render function
- `js/data.js` — all content: BIOMARKERS (20), MEALS (31), MARINADES (8), PANTRY (9), FOOD_LISTS (3), SUPPLEMENTS (10)
- `js/render.js` — client-side rendering for all pages
- `css/style.css` — single stylesheet, responsive (768px, 480px breakpoints)

## Key render function calls (in render.js)

| Page | Function |
|------|----------|
| `biomarkers.html` | `renderBiomarkers()` |
| `food.html` | `renderFoods()` |
| `supplements.html` | `renderSupplements()` |

## Data editing (`js/data.js`)

- Add meals to `MEALS[]` with `category: "breakfast"` or `"lunch"` (lunch + dinner are merged)
- 7 meals use `methods[]` for clickable cooking method switching: savory-scrambled-eggs, chicken-breast-dinner, salmon, white-fish-dinner, chicken-thighs-dinner, steak-dinner, air-fry-potato
- Meals without methods use a flat `instructions[]` inside a `<details>` toggle
- Biomarker IDs referenced in meals must match `BIOMARKERS[].id` — full list: hba1c, hscrp, apob, grip, fasting-glucose, fasting-insulin, triglycerides, ldl-c, hdl-c, vitamin-d, homocysteine, uric-acid, alt, testosterone, ferritin, tsh, vo2max, waist-hip, resting-hr, bp
- Ingredient pricing format: `(FairPrice: SGD X.XX)`. Supplement pricing: `costPerMonth: "SGD XX"`.

## After editing

No build step — just refresh the browser. Validate with `node --check js/data.js` for syntax errors.
