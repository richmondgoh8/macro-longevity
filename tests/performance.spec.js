import { expect, test } from '@playwright/test';

test('Nutrition meets throttled load and interaction budgets', async ({ page, context, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop-chromium', 'Run the Chromium desktop budget once');
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 75_000, connectionType: 'cellular4g' });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__longTaskTotal = 0;
    window.__largestContentfulPaint = 0;
    new PerformanceObserver((list) => { window.__longTaskTotal += list.getEntries().reduce((sum, entry) => sum + entry.duration, 0); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver((list) => { const entries = list.getEntries(); window.__largestContentfulPaint = entries.at(-1)?.startTime || 0; }).observe({ type: 'largest-contentful-paint', buffered: true });
  });
  await page.goto('/pages/stack.html', { waitUntil: 'load' });
  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    return {
      load: nav.loadEventEnd,
      lcp: window.__largestContentfulPaint,
      cls: performance.getEntriesByType('layout-shift').filter((entry) => !entry.hadRecentInput).reduce((sum, entry) => sum + entry.value, 0),
      cssBytes: resources.filter((entry) => entry.name.endsWith('.css')).reduce((sum, entry) => sum + entry.decodedBodySize, 0),
      jsBytes: resources.filter((entry) => new URL(entry.name).pathname.endsWith('.js')).reduce((sum, entry) => sum + entry.decodedBodySize, 0),
      longTasks: window.__longTaskTotal,
    };
  });
  expect(metrics.lcp).toBeLessThan(2_500);
  expect(metrics.load).toBeLessThan(3_000);
  expect(metrics.cls).toBeLessThanOrEqual(0.1);
  expect(metrics.cssBytes).toBeLessThanOrEqual(180_000);
  expect(metrics.jsBytes).toBeLessThanOrEqual(160_000);
  expect(metrics.longTasks).toBeLessThanOrEqual(200);

  const durations = await page.evaluate(() => {
    const output = [];
    for (let index = 0; index < 10; index++) {
      const target = document.querySelector(`[data-planner-mode="${index % 2 ? 'meals' : 'quick-add'}"]`);
      const start = performance.now();
      target.click();
      output.push(performance.now() - start);
    }
    return output;
  });
  expect(Math.max(...durations)).toBeLessThan(200);
});

test('Non-planner routes keep critical JavaScript lean', async ({ page }) => {
  for (const route of ['/', '/pages/avoid.html']) {
    await page.goto(route, { waitUntil: 'load' });
    const bytes = await page.evaluate(() => performance.getEntriesByType('resource').filter((entry) => entry.initiatorType === 'script').reduce((sum, entry) => sum + entry.decodedBodySize, 0));
    expect(bytes).toBeLessThanOrEqual(90_000);
  }
});
