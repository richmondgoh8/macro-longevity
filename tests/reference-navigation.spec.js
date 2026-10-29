import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function openPicker(page) {
  const picker = page.locator('.sg-reference-picker');
  if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
}

async function expectClearTarget(page, id) {
  await expect.poll(() => page.locator(id).evaluate(node => {
    const rect = node.getBoundingClientRect();
    const clearance = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--reference-clearance'));
    return rect.top >= clearance - 2 && rect.top < innerHeight - 100;
  })).toBe(true);
}

test.beforeEach(async ({ page }) => { await page.emulateMedia({ reducedMotion: 'reduce' }); });

test('section picker tracks scrolling, remains reachable, and clears the shell', async ({ page }) => {
  await page.goto('/');
  const desktop = page.viewportSize().width >= 1280;
  if (desktop) await expect(page.locator('.sg-reference-picker')).toHaveAttribute('open', '');
  else await expect(page.locator('.sg-reference-picker')).not.toHaveAttribute('open');
  await openPicker(page);
  await page.getByRole('navigation', { name: 'Health reference groups' }).getByRole('link', { name: 'Cardiovascular', exact: true }).click();
  await expectClearTarget(page, '#reference-cardiovascular');
  await expect(page.locator('.sg-reference-jumps [aria-current="location"]')).toHaveText('Cardiovascular');
  await expect(page.locator('[data-reference-current]')).toHaveText('Cardiovascular · 3/7');
  const rail = await page.locator('.sg-reference-rail').boundingBox();
  const nav = await page.locator('.nav').boundingBox();
  expect(rail.y).toBeGreaterThanOrEqual(nav.y + nav.height);
  expect(rail.y).toBeLessThan(nav.y + nav.height + 25);
  if (!desktop) await expect(page.locator('.sg-reference-picker')).not.toHaveAttribute('open');
  await page.locator('#reference-micronutrients').evaluate(node => node.scrollIntoView());
  await expect(page.locator('[data-reference-current]')).toHaveText('Micronutrients · 5/7');
  if (!desktop) {
    const before = await page.evaluate(() => scrollY);
    const trigger = await page.locator('.sg-reference-picker summary').boundingBox();
    // Real pointer coordinates avoid Playwright's automatic pre-click scroll adjustment.
    await page.mouse.click(trigger.x + trigger.width / 2, trigger.y + trigger.height / 2);
    expect(Math.abs(await page.evaluate(() => scrollY) - before)).toBeLessThanOrEqual(2);
    await expect(page.locator('[data-reference-current]')).toHaveText('Micronutrients · 5/7');
    expect(await page.locator('.sg-reference-picker').evaluate(node => getComputedStyle(node).backgroundColor)).toBe('rgb(255, 255, 255)');
    await page.locator('#biomarker-vitd .sg-copy-link').focus();
    await expect(page.locator('.sg-reference-picker')).not.toHaveAttribute('open');
  }
  await expect(page.locator('[data-reference-card]:visible')).toHaveCount(39);
  await expect(page.locator('.sg-card-action:visible')).toHaveCount(39);
});

test('search supports aliases, keyboard navigation, no matches, and does not filter cards', async ({ page }) => {
  await page.goto('/');
  await openPicker(page);
  const input = page.getByRole('searchbox', { name: 'Find a biomarker' });
  await input.fill('blood sugar');
  await expect(page.locator('[data-reference-results]')).toContainText('Fasting glucose');
  await expect(page.locator('[data-reference-card]:visible')).toHaveCount(39);
  await input.fill('does-not-exist');
  await expect(page.locator('#reference-search-status')).toContainText('No matches');
  await input.press('Escape');
  await expect(page.locator('.sg-reference-jumps')).toBeVisible();
  await input.fill('apolipoprotein b');
  await input.press('ArrowDown');
  await expect(page.locator('[data-reference-results] a')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#biomarker-apob$/);
  await expect(page.locator('#biomarker-apob')).toBeFocused();
  await expectClearTarget(page, '#biomarker-apob');
  await expect(page.locator('#biomarker-apob')).toHaveClass(/sg-reference-found/);
});

test('adjacent sections and back to top work in both directions with browser history', async ({ page }) => {
  await page.goto('/#reference-cardiovascular');
  await expectClearTarget(page, '#reference-cardiovascular');
  await page.locator('#reference-cardiovascular .sg-section-paging').getByRole('link', { name: /Next/ }).click();
  await expect(page).toHaveURL(/#reference-organ$/);
  await expectClearTarget(page, '#reference-organ');
  await page.goBack();
  await expect(page).toHaveURL(/#reference-cardiovascular$/);
  await expectClearTarget(page, '#reference-cardiovascular');
  await page.locator('#reference-cardiovascular .sg-section-paging').getByRole('link', { name: /Previous/ }).click();
  await expectClearTarget(page, '#reference-inflammation');
  const top = page.getByRole('link', { name: '↑ Top', exact: true });
  await expect(top).toBeVisible();
  await top.click();
  await expect(page).toHaveURL(/#reference-top$/);
  await expect(page.locator('.sg-reference-units')).toBeInViewport();
});

test('card deep links survive reload and copy a deployment-relative URL', async ({ page }) => {
  await page.goto('/#biomarker-vitd');
  await expectClearTarget(page, '#biomarker-vitd');
  await page.reload();
  await expectClearTarget(page, '#biomarker-vitd');
  await page.evaluate(() => {
    window.__copiedLink = '';
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async text => { window.__copiedLink = text; } } });
  });
  await page.locator('#biomarker-vitd').getByRole('button', { name: /^Copy link/ }).click();
  expect(await page.evaluate(() => window.__copiedLink)).toBe(page.url());
  await expect(page.locator('[data-reference-feedback]')).toContainText('Link copied');
  await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new Error('Permission denied'); }; });
  await page.locator('#biomarker-vitd .sg-copy-link').click();
  await expect(page.locator('[data-reference-feedback]')).toContainText('Copy this link:');
});

test('navigation stays usable at small widths, text zoom, and landscape without overflow', async ({ page }) => {
  for (const size of [{ width: 320, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(size);
    await page.goto('/');
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await openPicker(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
    await page.getByRole('searchbox', { name: 'Find a biomarker' }).fill('vitamin d');
    await page.locator('[data-reference-results] a').click();
    await expectClearTarget(page, '#biomarker-vitd');
    expect(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)).toBeLessThanOrEqual(1);
  }
});

test('guide navigation has no serious accessibility violations', async ({ page }) => {
  await page.goto('/');
  await openPicker(page);
  const results = await new AxeBuilder({ page }).include('#sg-home-dashboard').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze();
  expect(results.violations).toEqual([]);
});
