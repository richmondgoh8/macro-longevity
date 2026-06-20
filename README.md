# macro-longevity

An open-source Go web application that guides users toward optimal biomarker levels
for longevity through evidence-based nutrition, cooking protocols, and supplement
stacking — with a budget-first philosophy.

**Live site:** planned for Render.com

---

## Quick start

```sh
make run     # or: go run ./cmd/web
```

Open http://localhost:8080

## Build binary

```sh
make build   # produces ./server
./server
```

## Stack

| Layer          | Technology                        |
|----------------|-----------------------------------|
| Language       | Go 1.22+                          |
| Templates      | `html/template` (embedded via `//go:embed`) |
| CSS            | Plain CSS (no framework)          |
| Assets         | Fully embedded — single binary    |

## Architecture

```
cmd/web/main.go              Entry point, router, static file serving
internal/
  handlers/pages.go          HTTP handlers (index, biomarkers, food, supplements)
  models/data.go             All content: 20 biomarkers, 14 foods, 12 supplements
  web/
    embed.go                 Go embed declarations
    templates/               5 .html files (base + 4 pages)
    static/css/style.css     Full responsive design system (~400 lines)
```

No database, no dependencies beyond stdlib. All content is compiled into the binary.
To add or edit biomarkers/foods/supplements, edit `internal/models/data.go`.

## Pages

| Route          | Content                                                   |
|----------------|-----------------------------------------------------------|
| `/`            | Landing page with hero, preview cards, stats, features    |
| `/biomarkers`  | 20 biomarkers with ranges, importance, improvement plans, budget tips |
| `/food`        | 14 foods across 5 categories with recipes, cooking instructions, cost breakdowns |
| `/supplements` | 12 supplements with dosing, timing, budget brand recommendations |

## Anatomy of a Biomarker entry

Every biomarker in `internal/models/data.go` contains:

- **Name, description, category** — what it is
- **Optimal range & optimal level** — clinical + aspirational targets
- **Importance** — why it matters for longevity (with citations/statistics)
- **How to improve** — actionable checklist (diet, exercise, lifestyle)
- **Budget tips** — cheap/free alternatives that work
- **Risk level** — `low` / `moderate` / `high` (visual badge)

## Deploy to Render

No config file required. Via the Render dashboard:

1. **Build command:** `go build -o server ./cmd/web`
2. **Start command:** `./server`
3. **Environment:** PORT is auto-injected by Render (defaults to `8080` locally)

The binary is self-contained — no static files to copy.

## Contributing

PRs that add biomarkers, foods, supplements, or improve accuracy are welcome.
Keep entries concise, evidence-grounded, and budget-conscious.

## License

MIT — Copyright (c) 2026 Richmond Goh.
