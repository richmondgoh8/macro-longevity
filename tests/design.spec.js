import { expect, test } from '@playwright/test';

const routes = ['/', '/pages/stack.html', '/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html', '/pages/finance.html'];

for (const route of routes) {
  test(`${route} uses the local Calm Wellness contract`, async ({ page }) => {
    await page.goto(route);
    const contract = await page.evaluate(() => {
      const root = getComputedStyle(document.documentElement);
      const body = getComputedStyle(document.body);
      const primary = document.querySelector('.btn-primary, .button-primary');
      const card = document.querySelector('.preview-card, .stack-card, .meal-card, .blood-card, .invest-card, .pillar-card');
      const primaryStyle = primary ? getComputedStyle(primary) : null;
      const cardStyle = card ? getComputedStyle(card) : null;
      const blueprintStyle = getComputedStyle(document.body, '::before');
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
        blueprintStyle: {
          position: blueprintStyle.position,
          pointerEvents: blueprintStyle.pointerEvents,
          gridLines: (blueprintStyle.backgroundImage.match(/linear-gradient/g) || []).length,
          gridSize: blueprintStyle.backgroundSize,
          mask: blueprintStyle.maskImage || blueprintStyle.webkitMaskImage,
          animation: blueprintStyle.animationName,
          layer: Number(blueprintStyle.zIndex),
        },
      };
    });
    expect(contract.primary).toBe('#246B4B');
    expect(contract.text).toBe('#18251F');
    expect(contract.radius).toBe('16px');
    expect(contract.bodyFont).toContain('Inter');
    expect(contract.renderedEmoji).toBe(false);
    expect(contract.externalFontOrIcon).toBe(false);
    expect(contract.overflow).toBeLessThanOrEqual(1);
    expect(contract.blueprintStyle.gridLines).toBe(0);
    if (contract.primaryStyle) {
      expect(contract.primaryStyle.padding).toBe('8px 16px');
      expect(contract.primaryStyle.radius).toBe('10px');
      expect(contract.primaryStyle.background).toBe('rgb(36, 107, 75)');
    }
    if (contract.cardStyle) {
      expect(contract.cardStyle.radius).toBe('16px');
      expect(contract.cardStyle.shadow).not.toBe('none');
    }
  });
}

test('Blueprint grid yields to alternate contrast and print modes', async ({ page }) => {
  await page.goto('/');

  await page.emulateMedia({ media: 'print' });
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body, '::before').display)).toBe('none');

  await page.emulateMedia({ media: 'screen', contrast: 'more', forcedColors: 'none' });
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body, '::before').display)).toBe('none');

  await page.emulateMedia({ media: 'screen', contrast: 'no-preference', forcedColors: 'active' });
  await expect.poll(() => page.evaluate(() => getComputedStyle(document.body, '::before').display)).toBe('none');
});

test('Native modals keep the Calm Wellness contract and reduce motion safely', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pages/stack.html');
  await page.locator('[data-clear-stack]').click();
  const modal = page.locator('.ui-confirm-dialog');
  const contract = await modal.evaluate((dialog) => {
    const style = getComputedStyle(dialog);
    const backdrop = getComputedStyle(dialog, '::backdrop');
    return {
      width: dialog.getBoundingClientRect().width,
      radius: style.borderRadius,
      shadow: style.boxShadow,
      transform: style.transform,
      transitionMs: parseFloat(style.transitionDuration) * 1000,
      backdropTransitionMs: parseFloat(backdrop.transitionDuration) * 1000,
      labelled: dialog.getAttribute('aria-labelledby'),
      described: dialog.getAttribute('aria-describedby'),
    };
  });
  expect(contract.width).toBeLessThanOrEqual(720);
  expect(contract.radius).toBe('20px');
  expect(contract.shadow).not.toBe('none');
  expect(contract.transform).toMatch(/^(none|matrix\(1, 0, 0, 1, 0, 0\))$/);
  expect(contract.transitionMs).toBeLessThanOrEqual(10);
  expect(contract.backdropTransitionMs).toBeLessThanOrEqual(10);
  expect(contract.labelled).toBe('confirm-dialog-title');
  expect(contract.described).toBe('confirm-dialog-summary');
});

test('Toast notifications follow the Calm Wellness contract', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await page.evaluate(async () => {
    const { showToast } = await import('/js/components/ui.js');
    await showToast('Saved successfully', { type: 'success', duration: 30_000 });
  });
  const region = page.locator('[data-ui-toast]');
  const item = region.locator('[data-ui-toast-item]').first();
  const contract = await item.evaluate((node) => {
    const style = getComputedStyle(node);
    const close = node.querySelector('[data-ui-toast-dismiss]');
    return {
      regionRole: node.parentElement.getAttribute('role'),
      live: node.parentElement.getAttribute('aria-live'),
      type: node.dataset.uiToastType,
      surface: style.backgroundColor,
      radius: style.borderRadius,
      shadow: style.boxShadow,
      accentWidth: style.borderInlineStartWidth,
      transitionMs: parseFloat(style.transitionDuration) * 1000,
      closeHeight: close.getBoundingClientRect().height,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(contract.regionRole).toBe('region');
  expect(contract.live).toBe('polite');
  expect(contract.type).toBe('success');
  expect(contract.surface).toBe('rgb(255, 255, 255)');
  expect(contract.radius).toBe('16px');
  expect(contract.shadow).not.toBe('none');
  expect(contract.accentWidth).toBe('4px');
  expect(contract.transitionMs).toBeLessThanOrEqual(10);
  expect(contract.closeHeight).toBeGreaterThanOrEqual(44);
  expect(contract.overflow).toBeLessThanOrEqual(1);
});

test('Tooltips follow the Calm Wellness accessible contract', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/pages/stack.html');
  const trigger = page.locator('.meal-library-grid .meal-card').first().locator('[data-meal-toggle]');
  await trigger.focus();
  const tooltip = trigger.locator('.ui-tooltip');
  const contract = await tooltip.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      role: node.getAttribute('role'),
      open: node.dataset.tooltipOpen,
      background: style.backgroundColor,
      color: style.color,
      radius: style.borderRadius,
      maxWidth: parseFloat(style.maxWidth),
      pointerEvents: style.pointerEvents,
      transitionMs: parseFloat(style.transitionDuration) * 1000,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(contract.role).toBe('tooltip');
  expect(contract.open).toBe('true');
  expect(contract.background).toBe('rgb(49, 48, 46)');
  expect(contract.color).toBe('rgb(255, 255, 255)');
  expect(contract.radius).toBe('10px');
  expect(contract.maxWidth).toBeLessThanOrEqual(180);
  expect(contract.pointerEvents).toBe('none');
  expect(contract.transitionMs).toBeLessThanOrEqual(10);
  expect(contract.overflow).toBeLessThanOrEqual(1);
});

test('Planner mode uses one green underline and accessible targets', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const tabs = page.getByRole('tablist', { name: 'Planner input mode' });
  const active = tabs.locator('[aria-selected="true"]');
  expect(await active.evaluate(n => getComputedStyle(n).boxShadow)).toContain('0px -2px');
  expect(await active.evaluate(n => getComputedStyle(n, '::after').display)).toBe('none');
  for (const tab of await tabs.getByRole('tab').all()) expect((await tab.boundingBox()).height).toBeGreaterThanOrEqual(44);
});

test('Homepage split-screen hero follows the Calm Wellness protocol-map contract', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const desktop = await page.locator('.split-screen-hero-shell').evaluate((shell) => {
    const visual = shell.querySelector('.split-screen-hero-visual');
    const cards = [...shell.querySelectorAll('.hero-pillar-card')];
    const visualStyle = getComputedStyle(visual);
    return {
      columns: getComputedStyle(shell).gridTemplateColumns.split(' ').length,
      visualSurface: visualStyle.backgroundColor,
      visualRadius: visualStyle.borderRadius,
      visualShadow: visualStyle.boxShadow,
      cardHeights: cards.map((card) => card.getBoundingClientRect().height),
      links: cards.map((card) => card.getAttribute('href')),
    };
  });
  expect(desktop.columns).toBe(2);
  expect(desktop.visualSurface).toBe('rgb(237, 243, 236)');
  expect(desktop.visualRadius).toBe('16px');
  expect(desktop.visualShadow).toBe('none');
  expect(desktop.cardHeights).toHaveLength(4);
  desktop.cardHeights.forEach((height) => expect(height).toBeGreaterThanOrEqual(44));
  expect(desktop.links).toEqual(['/pages/blood.html', '/pages/protocol.html#biology', '/pages/workout.html', '/pages/stack.html']);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobile = await page.locator('.split-screen-hero-shell').evaluate((shell) => ({
    columns: getComputedStyle(shell).gridTemplateColumns.split(' ').length,
    visualVisible: shell.querySelector('.split-screen-hero-visual').getBoundingClientRect().height > 0,
    overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(mobile.columns).toBe(1);
  expect(mobile.visualVisible).toBe(true);
  expect(mobile.overflow).toBeLessThanOrEqual(1);
});

test('Destination cards use calm surfaces without pointer effects', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.hero-pillar-card');
  await expect(cards).toHaveCount(4);
  expect(await cards.first().evaluate(n => getComputedStyle(n).backgroundColor)).toBe('rgb(255, 255, 255)');
  expect(await cards.first().evaluate(n => getComputedStyle(n, '::before').display)).toBe('none');
});

test('Sticky pin rail follows the Calm Wellness contract', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/protocol.html');
  const desktop = await page.locator('.sticky-pin-rail').evaluate((rail) => {
    const root = getComputedStyle(document.documentElement);
    const nav = rail.querySelector('.sticky-pin-nav');
    const link = rail.querySelector('.sticky-pin-link');
    return {
      topToken: root.getPropertyValue('--sticky-pin-top').trim(),
      widthToken: root.getPropertyValue('--sticky-pin-width').trim(),
      position: getComputedStyle(rail).position,
      navSurface: getComputedStyle(nav).backgroundColor,
      navRadius: getComputedStyle(nav).borderRadius,
      navShadow: getComputedStyle(nav).boxShadow,
      linkHeight: link.getBoundingClientRect().height,
      activeIndicator: getComputedStyle(link).borderInlineStartColor,
      label: rail.querySelector('nav').getAttribute('aria-label'),
    };
  });
  expect(desktop.topToken).toBe('80px');
  expect(desktop.widthToken).toBe('12rem');
  expect(desktop.position).toBe('sticky');
  expect(desktop.navSurface).toBe('rgb(255, 255, 255)');
  expect(desktop.navRadius).toBe('16px');
  expect(desktop.navShadow).not.toBe('none');
  expect(desktop.linkHeight).toBeGreaterThanOrEqual(44);
  expect(desktop.activeIndicator).toBe('rgb(36, 107, 75)');
  expect(desktop.label).toBe('On this page');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect.poll(() => page.locator('.sticky-pin-link').first().evaluate((link) => parseFloat(getComputedStyle(link).transitionDuration) * 1000)).toBeLessThanOrEqual(10);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/protocol.html');
  const mobile = await page.locator('.sticky-pin-rail').evaluate((rail) => ({
    position: getComputedStyle(rail).position,
    overflow: getComputedStyle(rail).overflow,
    linkHeights: [...rail.querySelectorAll('.sticky-pin-link')].map((link) => link.getBoundingClientRect().height),
    pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  expect(mobile.position).toBe('static');
  expect(mobile.overflow).toBe('visible');
  mobile.linkHeights.forEach((height) => expect(height).toBeGreaterThanOrEqual(44));
  expect(mobile.pageOverflow).toBeLessThanOrEqual(1);
});

test('Finance chart uses the Calm Wellness stepped treatment', async ({ page }) => {
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
