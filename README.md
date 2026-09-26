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

Then open <http://127.0.0.1:8080>. Alternatively, run `python3 -m http.server 8080 --bind 127.0.0.1` from the repository root. If port 8080 is already in use, stop that server or choose another port; `make serve` will not terminate it.

Opening HTML files directly with a `file://` URL is not supported because the app uses ES modules and a service worker.

## Routes

The primary shell always contains Home, Nutrition, Health, Training, and Finance. Nutrition offers Daily plan, Ingredient guide, and an in-page Deep library; Health offers Blood tests and Blueprint.

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
| `make serve` | Serve the site at `http://127.0.0.1:8080` without stopping another process |
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
css/variables.css          Warm Canvas design tokens
css/style.css              Shared legacy presentation
css/wellness.css           Shared components and current visual layer
css/*-layout.css           Route-specific presentation
css/nutrition.css          Nutrition dialog and coverage details
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

There is no backend or account system. Planner state and finance entries are stored in the browser with `localStorage`; clearing site data removes them. The export action creates a Markdown file locally. The application does not include analytics or external fonts. Training music and sound cues are fetched from Freesound when a timer starts; those optional sounds require a connection and share the request with that provider. Timers remain usable without audio.

## Design system

[DESIGN.md](DESIGN.md) defines the Calm Wellness visual contract. [css/variables.css](css/variables.css) implements its Warm Canvas tokens, [css/wellness.css](css/wellness.css) holds shared components, and the route stylesheets refine individual pages.

The interface uses self-hosted Inter and JetBrains Mono fonts, a 4px base with an 8px primary spacing rhythm, warm light surfaces, visible focus states, and local SVG icons. Responsive acceptance widths are 390px and 1440px, with reduced-motion, forced-colors, print, keyboard, and 44px touch-target behavior covered by browser tests.

When changing an authored design value, update both `DESIGN.md` and `css/variables.css`. Update visual baselines only after reviewing the rendered differences.

## Deployment

There is no build step. On static hosts other than Cloudflare, configure the published files so repository metadata, tests, and development dependencies are excluded. For Cloudflare Workers, install the development dependencies with `npm ci`, then deploy with `npx wrangler deploy` after authenticating. [wrangler.jsonc](wrangler.jsonc) serves the root static site and [.assetsignore](.assetsignore) keeps development dependencies, tests, and repository metadata out of the Workers asset upload. `_headers` contains the production security headers used by compatible hosts. Offline installation requires HTTPS in production; localhost is allowed during development. Training's optional remote audio is not available offline.

## License

[MIT](LICENSE) © 2026 Richmond Goh.
