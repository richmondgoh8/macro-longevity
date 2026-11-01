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
- All five primary mobile entry screens were reviewed at 390px and 200% text size;
  no horizontally clipped controls were found. Health, Ingredient guide, Blueprint
  and Training now use compact mobile contents disclosures. Training's four session
  choices fit above the bottom navigation at 390×844, with weekly background guidance
  still available in a disclosure. These checks are not a user study or a claim of
  a perfect experience for every user.
- Stitch generation and review remain pending authentication.

## Verification — compact navigation pass

- `npm run test:ui`: 311 passed, 3 platform-inapplicable skips (2026-11-01).
- Desktop performance suite: all 3 checks passed after keeping the new section
  navigation CSS out of Home and Nutrition. Existing budgets were not changed.
- Mobile section menus retain keyboard opening, Escape, destination focus and
  desktop access after resizing. Weekly training context and metrics remain
  available; the four session choices fit above the mobile bottom bar.
- Firefox and WebKit executables are unavailable in this workspace. These results
  cover Chromium desktop/mobile emulation, not those engines or physical devices.

## Generation prompt

See `mobile-reference-concept-v1.prompt.txt` for the complete prompt. Built-in
generation was used; no CLI/API fallback or third-party runtime assets were used.
