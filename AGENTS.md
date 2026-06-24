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
  workout.html           12 equipment-free exercises with timer, music, and sound cues
  food.html             Meals (Breakfast, Lunch & Dinner), Marinades, Pantry, Food Lists
  finance.html          Investment Combos, FIRE Calculator + Passive Income Tracker
css/
  variables.css         Design tokens + self-hosted @font-face (DM Sans, Inter, JetBrains Mono)
  style.css             All component styles, responsive (768px, 480px breakpoints)
js/
  render.js             Client-side rendering for all pages (ES module, auto-inits on DOMContentLoaded)
  export.js             Markdown export + nav toggle (ES module)
  components/
    card-swipe.js       Viewport-filling swipeable card stack (mobile, ES module)
  data/
    common.js           Shared constants (MEAL_CATEGORIES, TIER_*, DIET_*, FASTING_PROTOCOLS)
    health.js           BIOMARKERS, VACCINES, SUPPLEMENTS, SUGAR_OFFSET_TIPS
    food.js             MEALS, MARINADES, PANTRY, FOOD_LISTS, AVOID_LIST
    workout.js          EXERCISES
    finance.js          INVESTMENTS
fonts/
  dm-sans-latin.woff2   Self-hosted Latin subset (variable weight)
  inter-latin.woff2     Self-hosted Latin subset (variable weight)
  jetbrains-mono-latin.woff2  Self-hosted Latin subset
sw.js                   Service worker (cache-first for static assets)
manifest.json           PWA manifest
offline.html            Offline fallback page
favicon.svg             Site icon (used as PWA icon too)
```

## Key render function calls

| Page | Function | Sub-tabs |
|------|----------|----------|
| `health.html` | `renderHealth()` | Biomarkers, Fasting, Vaccinations, Supplements, Damage Control |
| `workout.html` | `renderExercises("workout-app")` | None (single page, 12 exercise cards with built-in timers) |
| `food.html` | `renderFoods()` | Breakfast, Lunch & Dinner, Marinades, Pantry, Food Lists |
| `finance.html` | `renderInvestments()` + inline `calcFire()` | Investment Combos, FIRE Calculator |

## Data editing (`js/data/*.js`)

Data is split into ES modules under `js/data/`:

- `common.js` — Shared constants: `MEAL_CATEGORIES`, `MEAL_LABELS`, `FASTING_PROTOCOLS`, `TIER_*`, `DIET_*`, `PRICE_DISCLAIMER`, `SUGAR_OFFSET_TIPS`
- `health.js` — `BIOMARKERS`, `VACCINES`, `SUPPLEMENTS`
- `food.js` — `MEALS`, `MARINADES`, `PANTRY`, `FOOD_LISTS`, `AVOID_LIST`
- `workout.js` — `EXERCISES`
- `finance.js` — `INVESTMENTS`

- Meals use `category: "breakfast"` or `"lunch"` (lunch includes dinner)
- Meals use `group` property for visual grouping (e.g., "Poultry", "Fish & Seafood", "Sides")
- 7 meals use `methods[]` for clickable cooking method switching
- Meals without methods use a flat `instructions[]` inside a `<details>` toggle
- Biomarker IDs referenced in meals must match `BIOMARKERS[].id`
- Air fryer instructions include: preheat time, temperature, flip/shake timing, visual doneness cues
- Ingredient pricing format: `(FairPrice: SGD X.XX)`. Supplement pricing: `costPerMonth: "SGD XX"`.
- **Data counts**: Biomarkers 20, Meals 37, Marinades 8, Pantry 11, Supplements 23, Food Lists 3, Exercises 12, Fasting Protocols 7, Vaccines 10, Investments 5
- Exercise objects have: `variations[]` (Gold Standard / Regular / Easy Start), `instructions[]`, `biomarkers[]`

## Workout page (`pages/workout.html`)

- 12 exercises: Wall Push-Up, Bodyweight Squat, Reverse Lunge, Glute Bridge, Standing Calf Raise, Dead Bug, Plank, Bird Dog, Standing Knee Drive, Step-Up, Wall Sit, Inchworm
- Each exercise has a built-in timer (Web Audio API, no external libraries)
- Timer states: idle → running → paused → done. Only one timer active at a time (starting one stops any other)
- Countdown threshold: `timeLeft <= 6` — ticks from 6 to 1, then triggers end cue
- Background music: two separate tracks — work (Atmospheric Ambient Pad, CC BY 4.0, gain 0.2) + rest (Loft House, CC BY-NC 4.0, gain 0.4)
- Work music skips first 5s of intro (`MUSIC_START_OFFSET = 5`)
- Sound cues: synthesized whistles + ticks (no external audio files)
- `getVariation(ex)` always returns `ex.variations[1]` (Regular tier)

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

- Bottom tab bar on mobile (<768px): Home | Health | Workout | Food | Finance
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
node --check js/data/common.js
node --check js/data/health.js
node --check js/data/food.js
node --check js/data/workout.js
node --check js/data/finance.js
node --check js/render.js
node --check js/export.js
node --check js/components/card-swipe.js
```
