import { expect, test } from '@playwright/test';

test('Nutrition meets throttled usable-load and painted-interaction budgets', async ({ page, context, browserName }, testInfo) => {
  test.skip(browserName !== 'chromium' || testInfo.project.name !== 'desktop-chromium', 'Chromium CDP budget');
  test.setTimeout(60000);
  const session = await context.newCDPSession(page);
  await session.send('Network.enable');
  await session.send('Network.setCacheDisabled', { cacheDisabled: true });
  await session.send('Network.emulateNetworkConditions', { offline: false, latency: 150, downloadThroughput: 200_000, uploadThroughput: 75_000, connectionType: 'cellular4g' });
  await session.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    window.__metrics = { lcp: 0, shifts: [], longTasks: 0 };
    const ready = new MutationObserver(() => {
      if (!document.querySelector('[data-planner-ready="true"][aria-busy="false"]')) return;
      ready.disconnect();
      requestAnimationFrame(() => requestAnimationFrame(() => { window.__metrics.usable = performance.now(); }));
    });
    ready.observe(document, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-planner-ready', 'aria-busy'] });
    new PerformanceObserver(list => { window.__metrics.longTasks += list.getEntries().reduce((s, e) => s + e.duration, 0); }).observe({ type: 'longtask', buffered: true });
    new PerformanceObserver(list => { window.__metrics.lcp = list.getEntries().at(-1)?.startTime || 0; }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => { window.__metrics.shifts.push(...list.getEntries().filter(e => !e.hadRecentInput).map(e => ({ at: e.startTime, value: e.value }))); }).observe({ type: 'layout-shift', buffered: true });
  });
  const runs = [];
  for (let run = 0; run < 3; run++) {
    await page.goto('/pages/stack.html');
    await expect(page.locator('[data-planner-ready="true"]')).toHaveAttribute('aria-busy', 'false');
    await expect(page.getByRole('tab', { name: /^Meals/ })).toBeVisible();
    await page.waitForFunction(() => window.__metrics.usable > 0);
    const usable = await page.evaluate(() => window.__metrics.usable);
    await page.waitForTimeout(750);
    runs.push(await page.evaluate(usable => {
      const resources = performance.getEntriesByType('resource');
      let cls = 0, sum = 0, start = 0, last = 0;
      for (const shift of window.__metrics.shifts) {
        if (shift.at - last > 1000 || shift.at - start > 5000) { sum = 0; start = shift.at; }
        sum += shift.value; cls = Math.max(cls, sum); last = shift.at;
      }
      return { usable, lcp: window.__metrics.lcp, cls, longTasks: window.__metrics.longTasks,
        cssBytes: resources.filter(e => new URL(e.name).pathname.endsWith('.css')).reduce((s,e)=>s+e.decodedBodySize,0),
        jsBytes: resources.filter(e => new URL(e.name).pathname.endsWith('.js')).reduce((s,e)=>s+e.decodedBodySize,0) };
    }, usable));
  }
  await testInfo.attach('cold-load-measurements', { body: JSON.stringify(runs, null, 2), contentType: 'application/json' });
  const median = key => runs.map(r => r[key]).sort((a,b)=>a-b)[1];
  expect.soft(median('lcp')).toBeGreaterThan(0);
  expect.soft(median('lcp')).toBeLessThanOrEqual(2500);
  expect.soft(median('usable')).toBeLessThanOrEqual(3000);
  expect.soft(median('cls')).toBeLessThanOrEqual(.1);
  expect.soft(median('cssBytes')).toBeLessThanOrEqual(190000);
  expect.soft(median('jsBytes')).toBeLessThanOrEqual(160000);
  expect.soft(median('longTasks')).toBeLessThanOrEqual(200);
  // Real visible clicks, measured from event entry through two animation frames.
  await page.evaluate(() => {
    document.addEventListener('click', event => {
      if (!event.target.closest('[data-planner-mode]')) return;
      const start = performance.now();
      requestAnimationFrame(() => requestAnimationFrame(() => { window.__paintedInteraction = performance.now() - start; }));
    }, true);
  });
  for (let index = 0; index < 6; index++) {
    await page.evaluate(() => { window.__paintedInteraction = null; });
    const quick = index % 2 === 0;
    await page.getByRole('tab', { name: quick ? /Quick add/ : /^Meals/ }).click();
    await expect(page.locator(quick ? '#planner-quick-add' : '#planner-meals')).toBeVisible();
    await page.waitForFunction(() => window.__paintedInteraction !== null);
    expect(await page.evaluate(() => window.__paintedInteraction)).toBeLessThan(200);
  }
});

test('Non-planner routes keep critical JavaScript lean', async ({ page }) => {
  for (const route of ['/', '/pages/avoid.html']) {
    await page.goto(route);
    await page.waitForTimeout(500);
    const bytes = await page.evaluate(() => performance.getEntriesByType('resource').filter(e => new URL(e.name).pathname.endsWith('.js')).reduce((sum,e)=>sum+e.decodedBodySize,0));
    expect(bytes).toBeLessThanOrEqual(90000);
  }
});
