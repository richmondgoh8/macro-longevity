import { expect, test } from '@playwright/test';

test('Home baseline accepts screening values and explains the next move', async ({ page }) => {
  await page.goto('/');
  const workspace = page.locator('#sg-home-dashboard .sg-workspace');
  await expect(workspace).toBeVisible();
  await expect(workspace.locator('[data-baseline-score]')).toHaveText('0/5');
  await expect(workspace.locator('.sg-priority-note')).toContainText('full lipid panel');
  await expect(workspace.locator('.sg-marker-card')).toHaveCount(5);

  await workspace.locator('[data-profile-age]').fill('42');
  await workspace.locator('[data-profile-sex]').selectOption('female');
  await workspace.locator('[data-marker-input="bp"]').fill('124/78');
  await workspace.locator('[data-marker-input="waist"]').fill('78');
  await workspace.locator('[data-marker-input="bmi"]').fill('22.4');
  await workspace.locator('[data-marker-input="glucose"]').fill('5.2');
  await workspace.locator('[data-marker-input="ldl"]').fill('2.4');

  await expect(workspace.locator('[data-baseline-score]')).toHaveText('5/5');
  await expect(workspace.locator('[data-baseline-copy]')).toContainText('markers currently sit within');
  await expect(workspace.locator('[data-screening-card="cardiovascular"]')).toHaveClass(/is-recommended/);
  await expect(workspace.locator('[data-screening-card="cervical"]')).toHaveClass(/is-recommended/);
  await expect(workspace.locator('[data-marker-card="bp"] [data-marker-status]')).toHaveText('Within the guide');
});

test('Health route keeps deeper guidance progressively disclosed', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const workspace = page.locator('#sg-health-dashboard .sg-workspace');
  await expect(workspace.locator('.sg-marker-card')).toHaveCount(5);
  const details = workspace.locator('.sg-marker-details').first();
  await expect(details).not.toHaveAttribute('open', '');
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await expect(details.locator('li')).toHaveCount(3);
  await expect(page.locator('#blood-annual')).toBeVisible();
});

test('Singapore baseline stays within the viewport on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect.poll(() => page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await expect(page.locator('#sg-home-dashboard .sg-marker-card').first()).toBeVisible();
});
