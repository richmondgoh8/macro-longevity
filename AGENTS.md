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

- Keep Macro Longevity a dependency-free, multi-page Singapore preventive-health app. Use semantic HTML, shared CSS, browser-native modules, and local assets.
- Keep six destinations on each app page: **Overview, Food, Food Labels, Health, Supplements, Skin Care**. The Overview is a read-only prevention guide and Health owns the local results log.
- Keep route scripts local to the pages that use them. Reuse shared design tokens and CSS. Verify clinical guidance against primary sources and keep citations close to the content. The files in `reference/` are research inputs and stay out of deployment.
- Preserve the manifest identity, scoped service-worker installation, and root and project-path hosting. Bump the worker cache name and changed asset versions when updating the precache.
- Preserve browser records and their original units. Use Singapore report units as defaults. Unit selection labels the entered value and never performs conversion. Lp(a) has no fixed mass-to-molar conversion.
- Maintain keyboard navigation, visible focus, strong contrast, and practical 44px touch targets. Verify at 390px and 1440px with no horizontal overflow or nested scroll traps.
- Use `make run` or `make serve` for local browser work. Run `node --check` on changed modules, `make audit`, and the narrowest relevant browser checks. Run `npm run test:quick` for routine work, `npm run test:ui` for broad UI changes, and `npm run test:perf` for performance-sensitive changes.
