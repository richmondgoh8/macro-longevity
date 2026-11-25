import { expect, test } from "@playwright/test";

test("throttled routes stay lean and core actions paint within budget", async ({
  page,
  context,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "desktop-chromium",
    "Desktop Chromium CDP budget",
  );
  const session = await context.newCDPSession(page);
  await session.send("Network.enable");
  await session.send("Network.setCacheDisabled", { cacheDisabled: true });
  await session.send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 150,
    downloadThroughput: 200_000,
    uploadThroughput: 75_000,
    connectionType: "cellular4g",
  });
  await session.send("Emulation.setCPUThrottlingRate", { rate: 4 });

  await page.addInitScript(() => {
    window.metrics = { lcp: 0, cls: 0, longTasks: 0, interaction: null };
    new PerformanceObserver((list) => {
      window.metrics.lcp = list.getEntries().at(-1).startTime;
    }).observe({ type: "largest-contentful-paint", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.metrics.cls += entry.value;
    }).observe({ type: "layout-shift", buffered: true });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries())
        window.metrics.longTasks += entry.duration;
    }).observe({ type: "longtask", buffered: true });
    document.addEventListener(
      "click",
      (event) => {
        if (!event.target.matches('button[type="submit"]')) return;
        const start = performance.now();
        requestAnimationFrame(() =>
          requestAnimationFrame(() => {
            window.metrics.interaction = performance.now() - start;
          }),
        );
      },
      true,
    );
  });

  const runs = [];
  for (const [url, ready, action] of [
    ["/", "#priorities-title", null],
    ["/pages/stack.html", "#oats", null],
    ["/pages/food-labels.html", "#quick-title", null],
    ["/pages/supplements.html", "#options-title", null],
    ["/pages/skin-care.html", "#routine-title", null],
    ["/pages/blood.html", "#results-form button", "click"],
  ]) {
    await page.goto(url, { waitUntil: "commit" });
    const control = page.locator(ready).first();
    await control.waitFor({ state: "visible" });
    const usable = await page.evaluate(() => performance.now());
    await page.waitForFunction(() => window.metrics.lcp > 0);
    await page.waitForLoadState("load");
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
    if (action) {
      await control[action]();
      await page.waitForFunction(() => window.metrics.interaction !== null);
      metrics.interaction = await page.evaluate(
        () => window.metrics.interaction,
      );
      expect(metrics.interaction, url).toBeLessThan(200);
    }
    runs.push({ url, usable, ...metrics });
    expect(usable, url).toBeLessThan(1500);
    expect(metrics.lcp, url).toBeLessThan(2500);
    expect(metrics.cls, url).toBeLessThanOrEqual(0.1);
    expect(metrics.longTasks, url).toBeLessThanOrEqual(200);
    expect(metrics.bytes, url).toBeLessThan(160_000);
    expect(metrics.scripts, url).toBeLessThan(16_000);
  }
  await testInfo.attach("throttled-metrics", {
    body: JSON.stringify(runs, null, 2),
    contentType: "application/json",
  });
});
