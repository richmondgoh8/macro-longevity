# Stitch design brief — Macro Longevity
Updated 2026-11-03. The connector currently returns `Authentication required`;
no screen generated in this pass should be implied by this brief. The user has
authorized native HTML/CSS implementation as the fallback, so this brief is an
optional future reference, not a blocker or a requirement to reconnect.

## Current product contract

A calm, local-first Singapore wellness PWA with exactly five primary destinations:
Home, Nutrition, Health, Training, Finance. Preserve the working implementation
and latest user decisions. No framework, backend, account, or icon runtime.

- Home starts with evidence-linked, benefit-first health priorities, then keeps its
  seven-group reference guide, 39 cards, visible action plans, group plans, and
  testing schedule. Do not add a numerical ROI score, promotional hero, record-results
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

Warm ivory #FDFBF7, white cards, sage secondary surfaces, teal #0F766E,
slate #1E293B, muted text #526158. Flat teal, yellow, lilac, blue and coral icon tiles.
Self-hosted Inter, restrained borders, rounded surfaces, and 4px/8px spacing.
No gradients, glass effects, stock-photo heroes, or attribution-required assets.

Verify at 390px and 1440px, with 320px, landscape, and 200% text-size stress checks.
Keep aligned two-column desktop cards and one-column mobile cards. Avoid clipped
fixed-height content and persistent controls covering text or keyboard focus.
Use native semantics, visible focus, reduced-motion support, clear labels and
44px touch targets where practical. No diagnosis claims or invented target ranges;
factual content must come from the existing data files.

## First screen prompt after reconnecting

> Refine the existing MacroLongevity Home as a polished mobile PWA.
> Preserve the five tabs Home, Nutrition, Health, Training, Finance, with Home active.
> Use a warm ivory canvas, white rounded cards, teal controls, restrained sage
> borders and local Inter typography. Lead with high-return health fundamentals,
> a source-linked weekly activity guide, clear actions and a short benefit for each.
> Do not invent effect sizes or rank actions with a numeric ROI score. Follow with
> the Singapore/Alternative unit controls, compact section picker, biomarker search
> and reference cards with visible action plans. Include Copy link and previous/next
> section navigation. Keep Health focused on high-value screening and result context.
> No extra tabs, external fonts, hidden action plans or account flow. Produce a
> mobile composition first, then a corresponding wide-desktop composition with a
> persistent contents sidebar. Prioritize legibility and accessible controls.

The built-in image-generated review concept and its exact prompt are saved under
`docs/design/`. It is not an implemented screenshot or a source of medical facts.
