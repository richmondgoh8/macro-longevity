---
name: "Warm Canvas"
description: "Approachable minimalism on warm white. Compressed Inter at -2.125px, whisper borders, multi-layer 4-stack shadows, and a single saturated blue accent."
version: "1.1"
status: active
last_reviewed: "2026-08-28"
tags: [minimal, warm, productivity, saas]
colors:
  primary:   "#0075de"
  secondary: "#615d59"
  tertiary:  "#31302e"
  neutral:   "#ffffff"
  surface:   "#ffffff"
  canvas:    "#f6f5f4"
  muted:     "#787673"
  accent:    "#2a9d99"
  success:   "#1aae39"
  warning:   "#dd5b00"
  danger:    "#a62f36"
  decorative: "#ff64c8"
  focus:     "#097fe8"
typography:
  display: Inter
  body:    Inter
  mono:    "JetBrains Mono"
  scale:
    hero: "4rem / 1 / 700 / -2.125px"
    h1:   "3rem / 1 / 700 / -1.5px"
    h2:   "1.625rem / 1.23 / 700 / -0.625px"
    body: "1rem / 1.5 / 400 / 0"
radius:
  sm: 4px
  md: 8px
  lg: 12px
  featured: 16px
  pill: 9999px
spacing:
  unit: 4px
  rhythm: 8px
  section_min: 64px
  section_max: 120px
shadows:
  card:   "rgba(0,0,0,0.04) 0 4px 18px, rgba(0,0,0,0.027) 0 2.025px 7.85px, rgba(0,0,0,0.02) 0 0.8px 2.93px, rgba(0,0,0,0.01) 0 0.175px 1.04px"
  button: "rgba(0,117,222,0.15) 0 4px 12px"
borders:
  card:    "1px solid rgba(0,0,0,0.1)"
  divider: rgba(0,0,0,0.1)
textures:
  blueprint_grid:
    line_color: "color-mix(in srgb, #615d59 6%, transparent)"
    cell_size: 32px
    stroke_width: 1px
    mask: radial
    scope: site-wide-overlay
    motion: static
modals:
  max_width: 520px
  viewport_gutter: 16px
  surface: "#ffffff"
  scrim: "color-mix(in srgb, #31302e 42%, transparent)"
  backdrop_blur: 4px
  radius: 12px
  shadow: shadow.xl
  entry_motion: "240ms opacity + scale(.98 → 1)"
  exit_motion: "120ms opacity + scale(1 → .98)"
  dismissal: intent-aware
split_screen_hero:
  ratio: "1fr / 1fr"
  collapse_below: 1024px
  content_order: first
  visual_surface: tertiary
  visual: linked-protocol-blueprint
  mobile_visual: compact-visible
spotlight_cards:
  surface: tertiary
  border: "rgba(255,255,255,0.10)"
  glow_color: accent
  glow_radius: 220px
  glow_opacity: 0.35
  pointer: fine-only
  max_per_section: 4
  reduced_motion: static
segmented_controls:
  max_segments: 5
  track: "color-mix(in srgb, #615d59 12%, transparent)"
  selected_surface: "#ffffff"
  selected_shadow: shadow.card
  radius: 9999px
  option_min_height: 44px
  motion: "240ms transform"
sticky_pin:
  routes: [nutrition, ingredients, health, blueprint, training, finance]
  breakpoint: 1024px
  rail_width: 12rem
  top_offset: 80px
  gap: 32px
  surface: "#ffffff"
  border: "1px solid rgba(0,0,0,0.1)"
  radius: 12px
  shadow: shadow.card
  active_indicator: primary
  item_min_height: 44px
  mobile: wrapped-static
  motion: "IntersectionObserver state updates"
toast_notifications:
  position: top-right
  desktop_offset: 88px
  mobile_offset: 72px
  desktop_inset: 20px
  mobile_inset: 16px
  max_width: 360px
  max_visible: 3
  stack_gap: 8px
  surface: "#ffffff"
  border: "1px solid rgba(0,0,0,0.1)"
  accent_edge: 4px
  radius: 12px
  shadow: shadow.xl
  success_info_warning_duration: 4500ms
  action_duration: 9000ms
  error_persistence: until-dismissed-or-actioned
  entry_motion: "240ms opacity + translateY(-6px → 0)"
  exit_motion: "120ms opacity + translateY(0 → -6px)"
  reduced_motion: static
tooltips:
  scope: icon-only-controls
  trigger: hover-or-focus
  hover_delay: 300ms
  focus_delay: 0ms
  surface: tertiary
  text: neutral
  max_width: 180px
  gap: 8px
  radius: 4px
  placement: top-with-bottom-fallback
  mobile: no-hover
  dismissal: blur-pointer-leave-or-escape
  reduced_motion: static
buttons:
  primary:
    background: #0075de
    color: #FFFFFF
    border: none
    shape: rounded
    padding: 8px 16px
    font: 500 / 0.875rem
  secondary:
    background: #F7F6F3
    color: #2F2F2F
    border: 1px solid #E9E5DC
    shape: rounded
    padding: 8px 16px
    font: 500 / 0.875rem
  outline:
    background: transparent
    color: #2F2F2F
    border: 1px solid #2F2F2F
    shape: rounded
    padding: 8px 16px
    font: 500 / 0.875rem
  ghost:
    background: transparent
    color: #787673
    border: none
    shape: rounded
    padding: 8px 12px
    font: 500 / 0.875rem
charts:
  variant: stepped
  stroke_width: 2
  fill_opacity: 0.12
  gridlines: true
  bar_gap: 0px
  highlight: single
  dot_marker: false
fonts_url: null
fonts_local: ["/fonts/inter-latin.woff2", "/fonts/jetbrains-mono-latin.woff2"]
icons: "Lucide-style local SVG subset"
dependencies: []
---

# Warm Canvas

Warm Canvas is the authored design contract for Macro Longevity. Its executable token implementation lives in [`css/variables.css`](css/variables.css); shared and route-level presentation lives in [`css/style.css`](css/style.css), with focused stylesheets for components where noted in the repository README.

## Document contract

- Author raw values and component recipes here, then map them to named CSS variables in `css/variables.css`.
- Keep this document and the CSS implementation synchronized in the same change. Neither should silently override the other.
- Prefer the existing primitive → semantic → component token flow. Derived values may use existing tokens with `color-mix()` or `calc()`.
- Put route content and factual claims in `js/data/`, not in this design specification.
- Validate implementation with `npm run audit`, the design checks in `tests/design.spec.js`, and reviewed visual baselines.

The sections below serve two audiences: **AI Build Instructions** are the implementation checklist; **Atmosphere through Pro tokens** are the human-readable visual reference.

## AI Build Instructions

> **Read this section before writing any code.** The rules below
> are non-negotiable. Every value used in the UI must come from this
> file's frontmatter and its mapped CSS variables — never substitute,
> approximate, or invent new colors, fonts, radii, or shadows. If an
> authored value is missing, add it deliberately to the contract and
> implementation together.

### 1 · Your role

You are building UI for a project that has adopted **Warm Canvas** as its
design system. Treat `DESIGN.md` as the single source of truth.
Your job is to translate the user's product requirements into
components and pages that look like they were designed by the same
person who authored this file.

### 2 · Token compliance

- Pull every color, font family, radius, shadow, and spacing value
  from the frontmatter at the top of this file and map it through
  `css/variables.css`.
- Use semantic roles (e.g. `primary`, `accent`, `muted`) — never
  hard-code hex values that bypass the system.
- When a token can be expressed as a CSS variable, declare it once
  in your global stylesheet and reference it everywhere downstream.
- Build component tokens from semantic roles; derive opacity and
  geometry with existing tokens rather than duplicating raw values.
- Use the local font assets listed in frontmatter; do not add external
  font or icon requests to this dependency-free site.

### 3 · Component recipes

Use these recipes verbatim when building the corresponding component.

#### Buttons

Four variants are defined. Pick one — never blend variants or invent a fifth.

- **Primary** — rounded shape, bg `#0075de`, text `#FFFFFF`, padding `8px 16px`, weight `500`.
- **Secondary** — rounded shape, bg `#F7F6F3`, text `#2F2F2F`, border `1px solid #E9E5DC`, padding `8px 16px`, weight `500`.
- **Outline** — rounded shape, text `#2F2F2F`, border `1px solid #2F2F2F`, padding `8px 16px`, weight `500`.
- **Ghost** — rounded shape, text `#787673`, padding `8px 12px`, weight `500`.

Reach for **primary** as the single dominant CTA per screen.
**Secondary** for the supporting action. **Outline** for tertiary
actions in toolbars. **Ghost** for inline links and table actions.

#### Cards

- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.1)`
- Shadow: `rgba(0,0,0,0.04) 0 4px 18px, rgba(0,0,0,0.027) 0 2.025px 7.85px, rgba(0,0,0,0.02) 0 0.8px 2.93px, rgba(0,0,0,0.01) 0 0.175px 1.04px`
- Radius: `radius.lg` (`12px`)
- Internal padding: `20px` for compact cards, `24–28px` for content cards.

#### Charts

- Bar/line variant: `stepped`
- Highlight strategy: `single` — emphasize a single bar/point per chart.

#### Blueprint grid

- Render two static `1px` linear gradients at `32px` intervals.
- Derive the line from `secondary` at `6%` opacity and fade it toward viewport edges with a radial mask.
- Apply it as a pointer-transparent site-wide overlay, including cards and controls.
- Keep browser top-layer dialogs above the texture and remove it in print, forced-colors and increased-contrast modes.

#### Modal dialogs

- Use a centered native `<dialog>` with a maximum width of `520px`, `16px` viewport gutters, and a maximum height of `calc(100dvh - 32px)`.
- Dim and softly blur the page with the existing warm-dark token; keep the dialog surface white with the established border, `12px` radius, and XL shadow.
- Keep a clear title, supporting copy, top-right Close control, and right-aligned actions. Destructive actions use danger red; constructive actions use brand blue.
- Trap focus with `showModal()`, focus the least-destructive action or first field, support Escape, and restore focus to the trigger after close.
- Allow backdrop dismissal for non-destructive dialogs only. Destructive confirmations require an explicit Cancel/Close action or Escape.
- Use `240ms` entry and `120ms` exit fade/scale motion; remove scaling and shorten transitions for reduced-motion users.

#### Toast notifications

- Mount one global top-right notification region outside page content. Keep the desktop offset below the primary navigation and use the compact mobile offset below the header.
- Use a white `12px` surface with the card border and XL shadow. Identify success, info, warning and error states with a local icon, message semantics and a narrow `4px` semantic accent edge; do not flood the toast with a tinted background.
- Show at most three notifications at once, newest first, and queue additional notifications for promotion as visible items close.
- Auto-dismiss success, info and warning messages after `4500ms`; give action toasts `9000ms`; keep errors visible until the user dismisses or completes the action. Pause timers while a toast or one of its controls is hovered or focused.
- Provide a 44px Dismiss control and optional action control. Use polite status semantics for routine updates and alert semantics for errors without stealing focus from the page.
- Prefer native `popover="manual"` with an explicit hide control, and keep a fixed-position fallback for browsers without Popover support. Remove transitions for reduced-motion users and hide the region in print.

#### Tooltips

- Use tooltips only as supplemental labels for icon-only controls; keep the control's visible or `aria-label` name complete without the tooltip.
- Reveal after a `300ms` fine-pointer hover delay and immediately on keyboard focus. Cancel pending reveals on pointer leave and dismiss on blur, pointer leave or Escape without moving focus.
- Keep one non-interactive `role="tooltip"` label per trigger, connect it with temporary `aria-describedby`, and never place actions or essential instructions inside it.
- Prefer a compact tertiary surface with neutral text, a `4px` radius and an `8px` gap. Place above the trigger by default, flipping below and aligning to the viewport when needed.
- Disable hover-triggered behavior for coarse pointers; keep touch controls directly tappable. Remove motion for reduced-motion users and hide tooltips in print and forced-colors-safe styling.

#### Split-screen hero

- Divide the desktop hero into equal content and visual halves at the `1024px` breakpoint.
- Keep the content half first in source order, top-align the headline, and anchor the primary and secondary CTAs inside it.
- Use the existing tertiary surface for a linked four-pillar protocol blueprint; labels and destinations come from the `PILLARS` data source.
- Stack content before the compact blueprint below the breakpoint, keeping every pillar link visible and keyboard accessible.
- Do not use stock imagery, generic gradients, or a visual half that has no meaningful content.

#### Spotlight cards

- Apply the treatment only to dark tertiary cards, with no more than four spotlights in one section.
- Keep a `1px` white hairline border and a soft accent-colored radial glow centered on the pointer.
- Treat the glow as progressive enhancement: card content stays fully legible and keyboard-reachable without it.
- Enable pointer tracking only for fine pointers; hide the overlay for coarse pointers and forced colors.
- Remove transition interpolation for reduced-motion users and keep the overlay pointer-transparent.

#### Segmented controls

- Use a connected pill-shaped group for two to five mutually exclusive options.
- Keep the track warm-neutral and elevate exactly one selected option on a white surface with the card shadow.
- Give options equal widths, short labels (one to two words), and a minimum 44px touch target.
- Implement the group with a labelled `role="group"` and native buttons using `aria-pressed`; do not use segmented controls for multi-select or long labels.
- Preserve ArrowLeft/ArrowRight/Home/End keyboard navigation and move a tokenized active indicator with the `240ms` fast motion token. Disable interpolation for reduced-motion users.

#### Sticky pin rails

- Use one `position: sticky` “On this page” rail on long routes at the `1024px` breakpoint, offset below the primary navigation by `80px`.
- Keep the rail at `12rem` wide with a `32px` gap, Warm Canvas card surface, card border, `12px` radius and card shadow.
- Use anchors for document sections and native buttons for tab-controlled views; expose active anchors with `aria-current="location"` and controls with `aria-pressed`.
- Update the active item with `IntersectionObserver`; do not add a raw scroll listener or nested scrolling region.
- Below the breakpoint, switch to a static wrapped list with `44px` minimum targets. Respect reduced motion, forced colors and print output.

#### Typography pairings

- **Display (`Inter`)** — h1, h2, hero headlines, brand wordmarks.
- **Body (`Inter`)** — paragraphs, labels, button text, form inputs.
- **Mono (`JetBrains Mono`)** — code, eyebrows, metadata, numerals in tables.

### 4 · Hard constraints

Never do any of the following without explicit instruction from the user:

- Introduce a new color, font, radius, or shadow that isn't declared above.
- Mix this system with another (e.g. don't paste in Material or Bootstrap defaults).
- Use generic gradient defaults (purple→blue, peach→pink) — they break the system's voice.
- Reach for emoji icons. Use the shared local SVG subset and size icons in line with body type.
- Add motion that exceeds the system's restraint — use the authored motion
  tokens, with interaction feedback at `duration.fast` or faster.

### 5 · Before you finish — verify

Run through this checklist for every screen you produce:

- [ ] Every raw color appears in the contract and is exposed through a semantic CSS variable.
- [ ] Headlines use the display font; body copy uses the body font.
- [ ] Buttons match one of the declared variants exactly (shape, padding, weight).
- [ ] Border-radius values come from `radius.sm` / `radius.md` / `radius.lg` / `radius.pill`.
- [ ] Cards and dividers use the declared border + shadow tokens.
- [ ] New authored values were added to this document and `css/variables.css` together.
- [ ] `npm run audit` and the relevant browser tests pass.

---

## 1. Atmosphere

Warm Canvas embodies the philosophy of a great workspace: a blank canvas that gets out of your way. The system is built on warm neutrals rather than cold grays — distinctly approachable minimalism that feels like quality paper rather than sterile glass. The page background is pure white (`#ffffff`) but the text isn't pure black — it sits at `rgba(0,0,0,0.95)`, softening the read imperceptibly. The warm gray scale (`#f6f5f4`, `#31302e`, `#615d59`, `#787673`) carries subtle yellow-brown undertones, giving the interface a tactile, almost analog warmth.

A modified geometric sans is the backbone of the system. At display sizes (64px) it uses aggressive negative letter-spacing (-2.125px), creating headlines that feel compressed and precise. The weight range is broader than typical: 400 for body, 500 for UI, 600 for semi-bold labels, 700 for display headings. OpenType features `"lnum"` and `"locl"` are enabled on larger text, adding sophistication that rewards close reading.

What makes Warm Canvas distinctive is its **border philosophy**. Rather than heavy borders or shadows, it uses ultra-thin `1px solid rgba(0,0,0,0.1)` — borders that exist as whispers, barely perceptible division lines that create structure without weight. The shadow system is equally restrained: multi-layer 4-stack with cumulative opacity never exceeding 0.05, depth that's felt rather than seen.

**Signature moves**
- Compressed sans at -2.125px tracking on 64px display
- Warm neutrals: yellow-brown undertones throughout (`#f6f5f4` warm white, `#31302e` warm dark)
- Near-black text via `rgba(0,0,0,0.95)` — micro-warmth
- Whisper borders: `1px solid rgba(0,0,0,0.1)` — barely there
- Multi-layer 4-stack shadows with sub-0.05 opacity
- Single saturated blue accent (`#0075de`) — the only color in core UI chrome
- Pill badges (9999px) with tinted blue background for status
- Static 32px blueprint grid with a warm-neutral 6% line and radial edge fade
- Equal split-screen hero with a linked four-pillar protocol blueprint
- Pointer-following spotlight glow on dark tertiary cards
- Desktop sticky “On this page” rails with a static wrapped mobile fallback

## 2. Palette

### Primary
- **Near Black** `rgba(0,0,0,0.95)` — text, headings
- **Pure White** `#ffffff` — page, cards
- **Canvas Blue** `#0075de` — CTA, links, single saturated accent

### Warm Neutrals
- Warm White `#f6f5f4` — section alternation
- Warm Dark `#31302e` — dark surface
- Warm Gray 500 `#615d59` — secondary text
- Warm Gray 300 `#787673` — ghost actions, placeholders, disabled

### Semantic
- Teal `#2a9d99` — accent, secondary success state
- Green `#1aae39` — completion
- Orange `#dd5b00` — warning
- Warm Red `#a62f36` — danger
- Pink `#ff64c8` — decorative

### Interactive
- Active `#005bab` — pressed
- Focus `#097fe8` — ring
- Badge bg `#f2f9ff`, text `#005bab`

## 3. Typography

| Role | Size | Weight | Leading | Tracking |
|------|------|--------|---------|----------|
| Display Hero | 64px | 700 | 1.00 | -2.125px |
| Display 2 | 54px | 700 | 1.04 | -1.875px |
| Section | 48px | 700 | 1.00 | -1.5px |
| Sub-heading L | 40px | 700 | 1.50 | normal |
| Sub-heading | 26px | 700 | 1.23 | -0.625px |
| Card title | 22px | 700 | 1.27 | -0.25px |
| Body L | 20px | 600 | 1.40 | -0.125px |
| Body | 16px | 400 | 1.50 | normal |
| Nav | 15px | 600 | 1.33 | normal |
| Badge | 12px | 600 | 1.33 | +0.125px |

**Four-weight system.** 400 (read), 500 (interact), 600 (emphasize), 700 (announce). Tracking compresses with size and relaxes at body. Badges are the only positive-tracking text.

## 4. Buttons

### Primary Blue
```css
background: #0075de;
color: #ffffff;
padding: 8px 16px;
border-radius: 4px;
```
Hover `#005bab`. Active scale(0.98).

### Secondary Warm Surface
- Background `#F7F6F3`, text `#2F2F2F`, border `#E9E5DC`
- 4px radius, translate up 1px on hover

### Pill Badge
- Background `#f2f9ff`, text `#005bab`
- 9999px radius, 4px 8px padding, 12px weight 600

## 5. Cards

- Background: `#ffffff`
- Border: `1px solid rgba(0,0,0,0.1)` (whisper)
- Radius: 12px standard, 16px featured
- Shadow: 4-layer stack, max opacity 0.04

## 6. Charts

**Stepped charts.** Bars are flush (no gap) with a thin top accent line, giving an organic, blocky productivity-tool feel. Gridlines are dashed and restrained. Line charts use a 2px stroke with subtle 12% area fill — no end-dot.

## 7. Spacing

- Base: 4px; primary rhythm: 8px
- Scale: `2, 3, 4, 5, 6, 7, 8, 11, 12, 14, 16, 24, 32`
- Section vertical: 64–120px

## 8. Depth & elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| 0 | None | Page, text |
| 1 | Whisper border `1px solid rgba(0,0,0,0.1)` | Cards, dividers |
| 2 | 4-stack shadow (max 0.04) | Content cards |
| 3 | 5-stack shadow (max 0.05, 52px blur) | Modals, hero |

**Layered, ambient, embedded.** Multiple layers with extremely low individual opacity accumulate into soft natural-looking elevation — elements feel embedded in the page, not floating above it.

## 9. Do's & don'ts

✅ **Do**
- Use warm neutrals exclusively — yellow-brown undertones
- Compress display tracking to -2.125px at 64px
- Use whisper borders at `rgba(0,0,0,0.1)` — never heavier
- Layer 4–5 shadows with sub-0.05 individual opacity
- Reserve canvas blue (`#0075de`) for CTAs and links

❌ **Don't**
- Use blue-gray neutrals — kills the warmth
- Apply pill radius to cards — pill is for badges only
- Use heavy single shadows — multi-layer ambient only
- Introduce more saturated colors in core chrome
- Use bold (`#000000`) — `rgba(0,0,0,0.95)` only

---

## Tokens

> Generated from the same source the live preview renders from.
> Treat the values below as the contract — never substitute approximations.

### Colors

| Role      | Value |
|-----------|-------|
| primary   | `#0075de` |
| secondary | `#615d59` |
| tertiary  | `#31302e` |
| neutral   | `#ffffff` |
| surface   | `#ffffff` |
| canvas    | `#f6f5f4` |
| muted     | `#787673` |
| accent    | `#2a9d99` |
| success   | `#1aae39` |
| warning   | `#dd5b00` |
| danger    | `#a62f36` |
| decorative | `#ff64c8` |
| focus     | `#097fe8` |
| badge text | `#005bab` |

### Typography

- **Display:** Inter
- **Body:** Inter
- **Mono:** JetBrains Mono

| Role | size / leading / weight / tracking |
|------|------------------------------------|
| Hero | 4rem / 1 / 700 / -2.125px |
| H1   | 3rem / 1 / 700 / -1.5px |
| H2   | 1.625rem / 1.23 / 700 / -0.625px |
| Body | 1rem / 1.5 / 400 / 0 |

### Radius

- sm: `4px`
- md: `8px`
- lg: `12px`
- pill: `9999px`

### Shadows

- **card:** `rgba(0,0,0,0.04) 0 4px 18px, rgba(0,0,0,0.027) 0 2.025px 7.85px, rgba(0,0,0,0.02) 0 0.8px 2.93px, rgba(0,0,0,0.01) 0 0.175px 1.04px`
- **button:** `rgba(0,117,222,0.15) 0 4px 12px`

### Borders

- **card:** `1px solid rgba(0,0,0,0.1)`
- **divider:** `rgba(0,0,0,0.1)`

### Buttons

Four variants, each fully tokenized. The preview renders from these exact values.

#### Primary

| Property | Value |
|----------|-------|
| shape | `rounded` |
| background | `#0075de` |
| color | `#FFFFFF` |
| border | `none` |
| padding | `8px 16px` |
| fontWeight | `500` |
| fontSize | `0.875rem` |

#### Secondary

| Property | Value |
|----------|-------|
| shape | `rounded` |
| background | `#F7F6F3` |
| color | `#2F2F2F` |
| border | `1px solid #E9E5DC` |
| padding | `8px 16px` |
| fontWeight | `500` |
| fontSize | `0.875rem` |

#### Outline

| Property | Value |
|----------|-------|
| shape | `rounded` |
| background | `transparent` |
| color | `#2F2F2F` |
| border | `1px solid #2F2F2F` |
| padding | `8px 16px` |
| fontWeight | `500` |
| fontSize | `0.875rem` |

#### Ghost

| Property | Value |
|----------|-------|
| shape | `rounded` |
| background | `transparent` |
| color | `#787673` |
| border | `none` |
| padding | `8px 12px` |
| fontWeight | `500` |
| fontSize | `0.875rem` |

### Charts

| Property | Value |
|----------|-------|
| variant | `stepped` |
| strokeWidth | `2` |
| fillOpacity | `0.12` |
| gridlines | `true` |
| barGap | `0px` |
| highlight | `single` |
| dotMarker | `false` |

---

## Pro tokens

> Production-fidelity tokens. States, density, motion, elevation,
> content rules and a measured WCAG contract — derived from the
> resting tokens unless explicitly authored.

### States

#### Button

- **hover** — shadow: `0 8px 24px -10px rgba(0, 117, 222, 0.35)`, transform: `translateY(-1px)`, filter: `brightness(1.02)`
- **focus** — outline: `2px solid rgba(0, 117, 222, 0.4)`, outline-offset: `3px`
- **active** — transform: `translateY(0) scale(0.98)`
- **disabled** — opacity: `0.4`, filter: `saturate(0.5)`
- **loading** — opacity: `0.65`
- **selected** — bg: `rgba(0, 117, 222, 0.18)`, color: `#0075de`

#### Input

- **hover** — bg: `rgba(0, 117, 222, 0.03)`, border: `1px solid rgba(0, 117, 222, 0.4)`
- **focus** — border: `1px solid rgba(0, 117, 222, 0.6)`, shadow: `0 0 0 4px rgba(0, 117, 222, 0.12)`
- **disabled** — opacity: `0.4`
- **error** — border: `1px solid rgba(244,114,182,0.7)`, shadow: `0 0 0 4px rgba(244,114,182,0.15)`

#### Card

- **hover** — shadow: `0 16px 40px -16px rgba(0, 117, 222, 0.3)`, transform: `translateY(-3px)`
- **selected** — bg: `rgba(0, 117, 222, 0.04)`, border: `1px solid rgba(0, 117, 222, 0.5)`
- **dragging** — transform: `scale(1.03) rotate(-0.8deg)`, opacity: `0.92`

#### Tab

- **hover** — bg: `rgba(0, 117, 222, 0.08)`, color: `#0075de`
- **focus** — outline: `2px solid rgba(0, 117, 222, 0.4)`, outline-offset: `2px`
- **selected** — bg: `rgba(0, 117, 222, 0.16)`, color: `#0075de`

### Density

| Mode | padding × | row × | body | radius × | Use for |
|------|-----------|-------|------|----------|---------|
| compact | 0.72 | 0.78 | 0.8125rem | 0.85 | Information-dense — tables, IDEs, dashboards |
| comfortable | 1 | 1 | 0.9375rem | — | Default — most product UI |
| spacious | 1.35 | 1.3 | 1rem | 1.15 | Editorial — marketing, long-form, settings |

### Motion

**Signature — Soft fade.** Long, gentle transitions with a symmetric easing curve. Motion is calming, never intrusive.

```css
transition: all 400ms cubic-bezier(0.45, 0.05, 0.55, 0.95);
```

| Token | Value |
|-------|-------|
| duration.instant | `120ms` |
| duration.fast | `240ms` |
| duration.base | `400ms` |
| duration.slow | `600ms` |
| easing.standard | `cubic-bezier(0.45, 0.05, 0.55, 0.95)` |
| easing.decelerate | `cubic-bezier(0.0, 0, 0.2, 1)` |
| easing.accelerate | `cubic-bezier(0.4, 0, 1, 1)` |
| easing.spring | `cubic-bezier(0.45, 1.4, 0.55, 1)` |

### Elevation

Five-level scale, system-specific recipe.

| Level | Shadow | Recipe |
|-------|--------|--------|
| level0 | `none` | Flat — the tone separates, not the shadow. |
| level1 | `0 2px 6px -2px rgba(0, 117, 222, 0.12)` | Soft tinted lift. |
| level2 | `0 8px 24px -10px rgba(0, 117, 222, 0.2)` | Floating card — pastel-tinted shadow. |
| level3 | `0 16px 48px -16px rgba(0, 117, 222, 0.28)` | Sheet — visible tinted glow. |
| level4 | `0 32px 80px -24px rgba(0, 117, 222, 0.4)` | Modal — tinted wash, scrim required. |

### Content

- **measure:** `64ch` (max line length for body prose)
- **paragraph spacing:** `1.35em`
- **list indent:** `1.5em`
- **list gap:** `0.6em`
- **link:** color `#0075de`, underline `hover`
- **blockquote:** border `2px solid rgba(0, 117, 222, 0.5)`, padding `0.9em 1.2em`
- **code:** background `rgba(0, 117, 222, 0.1)`, color `#000000`

### Accessibility contrast reference (WCAG 2.1)

These calculated token pairs are a design guardrail, not a substitute for route-level accessibility tests. Ratios are rounded to two decimal places.

| Foreground on white surface | Ratio | Safe text use |
|-----------------------------|-------|---------------|
| Body `rgba(0,0,0,0.95)` | 19.44:1 | Normal and large text (AAA) |
| Secondary `#615d59` | 6.53:1 | Normal and large text (AA) |
| Muted `#787673` | 4.53:1 | Normal and large text (AA) |
| Primary `#0075de` | 4.57:1 | Normal and large text (AA) |
| Accent `#2a9d99` | 3.29:1 | Large text and non-text UI only |
| Warning `#dd5b00` | 3.77:1 | Large text and non-text UI only |
| Danger `#a62f36` | 6.82:1 | Normal and large text (AA) |

On warm or tinted surfaces, recalculate the actual foreground/background pair. Do not use accent or warning as normal-sized body text without a stronger foreground token.
