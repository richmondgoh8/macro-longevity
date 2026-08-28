# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

## 5. Project-specific architecture

This is a dependency-free, multi-page wellness utility built with semantic HTML, shared CSS, and browser-native ES modules. There is no framework, bundler, backend, or runtime package install.

- Treat the HTML, CSS, and `js/data/*.js` files as the source of truth. Keep runtime code dependency-free.
- Keep page renderers in their owning module (`js/stack.js`, `js/blood.js`, `js/protocol.js`, `js/render.js`, or the relevant page module). Put shared navigation, export, escaping, and presentation primitives in `js/site.js`, `js/export.js`, and `js/components/` instead of duplicating them.
- Load page-specific modules only on pages that use them. Do not make a route import the entire application.
- Keep factual content and claims in the existing data files. Do not invent health, lab, supplement, or financial claims while changing presentation.
- Use `make serve` (or `python3 -m http.server 8080`) for local browser work; do not introduce a build step unless the user explicitly asks for one.

## 6. UI, navigation, and responsive invariants

- Preserve the five-destination shell on every route: **Home, Nutrition, Health, Training, Finance**. Context links such as Ingredient guide, Blueprint, or Daily Stack are not new primary tabs and must not remove or replace a shell destination.
- The Ingredient guide remains a five-screen page. Search/filter states may hide matching cards, but must not remove the page, its shell, or the five-screen context.
- Reuse tokens and shared components in `css/variables.css` and `css/style.css`. Keep the warm light theme, strong text/border contrast, rounded surfaces, and the established 4px/8px spacing rhythm. Do not reintroduce grayscale-only surfaces, hairline borders that disappear at normal zoom, clipped fixed-height cards, or overlapping content.
- Use semantic headings, landmarks, buttons for actions, visible focus states, accessible names, and touch targets of at least 44px where practical. Preserve keyboard operation and reduced-motion behavior.
- Validate responsive flow at the project’s important widths (390px mobile and 1440px desktop at minimum). No route may introduce horizontal overflow or a nested scroll trap.

## 7. Performance and loading rules

- Keep critical route JavaScript and CSS lean. Defer optional work, avoid loading unrelated route modules, and do not perform repeated synchronous DOM scans or layout reads/writes in interaction handlers.
- Preserve local font assets and offline/service-worker behavior. Do not add external font, icon, analytics, or CDN dependencies to the deployed site without explicit approval.
- Reserve space for content before it renders and avoid layout shifts. Tab changes and planner interactions must remain responsive under the throttled budgets in `tests/performance.spec.js`.
- When a change affects navigation, rendering, or interaction cost, add or update a real-browser regression rather than relying only on static inspection.

## 8. Verification requirements

Before handing off a change, run the narrowest relevant checks and record anything that could not run:

- JavaScript syntax checks for every changed module (`node --check <file>`).
- `make audit` for metadata, tab wiring, service-worker assets, safety guards, and syntax.
- `npm run test:ui` for navigation, accessibility, interaction, visual, and service-worker coverage.
- `npm run test:perf` for throttled load, LCP/CLS, transfer-size, long-task, and interaction budgets when performance-sensitive code changes.
- `npm run test:ui:headed` when diagnosing visual or timing issues; only use `npm run test:visual:update` after intentionally reviewing the screenshot diff.

Tests should exercise real user flows, map each new assertion to an acceptance criterion or regression, prefer stable semantic/`data-*` selectors for new hooks, and cover both mobile and desktop behavior for layout changes.

## 9. Change boundaries

Keep changes surgical and reuse existing patterns before adding abstractions. If a change creates an unused import, listener, selector, or data field, remove that orphan; do not use the task as a reason to refactor unrelated code.
