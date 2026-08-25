# macro-longevity

Static HTML/CSS/JS carnivore-first longevity site — daily stack, blood tests, workout, finance. Zero build step, zero dependencies. Deploys to Cloudflare Pages from root.

Follows GENUI.md v3.0 (protocol-first, evidence-graded, clinical-biotech design system; supersedes DESIGN.md for this app).

## Quick start

```sh
make serve       # kill old :8080, start python3 http.server
```

## Structure

```
index.html              Home — 4-Pillar spine, Longevity 101, decision rule, evidence legend, daily protocol at a glance
pages/
  stack.html            Daily Stack: Supplements / Food & Spices / Extras / Conditional / Skip List (sub-tabs)
  blood.html            Blood Tests: Annual core, One-time, Periodic, Low-value tests, ApoB module
  workout.html          10 equipment-free exercises with timer, music, and sound cues
  finance.html          Investment Combos, FIRE Calculator + Passive Income Tracker
  avoid.html            Ingredients to Avoid (full-page list, 7 items)
  protocol.html         Blueprint: 4-Pillar model, 80/20, screening tiers, biology, social health, frontier geroscience, Singapore
css/
  variables.css         Design tokens (v3.0) + self-hosted @font-face (DM Sans, Inter, JetBrains Mono)
  style.css             All component styles, light/dark, responsive (768px, 480px breakpoints)
js/
  stack.js              Daily Stack rendering (ES module, auto-inits on DOMContentLoaded)
  blood.js              Blood Tests rendering (ES module, auto-inits on DOMContentLoaded)
  render.js             Workout + Finance rendering (ES module, auto-inits on DOMContentLoaded)
  home.js               Home: 4-Pillar spine, Longevity 101, decision rule, evidence legend
  protocol.js           Blueprint page rendering
  icons.js             Inline SVG icon system (structural UI; replaces emoji)
  theme.js              Dark/light theme toggle (persisted), injected via export.js
  export.js             Markdown export + nav toggle (ES module)
  components/
    card-swipe.js       Viewport-filling swipeable card stack (mobile, ES module)
  data/
    stack.js            DAILY_SUPPLEMENTS, FOOD_SPICES, EXTRAS, AVOID_INGREDIENTS, UPF_GUIDE, SKIP_LIST, CONDITIONAL_LIST
    blood.js            ANNUAL_PANEL (tiers), LOW_VALUE_TESTS, BEYOND_PANEL, APOB_PLAN + APOB_EFFECTS
    workout.js          EXERCISES, PILLARS (4-Pillar training)
    finance.js          INVESTMENTS
    pillars.js          PILLARS (4-Pillar master model), LONGEVITY_101, DECISION_RULE, EVIDENCE_TIERS
    protocol.js         EIGHTY_TWENTY, SOCIAL_MENTAL, FRONTIER, SCREENING_TIERS, BIOLOGY
    singapore.js        HAWKER, HEALTHIER_SG, SODIUM, ENVIRONMENT
fonts/
  dm-sans-latin.woff2   Self-hosted Latin subset (variable weight)
  inter-latin.woff2     Self-hosted Latin subset (variable weight)
  jetbrains-mono-latin.woff2  Self-hosted Latin subset
sw.js                   Service worker (cache-first for static assets)
manifest.json           PWA manifest
offline.html            Offline fallback page
favicon.svg             Site icon (used as PWA icon too)
GENUI.md                Design spec v3.0 (protocol-first, evidence-graded, clinical-biotech, zero hype)
```

## Key render function calls

| Page | Function | Sub-tabs |
|------|----------|----------|
| `index.html` | `renderFoodProtocol()` + `home.js` (pillars/101/legend) | None (daily protocol table) |
| `stack.html` | `renderStack()` | Supplements, Food & Spices, Extras, Conditional, Skip List |
| `blood.html` | `renderBlood()` | None (tier sections + ApoB module) |
| `workout.html` | `renderExercises("workout-app")` | None (4 Pillars: Zone 2, VO₂ Max, Strength, Mobility with built-in timers) |
| `finance.html` | `renderInvestments()` + inline `calcFire()` | Investment Combos, FIRE Calculator |
| `avoid.html` | `renderAvoidPage()` | None (full-page list) |
| `protocol.html` | `renderProtocol()` (js/protocol.js) | 80/20, screening tiers, biology, social, frontier, Singapore |

## Data editing (`js/data/*.js`)

- `stack.js` — `DAILY_SUPPLEMENTS` (dose, timing, pairing, synergy, why, carnivoreNote), `FOOD_SPICES` (serving, timing, why, risk), `EXTRAS` (drinks/habits, same schema), `AVOID_INGREDIENTS`, `SKIP_LIST`, `CONDITIONAL_LIST` (context-dependent supplements with who/dose/why/caution). `evidence` uses the 5-tier vocabulary: `core / conditional / optional / experimental / skip`.
- `blood.js` — `ANNUAL_PANEL` (tiers: annual / one-time / periodic; each: frequency, optimalRange, why, carnivoreNote), `LOW_VALUE_TESTS`, `BEYOND_PANEL` (non-lab high-ROI habits), `APOB_PLAN` + `APOB_EFFECTS` (ApoB-elevated next-steps module)
- `workout.js` — `EXERCISES`, `PILLARS` (4-Pillar training)
- `finance.js` — `INVESTMENTS`
- `pillars.js` — `PILLARS` (4-Pillar master model), `LONGEVITY_101`, `DECISION_RULE`, `EVIDENCE_TIERS` (5-tier taxonomy)
- `protocol.js` — `EIGHTY_TWENTY`, `SOCIAL_MENTAL`, `FRONTIER`, `SCREENING_TIERS`, `BIOLOGY`
- `singapore.js` — `HAWKER`, `HEALTHIER_SG`, `SODIUM`, `ENVIRONMENT`

- **Why-lines**: 1–2 sentences per item. No citation walls in the UI (research lives in the data, not the DOM).
- **Data counts**: Supplements 2 (core), Food & Spices 10, Extras 8, Avoid Ingredients 7, Skip List 21, Conditional 10, Blood Tests 26, Low-Value Tests 9, Beyond the Panel 8, ApoB Plan 7 + 8 Effects, Exercises 10, Investments 5, Master Pillars 4, Longevity 101 = 10, Evidence Tiers 5, Screening Tiers 4
- **Supplements: food-first hierarchy.** Only 8 supplements survive — each one covers a genuine carnivore gap or has strong evidence that food alone doesn't provide. 6 conditional supplements are Tier B evidence — worth tracking but not daily essentials.

## Workout page (`pages/workout.html`)

- 4 Pillars: Zone 2 (steady-state countdown), VO₂ Max (Norwegian 4×4 intervals), Strength & Posterior Chain (6 compound exercises), Mobility (4 drills)
- Each pillar has a built-in timer (Web Audio API, no external libraries)
- Timer types: countdown (Zone 2), intervals (VO₂ Max), reps (Strength/Mobility)
- Timer states: idle → running → paused → done. Only one timer active at a time (starting one stops any other)
- Countdown threshold: `timeLeft <= 6` — ticks from 6 to 1, then triggers end cue
- Background music: two separate tracks — work (Atmospheric Ambient Pad, CC BY 4.0, gain 0.2) + rest (Loft House, CC BY-NC 4.0, gain 0.4)
- Work music skips first 5s of intro (`MUSIC_START_OFFSET = 5`)
- Sound cues: synthesized whistles + ticks (no external audio files)
- `PILLARS` export replaces flat `EXERCISES` array; legacy `EXERCISES` maintained for backward compat

## Design tokens (`css/variables.css`)

Follows GENUI.md v3.0 — 4-size fluid typography with `clamp()`, DM Sans display font, 8px spacing grid, 5-tier evidence tokens, 4-pillar accents, full dark mode.

```css
--text-sm:  clamp(0.8125rem, 0.75rem + 0.3vw, 0.9375rem);  /* captions */
--text-md:  clamp(1rem, 0.9rem + 0.5vw, 1.25rem);           /* body */
--text-lg:  clamp(1.375rem, 1.1rem + 1.2vw, 2rem);          /* headings */
--text-xl:  clamp(1.75rem, 1.2rem + 2.5vw, 3.5rem);         /* hero */
```

- Carnivore note tokens: `--carnivore`, `--carnivore-bg`, `--carnivore-border`
- Radius: sm=4px, md=8px, lg=16px, xl=24px
- Spacing: 8px grid (`--space-2` through `--space-20`)
- Never hardcode colors in style.css — use token variables

## Mobile UX

- Bottom tab bar on mobile (<768px): Home | Stack | Blood | Blueprint | Workout | Finance | Avoid
- Swipeable card stacks for dense content (workout exercises)
- Sub-tab controls (stack page) hide buttons and show `<select>` dropdown on mobile
- Timing tables scroll horizontally on narrow screens

## Export to AI

- `js/export.js` provides `exportData()` function
- Downloads `macro-longevity-data.md` — full knowledge base in Markdown format
- Includes: Food & Spices, Extras, Avoid Ingredients, Skip List, Conditional List, Blood Panel, Low-Value Tests, Beyond the Panel, ApoB Plan, Investments, 4 Pillars of Training, 4-Pillar Master Model, Longevity 101, 80/20 Protocol, Screening Tiers, Biology, Social & Mental Health, Frontier Geroscience, Singapore (hawker, Healthier SG, sodium, environment)
- Button in footer of all pages

## Search & Retrieval Priority

**TinyFish is always the first choice for any web search or content retrieval.** Exa is backup-only.

1. **TinyFish first** — Use `tinyfish_search` and `tinyfish_fetch_content` for all web searches, URL reading, and external knowledge retrieval.
2. **Exa backup only** — Only use Exa tools (`exa_web_search_exa`, `exa_crawling_exa`, `exa_get_code_context_exa`) if TinyFish returns insufficient or poor-quality results.
3. **Never mix search providers** in the same task.

## After editing

No build step — just refresh the browser. Validate with:

```sh
node --check js/data/stack.js
node --check js/data/blood.js
node --check js/data/workout.js
node --check js/data/finance.js
node --check js/stack.js
node --check js/blood.js
node --check js/render.js
node --check js/export.js
node --check js/data/pillars.js
node --check js/data/protocol.js
node --check js/data/singapore.js
node --check js/home.js
node --check js/protocol.js
node --check js/icons.js
node --check js/theme.js
node --check js/components/card-swipe.js
```
