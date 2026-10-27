import { expect, test } from '@playwright/test';

test('Home baseline accepts screening values and explains the next move', async ({ page }) => {
  await page.goto('/');
  const workspace = page.locator('#sg-home-dashboard .sg-workspace');
  await expect(workspace).toBeVisible();
  await expect(workspace.locator('[data-baseline-score]')).toHaveText('0');
  await expect(workspace.locator('.sg-priority-note')).toContainText('full lipid panel');
  await expect(workspace.locator('.sg-marker-card')).toHaveCount(12);

  await workspace.locator('[data-profile-age]').fill('42');
  await workspace.locator('[data-profile-sex]').selectOption('female');
  await workspace.locator('[data-marker-input="bp"]').fill('124/78');
  await workspace.locator('[data-marker-input="waist"]').fill('78');
  await workspace.locator('[data-marker-input="bmi"]').fill('22.4');
  await workspace.locator('[data-marker-input="glucose"]').fill('5.2');
  await workspace.locator('[data-marker-input="ldl"]').fill('2.4');

  await expect(workspace.locator('[data-baseline-score]')).toHaveText('5');
  await expect(workspace.locator('[data-baseline-copy]')).toContainText('results within the displayed guideposts');
  await expect(workspace.locator('[data-screening-card="cardiovascular"]')).toHaveClass(/is-recommended/);
  await expect(workspace.locator('[data-screening-card="cervical"]')).toHaveClass(/is-recommended/);
  await expect(workspace.locator('[data-marker-card="bp"] [data-marker-status]')).toHaveText('Within the guide');
});

test('Health route keeps deeper guidance progressively disclosed', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const workspace = page.locator('#sg-health-dashboard .sg-workspace');
  await expect(workspace.locator('.sg-marker-card')).toHaveCount(12);
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

test('marker controls have one border and leave space for the unit', async ({ page }) => {
  await page.goto('/pages/blood.html');
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    const workspace = page.locator('#sg-health-dashboard');
    await workspace.locator('[data-marker-group="kidney"] > summary').evaluate(node => node.parentElement.open = true);
    const controls = await workspace.locator('.sg-value-input').evaluateAll(nodes => nodes.map(node => {
      const input = node.querySelector('input');
      const suffix = node.querySelector('span');
      const style = getComputedStyle(input);
      return { border: style.borderTopWidth, shadow: style.boxShadow, inputRight: input.getBoundingClientRect().right, suffixLeft: suffix.getBoundingClientRect().left, suffixRight: suffix.getBoundingClientRect().right, right: node.getBoundingClientRect().right };
    }));
    controls.forEach(control => {
      expect(control.border).toBe('0px');
      expect(control.shadow).toBe('none');
      expect(control.inputRight).toBeLessThanOrEqual(control.suffixLeft);
      expect(control.suffixRight).toBeLessThan(control.right);
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  }
});

test('ApoB, Lp(a) and kidney results retain their original units and context', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const workspace = page.locator('#sg-health-dashboard');
  await expect(workspace.locator('[data-marker-card="apob"]')).toBeVisible();
  await workspace.locator('[data-marker-input="apob"]').fill('85');
  await workspace.locator('[data-marker-unit="apob"]').selectOption('mg/dL');
  await expect(workspace.locator('[data-marker-card="apob"] [data-marker-status]')).toContainText('risk-based goal');
  await workspace.locator('[data-marker-input="lpa"]').fill('60');
  await expect(workspace.locator('[data-marker-card="lpa"] [data-marker-status]')).toContainText('Below');
  await workspace.locator('[data-marker-unit="lpa"]').selectOption('mg/dL');
  await expect(workspace.locator('[data-marker-card="lpa"] [data-marker-status]')).toContainText('Risk-enhancing');
  await workspace.locator('[data-marker-group="kidney"] > summary').click();
  await workspace.locator('[data-marker-input="egfr"]').fill('55');
  await expect(workspace.locator('[data-marker-card="egfr"] [data-marker-status]')).toContainText('follow-up');
  await page.reload();
  await expect(workspace.locator('[data-marker-input="apob"]')).toHaveValue('85');
  await expect(workspace.locator('[data-marker-unit="apob"]')).toHaveValue('mg/dL');
  await expect(workspace.locator('[data-marker-unit="lpa"]')).toHaveValue('mg/dL');
  await workspace.locator('[data-marker-input="glucose"]').fill('-1');
  await expect(workspace.locator('[data-marker-input="glucose"]')).toHaveAttribute('aria-invalid', 'true');
  await workspace.locator('[data-marker-input="bp"]').fill('20/10');
  await expect(workspace.locator('[data-marker-card="bp"] [data-marker-status]')).not.toHaveText('Within the guide');
});
