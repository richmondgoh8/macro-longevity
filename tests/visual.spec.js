import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const routes = [
  ["overview", "/", "#priorities-title"],
  ["food", "/pages/stack.html", ".food-image"],
  ["food-labels", "/pages/food-labels.html", "#quick-title"],
  ["supplements", "/pages/supplements.html", "#options-title"],
  ["skin-care", "/pages/skin-care.html", "#routine-title"],
  ["health", "/pages/blood.html", "#results-form"],
];

for (const [name, url, ready] of routes) {
  test(`${name} layout and accessibility`, async ({ page }) => {
    await page.goto(url);
    await expect(page.locator(ready).first()).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
