# Macro Longevity

A local-first preventive-health app for Singapore. It works as a static website and as an installable web app on supported devices.

| Page | What you can do |
| --- | --- |
| Overview | Choose prevention habits, find urgent help, and review optional recovery practices. |
| Food | Choose lower-GI meals and prepare, store and reheat them safely. |
| Food Labels | Compare packaged foods, check allergens and recalls, and review packaging and contaminants. |
| Health | Check screening and vaccinations, record core readings and dated HbA1c results, and export data. |
| Supplements | Decide which supplements fit a specific need and check labels before buying. |
| Skin Care | Follow a simple routine, compare products, and check cosmetic safety alerts. |

Give each topic one home based on the decision the reader needs to make. Use a direct link from related pages, and keep urgent actions easy to reach on mobile and offline.

## Run and verify

Run `make run` and open `http://127.0.0.1:8081/`. For a different port, run `make run PORT=8090`. `make serve` is an alias. The deployed app uses HTML, shared CSS, and native ES modules. It requires no build step or runtime packages.

For development, use Node.js 22 or newer.

```sh
npm ci
npx playwright install chromium
make audit
npm run test:quick
npm run test:ui
npm run test:perf
```

## Data and offline use

Result values stay in this browser. Health offers a health-only JSON download for core results and dated HbA1c entries, plus a full archive that may include private records from retired features such as finance. Clearing site data removes the browser’s copy.

After the first successful online cache install, the six pages and results log work offline. When a new version is ready, **Update app** appears in the header. Select it to apply the update and reload the current page. If you’re upgrading from a version without the button, close all app tabs and reopen once. Each host keeps its own browser records. On mobile, use the browser’s install or Add to Home Screen action where supported.

## Deployment

GitHub Pages publishes the site after the quality workflow passes. Cloudflare Workers can serve the same static assets. Keep asset URLs relative and keep `reference/` local. Use primary sources linked on the pages when reviewing health content.
