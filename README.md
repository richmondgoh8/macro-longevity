# macro-longevity

Static HTML/CSS/JS food-first longevity site — daily nutrition stack, blood tests, workout, finance. Zero build step, zero dependencies.

## Quick start

```sh
make serve   # or: python3 -m http.server 8080
```

## How it works

- **No framework** — pure HTML/CSS/JS served from root
- **No backend** — all data hardcoded in `js/data/*.js`, rendered client-side
- **No build step** — edit files, refresh browser
- **Deploys to Cloudflare Pages** — push to GitHub, no config needed

## Structure

```
index.html                  Home — carnivore note, daily stack at a glance, page links
pages/
  stack.html                Daily Stack: multi-meal planner, nutrient checklist, supplements & recovery
  blood.html                Blood Tests: Annual core, One-time, Periodic, Low-value tests
  workout.html              Daily workout: 10 exercises with built-in timers and sound cues
  finance.html              Investment Combos, FIRE Calculator + Passive Income Tracker
  avoid.html                Ingredients to Avoid (full-page list, 7 items)
  protocol.html             Blueprint: 4-Pillar model, 80/20, screening tiers, biology, social health, frontier geroscience, Singapore
css/
  variables.css             Design tokens — colors, typography (4-size fluid), spacing (8px grid)
  style.css                 All component styles, responsive (768px, 480px)
js/
  stack.js                  Daily Stack planner rendering (ES module)
  avoid.js                  Lightweight Ingredient guide rendering and search
  stack-preview.js          Lightweight home-page protocol preview
  site.js                   Shared navigation and lazy export bootstrap
  blood.js                  Blood Tests rendering (ES module)
  render.js                Workout + Finance rendering
  home.js                  Home: 4-Pillar spine, Longevity 101, decision rule, evidence legend
  protocol.js              Blueprint page rendering
  export.js                Markdown export + nav toggle
  components/card-swipe.js  Viewport-filling swipeable card stack for mobile
  components/ui.js           Shared escaping and presentation primitives
  data/
    stack.js                DAILY_SUPPLEMENTS, FOOD_SPICES, EXTRAS, AVOID_INGREDIENTS, UPF_GUIDE, SKIP_LIST, CONDITIONAL_LIST
    core.js                 CORE_OUTCOMES — six outcome domains covered by the protocol
    blood.js                ANNUAL_PANEL, LOW_VALUE_TESTS
    workout.js              EXERCISES
    finance.js              INVESTMENTS
    pillars.js              PILLARS (4-Pillar master model), LONGEVITY_101, DECISION_RULE, EVIDENCE_TIERS
    protocol.js             EIGHTY_TWENTY, SOCIAL_MENTAL, FRONTIER, SCREENING_TIERS, BIOLOGY
    singapore.js            HAWKER, HEALTHIER_SG, SODIUM, ENVIRONMENT
    nutrition.js            Daily targets, builder items, reusable meal plans, high-ROI foods, supplements and recovery
```

## Data counts

| Array | Count | Notes |
|-------|-------|-------|
| `DAILY_SUPPLEMENTS` | 2 | Core protocol only; dose, timing, pairing, synergy, why, carnivore note |
| `FOOD_SPICES` | 10 | Food-first choices and optional spices |
| `EXTRAS` | 8 | Optional drinks, habits and plant additions |
| `AVOID_INGREDIENTS` | 7 | High-ROI avoid list for added sugar, alcohol, processed meat, trans fats and UPF |
| `AVOID_LABEL_GUIDE` | 5 groups | Exact ingredient markers with priority, rule and context |
| `UPF_GUIDE` | 4 steps | Practical NOVA-style label screen; no fake five-ingredient cutoff |
| `TIMING_GUIDE` | 4 slots | Meal-fat, training, evening and medicine-separation guidance |
| `CORE_OUTCOMES` | 6 | Sleep, stress, glucose, ApoB, mitochondria and gut coverage |
| `NUTRIENT_TARGETS` | 30 | Adult-male baseline: protein, essential fats, minerals, vitamins, fibre and choline |
| `COMPOUND_TARGETS` | 7 | Targeted compounds: food-first, conditional and optional layers |
| `BUILDER_ITEMS` | 52 | Specific foods, servings, supplements and safety flags for the Daily Stack builder |
| `MEAL_PLANS` | 6 | Reusable multi-item meals for the Daily Stack planner |
| `SKIP_LIST` | 21 | "Do not buy" — redundant, speculative or low-evidence supplements |
| `CONDITIONAL_LIST` | 10 | Use only for a defined symptom, food pattern, lab result or clinical indication |
| `ANNUAL_PANEL` | 27 | Tiers: core / one-time / periodic, with optimal ranges |
| `LOW_VALUE_TESTS` | 9 | Expensive tests with no actionable value |
| `BEYOND_PANEL` | 8 | Non-lab high-ROI habits (BP, sleep apnea, waist, fitness, smoking, alcohol, social, dental) |
| `APOB_PLAN` / `APOB_EFFECTS` | 7 / 8 | ApoB-elevated next-steps module + "what helps what" table |
| `EXERCISES` | 10 | Minimal-equipment, with timers |
| `INVESTMENTS` | 5 | Singapore FIRE combos |

## Design system

Follows [`DESIGN.md`](DESIGN.md). Key tokens in `css/variables.css`:

- **Typography**: 4 sizes with `clamp()` fluid scaling (`--text-sm` through `--text-xl`)
- **Typography**: Geist for interface text and Geist Mono for measured data — self-hosted, no external fetch
- **Spacing**: 8px grid (`--space-2` through `--space-20`)
- **Evidence taxonomy (5 tiers)**: `--evidence-core/conditional/optional/experimental/skip` — mirrors the Longevity OS report (CORE / CONDITIONAL / OPTIONAL / EXPERIMENTAL / SKIP)
- **4-Pillar accents**: `--pillar-1..4` (rose / violet / amber / teal)
- **Theme**: light-only interface with a single neutral surface system
- **Icons**: text-first interface; data visualizations may use SVG, but navigation and cards do not use icon markers
- **Carnivore notes**: `--carnivore`, `--carnivore-bg`, `--carnivore-border`

## Mobile UX

- Bottom tab bar (<768px): Home | Nutrition | Health | Training | Finance
- Swipeable card stacks for dense content (workout exercises)
- Sub-tab controls (stack page) hide buttons and show `<select>` dropdown on mobile
- Timing tables scroll horizontally on narrow screens

## After editing

No build step. Validate JS syntax:

```sh
node --check js/data/stack.js
node --check js/data/blood.js
node --check js/data/pillars.js
node --check js/data/protocol.js
node --check js/data/singapore.js
node --check js/stack.js
node --check js/blood.js
node --check js/home.js
node --check js/protocol.js
node --check js/export.js
node --check js/render.js
node --check js/export.js
node --check js/components/card-swipe.js
```

Run the dependency-free repository audit with `make audit`. It checks page security metadata, labels, tab wiring, service-worker assets, content safety guards, and JavaScript syntax.

Run the real-browser quality suite with `npm run test:ui`. Use `npm run test:ui:headed` to debug interactively, `npm run test:visual:update` to intentionally refresh screenshot baselines, and `npm run test:perf` for the throttled performance budgets. These packages are development-only; the deployed site remains dependency-free.

## License

MIT — Copyright (c) 2026 Richmond Goh.
