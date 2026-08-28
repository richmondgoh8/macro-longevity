# Macro Longevity

A local-first wellness reference and planning toolkit for nutrition, health, training, and personal finance. The deployed application uses semantic HTML, shared CSS, and browser-native ES modules—no framework, backend, runtime packages, or build step.

> This project is educational. It does not replace individualized medical, nutritional, or financial advice.

## Features

- A reusable-meal Daily Plan with portion controls and nutrient-gap estimates
- A searchable, five-screen Ingredient guide
- Blood-test references and an evidence-tiered healthspan Blueprint
- A minimal-equipment training plan with timers and sound cues
- FIRE and passive-income planning tools
- Browser-local saved plans, meals, and finance entries with Markdown export
- Installable/offline support through a web app manifest and service worker

## Run locally

The application itself only needs a local HTTP server:

```sh
make serve
```

Then open <http://localhost:8080>. Alternatively, run `python3 -m http.server 8080` from the repository root.

Opening HTML files directly with a `file://` URL is not supported because the app uses ES modules and a service worker.

## Routes

The primary shell always contains Home, Nutrition, Health, Training, and Finance. Nutrition and Health each contain two contextual pages.

| Area | Route | Purpose |
|------|-------|---------|
| Home | `/` | Four-pillar overview and protocol preview |
| Nutrition | `/pages/stack.html` | Daily Plan, nutrient coverage, supplements, and recovery |
| Nutrition | `/pages/avoid.html` | Five-screen Ingredient guide with search and filters |
| Health | `/pages/blood.html` | Blood-test tiers, ranges, and follow-up context |
| Health | `/pages/protocol.html` | Evidence-based healthspan Blueprint |
| Training | `/pages/workout.html` | Exercise plan, timers, and cues |
| Finance | `/pages/finance.html` | Investment examples, FIRE calculator, and passive-income tracker |

## Development

Node.js 22 is used by CI for audits and browser tests; it is not shipped to users. Install the development tools with:

```sh
npm ci
npx playwright install chromium
```

| Command | Purpose |
|---------|---------|
| `make serve` | Serve the site at `http://localhost:8080` |
| `make audit` or `npm run audit` | Check metadata, navigation wiring, safety guards, service-worker assets, and JavaScript syntax |
| `npm run test:ui` | Run desktop and mobile browser, accessibility, interaction, service-worker, and visual tests |
| `npm run test:ui:headed` | Run the browser suite interactively for diagnosis |
| `npm run test:visual` | Run screenshot comparisons only |
| `npm run test:visual:update` | Intentionally replace reviewed screenshot baselines |
| `npm run test:perf` | Run throttled loading and interaction budgets |

Run `node --check <file>` for every changed JavaScript module. For a normal UI change, the handoff baseline is `make audit` followed by `npm run test:ui`; add `npm run test:perf` when loading or interaction cost may change.

## Architecture

```text
index.html, pages/*.html    Semantic route shells
css/variables.css          Executable Warm Canvas design tokens
css/style.css              Shared and route-level presentation
css/toast.css              Toast presentation
css/tooltip.css            Tooltip presentation
js/data/*.js               Factual content and planning data
js/components/*.js         Shared UI behavior and primitives
js/site.js                 Navigation, shared initialization, and lazy export
js/export.js               Local Markdown export
js/<route>.js              Route-owned rendering and interactions
tests/*.spec.js            Browser, accessibility, visual, and performance checks
sw.js, manifest.json       Offline and installable-app support
```

Page-specific modules are loaded only by the routes that use them. Shared behavior belongs in `js/site.js`, `js/export.js`, or `js/components/`; factual wellness and finance content remains in `js/data/`.

## Data and privacy

There is no backend or account system. Planner state and finance entries are stored in the browser with `localStorage`; clearing site data removes them. The export action creates a Markdown file locally. The application does not include analytics, external fonts, or CDN-hosted runtime assets.

## Design system

[DESIGN.md](DESIGN.md) defines the Warm Canvas visual contract and component recipes. [css/variables.css](css/variables.css) is its executable token implementation, while [css/style.css](css/style.css) contains shared and route-level rules.

The interface uses self-hosted Inter and JetBrains Mono fonts, a 4px base with an 8px primary spacing rhythm, warm light surfaces, visible focus states, and local SVG icons. Responsive acceptance widths are 390px and 1440px, with reduced-motion, forced-colors, print, keyboard, and 44px touch-target behavior covered by browser tests.

When changing an authored design value, update both `DESIGN.md` and `css/variables.css`. Update visual baselines only after reviewing the rendered differences.

## Deployment

Deploy the repository root to any static host with no build command and `.` as the output directory. `_headers` contains the production security headers used by compatible hosts. Offline installation requires HTTPS in production; localhost is allowed during development.

## License

[MIT](LICENSE) © 2026 Richmond Goh.
