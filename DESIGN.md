# 🎨 Universal Informational Website Design System
### *For Cooking · Nutrition · Health · Editorial · Knowledge Platforms*

> **Version:** 1.0 · **Scope:** General-purpose web & mobile · **Stability:** Timeless principles — no framework lock-in

---

## ⚡ Quick Reference (Commit This to Memory)

| Rule | Value |
|------|-------|
| Base font size (mobile) | `16–18px` |
| Base font size (desktop) | `18–20px` |
| Line height (body) | `1.6–1.75` |
| Max content column width | `680–720px` |
| Min tap target | `44 × 44px` |
| Max items in nav | `5–7` |
| Max font sizes used | `4` |
| Spacing unit | `8px` base grid |
| Card border radius | `8–16px` |
| Contrast ratio (body text) | `≥ 4.5:1` |
| Image aspect (recipe/hero) | `16:9` or `4:3` |

---

## 1. Philosophy: The 4 Laws

```
┌─────────────────────────────────────────────────┐
│  LAW 1 · Clarity over cleverness               │
│  LAW 2 · One hierarchy, respected everywhere   │
│  LAW 3 · Mobile is the real product            │
│  LAW 4 · White space is not empty — it thinks  │
└─────────────────────────────────────────────────┘
```

**What these mean in practice:**

- **Clarity over cleverness** — If a user needs to think to understand a label, icon, or layout, redesign it. Elegant design communicates without instructions.
- **One hierarchy** — Every page has exactly one most-important thing. Headlines, spacing, and color all agree on what it is. Nothing competes.
- **Mobile is the real product** — Build for the 375px phone first. The desktop version is the upgrade, not the baseline.
- **White space thinks** — Generous padding, line-height, and breathing room between sections aren't wasted space. They guide eyes, reduce cognitive load by up to 20%, and signal quality.

---

## 2. Color System

### 2.1 Semantic Token Architecture

Never hardcode hex values in components. Always map to semantic tokens so a rebrand is a one-file change.

```
Primitive → Semantic → Component
   #2D6A2F → --color-brand-primary → --button-bg-primary
```

### 2.2 Universal Palette Blueprint

Adapt hues to your brand; **never change these roles:**

```
┌─────────────────────────────────────────────────────────────┐
│  TOKEN                   │ ROLE                             │
│──────────────────────────┼──────────────────────────────────│
│  --color-bg-base         │ Page background (light/neutral)  │
│  --color-bg-surface      │ Cards, panels, raised elements   │
│  --color-bg-subtle       │ Zebra rows, input fills          │
│  --color-border          │ Dividers, card outlines          │
│  --color-text-primary    │ Body text, headings              │
│  --color-text-secondary  │ Captions, labels, metadata       │
│  --color-text-disabled   │ Placeholders, inactive           │
│  --color-brand-primary   │ CTAs, links, active states       │
│  --color-brand-accent    │ Highlights, tags, badges         │
│  --color-semantic-success│ Positive metrics, "healthy"      │
│  --color-semantic-warn   │ Caution flags, allergens         │
│  --color-semantic-error  │ Validation errors                │
│  --color-semantic-info   │ Tips, neutral notices            │
└─────────────────────────────────────────────────────────────┘
```

### 2.3 Palette Recipes by Context

**Cooking / Recipe platforms:**
- Base: warm off-white (`#FAFAF7`–`#F5F2EE`)
- Surface: pure white or cream (`#FFFFFF`)
- Brand: earthy terracotta, sage green, or warm amber
- Accent: pop of saturated herb green or paprika red
- Text: near-black with warmth (`#1C1C1A`)

**Health / Nutrition platforms:**
- Base: clean cool white or pale mint (`#F8FFFE`)
- Surface: white
- Brand: clinical yet friendly — teal, forest green, or cobalt blue
- Accent: energetic citrus or warm coral
- Text: true neutral dark (`#18181B`)

**Editorial / Informational platforms:**
- Base: light gray or newsprint (`#F6F6F4`)
- Surface: white
- Brand: ink black, slate, or deep navy
- Accent: one bold editorial pop (vermillion, electric blue, gold)
- Text: ink black (`#111111`)

> **Dark Mode:** Invert surface hierarchy (base → `#121212`, surface → `#1E1E1E`, text primary → `#E8E8E4`). Never use pure `#000000` or pure `#FFFFFF` in dark mode — it creates excessive contrast that strains eyes.

### 2.4 Contrast Enforcement

```
Body text on bg       →  minimum 4.5:1  (WCAG AA)
Large text / headings →  minimum 3.0:1  (WCAG AA)
Interactive elements  →  minimum 3.0:1  (WCAG AA)
Icons + meaningful UI →  minimum 3.0:1  (WCAG AA)
Aim for AAA (7:1) on primary body copy whenever possible.
```

---

## 3. Typography System

### 3.1 The 4-Size Rule

**Never use more than 4 distinct font sizes in a design.** 

```
SIZE   │ ROLE                      │ MOBILE    │ DESKTOP
───────┼───────────────────────────┼───────────┼──────────
XL     │ Page headline / hero      │ 28–36px   │ 40–56px
LG     │ Section heading / H2      │ 22–26px   │ 28–36px
MD     │ Body text / UI default    │ 16–18px   │ 18–20px
SM     │ Captions / metadata       │ 13–14px   │ 14–15px
```

For a 5th wildcard (all-caps labels, overlines, micro-tags): use SM with `letter-spacing: 0.08–0.12em` and `font-weight: 600`. This reads as a new size without adding one.

### 3.2 Fluid Typography (Recommended)

Use CSS `clamp()` so type scales naturally without breakpoint hacks:

```css
/* Body text: 16px on 320px viewport → 20px on 1440px viewport */
font-size: clamp(1rem, 0.9rem + 0.5vw, 1.25rem);

/* H1: 28px → 56px */
font-size: clamp(1.75rem, 1.2rem + 2.5vw, 3.5rem);
```

### 3.3 Font Pairing Strategies

**Strategy A — Editorial Warmth** *(Best for cooking, lifestyle)*
- Display: Serif (Playfair Display, Lora, Cormorant Garamond)
- Body: Humanist sans (Source Sans Pro, Nunito Sans, Inter)
- Utility/data: Monospace (JetBrains Mono, IBM Plex Mono)

**Strategy B — Clean Authority** *(Best for nutrition, health, science)*
- Display: Geometric sans (DM Sans, Plus Jakarta Sans, Outfit)
- Body: Neutral sans (Inter, Roboto, IBM Plex Sans)
- Utility/data: Same family, lighter weight

**Strategy C — High-Contrast Structural** *(Best for editorial, news)*
- Display: Slab serif (Playfair, Newsreader, Spectral)
- Body: Compact sans (IBM Plex Sans, Barlow)
- Utility/data: Tabular numerals in same sans

### 3.4 Type Scale Ratios

Use a ratio for harmony. Apply to your base size:

```
Minor Third  (1.200) → Comfortable, compact
Major Third  (1.250) → Standard — recommended for most sites
Perfect Fourth (1.333) → Dramatic, bold editorial
```

### 3.5 Readability Rules

```
✅ Line length (measure):    45–75 characters per line
✅ Line height (body):       1.6–1.75
✅ Line height (headings):   1.1–1.3
✅ Paragraph spacing:        1em between paragraphs (not 0.5em)
✅ Max paragraph length:     3–5 sentences before break
✅ Letter spacing (body):    default / 0 (never touch this)
✅ Letter spacing (labels):  +0.05 to +0.12em on ALL-CAPS only
✅ Font weight (body):       400
✅ Font weight (UI labels):  500–600
✅ Font weight (headlines):  700–800
```

---

## 4. Spacing System

### 4.1 The 8px Grid

All spacing derives from multiples of `8px`. This creates invisible harmony.

```
  4px  →  xs   — Icon gaps, tight inline spacing
  8px  →  sm   — Component internal padding (tight)
 12px  →  md-  — Between related elements
 16px  →  md   — Standard padding unit
 24px  →  lg   — Card padding, section sub-spacing
 32px  →  xl   — Between sections within a block
 48px  →  2xl  — Major section separations
 64px  →  3xl  — Top-level section breaks (desktop)
 80px  →  4xl  — Hero padding, dramatic whitespace
```

### 4.2 Component Spacing Guide

```
COMPONENT              │ PADDING          │ GAP
───────────────────────┼──────────────────┼──────────────
Card                   │ 20–24px          │ 16px between cards
Button (default)       │ 12px × 20–24px   │ —
Input field            │ 12–14px          │ 8px label gap
Section (mobile)       │ 32–40px top/bot  │ —
Section (desktop)      │ 64–80px top/bot  │ —
Navigation             │ 16px             │ 24–32px between items
Inline tags/chips      │ 4px × 10px       │ 6px between chips
Data table row         │ 12–14px vertical │ —
```

---

## 5. Layout Architecture

### 5.1 The Column Model

```
Mobile (< 768px)        → 1 column, 16–20px side margins
Tablet (768–1024px)     → 2 columns, 24px gaps
Desktop (1024–1280px)   → 2–3 columns, 32px gaps
Wide (> 1280px)         → Max 4 columns; sidebar pattern; content cap

Max content width:  680–720px (reading column)
Max page width:     1280–1440px (container cap, never go wider)
```

### 5.2 Page Architecture Templates

**Template A: Article / Recipe Page**
```
┌──────────────────────────────────────┐
│  STICKY HEADER (logo + search + nav) │
├──────────────────────────────────────┤
│  HERO IMAGE + Title + Meta row       │
│  (category, time, author, rating)    │
├──────────────────────────────────────┤
│  JUMP LINKS (mobile: horizontal      │
│  scroll chips — "Ingredients /       │
│  Instructions / Nutrition / Tips")   │
├─────────────────────┬────────────────┤
│  BODY CONTENT       │  STICKY        │
│  (reading column)   │  SIDEBAR       │
│  max 720px          │  (desktop only)│
│                     │  — Quick facts │
│                     │  — Save/share  │
│                     │  — Related     │
├─────────────────────┴────────────────┤
│  RELATED CONTENT GRID (2–3 cards)   │
├──────────────────────────────────────┤
│  FOOTER                              │
└──────────────────────────────────────┘
```

**Template B: Hub / Category Page**
```
┌──────────────────────────────────────┐
│  STICKY HEADER                       │
├──────────────────────────────────────┤
│  HERO / FEATURED (1 large card)      │
├──────────────────────────────────────┤
│  FILTER BAR (horizontal scroll tags) │
├──────────────────────────────────────┤
│  GRID: 2–3 col cards with images     │
│  [Card] [Card]                       │
│  [Card] [Card]                       │
│  — Lazy load more —                  │
├──────────────────────────────────────┤
│  FOOTER                              │
└──────────────────────────────────────┘
```

**Template C: Data / Comparison Page**
```
┌──────────────────────────────────────┐
│  STICKY HEADER                       │
├──────────────────────────────────────┤
│  PAGE TITLE + SUMMARY (2–3 lines)    │
├──────────────────────────────────────┤
│  QUICK STATS ROW (3–4 KPI cards)    │
├──────────────────────────────────────┤
│  SECTION: Visual chart / table       │
│  SECTION: Breakdown + context text   │
│  SECTION: Call to action             │
├──────────────────────────────────────┤
│  FOOTER                              │
└──────────────────────────────────────┘
```

---

## 6. Component Patterns

### 6.1 Card Anatomy

Cards are the atomic unit of informational sites. Every card type must answer: *What does the user do with this?*

```
┌─────────────────────────────┐
│  [IMAGE 16:9 or 4:3]        │  ← Always fixed-ratio, never distorted
│                             │
├─────────────────────────────┤
│  CATEGORY TAG  ·  METADATA  │  ← Small, secondary, left-aligned
│  ─────────────────────────  │
│  HEADLINE (2–3 lines max)   │  ← Bold, high contrast
│  ─────────────────────────  │
│  SNIPPET (1–2 lines, opt.)  │  ← Secondary text color
│  ─────────────────────────  │
│  [ICON] 25 min  [ICON] Easy │  ← Icon + label pairs
└─────────────────────────────┘
```

**Card Rules:**
- Limit to 3–4 data points visible per card
- Entire card is a tap target on mobile (not just the headline)
- Use `box-shadow` or `border` for elevation — never both
- Cards in a grid must be the same height (CSS Grid, not absolute heights)
- Hover/focus state: slight shadow lift + scale(`1.01–1.02`) — never more

### 6.2 Recipe Card (Specialized)

```
┌─────────────────────────────────────┐
│  [FULL-WIDTH HERO IMAGE]            │
│  [SAVE BUTTON — heart icon, top-R]  │
├─────────────────────────────────────┤
│  🏷️ CATEGORY  ·  ⭐ 4.8 (230)      │
│                                     │
│  Oven-Baked Lemon Herb Salmon       │  ← H1, bold serif
│                                     │
│  ┌───────┬───────┬───────┬───────┐  │
│  │ 🕐    │ 🍳    │ 👥    │ 📊    │  │  ← Quick-fact strip
│  │ 30min │ Easy  │ 4 srv │ 480cal│  │
│  └───────┴───────┴───────┴───────┘  │
│                                     │
│  JUMP:  [Ingredients] [Steps] [Tips]│  ← Anchor chips
│                                     │
│  ## Ingredients                     │
│  ─ [ ] 400g salmon fillet           │  ← Checkbox list
│  ─ [ ] 2 tbsp olive oil             │
│                                     │
│  ## Instructions                    │
│  1. Preheat oven to 200°C...        │  ← Numbered steps
│     [TIMER: 25 min] ←clickable      │
│                                     │
│  ## Nutrition (per serving)         │
│  [SEE SECTION 6.3 BELOW]            │
└─────────────────────────────────────┘
```

### 6.3 Nutrition Panel Component

Display nutrition data visually — never as a raw text dump.

```
╔══════════════════════════════════╗
║  NUTRITION  (per serving · 120g) ║
╠══════════════════════════════════╣
║  Calories        480 kcal        ║  ← Large number
║  ──────────────────────────────  ║
║  Protein   [████████░░]  32g     ║  ← Progress bar visual
║  Carbs     [███░░░░░░░]  18g     ║
║  Fat       [█████░░░░░]  24g     ║
║  Fibre     [██░░░░░░░░]  3g      ║
║  ──────────────────────────────  ║
║  Sodium    340mg · Sugars  4g    ║  ← Secondary row
╚══════════════════════════════════╝
```

**Key rules:**
- Use bar lengths proportional to `% Daily Value`, not raw grams
- Color-code bars: Protein → brand color, Carbs → neutral, Fat → warm amber, Fibre → green
- Collapse secondary micronutrients behind "Show more" on mobile
- Annotate allergens with icon badges (🥛 dairy, 🌾 gluten, 🥜 nuts)

### 6.4 Data Table Pattern

Never use raw HTML tables on mobile. Use this adaptive pattern:

**Desktop:** Traditional table with sticky header row
**Mobile:** Card-per-row transformation

```
DESKTOP                          MOBILE
┌────┬──────┬─────┬────────┐     ┌──────────────────┐
│ #  │ Name │ Cal │ Protein│     │  1. Chicken Breast│
│────┼──────┼─────┼────────│     │  Calories:  165  │
│ 1  │ Chkn │ 165 │  31g   │  → │  Protein:   31g  │
│ 2  │ Tofu │  76 │   8g   │     ├──────────────────┤
│ 3  │ Eggs │ 155 │  13g   │     │  2. Tofu         │
└────┴──────┴─────┴────────┘     │  Calories:   76  │
                                 │  Protein:    8g  │
```

Implementation: CSS `@container` queries or a JS toggle at `< 640px`.

### 6.5 Tag / Chip System

Use chips to convey content attributes — filter, label, or navigate.

```
Category chips (filters):
  [🥗 Salads] [🍖 Meat] [🌱 Vegan] [⏱ Quick] [🔥 Popular]

Attribute chips (read-only):
  [Gluten-Free] [High-Protein] [Meal Prep] [30 min]

State variations:
  Default    → border + bg-surface    → text-secondary
  Selected   → bg-brand-primary       → text-white
  Disabled   → opacity: 0.4           → no interaction
```

### 6.6 Stat / KPI Card (Data Pages)

```
┌────────────────────────────┐
│  [ICON or SPARKLINE]       │
│                            │
│  2,847                     │  ← Giant number, bold
│  Daily Active Users        │  ← Label, secondary
│                            │
│  ↑ 12.4% vs last week      │  ← Delta, semantic color
└────────────────────────────┘
```

**Grid of 3–4 on desktop, horizontal scroll on mobile.**

### 6.7 Progress & Timeline Components

Use for step-by-step content (cooking steps, program stages, guides):

```
Horizontal stepper (desktop):
  [①  Prep] ——— [② Cook] ——— [③ Rest] ——— [④ Serve]
   ✅ done        ● current     ○ next        ○ next

Vertical timeline (mobile):
  │ ✅ Step 1: Preheat oven to 200°C
  │             ↳ 5 min
  │ ● Step 2: Season the salmon
  │             ↳ Active
  │ ○ Step 3: Bake for 20 minutes
  │             ↳ Timer: 20:00
```

---

## 7. Navigation Architecture

### 7.1 Mobile Navigation (< 768px)

**Bottom Tab Bar** — the correct choice for mobile:

```
┌──────────────────────────────────────┐
│  ○ Home  ○ Discover  ● Search  ○ Saved  ○ Profile │
└──────────────────────────────────────┘
```

Rules:
- 5 items maximum (no overflow menu in tab bar)
- Active item: brand color icon + small dot or filled icon
- Height: `56–64px` with `safe-area-inset-bottom` padding on iOS
- Icons must have visible text labels (never icon-only)
- Tap targets: minimum `44 × 44px`

**Hamburger — when to use:**
Only for secondary/overflow navigation on pages where the bottom tab bar is already used. Never as the primary nav on a content-heavy site. If you use it, the drawer opens from the left (standard) with a close button at top-right.

### 7.2 Desktop Navigation

**Sticky Header:**
```
┌──────────────────────────────────────────────────────────┐
│  [LOGO]   Recipes   Nutrition   Guides   [🔍 Search] [CTA]│
└──────────────────────────────────────────────────────────┘
```

Rules:
- Logo left-aligned always
- CTA (sign up / subscribe) right-aligned, visually distinct
- Shrink header on scroll: reduce height from `80px → 56px`
- Drop shadow appears only when scrolled (not on page load)
- Underline or subtle background on active nav item (not bold weight alone)

### 7.3 Search — First-Class Feature

Search is undervalued. Treat it as primary UX, not an afterthought.

```
Priority placement:
  Mobile:  Prominent in hero OR tab bar icon
  Desktop: Right-side header OR centered hero bar

Behaviors:
  → Autofocus on open
  → Show recent searches immediately
  → Debounced live results (300ms delay)
  → Filter chips within results (Category / Time / Difficulty)
  → "No results" state offers 3 alternative suggestions
  → Search within results (ingredient filtering)
```

### 7.4 Jump Navigation (Long-form pages)

For any page > 3 screens tall, provide anchor navigation:

```
Mobile:   Horizontal scroll chips at page top
          [Overview] [Ingredients] [Method] [Tips] [Nutrition]

Desktop:  Sticky sidebar TOC (visible after scroll past hero)
          Or inline jump bar that sticks below the header
```

---

## 8. Content Presentation Rules

### 8.1 The Anti-Wall-of-Text Checklist

Before publishing any long-form content:

```
□ Max paragraph length: 3–5 sentences
□ Every 3–4 paragraphs: visual break (heading, image, callout, list)
□ Sentences: average < 20 words
□ Reading level: Flesch-Kincaid Grade 8 or below
□ Key takeaways: always available without reading full body
□ No lists with more than 7 items (split into subsections)
□ Code/data: always in formatted blocks, never inline prose
□ "Jump to" link at top for long pages
□ Progressive disclosure: lead with the summary, expand for detail
```

### 8.2 Content Hierarchy System

Every content section must follow this order:

```
1. EYEBROW (optional)    — "Macro Breakdown" — SM, caps, brand color
2. HEADLINE              — The point, stated clearly — XL or LG
3. LEDE / SUMMARY        — 1–2 lines: what, why it matters — MD regular
4. BODY / DETAIL         — The full explanation — MD regular
5. CALLOUT (optional)    — Key fact / warning / tip boxed
6. SUPPORTING VISUALS    — Chart, table, or image that adds info
7. ACTION (optional)     — "See full breakdown →" — link or button
```

### 8.3 Visual Callout Types

Use these to break content into digestible chunks:

```
💡 TIP BOX
┌────────────────────────────────────────┐
│  💡  Pro tip                           │
│  Resting salmon after cooking for 3   │
│  minutes redistributes juices.        │
└────────────────────────────────────────┘
  Styling: light brand bg, left border 4px brand accent

⚠️ WARNING / ALLERGEN BOX
┌────────────────────────────────────────┐
│  ⚠️  Allergen: Contains Tree Nuts      │
└────────────────────────────────────────┘
  Styling: semantic-warn bg, icon prominent

📊 KEY STAT CALLOUT
┌────────────────────────────────────────┐
│          32g                           │
│          Protein per serving           │
└────────────────────────────────────────┘
  Styling: large number, bold, centered, subtle bg

📌 DEFINITION / TERM BOX
┌────────────────────────────────────────┐
│  Maillard Reaction                     │
│  The browning process between amino    │
│  acids and sugars above 140°C that    │
│  creates complex flavor.              │
└────────────────────────────────────────┘
  Styling: border-left 3px, italic label, compact
```

### 8.4 Image Handling

```
PLACEMENT       │ ASPECT RATIO   │ MIN WIDTH   │ FORMAT
────────────────┼────────────────┼─────────────┼──────────
Hero            │ 16:9 or 21:9   │ 1280px      │ WebP
Card thumbnail  │ 4:3 or 16:9    │ 600px       │ WebP
Inline article  │ 16:9 or free   │ 800px       │ WebP
Avatar / author │ 1:1 (circle)   │ 80px        │ WebP
Gallery item    │ 4:3            │ 400px       │ WebP
Icon            │ 1:1            │ 24–48px     │ SVG
```

Rules:
- Always include `width` and `height` attributes (prevents layout shift)
- Use `loading="lazy"` on all images below the fold
- Provide 2–3 `srcset` sizes (400w, 800w, 1280w)
- Use `object-fit: cover` inside fixed-ratio containers
- Alt text: describe content relevantly, not "photo of food"
- Skeleton loader during fetch (matches final layout shape)

---

## 9. Mobile-First Implementation Guide

### 9.1 Thumb Zone Map

```
PHONE SCREEN (portrait)
┌──────────────────────┐
│  DEAD ZONE           │  ← Top ~15% — hard to reach one-handed
│  (secondary actions) │
├──────────────────────┤
│                      │
│  NATURAL ZONE        │  ← Middle ~50% — easy reach
│  (primary content,   │
│   main interactions) │
│                      │
├──────────────────────┤
│  PRIME ZONE          │  ← Bottom ~35% — effortless thumb reach
│  (CTAs, nav, save,   │
│   next step button)  │
└──────────────────────┘

Rule: Place every primary action in the Natural or Prime zones.
      Reserve Dead Zone for decorative content and back buttons.
```

### 9.2 Touch Target Standards

```
Minimum size:        44 × 44px  (Apple HIG + Google MDL)
Recommended size:    48 × 48px  
Spacing between:     8px minimum gap between targets
Label proximity:     Label must be within 8px of its control

Common failures to avoid:
  ✗ Inline text links as the only tap target in a card
  ✗ Icons without labeled hit-area padding
  ✗ Dropdown arrows < 44px wide
  ✗ Close/X buttons < 44px (especially modals/alerts)
```

### 9.3 Mobile Layout Anti-Patterns

```
AVOID                              FIX
────────────────────────────────────────────────────────
Side-by-side 50/50 columns    →  Stack vertically < 640px
Horizontal data tables         →  Card-per-row transform
Multi-level dropdown nav       →  Flat drawer or bottom tabs
Fixed-position elements > 25%  →  Use sparingly, one at a time
Full-page modals with scroll   →  Bottom sheet with drag handle
Hover-only states              →  Add focus + active states
Tiny form inputs < 16px font   →  iOS auto-zoom trigger, prevent it
Placeholder-only form labels   →  Visible label above input always
```

### 9.4 Scroll Behavior

```
Native scroll:           Always preferred on mobile (not custom)
Horizontal scroll:       Cards, filter chips, gallery — snap to grid
Sticky elements:         Max 1 sticky element visible at a time
Infinite scroll:         Pair with explicit "You've seen 40 items"
Scroll depth indicator:  Use for long articles (thin progress bar, top)
Pull-to-refresh:         Only if data is live/real-time
```

---

## 10. Data Visualization Guidelines

### 10.1 Chart Selection Matrix

```
QUESTION TYPE              │ CHART TYPE
───────────────────────────┼────────────────────────────────
Compare magnitudes         │ Bar chart (horizontal on mobile)
Show composition           │ Donut chart or stacked bar
Show change over time      │ Line chart
Show distribution          │ Histogram or box plot
Show relationship          │ Scatter plot (desktop only)
Show ranking               │ Ranked bar or leaderboard
Show parts of a whole      │ Donut (max 5 slices)
Show a single metric       │ Big number + sparkline
Show macros (nutrition)    │ Donut + labeled legend
```

### 10.2 Chart Rendering Principles

```
□ Every chart has a descriptive title AND a one-line insight
  "Protein content across protein sources"
  "Chicken breast provides the most protein per 100g"

□ Default to horizontal bar charts on mobile (labels readable)

□ Max 7 data series visible simultaneously; use "Other" to collapse

□ Axes labels: 12–13px, secondary text color, no rotation

□ Gridlines: subtle (15–20% opacity), horizontal only

□ Tooltips: trigger on tap/hover, always dismissible on mobile

□ Zero baseline: bar charts always start at zero

□ Color blindness: never use red + green alone as opposing colors;
  add pattern or icon differentiation

□ Animation: chart elements animate in on scroll-enter (once only)
  Duration: 400–600ms, ease-out

□ Mobile fallback: simplify chart (fewer labels, less detail)
```

### 10.3 Macro Breakdown (Nutrition) — Preferred Visual

```
For displaying macronutrient ratios:

  ┌───────────────────────────────┐
  │      [DONUT: 40P/30C/30F]     │  ← Donut chart, 3 segments
  │                               │
  │  Protein  ■  40%  · 32g      │
  │  Carbs    ■  30%  · 24g      │
  │  Fat      ■  30%  · 24g      │
  └───────────────────────────────┘

  Each macro: its own color, percentage, and gram weight.
  Touch a segment on mobile → tooltip shows full name.
```

---

## 11. Performance Requirements

*Fast sites are better products. These are floors, not aspirations.*

### 11.1 Core Web Vitals Targets

```
METRIC   │ TARGET        │ WHAT IT MEASURES
─────────┼───────────────┼─────────────────────────────────
LCP      │ < 2.5s        │ Largest image/text block visible
INP      │ < 200ms       │ Interaction responsiveness
CLS      │ < 0.1         │ Layout stability (no jumps)
FCP      │ < 1.8s        │ First content painted
TTFB     │ < 800ms       │ Server response
```

### 11.2 Image Performance Rules

```
Format:       WebP for photos, AVIF where supported, SVG for icons
Compression:  85% quality WebP for hero, 75% for thumbnails
Hero image:   Preload with <link rel="preload" as="image">
Lazy images:  loading="lazy" on all below-the-fold images
Srcset:       Provide 400w, 800w, 1280w variants minimum
Width/Height: Always declare to prevent CLS
CDN:          Serve images from CDN edge; enable cache headers
```

### 11.3 Loading State Standards

```
Component state    │ Pattern
───────────────────┼────────────────────────────────────────
Initial page load  │ Skeleton screens (match final layout shape)
Image loading      │ Low-quality placeholder (LQIP) or skeleton
Data fetching      │ Spinner inside the component only
Action response    │ Button: loading state within 200ms
Long operations    │ Progress bar with percentage
Error state        │ Friendly message + retry button, always
Empty state        │ Illustration + clear prompt to act
```

---

## 12. Accessibility (A11y) Baseline

*Accessibility is not a feature. It is a quality standard.*

### 12.1 Non-Negotiables

```
□ Keyboard navigation: Full site navigable without mouse
□ Focus indicators: Visible, high-contrast (never remove outline)
□ Alt text: All meaningful images have descriptive alt text
□ Color: Never convey information by color alone (add icon/label)
□ ARIA: Use semantic HTML first; ARIA only to supplement
□ Forms: Every input has a visible <label>, never placeholder-only
□ Skip links: "Skip to main content" as first focusable element
□ Headings: Logical hierarchy (H1 → H2 → H3, never skip levels)
□ Motion: Respect prefers-reduced-motion for all animations
□ Text zoom: Site usable at 200% zoom without horizontal scroll
□ Touch targets: All interactive elements ≥ 44 × 44px
```

### 12.2 Semantic HTML Hierarchy

```html
<header role="banner">      ← Site header, once per page
  <nav aria-label="Main">   ← Primary navigation
<main>                      ← Page content, once per page
  <article>                 ← Self-contained content (recipe, post)
  <section aria-labelledby> ← Logical content section
  <aside>                   ← Sidebar, supplementary
<footer role="contentinfo"> ← Site footer
```

### 12.3 Focus Management

```
Custom modals:     Trap focus inside while open
  → On open:  move focus to first interactive element
  → On close: return focus to the trigger element

Carousels:         Pause on focus; keyboard arrow navigation
Dynamic content:   Announce to screen readers with aria-live
Route changes:     Focus <h1> of new page (SPA navigation)
```

---

## 13. Animation & Motion System

### 13.1 Motion Budget

```
Micro-interactions (hover, focus): 100–200ms
State transitions (expand, collapse): 200–300ms
Page transitions: 250–400ms
Data visualization entries: 400–600ms
Skeleton → content: 200ms fade

RULE: If you cannot justify why an animation exists, remove it.
      Motion should explain — not decorate.
```

### 13.2 Easing Curves

```
Entering (appear):  ease-out (cubic-bezier(0.0, 0.0, 0.2, 1.0))
Exiting (disappear): ease-in (cubic-bezier(0.4, 0.0, 1.0, 1.0))
Position change:    ease-in-out (cubic-bezier(0.4, 0.0, 0.2, 1.0))
Spring (emphasis):  spring(1, 80, 8, 0) — use sparingly
```

### 13.3 Reduced Motion

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
```

---

## 14. Form Design

### 14.1 Input Field Anatomy

```
[Label — always visible above input]
[Placeholder — optional, lighter color]
[────────────────────────────────────]  ← Input (48px tall on mobile)
[Helper text or validation message   ]
```

Rules:
- Font size inside inputs: minimum `16px` on mobile (prevents iOS zoom)
- Input height mobile: `48–52px` (generous touch target)
- Input height desktop: `40–44px`
- Validation: inline (show on blur, not on every keystroke)
- Success state: green checkmark at right edge
- Error state: red border + error text below + error icon (not color alone)
- Required fields: `*` with legend "(* required)" — not hidden

### 14.2 Search Input (Special)

```
  [🔍  Search recipes, ingredients...        ] ← Full-width bar
  
  Results appear below, within 300ms of input
  
  Mobile behavior:
  - Input expands full-screen on focus
  - Keyboard pushes viewport (do not prevent this)
  - Recent searches shown before typing
  - "Clear" (×) button appears when text present
```

---

## 15. Error & Empty States

### 15.1 Error State Hierarchy

```
LEVEL         │ DISPLAY        │ RECOVERY
──────────────┼────────────────┼──────────────────────────────
Field error   │ Below input    │ Describe the fix in plain text
Form error    │ Above form     │ Summary + scroll to first error
Page error    │ Full section   │ Retry button + support link
404           │ Full page      │ Search bar + popular links
500           │ Full page      │ Retry + status page link
Offline       │ Banner/toast   │ "Retry when connected" button
```

### 15.2 Empty State Template

```
┌─────────────────────────────┐
│                             │
│       [ILLUSTRATION]        │  ← Friendly, on-brand graphic
│                             │
│   No saved recipes yet      │  ← Specific, not "Nothing here"
│                             │
│   Recipes you save will     │  ← Brief, helpful context
│   appear here               │
│                             │
│      [Browse Recipes]       │  ← Clear primary CTA
│                             │
└─────────────────────────────┘
```

---

## 16. Anti-Pattern Gallery

*Patterns seen frequently on informational/cooking/nutrition sites — and why to avoid them.*

```
❌  ANTI-PATTERN                    WHY IT FAILS
──────────────────────────────────────────────────────────────────
Full recipe story before recipe     Users scroll past wall of text
                                    to get to ingredients; they leave

PDF menus / static images           Not searchable, not accessible,
                                    fails mobile rendering

Forced account creation to save     20–60% of users abandon at this
                                    point; guest mode first always

Pop-up on landing (< 3s)            Interrupts before value is shown;
                                    dismissed reflexively, zero reads

3-column layout on mobile           Breaks readability; text becomes
                                    unreadable below 12px

Autoplay audio/video with sound     Startles users; violated by most
                                    mobile browsers automatically

Hover-only tooltips for nutrition   Touch devices can't hover; use
                                    tap-toggle with dismiss button

15+ navigation items                Cognitive overload; group and
                                    collapse to max 7 visible

Nutrition data in plain prose       "This dish contains 32g of protein,
                                    18g of carbohydrates, and 14g of
                                    fat" — use visual panel instead

Accordion-only on mobile (no        Users miss content; always show
visible preview)                    first line or label before expand

Low-contrast "ghost" buttons        Invisible to low-vision users;
as primary CTA                      ensure 4.5:1 contrast minimum

Multiple competing CTAs per page    Split attention; decide the one
                                    action per section

Justified text alignment            Rivers of whitespace, worse for
                                    dyslexic users; use left-align

Light gray text on white bg         Fails WCAG; secondary text must
                                    still clear 4.5:1

Video autoplay above fold           Destroys LCP score; blocks content
```

---

## 17. Design Token Reference Sheet

Use these token names in your CSS variables / design system:

```css
/* ─── SPACING ─────────────────── */
--space-1:   4px;
--space-2:   8px;
--space-3:  12px;
--space-4:  16px;
--space-6:  24px;
--space-8:  32px;
--space-12: 48px;
--space-16: 64px;
--space-20: 80px;

/* ─── TYPOGRAPHY ──────────────── */
--text-xs:   clamp(0.75rem, 0.7rem + 0.2vw,  0.875rem);
--text-sm:   clamp(0.875rem, 0.8rem + 0.3vw, 0.9375rem);
--text-md:   clamp(1rem,     0.9rem + 0.5vw,  1.25rem);
--text-lg:   clamp(1.25rem,  1rem + 1vw,      1.75rem);
--text-xl:   clamp(1.75rem,  1.2rem + 2vw,    2.75rem);
--text-2xl:  clamp(2rem,     1.5rem + 2.5vw,  3.5rem);

--font-body:    'Your Body Font', system-ui, sans-serif;
--font-display: 'Your Display Font', Georgia, serif;
--font-mono:    'Your Mono Font', monospace;

--weight-normal: 400;
--weight-medium: 500;
--weight-semi:   600;
--weight-bold:   700;

--leading-tight:  1.15;
--leading-snug:   1.35;
--leading-normal: 1.6;
--leading-loose:  1.8;

/* ─── BORDER ─────────────────── */
--radius-sm:  4px;
--radius-md:  8px;
--radius-lg: 16px;
--radius-xl: 24px;
--radius-full: 9999px;  /* pills */

/* ─── SHADOWS ────────────────── */
--shadow-sm:  0 1px 3px rgba(0,0,0,0.08);
--shadow-md:  0 4px 12px rgba(0,0,0,0.10);
--shadow-lg:  0 12px 32px rgba(0,0,0,0.12);
--shadow-xl:  0 24px 64px rgba(0,0,0,0.14);

/* ─── TRANSITIONS ────────────── */
--ease-in:      cubic-bezier(0.4, 0, 1, 1);
--ease-out:     cubic-bezier(0, 0, 0.2, 1);
--ease-in-out:  cubic-bezier(0.4, 0, 0.2, 1);
--duration-fast:   150ms;
--duration-base:   250ms;
--duration-slow:   400ms;
```

---

## 18. Pre-Launch Quality Checklist

### Visual & Typography
```
□ Maximum 4 font sizes used (H1, H2, body, caption + optional overline)
□ Body text line-height ≥ 1.6
□ Paragraph max-width ≤ 720px (reading column)
□ All color combinations pass 4.5:1 contrast (AA)
□ White space consistent with 8px grid
□ No text over low-contrast images without overlay
□ Images maintain fixed aspect ratios (no distortion)
□ Dark mode tested (if implemented)
```

### Mobile
```
□ Tested at 320px, 375px, 414px viewport widths
□ All tap targets ≥ 44 × 44px
□ Bottom navigation bar implemented (not hamburger-only)
□ No horizontal scroll on any page
□ Form inputs ≥ 16px font size (iOS auto-zoom prevention)
□ Images load via srcset with WebP
□ Loading skeletons match final layout
□ Pinch-zoom not disabled (never set user-scalable=no)
```

### Performance
```
□ LCP < 2.5s on 4G mobile
□ CLS < 0.1 (all images have width/height declared)
□ INP < 200ms
□ Hero image preloaded
□ Fonts: max 2 families, preloaded, WOFF2 format
□ No render-blocking scripts in <head>
□ Third-party scripts deferred or async
```

### Accessibility
```
□ Lighthouse accessibility score ≥ 90
□ All images have alt text
□ Form labels visible and associated
□ Skip navigation link present
□ Heading hierarchy logical (no skipped levels)
□ Keyboard navigation functional end-to-end
□ Focus indicators visible on all interactive elements
□ No content available only on hover
□ prefers-reduced-motion respected
□ ARIA landmarks present (header, nav, main, footer)
```

### Content
```
□ No paragraphs > 5 sentences without a visual break
□ Jump navigation on pages > 3 screens tall
□ "Jump to recipe" link on all recipe pages
□ Allergen information prominently displayed
□ Data displayed visually (charts, bars, panels) not in prose
□ Empty states designed for every dynamic content area
□ Error states designed for all form inputs
□ 404 and 500 pages designed and implemented
```

---

## 19. Responsive Breakpoint Reference

```
Breakpoint name │ Width       │ Typical device
────────────────┼─────────────┼──────────────────────────
xs              │ < 375px     │ Small phones (SE, older)
sm              │ 375–640px   │ Standard phones
md              │ 640–768px   │ Large phones, small tablet
lg              │ 768–1024px  │ Tablet portrait / landscape
xl              │ 1024–1280px │ Small laptop
2xl             │ 1280–1536px │ Desktop
3xl             │ > 1536px    │ Wide desktop

Design at:   375px (mobile base)
             768px (tablet adjust)
             1280px (desktop)

Content column locks to 720px wide at > 960px — stop expanding.
Side margins grow with viewport; max content never unbounded.
```

---

*This document is platform-agnostic and technology-neutral. It applies equally to React, Vue, plain HTML/CSS, WordPress, Webflow, or any other implementation stack. The principles describe what to build, not how your toolchain should build it.*

---

**Document end.** Total sections: 19 · Estimated implementation coverage: Foundation through production-ready.
