# GENUI.md — Macro Longevity Design System v3.0

Protocol-first, evidence-graded, clinical-biotech aesthetic. Supersedes DESIGN.md and the
prior GENUI notes for this app. This file is the single source of truth for visual design.

## Principles
1. **Evidence over hype.** Every claim carries a visible evidence tier. Mechanism excitement never outranks human outcomes.
2. **Token-driven, zero-dependency.** All color/type/space is a CSS variable in `css/variables.css`. Never hardcode values in `style.css`.
3. **Self-hosted, no external fetch.** Fonts are self-hosted woff2 (DM Sans / Inter / JetBrains Mono). No Google Fonts, no CDNs.
4. **Dark mode is first-class.** Every surface/text/border token has a dark value; toggle via `[data-theme]` on `<html>`, defaults to `prefers-color-scheme`.
5. **Icons are vector, not emoji.** Structural/nav/system icons use `js/icons.js` (inline SVG, 24px, 2px stroke). Emoji only as food-content decoration.
6. **Motion is subordinate.** Honors `prefers-reduced-motion`. Micro-interactions 150–300ms.

## Evidence taxonomy (5 tiers)
Mirrors the *Longevity OS* report. Applied site-wide via `.evidence-badge`.

| Tier | Token | Meaning |
|------|-------|---------|
| CORE | `--evidence-core` | Strong human evidence + high practical value. Prioritize. |
| CONDITIONAL | `--evidence-conditional` | Good value for specific people/deficiencies/risk. |
| OPTIONAL | `--evidence-optional` | Reasonable incremental benefit, not foundational. |
| EXPERIMENTAL | `--evidence-experimental` | Interesting science, no proven longevity outcome. |
| SKIP | `--evidence-skip` | Weak evidence / poor economics / unfavorable trade-off. |

v2 aliases (`--evidence-strong/moderate/weak`) are retained for backward compatibility.

## 4 Pillars (site spine)
| Pillar | Token | Scope |
|--------|-------|-------|
| 1 Prevent Disease | `--pillar-1` (rose) | CVD, cancer, diabetes, dementia, CKD, infection, frailty |
| 2 Slow Biological Aging | `--pillar-2` (violet) | 12 Hallmarks, mitochondria, autophagy, senescence, inflammation |
| 3 Build & Preserve Reserve | `--pillar-3` (amber) | VO₂max, muscle, strength, power, bone, balance, cognition |
| 4 Optimize Fundamentals | `--pillar-4` (teal) | Exercise, diet, sleep, body composition, BP/lipids/glucose, environment |

## Typography
- Display: DM Sans. Body: Inter. Data/mono: JetBrains Mono.
- Fluid scale `--text-sm` → `--text-xl` (clamp). Display weight 700–900 for hero.

## Color
- Primary deep teal `#0F766E`; accent health-green `#059669`; conditional amber `#D97706`.
- Dark mode flips to bright teal `#2DD4BF` / green `#34D399` on near-black `#0B0F14`.

## Spacing / radius / shadow
- 8px grid (`--space-2` … `--space-20`). Radius sm=6 / md=10 / lg=16 / xl=24.
- Layered shadows (`--shadow-sm` … `--shadow-xl`), softened in dark mode.

## Components (see `css/style.css`)
- `.evidence-badge` — 5-tier pill with SVG glyph.
- `.pillar-card` — pillar entry with accent rail + icon.
- `.hero`, `.nav`, `.bottom-nav`, `.card`, `.btn`, `.table`, `.callout` (decision rule / one-sentence model).
- Theme toggle button (`[data-theme-toggle]`) persisted in `localStorage`.

## Accessibility
- Body text contrast >= 4.5:1, secondary >= 3:1 in both themes.
- Touch targets >= 44px; visible focus rings; `prefers-reduced-motion` disables non-essential animation.
- Color is never the only signal — pair with icon/label.

## CSP
`default-src 'self'`. Script/style inline allowed. Connect to `cdn.freesound.org` for workout audio only.
