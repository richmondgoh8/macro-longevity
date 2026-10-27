# Stitch design brief — Macro Longevity Singapore baseline

This brief is the handoff for generating or reviewing design assets in Google
Stitch when the connector is authenticated. The live implementation remains a
dependency-free static PWA in this repository.

## Product direction

Design a calm, practical Singapore health-screening companion for adults who
want to understand their current baseline and choose one useful next action.
The interface must be easy to scan before it becomes detailed:

1. Plain-language summary
2. Personal value and status
3. Orientation target with units and caveat
4. Progressive three-step “how to move toward this level” disclosure
5. Singapore source and primary-care follow-up link

Do not present orientation ranges as diagnoses or guarantees. Make it clear
that risk-based targets and clinician advice can override generic guideposts.

## Screens to generate

- Home: “Know your baseline. Take one next step.” with the five-marker local
  workspace visible above the fold on desktop and in a compact vertical flow on
  mobile.
- Health: the same shared baseline workspace followed by the deeper screening
  map: preparation, core panel, one-time checks, periodic checks, ApoB options,
  beyond-panel checks, and low-value tests.
- Screening package comparison state: a prominent “Priority first” shortlist
  for blood pressure, BMI + waist, glucose, and a full lipid panel; show ApoB,
  Lp(a), kidney function, and urine ACR as selective clinician-led add-ons.

## Visual system

- Warm ivory canvas: `#F7F8F3`; white cards; sage secondary surfaces.
- Forest-green action color: `#246B4B`; dark ink: `#18251F`; muted text:
  `#526158`.
- Flat-color marker tiles only: teal `#D9F1E7`, yellow `#FFF0BD`, lilac
  `#E9E4FB`, blue `#DCE9F8`, coral `#FFE0D8`.
- Inter for body and headings; JetBrains Mono for compact numeric metadata.
- Rounded cards and inputs, restrained borders, generous whitespace, obvious
  focus states, and no decorative gradients or glass effects.
- Use simple original line icons inside flat-color tiles. Do not import an icon
  font, third-party runtime, or an asset that requires attribution. Any newly
  generated visual asset must be commercially usable without attribution.

## Interaction constraints

- Desktop content width around 1280px; responsive acceptance widths 390px and
  1440px.
- Keep the marker cards readable in one column on mobile and two columns on
  desktop.
- Use native disclosure patterns for progressive details.
- Preserve local-first privacy: baseline values stay in browser storage and are
  never uploaded by the interface.
- Respect reduced motion, keyboard navigation, 44px touch targets, and visible
  focus rings.

## Stitch prompt

> Create a warm, flat-color, Singapore-focused health screening PWA for adults.
> The primary screen is a baseline workspace with five cards: blood pressure,
> waist circumference, BMI, fasting glucose, and LDL cholesterol. Each card
> shows a plain-language reason, an input for the latest result, units, an
> orientation target, a non-diagnostic status, and a collapsed three-step
> “how to move toward this level” section. Place a blue “Priority first” strip
> above the cards explaining which checks to look for when comparing screening
> packages: blood pressure, BMI plus waist, glucose, and a full lipid panel;
> make ApoB, Lp(a), kidney function, and urine ACR clearly clinician-selected
> add-ons. Follow with an age/sex-aware Singapore screening roadmap for
> Healthier SG cardiovascular, cervical, breast, and colorectal screening.
> Use warm ivory, forest green, sage, teal, yellow, lilac, blue, and coral flat
> surfaces; original line icons; Inter typography; calm editorial hierarchy;
> no gradients, no stock photography, no attribution-required icon library,
> and no medical-diagnosis language. Produce desktop and mobile compositions.
