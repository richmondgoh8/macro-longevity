# Stitch design brief — Macro Longevity
Updated 2026-11-01. The connector currently returns `Authentication required`;
no screen generated in this pass should be implied by this brief. The user has
authorized native HTML/CSS implementation as the fallback, so this brief is an
optional future reference, not a blocker or a requirement to reconnect.

## Current product contract

A calm, local-first Singapore wellness PWA with exactly five primary destinations:
Home, Nutrition, Health, Training, Finance. Preserve the working implementation
and latest user decisions. No framework, backend, account, or icon runtime.

- Home is a reference guide, not a results-entry dashboard. Keep its seven groups,
  39 cards, labelled ranges or clinical context, visible action plans, group plans,
  and testing schedule. Do not bring back the promotional hero, the record-results
  CTA, export controls, or duplicate destination cards.
- The seven groups are Metabolic, Inflammation, Cardiovascular, Liver & kidneys,
  Micronutrients, Cancer screening, and Fitness & body.
- Use a sticky contents rail on sufficiently wide desktop screens. On mobile,
  use a compact section picker with the active group and a Top link, separate
  from the five-tab bottom navigation.
- Search marker names and aliases; choosing a result jumps to its card without
  hiding the other cards. Preserve copyable card links, previous/next section
  links, browser Back behavior, and ordinary document scrolling.
- Health owns personal result entry. Existing unit choices must never silently
  convert saved values. Home keeps ranges and action plans visible together.
- Nutrition prioritizes a usable daily meal plan and coverage; Training prioritizes
  the current activity and timer; Finance keeps its calculator and tracker distinct.
  Advanced details may be disclosed progressively, without hiding primary actions.

## Visual and interaction system

Warm ivory #F7F8F3, white cards, sage secondary surfaces, forest green #246B4B,
ink #18251F, muted text #526158. Flat teal, yellow, lilac, blue and coral icon tiles.
Self-hosted Inter, restrained borders, rounded surfaces, and 4px/8px spacing.
No gradients, glass effects, stock-photo heroes, or attribution-required assets.

Verify at 390px and 1440px, with 320px, landscape, and 200% text-size stress checks.
Keep aligned two-column desktop cards and one-column mobile cards. Avoid clipped
fixed-height content and persistent controls covering text or keyboard focus.
Use native semantics, visible focus, reduced-motion support, clear labels and
44px touch targets where practical. No diagnosis claims or invented target ranges;
factual content must come from the existing data files.

## First screen prompt after reconnecting

> Refine the existing MacroLongevity Home reference guide as a polished mobile PWA.
> Preserve the five tabs Home, Nutrition, Health, Training, Finance, with Home active.
> Use a warm ivory canvas, white rounded cards, forest-green controls, restrained
> sage borders and Inter typography. Show the title Health reference & action plans,
> a brief subtitle, Singapore/Alternative unit controls, a compact current-section
> picker, biomarker search, and a readable reference card with its action plan
> visible below the ranges. Use existing content placeholders rather than inventing
> medical numbers. Include Copy link and previous/next section navigation.
> No recording CTA, promotional hero, extra tabs, decorative charts, hidden action
> plans, account flow or gamified score. Produce a mobile composition first, then
> a corresponding wide-desktop composition with a persistent contents sidebar.
> Prioritize legibility, minimal clutter, strong hierarchy and accessible controls.

The built-in image-generated review concept and its exact prompt are saved under
`docs/design/`. It is not an implemented screenshot or a source of medical facts.
