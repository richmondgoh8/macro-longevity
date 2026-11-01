# Mobile reference concept — 2026-11-01

`mobile-reference-concept-v1.png` was generated with the built-in image-generation
tool as a design-review artifact. It is not shipped to the website and is not a
screenshot of an implemented interface. No runtime image dependency was added.

The concept explores readable hierarchy, compact section navigation, search,
visible actions, and the existing five-destination shell. Its selected Health tab
does not match the current Home reference route; do not copy that state. Generated
medical wording is not an authoritative source and must not replace the factual
data files. Preserve the current approved ranges and always-visible action plans.

The installed-app icons are separate deterministic PNG exports of the existing
favicon, not generated replacements for the brand. Reproduce them with
`node scripts/generate-app-icons.mjs` after installing the development browser.

## Stitch status

The Stitch connector returned `Authentication required` on 2026-11-01 when listing
projects. No Stitch project or generated screen was created in this pass. Connect
Stitch before claiming its design-generation requirement is complete.

## Remaining completion evidence

- Actual install/launch behavior on iPhone and Android hardware is unverified;
  Chromium reports no installability errors in a non-private browser profile, but
  that check and offline tests are not substitutes for those device checks.
- The broader minimalism/usability goal requires reviewing all five primary tools,
  not only the reference homepage. This pass improves install support rather than
  claiming a complete redesign or a perfect user experience.
- Stitch generation and review remain pending authentication.

## Generation prompt

See `mobile-reference-concept-v1.prompt.txt` for the complete prompt. Built-in
generation was used; no CLI/API fallback or third-party runtime assets were used.
