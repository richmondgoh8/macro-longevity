# macro-longevity

Static HTML/CSS/JS site guiding users toward optimal biomarker levels for longevity
through evidence-based nutrition, cooking protocols, and supplement stacking — with
a budget-first philosophy. Deploys to Cloudflare Pages.

---

## Quick start

```sh
make serve   # or: python3 -m http.server 8080
```

Open http://localhost:8080

## Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Language       | Pure HTML, CSS, JavaScript        |
| Frameworks     | None                              |
| Build step     | None — served directly from root  |
| Hosting        | Cloudflare Pages (planned)        |

## Architecture

```
index.html              Landing page with hero, stats, feature cards
biomarkers.html         20 biomarker cards rendered client-side
food.html               30 meals (breakfast/lunch/dinner) + marinades + pantry + food lists
supplements.html        Supplement stack builder with diet/tier filtering
css/style.css           Single stylesheet, ~1850 lines, responsive (768px, 480px)
js/data.js              All content: biomarkers, meals, supplements, pantry, food lists
js/render.js            Client-side rendering for every page
```

All data is hardcoded in `js/data.js` — no API, no database, no backend.
Each `.html` page loads `data.js` + `render.js` and calls its render function.

## Pages

| File                | Content                                                              |
|---------------------|----------------------------------------------------------------------|
| `index.html`        | Landing page with hero, preview cards, stats, features               |
| `biomarkers.html`   | 20 biomarkers grouped by category, with ranges and improvement plans |
| `food.html`         | 30 meals across 3 meal types + marinades, pantry staples, food lists |
| `supplements.html`  | Stack builder — select diet + tier to see filtered supplements       |

## Content editing

Edit `js/data.js` to add or change biomarkers, meals, supplements, pantry items,
or food lists. Each page reads the global arrays and renders them client-side.
After editing, verify counts stay consistent with brace-matching.

### Pricing

- Ingredient costs in **SGD** reference NTUC FairPrice.
- Supplement costs sourced from **iHerb SG** — update `PRICE_DISCLAIMER` date if refreshing.
- Supplement costs use `"SGD XX"` format for `costPerMonth`.

## Deploy to Cloudflare Pages

Push to GitHub. No build command needed — serve files from root.
All assets are static, no server-side processing.

## License

MIT — Copyright (c) 2026 Richmond Goh.
