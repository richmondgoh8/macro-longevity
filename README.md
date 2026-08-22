# macro-longevity

Static HTML/CSS/JS carnivore-first longevity site — daily stack, blood tests, workout, finance. Zero build step, zero dependencies.

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
  stack.html                Daily Stack: Supplements / Food & Spices / Extras & Habits (sub-tabs)
  blood.html                Blood Tests: Annual core, One-time, Periodic, Low-value tests
  workout.html              Daily workout: 10 exercises with built-in timers and sound cues
  finance.html              Investment Combos, FIRE Calculator + Passive Income Tracker
  avoid.html                Ingredients to Avoid (full-page list, 7 items)
css/
  variables.css             Design tokens — colors, typography (4-size fluid), spacing (8px grid)
  style.css                 All component styles, responsive (768px, 480px)
js/
  stack.js                  Daily Stack rendering (ES module)
  blood.js                  Blood Tests rendering (ES module)
  render.js                 Workout + Finance rendering
  export.js                 Markdown export + nav toggle
  components/card-swipe.js  Viewport-filling swipeable card stack for mobile
  data/
    stack.js                DAILY_SUPPLEMENTS, FOOD_SPICES, EXTRAS, AVOID_INGREDIENTS, UPF_GUIDE, SKIP_LIST, CONDITIONAL_LIST
    core.js                 CORE_OUTCOMES — six outcome domains covered by the protocol
    blood.js                ANNUAL_PANEL, LOW_VALUE_TESTS
    workout.js              EXERCISES
    finance.js              INVESTMENTS
```

## Data counts

| Array | Count | Notes |
|-------|-------|-------|
| `DAILY_SUPPLEMENTS` | 2 | Core protocol only; dose, timing, pairing, synergy, why, carnivore note |
| `FOOD_SPICES` | 10 | Food-first choices and optional spices |
| `EXTRAS` | 8 | Optional drinks, habits and plant additions |
| `AVOID_INGREDIENTS` | 7 | High-ROI avoid list for added sugar, alcohol, processed meat, trans fats and UPF |
| `UPF_GUIDE` | 4 steps | Practical NOVA-style label screen; no fake five-ingredient cutoff |
| `CORE_OUTCOMES` | 6 | Sleep, stress, glucose, ApoB, mitochondria and gut coverage |
| `SKIP_LIST` | 21 | "Do not buy" — redundant, speculative or low-evidence supplements |
| `CONDITIONAL_LIST` | 9 | Use only for a defined symptom, food pattern, lab result or clinical indication |
| `ANNUAL_PANEL` | 26 | Tiers: core / one-time / periodic, with optimal ranges |
| `LOW_VALUE_TESTS` | 9 | Expensive tests with no actionable value |
| `BEYOND_PANEL` | 8 | Non-lab high-ROI habits (BP, sleep apnea, waist, fitness, smoking, alcohol, social, dental) |
| `APOB_PLAN` / `APOB_EFFECTS` | 7 / 8 | ApoB-elevated next-steps module + "what helps what" table |
| `EXERCISES` | 10 | Minimal-equipment, with timers |
| `INVESTMENTS` | 5 | Singapore FIRE combos |

## Design system

Follows `GENUI.md` v2.0 (supersedes `DESIGN.md` for this app). Key tokens in `css/variables.css`:

- **Typography**: 4 sizes with `clamp()` fluid scaling (`--text-sm` through `--text-xl`)
- **Font pairing**: DM Sans (display) + Inter (body), JetBrains Mono for data
- **Spacing**: 8px grid (`--space-2` through `--space-20`)
- **Evidence badges**: `--evidence-strong/moderate/weak/skip` semantic tokens
- **Carnivore notes**: `--carnivore`, `--carnivore-bg`, `--carnivore-border`

## Mobile UX

- Bottom tab bar (<768px): Home | Stack | Blood | Workout | Finance | Avoid
- Swipeable card stacks for dense content (workout exercises)
- Sub-tab controls (stack page) hide buttons and show `<select>` dropdown on mobile
- Timing tables scroll horizontally on narrow screens

## After editing

No build step. Validate JS syntax:

```sh
node --check js/data/stack.js
node --check js/data/blood.js
node --check js/stack.js
node --check js/blood.js
node --check js/render.js
node --check js/export.js
node --check js/components/card-swipe.js
```

## License

MIT — Copyright (c) 2026 Richmond Goh.
