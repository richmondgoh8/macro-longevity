# Calm Wellness design system

Approved direction: warm ivory, forest-green actions, readable typography, calm surfaces.
Updated: 2026-09-19.

## Architecture

Dependency-free multi-page HTML/CSS and native ES modules. Keep the five destinations:
Home, Nutrition, Health, Training, Finance. Nutrition context links are Daily plan,
Ingredient guide, Deep library; Health context links are Blood tests and Blueprint.

Shared tokens: css/variables.css. Shared component layer: css/wellness.css.
Existing specialized styling is isolated in a lower-priority legacy cascade layer.
css/style.css contains shared legacy rules; each route loads its own named
*-layout.css file. Nutrition detail rules live in css/nutrition.css.
These are explicit authored route boundaries, not runtime CSS-coverage extracts.
Do not load CSS on clicks or only for the initial viewport.

Shared layout primitives are `ui-tabs` / `ui-tab`, `ui-panel`,
`ui-section-head`, `ui-empty-state`, `ui-actions`, and the rendering helpers in
`js/components/ui.js`. A route must not borrow a component's base layout from
another route stylesheet. Route styles may refine content-specific presentation,
but shared padding, focus, empty-state, and tab behavior stays in the common layer.

Keep local Inter and JetBrains Mono assets, service-worker caching, exports, and
the current local-storage keys. Never add new medical or financial claims through styling.

## Tokens and layout

- Canvas #F7F8F3; white main surfaces; sage #EDF3EC secondary surfaces.
- Text #18251F; secondary text #526158.
- Primary #246B4B; hover #1B5239; white primary-action labels.
- Decorative border #D4DDD3; input border #7B897F.
- Attention #8A5600; danger #A33434. Always pair status colors with text.
- Local Inter: body 16/24px, secondary 14/21px, metadata >=12px.
- Page headings 32px desktop / 28px mobile; section 24px / 22px; card 18px.
- Radius: cards 16px, controls 10px, dialogs 20px.
- 4px/8px spacing rhythm. 1280px max content width.
- Gutters: 32px desktop, 24px tablet, 16px mobile.
- Card padding: 24px desktop, 16px mobile. Grid gaps: 24px / 16px.
- Equal card heights within a row, intrinsic heights across rows.
- No blueprint overlay, pointer spotlight, clipped fixed-height text, or
  hover-driven geometry changes.

## Navigation and interaction

Desktop begins at 1100px. Primary navigation remains visible in a sticky,
opaque header. Smaller screens use the five-destination bottom navigation,
with safe-area padding and reserved document space.

Active navigation/tabs use one 2px underline. Content links remain underlined.
Context navigation and long-page layout wrappers are in initial HTML.
Section rails remain optional content navigation, never an additional primary shell.
Nutrition has no redundant side rail.

44px touch targets where practical; visible 3px focus outline.
Native links preserve browser history and modifier-click behavior.
Motion is restrained to short color/opacity transitions; reduced motion disables it.
Do not make navigation wait for animation.

## Nutrition

The daily macro strip displays protein, carbs, fats, and fiber horizontally; the
coverage dialog uses two columns on mobile to keep values legible.
Numeric grams, references, progress and text status are primary.
Gaps, All nutrients, and Settings are secondary actions.

A sentinel pins the same element beneath the measured header. Its original slot
reserves its height. It is independent of short planner/grid containers and stays
available at the footer. ResizeObserver maintains dimensions; IntersectionObserver
controls pinning. A compact mode handles short viewports. There must never be two
interactive copies or a hide-at-footer behavior.

Details use native dialogs: one open dialog at a time, visible close control,
one scrolling body, Escape and focus restoration. Coverage gaps support drill-down
and Back within the same dialog. Saved-meal editing guards unsaved drafts with
an in-dialog discard decision.

Meal editing combines name, ingredient search, ingredient amounts, and macro preview.
Saving a selected meal updates the recipe and its current-plan amounts; saving an
unselected recipe does not select it. Food quantities use 1–2000 whole grams;
supplements retain serving units. Quick add exposes quantity controls directly.
Blank/invalid draft input does not mutate the last valid total. Clear resets only
today's selection, not the saved meal library.

Deep library is a Nutrition context destination, not a Meals/Quick add tab.
It has no persistent coverage surface. Direct links and browser history must work.

## Nutrition data

Reference nutrient amount × selected grams ÷ reference serving grams.
The pure calculateNutrients function sums occurrences without display rounding.
Measured zero and missing values are distinct. Do not invent micronutrient data.
Coverage rows identify incomplete food data; macro amounts remain numeric.

Existing reference sources and approximate 80% nutrient-coverage counts are preserved and
explained. The primary protein progress bar reaches its goal at 100% of the protein floor;
exceeding that floor is not treated as exceeding an upper limit. Exceeding an intake reference is not automatically a medical upper-limit warning.
Saved recipe records may include ingredientGrams and ingredientServings maps.
Older records use their existing reference portions and conversion rules.

## Performance

Load only shared essentials and the current route's code/styles. Optional Deep library
data may load on demand. Essential control styling must be ready before interaction.
Reserve loading space and avoid late structural wrapping.
Keep ordinary navigation responsive without artificial timers or cosmetic loaders.

tests/performance.spec.js measures three cold runs under 4x CPU, 150ms latency and
200,000 bytes/s download. It waits for real, wired planner controls, observes shifts
through settlement, and measures visible tab interactions through animation frames.

Median budgets: LCP <=2500ms; usable controls <=3000ms; CLS <=0.1; Nutrition decoded
CSS <=190KB and JS <=160KB; cumulative initial long tasks <=200ms.
Painted loaded interactions must be <200ms.
These are laboratory measurements, not field INP or production-user guarantees.

## Verification

- node --check on changed modules, make audit, git diff --check.
- npm run test:ui and npm run test:perf.
- npm run test:ui:headed for visual/timing diagnostics.
- Review screenshot changes before npm run test:visual:update.
- Headed and headless checks use the same Chromium binary with real scrollbars;
  keep those settings aligned rather than widening screenshot tolerances.
- 390×844 and 1440×900 full checks; 320, 768 and 1024px resize/overflow checks.
- Short viewport, reduced motion, keyboard, modal close hit-testing and focus.
- Coverage geometry at top, 25%, 50%, 75%, and maximum scroll.
- Meal edit/save/cancel/reload, Quick add grams, history, Clear, and offline upgrade.
- Firefox/WebKit smoke tests when engines are available; report unavailable engines.
- No serious/critical axe violations; manual checks supplement automation.

Old sidebar/spotlight/blue-grid visual contracts are intentionally superseded.
Their replacement coverage is in tests/wellness.spec.js and updated design/interaction
specs. Never satisfy readiness through hidden controls or loosen budgets to obtain a pass.
