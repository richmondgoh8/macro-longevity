import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { HEALTH_REFERENCES, HEALTH_REFERENCE_GROUPS } from '../js/data/health-reference-groups.js';

test('Home contains the seven requested groups with visible references and action plans, without promotional extras', async ({ page }) => {
  await page.goto('/');
  const guide = page.locator('#sg-home-dashboard');
  await expect(page.getByRole('heading', { name: 'Health reference & action plans' })).toBeVisible();
  await expect(page.locator('input, select, [data-export], #hero-pillar-map, #pillars-app, #stack-summary-app, #longevity101-app')).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Record and review my results' })).toHaveCount(0);
  await expect(guide.locator('[data-reference-group]')).toHaveCount(7);
  await expect(guide.locator('[data-reference-card]:visible')).toHaveCount(39);
  const ids = HEALTH_REFERENCE_GROUPS.flatMap(group => group.ids);
  expect(new Set(ids).size).toBe(39);
  expect(ids.slice().sort()).toEqual(HEALTH_REFERENCES.map(item => item.id).sort());
  for (const group of HEALTH_REFERENCE_GROUPS) {
    const section = guide.locator(`[data-reference-group="${group.id}"]`);
    await expect(section.getByRole('heading', { name: group.title, exact: true })).toBeVisible();
    await expect(section.locator('.sg-group-plan li')).toHaveCount(3);
    for (const id of group.ids) {
      const card = section.locator(`[data-reference-card="${id}"]`);
      await expect(card.locator('[data-reference-scale]')).toBeVisible();
      await expect(card.locator('.sg-card-action')).toBeVisible();
      await expect(card.getByRole('link', { name: /^Reference source for / })).toHaveAttribute('href', /^https:\/\//);
    }
  }
  await expect(guide.locator('[data-reference-card="hscrp"]')).toContainText('not universal treatment goals');
  await expect(guide.locator('[data-reference-card="vitd"]')).toContainText('40–60 ng/mL');
  await expect(guide.locator('[data-reference-card="mced"]')).toContainText('No established routine testing frequency');
  await expect(guide.locator('[data-reference-card="wholebodymri"]')).toContainText('No evidence-based routine interval');
  await expect(guide.locator('.sg-testing-schedule')).toContainText('not a blanket annual panel');
  await expect(guide.locator('.sg-testing-schedule')).toContainText('BRCA1/2, Lynch');
  const accessibility = await new AxeBuilder({ page }).include('main').analyze();
  expect(accessibility.violations).toEqual([]);
});

test('Home reference units update all supported scales and leave stored Health values untouched', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('sg-health-baseline-v1', JSON.stringify({ values: { tg: '105' }, units: { tg: 'mg/dL' } })));
  await page.goto('/');
  const guide = page.locator('#sg-home-dashboard');
  const units = guide.getByRole('button', { name: 'Alternative units' });
  await units.focus();
  await page.keyboard.press('Enter');
  await expect(units).toHaveAttribute('aria-pressed', 'true');
  for (const [id, unit, values] of [
    ['glucose', 'mg/dL', ['70–<110', '110–<126', '≥126']],
    ['ldl', 'mg/dL', ['<100', '100–<160', '≥160']],
    ['tg', 'mg/dL', ['<150', '150–<200', '≥200']],
    ['apob', 'mg/dL', ['<90', '90–<120', '≥120']],
    ['lpa', 'mg/dL', ['<30', '30–<50', '≥50']],
    ['hscrp', 'mg/dL', ['<0.1', '0.1–0.3', '>0.3']],
    ['uacr', 'mg/g', ['<30', '30–300', '>300']],
    ['hba1c', 'mmol/mol', ['≤42', '43–52', '≥53']],
    ['vitd', 'ng/mL', ['20–50', '12–<20', '<12']],
  ]) {
    const card = guide.locator(`[data-reference-card="${id}"]`);
    await expect(card.locator('.sg-reference-unit')).toHaveText(unit);
    await expect(card.locator('dd')).toHaveText(values);
  }
  await guide.getByRole('button', { name: 'Singapore units' }).click();
  await expect(guide.locator('[data-reference-card="tg"] dd')).toHaveText(['<1.7', '1.7–<2.3', '≥2.3']);
  await expect(guide.locator('[data-reference-card="lpa"]')).toContainText('No fixed conversion');
  await page.goto('/pages/blood.html');
  await expect(page.locator('[data-marker-input="tg"]')).toHaveValue('105');
  await expect(page.locator('[data-marker-unit="tg"]')).toHaveValue('mg/dL');
});

test('Home grouped references remain aligned and readable across viewport widths and text zoom', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const guide = page.locator('#sg-home-dashboard');
  for (const width of [320, 390, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(guide.locator('[data-reference-card="glucose"]')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
    if (width >= 1024) {
      const first = await guide.locator('[data-reference-card="glucose"]').boundingBox();
      const second = await guide.locator('[data-reference-card="insulin"]').boundingBox();
      expect(Math.abs(first.height - second.height)).toBeLessThan(1);
      const a = await guide.locator('[data-reference-card="glucose"] .sg-reference-source').boundingBox();
      const b = await guide.locator('[data-reference-card="insulin"] .sg-reference-source').boundingBox();
      expect(Math.abs(a.y - b.y)).toBeLessThan(1);
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await page.evaluate(() => document.documentElement.style.fontSize = '200%');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  const boxes = await guide.locator('.sg-range-band').evaluateAll(nodes => nodes.map(node => node.scrollWidth <= node.clientWidth + 1));
  expect(boxes.every(Boolean)).toBe(true);
});

test('Health baseline accepts screening values and explains the next move', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const workspace = page.locator('#sg-health-dashboard .sg-workspace');
  await expect(workspace).toBeVisible();
  await expect(workspace.locator('[data-baseline-score]')).toHaveText('0');
  await expect(workspace.locator('.sg-priority-note')).toContainText('full lipid panel');
  await expect(workspace.locator('.sg-marker-card')).toHaveCount(13);

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
  await expect(workspace.locator('.sg-marker-card')).toHaveCount(13);
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
  await expect(page.locator('#sg-home-dashboard [data-reference-card]').first()).toBeVisible();
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

test('reference targets follow selected units without converting saved results', async ({ page }) => {
  await page.goto('/pages/blood.html');
  for (const [id, value, target] of [
    ['tg', '105', '<150 mg/dL'],
    ['glucose', '94', '<110 mg/dL'],
    ['ldl', '93', '<100 mg/dL'],
    ['apob', '85', '<100 / <80 / <65 mg/dL'],
    ['hscrp', '0.08', '<0.1 mg/dL; ≥0.2 mg/dL'],
  ]) {
    const card = page.locator(`[data-marker-card="${id}"]`);
    const units = card.locator('[data-marker-unit]');
    const originalUnit = await units.inputValue();
    const originalTarget = await card.locator('[data-marker-target]').textContent();
    await card.locator('[data-marker-input]').fill(value);
    await units.selectOption('mg/dL');
    await expect(card.locator('[data-marker-target]')).toContainText(target);
    await expect(card.locator('[data-marker-input]')).toHaveValue(value);
    await units.selectOption(originalUnit);
    await expect(card.locator('[data-marker-target]')).toHaveText(originalTarget);
    await units.selectOption('mg/dL');
  }
  for (const [id, boundary] of [['tg', '150'], ['ldl', '100'], ['glucose', '110']]) {
    const card = page.locator(`[data-marker-card="${id}"]`);
    await card.locator('[data-marker-input]').fill(boundary);
    await expect(card.locator('[data-marker-status]')).toHaveClass(/sg-status-review/);
    await card.locator('[data-marker-input]').fill(String(Number(boundary) - 1));
    await expect(card.locator('[data-marker-status]')).toHaveClass(/sg-status-on-track/);
  }
  await page.reload();
  await expect(page.locator('[data-marker-input="tg"]')).toHaveValue('149');
  await expect(page.locator('[data-marker-card="tg"] [data-marker-target]')).toContainText('<150 mg/dL');
  await expect(page.locator('[data-marker-card="hscrp"] [data-marker-target]')).toContainText('<0.1 mg/dL');
});

test('flipping one card leaves its two-column neighbour text and controls unchanged', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/pages/blood.html');
  await page.evaluate(() => document.fonts.ready);
  const card = page.locator('[data-marker-card="bmi"]');
  const neighbour = page.locator('[data-marker-card="glucose"]');
  const geometry = () => neighbour.evaluate(node => {
    const outer = node.getBoundingClientRect();
    return [...node.querySelectorAll('.sg-marker-why, .sg-marker-input-row, .sg-marker-target')].map(child => child.getBoundingClientRect().top - outer.top);
  });
  const expectAligned = async () => {
    const first = await card.boundingBox();
    const second = await neighbour.boundingBox();
    expect(Math.abs(first.y - second.y)).toBeLessThan(1);
    expect(Math.abs(first.height - second.height)).toBeLessThan(1);
    const firstAction = await card.locator('summary').boundingBox();
    const secondAction = await neighbour.locator('summary').boundingBox();
    expect(Math.abs(firstAction.y - secondAction.y)).toBeLessThan(1);
  };
  for (const width of [1024, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    await expectAligned();
  }
  const before = await geometry();
  await expect(card.locator('summary')).toHaveAccessibleName('View actions for BMI');
  await card.locator('summary').click();
  await expect(card.locator('li')).toHaveCount(3);
  await expect(card.locator('[data-marker-input]')).toBeHidden();
  await expect(card.locator('summary')).toHaveAccessibleName('Back to result for BMI');
  const after = await geometry();
  after.forEach((value, index) => expect(Math.abs(value - before[index])).toBeLessThan(1));
  await card.locator('summary').click();
  await expect(card.locator('[data-marker-input]')).toBeVisible();
  await expect(card.locator('[data-marker-actions]')).toBeHidden();
  await expectAligned();
});

test('flip cards support keyboard, retained values and reduced motion without clipped guidance', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/blood.html');
  const card = page.locator('[data-marker-card="ldl"]');
  await card.locator('[data-marker-input]').fill('2.4');
  const flip = card.locator('summary');
  await flip.focus();
  await page.keyboard.press('Enter');
  await expect(card.locator('li')).toHaveCount(3);
  await expect(flip).toBeFocused();
  await expect(card.locator('[data-marker-input]')).toBeHidden();
  expect(await card.evaluate(node => getComputedStyle(node).animationName)).toBe('none');
  await page.keyboard.press('Tab');
  await expect(card.getByRole('link', { name: 'Guidance and reference' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(flip).toBeFocused();
  expect(await card.locator('.sg-marker-details').evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
  await page.keyboard.press('Space');
  await expect(card.locator('[data-marker-input]')).toBeVisible();
  await expect(card.locator('[data-marker-input]')).toHaveValue('2.4');
  await expect(flip).toBeFocused();
});
