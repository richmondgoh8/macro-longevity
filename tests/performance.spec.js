import { expect, test } from "@playwright/test";

test("routes stay lean and avoid layout shift", async ({ page }, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop Chromium payload budget",
  );

  await page.addInitScript(() => {
    window.metrics = { cls: 0 };
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
  });

  const runs = [];
  for (const [url, ready] of [
    ["/", "#priorities-title"],
    ["/pages/stack.html", "#oats"],
    ["/pages/food-labels.html", "#quick-title"],
    ["/pages/supplements.html", "#options-title"],
    ["/pages/skin-care.html", "#routine-title"],
    ["/pages/blood.html", "#results-form button"],
  ]) {
    await page.goto(url, { waitUntil: "load" });
    await page.locator(ready).first().waitFor({ state: "visible" });
    const metrics = await page.evaluate(() => {
      const resources = performance.getEntriesByType("resource");
      return {
        ...window.metrics,
        bytes: resources.reduce((sum, entry) => sum + entry.transferSize, 0),
        scripts: resources
          .filter((entry) => new URL(entry.name).pathname.endsWith(".js"))
          .reduce((sum, entry) => sum + entry.decodedBodySize, 0),
      };
    });
    runs.push({ url, ...metrics });
    expect(metrics.cls, url).toBeLessThanOrEqual(0.1);
    expect(metrics.bytes, url).toBeLessThan(160_000);
    expect(metrics.scripts, url).toBeLessThan(16_000);
  }
  await testInfo.attach("route-metrics", {
    body: JSON.stringify(runs, null, 2),
    contentType: "application/json",
  });
});
