# Macro Longevity premium wellness design system

The interface is a premium wellness utility: calm, warm, spacious and highly legible. It should feel contemporary and trustworthy, with enough color and depth to make dense information easy to navigate.

## Principles

- Use hierarchy, labels, spacing, and alignment before adding visual markers.
- Keep one visual language across Home, Stack, Blood, Workout, Finance, Avoid, and Blueprint.
- Preserve the health and financial content; improve its presentation without inventing metrics or claims.
- Prefer a visible state change over hover-only feedback. Keep controls keyboard-operable and easy to scan.
- Design each page as a sequence: orient the user, expose the highest-value action, then reveal supporting detail on demand.
- Use subtle depth and tinted surfaces to separate meaning. Avoid ornamental effects that do not improve hierarchy.

## Foundations

- Typography: self-hosted Geist for all interface text; Geist Mono only for measured values and code-like data. The UI is light-only.
- Color: warm ivory canvas, white and sage surfaces, deep ink text, teal primary actions, leaf-green positive states, amber conditional states and rose risk states. Text and controls meet WCAG AA contrast.
- Shape: 10px controls, 16px cards and 22–30px feature containers. Use stronger outlines or soft elevation so adjacent surfaces never blend together.
- Spacing: retain the 4px base / 8px rhythm, with 24–40px inside major components and 64–96px between major page sections.
- Icons: navigation and content remain text-first. A small centralized line-icon set is allowed only for familiar functional controls such as add, edit, delete, close and portion adjustment; every icon requires an accessible name and visible focus tooltip. SVG otherwise remains reserved for data visualization.

## Components

Use the shared card, section heading, badge, button, tab, disclosure, and form styles in `css/style.css`. Repeated HTML escaping and simple presentation primitives live in `js/components/ui.js`.

Cards should have one clear title, one supporting line, and only the metadata needed to make a decision. Use tinted headers, semantic accents and generous padding where they materially improve scanning. The planner must remain in normal document flow and must not overlap or trap the page in nested scrolling.

Do not add generic instructional progress strips. Progress must reflect real application state: selected meals and portions, nutrient coverage, workout timers or calculator results. Long reference-heavy sections use shared progressive disclosure: the core or most actionable section starts open, while optional context remains easy to find without dominating the initial scan.

## Accessibility and performance

- Every control has a visible focus state, an accessible name, and a target of at least 44px where practical.
- Use semantic headings, landmarks, buttons for actions, and `aria-live` only for meaningful status changes.
- Maintain readable contrast in the light theme and support `prefers-reduced-motion` and forced-colors mode.
- Fonts are local variable WOFF2 assets with swap loading, preload, and no external font dependency.
- Keep the app dependency-free and preserve local storage, export, and offline behavior.
