# Macro Longevity

A local-first Singapore health screening and longevity guide with optional nutrition, training, and finance tools. The deployed application uses semantic HTML, shared CSS, and browser-native ES modules—no framework, backend, runtime packages, or build step.

> This project is educational. It does not replace individualized medical, nutritional, or financial advice.

## Features

- A reusable-meal Daily Plan with portion controls and nutrient-gap estimates
- A searchable, five-screen Ingredient guide
- A Singapore baseline workspace with 13 readily accessible markers, including hs-CRP, ApoB and Lp(a), plus 32 optional tracker fields for full lipids, insulin, liver, kidney, iron, thyroid, chemistry, blood count and vitamin D
- Grouped screening guidance with risk-based lipid targets and report-unit selection for ApoB, Lp(a) and urine ACR
- Progressive “how to move toward this level” guidance for each marker
- A lazy-loaded, searchable Blueprint reference covering all 140 published baseline measurements, 3 male additions, 1 female addition and 86 matched follow-up entries; local result, unit, reference-interval and date logging
- Concrete daily/weekly marker actions, with testing instructions and non-modifiable risks clearly separated
- A coverage regression maps every existing core-panel reference to usable tracker fields; the complete differential and specialty assays remain searchable in the 144-measurement library
- Singapore screening roadmap for cardiovascular, cervical, breast and colorectal checks
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
| `npm run test:quick` | Fast routine checks: core routes, unit choices, saved results and offline behavior |
| `npm run test:ui` | Run desktop and mobile browser, accessibility, interaction, service-worker, and visual tests |
| `npm run test:ui:headed` | Run the browser suite interactively for diagnosis |
| `npm run test:visual` | Run screenshot comparisons only |
| `npm run test:visual:update` | Intentionally replace reviewed screenshot baselines |
| `npm run test:perf` | Run throttled loading and interaction budgets |

For a small change, run `npm run audit` and `npm run test:quick`. Use `npm run test:ui` for broad changes; add `npm run test:perf` when loading or interaction cost changes. Keep changes focused; no new framework or test service is needed.

Glucose and lipid entries default to mmol/L, ApoB to g/L, Lp(a) to nmol/L, HbA1c to %, and urine ACR to mg/mmol. Alternate report units can be selected and are saved. Selection does not convert the entered number; glucose/lipid status checks account for mg/dL internally. The library suggests Singapore-style units for established quantitative tests and allows any report unit; specialty/qualitative units remain report-specific. Existing saved units are preserved.

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
js/paths.js                Domain-root and GitHub Pages project-path resolution
js/export.js               Local Markdown export
js/<route>.js              Route-owned rendering and interactions
tests/*.spec.js            Browser, accessibility, visual, and performance checks
sw.js, manifest.json       Offline and installable-app support
```

Page-specific modules are loaded only by the routes that use them. Shared behavior belongs in `js/site.js`, `js/export.js`, or `js/components/`; factual wellness and finance content remains in `js/data/`.

## Data and privacy

There is no backend or account system. Planner state and finance entries are stored in the browser with `localStorage`; clearing site data removes them. The export action creates a Markdown file locally. The application does not include analytics or external fonts. Training music and sound cues are fetched from Freesound when a timer starts; those optional sounds require a connection and share the request with that provider. Timers remain usable without audio.

Screening values use `sg-health-baseline-v1`; optional library results use `blueprint-marker-results-v1`. They are separate records, not automatically synced or included in the existing plan export. Library rows can be cleared individually. Results never leave the browser; avoid entering identifying information on shared devices. The reference list was checked against [the official published panel](https://immortals.com/pages/biomarkers) on 2026-10-27. It is not a claim about every private test Bryan Johnson has ever taken, nor a recommendation to order every listed test.

## Design system

[DESIGN.md](DESIGN.md) defines the Calm Wellness visual contract. [css/variables.css](css/variables.css) implements its Warm Canvas tokens, [css/wellness.css](css/wellness.css) holds shared components, and the route stylesheets refine individual pages.

The interface uses self-hosted Inter and JetBrains Mono fonts, a 4px base with an 8px primary spacing rhythm, warm light surfaces, visible focus states, flat-color icon tiles made from original inline SVG paths, and no third-party icon runtime. Responsive acceptance widths are 390px and 1440px, with reduced-motion, forced-colors, print, keyboard, and 44px touch-target behavior covered by browser tests.

[STITCH_DESIGN_BRIEF.md](STITCH_DESIGN_BRIEF.md) preserves the screen prompts, flat-color palette, and no-attribution asset constraints for Google Stitch handoff.

When changing an authored design value, update both `DESIGN.md` and `css/variables.css`. Update visual baselines only after reviewing the rendered differences.

## Deployment

Live site: <https://hazelah.me/macro-longevity/>. GitHub Pages inherits the account's custom domain; the `richmondgoh8.github.io/macro-longevity/` address redirects there.

Quality runs the fast suite on desktop and mobile in parallel, with npm caching, superseded-run cancellation and documentation-only skips. The full visual/performance suite runs weekly; choose `full_suite` in Quality’s manual dispatch to run it sooner. Main pushes and PRs are checked. Pages deploys only after successful Quality, checks out the tested SHA and rejects a stale revision. Browser reports are uploaded separately on failure. No privileged deployment runs PR code.

There is no build step. GitHub Pages can publish the repository root directly; `.nojekyll` keeps the static asset paths intact. Relative route resolution supports both a repository project URL such as `https://richmondgoh8.github.io/macro-longevity/` and the existing custom-domain root. Enable Pages under **Settings → Pages → GitHub Actions** and use the included workflow if your repository has Actions enabled. On static hosts other than Cloudflare, configure the published files so repository metadata, tests, and development dependencies are excluded. For Cloudflare Workers, install the development dependencies with `npm ci`, then deploy with `npx wrangler deploy` after authenticating. [wrangler.jsonc](wrangler.jsonc) serves the root static site and [.assetsignore](.assetsignore) keeps development dependencies, tests, and repository metadata out of the Workers asset upload. `_headers` contains the production security headers used by compatible hosts. Offline installation requires HTTPS in production; localhost is allowed during development. Training's optional remote audio is not available offline.

## License

[MIT](LICENSE) © 2026 Richmond Goh.
