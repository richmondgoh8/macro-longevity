import { expect, test } from '@playwright/test';

const routes = ['/', '/pages/stack.html', '/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html', '/pages/finance.html'];

for (const route of routes) {
  test(`${route} uses the local Warm Canvas contract`, async ({ page }) => {
    await page.goto(route);
    const contract = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const primary = document.querySelector('.btn-primary, .button-primary');
      const card = document.querySelector('.preview-card, .stack-card, .meal-card, .blood-card, .invest-card, .pillar-card');
      const primaryStyle = primary ? getComputedStyle(primary) : null;
      const cardStyle = card ? getComputedStyle(card) : null;
      const pictographic = /\p{Emoji_Presentation}/u;
      return {
        primary: root.getPropertyValue('--color-primary').trim(),
        text: root.getPropertyValue('--color-text').trim(),
        radius: root.getPropertyValue('--radius-lg').trim(),
        bodyFont: body.fontFamily,
        renderedEmoji: pictographic.test(document.body.innerText),
        externalFontOrIcon: [...performance.getEntriesByType('resource')].some((entry) => /fonts\.googleapis|lucide/i.test(entry.name)),
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        primaryStyle: primaryStyle && { padding: primaryStyle.padding, radius: primaryStyle.borderRadius, background: primaryStyle.backgroundColor },
        cardStyle: cardStyle && { radius: cardStyle.borderRadius, shadow: cardStyle.boxShadow },
      };
    });
    expect(contract.primary).toBe('#0075de');
    expect(contract.text).toContain('rgba(0, 0, 0, 0.95)');
    expect(contract.radius).toBe('12px');
    expect(contract.bodyFont).toContain('Inter');
    expect(contract.renderedEmoji).toBe(false);
    expect(contract.externalFontOrIcon).toBe(false);
    expect(contract.overflow).toBeLessThanOrEqual(1);
    if (contract.primaryStyle) {
      expect(contract.primaryStyle.padding).toBe('8px 16px');
      expect(contract.primaryStyle.radius).toBe('4px');
      expect(contract.primaryStyle.background).toBe('rgb(0, 117, 222)');
    }
    if (contract.cardStyle) {
      expect(contract.cardStyle.radius).toBe('12px');
      expect(contract.cardStyle.shadow).not.toBe('none');
    }
  });
}

test('Finance chart uses the Warm Canvas stepped treatment', async ({ page }) => {
  await page.goto('/pages/finance.html');
  await page.getByRole('tab', { name: 'FIRE calculator' }).click();
  await expect(page.locator('#fireChart')).toBeVisible();
  const chart = await page.locator('#fireChart').evaluate((svg) => ({
    stepped: [...svg.querySelectorAll('.chart-value-line')].some((path) => /H/.test(path.getAttribute('d') || '') && /V/.test(path.getAttribute('d') || '')),
    stroke: getComputedStyle(svg.querySelector('.chart-value-line')).strokeWidth,
    area: getComputedStyle(svg.querySelector('.chart-value-area')).fill,
    dots: svg.querySelectorAll('circle').length,
  }));
  expect(chart.stepped).toBe(true);
  expect(chart.stroke).toBe('2px');
  expect(chart.area).not.toBe('none');
  expect(chart.dots).toBe(0);
});
