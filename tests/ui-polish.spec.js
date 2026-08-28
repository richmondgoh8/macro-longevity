import { expect, test } from '@playwright/test';

test('homepage removes Diet context and keeps its actions clear', async ({ page }) => {
  await page.goto('/');
  const spacing = await page.evaluate(() => {
    const subtitle = document.querySelector('.hero-subtitle').getBoundingClientRect();
    const actions = document.querySelector('.hero-actions').getBoundingClientRect();
    return {
      hasDietContext: Boolean(document.querySelector('.hero-context')),
      gap: actions.top - subtitle.bottom,
    };
  });
  expect(spacing.hasDietContext).toBe(false);
  expect(spacing.gap).toBeGreaterThanOrEqual(24);
});

test('five navigation tabs center their labels vertically', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const desktop = await page.locator('.nav-links .nav-link').evaluateAll((nodes) => nodes.map((node) => ({
    display: getComputedStyle(node).display,
    align: getComputedStyle(node).alignItems,
    justify: getComputedStyle(node).justifyContent,
  })));
  expect(desktop).toHaveLength(5);
  desktop.forEach((tab) => {
    expect(tab.display).toBe('flex');
    expect(tab.align).toBe('center');
    expect(tab.justify).toBe('center');
  });

  await page.setViewportSize({ width: 390, height: 844 });
  const mobile = await page.locator('.bottom-nav-item').evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    const label = node.querySelector('.bottom-nav-label').getBoundingClientRect();
    return { centerDelta: Math.abs((label.top + label.height / 2) - (box.top + box.height / 2)) };
  }));
  expect(mobile).toHaveLength(5);
  mobile.forEach((tab) => expect(tab.centerDelta).toBeLessThanOrEqual(1));
});

test('homepage uses a split-screen hero with a linked protocol map', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const desktop = await page.locator('.split-screen-hero-shell').evaluate((shell) => {
    const style = getComputedStyle(shell);
    const content = shell.querySelector('.split-screen-hero-content');
    const visual = shell.querySelector('.split-screen-hero-visual');
    const contentBox = content.getBoundingClientRect();
    const visualBox = visual.getBoundingClientRect();
    return {
      display: style.display,
      columns: style.gridTemplateColumns.split(' ').length,
      widthDelta: Math.abs(contentBox.width - visualBox.width),
      contentFirst: shell.firstElementChild === content,
      visualLabel: visual.getAttribute('aria-label'),
      mapLinks: [...visual.querySelectorAll('.hero-pillar-card')].map((link) => new URL(link.href).pathname + new URL(link.href).hash),
      ctaInContent: Boolean(content.querySelector('.hero-actions')),
    };
  });
  expect(desktop.display).toBe('grid');
  expect(desktop.columns).toBe(2);
  expect(desktop.widthDelta).toBeLessThanOrEqual(1);
  expect(desktop.contentFirst).toBe(true);
  expect(desktop.visualLabel).toBe('Protocol pillars');
  expect(desktop.mapLinks).toEqual(['/pages/blood.html', '/pages/protocol.html#biology', '/pages/workout.html', '/pages/stack.html']);
  expect(desktop.ctaInContent).toBe(true);

  await page.setViewportSize({ width: 900, height: 900 });
  await page.goto('/');
  const tablet = await page.locator('.split-screen-hero-shell').evaluate((shell) => ({
    columns: getComputedStyle(shell).gridTemplateColumns.split(' ').length,
  }));
  expect(tablet.columns).toBe(1);

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  const mobile = await page.locator('.split-screen-hero-shell').evaluate((shell) => {
    const content = shell.querySelector('.split-screen-hero-content').getBoundingClientRect();
    const visual = shell.querySelector('.split-screen-hero-visual').getBoundingClientRect();
    const cta = shell.querySelector('.hero-actions').getBoundingClientRect();
    return {
      columns: getComputedStyle(shell).gridTemplateColumns.split(' ').length,
      contentBeforeVisual: content.bottom <= visual.top,
      ctaBeforeVisual: cta.bottom <= visual.top,
      visualVisible: visual.width > 0 && visual.height > 0,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(mobile.columns).toBe(1);
  expect(mobile.contentBeforeVisual).toBe(true);
  expect(mobile.ctaBeforeVisual).toBe(true);
  expect(mobile.visualVisible).toBe(true);
  expect(mobile.overflow).toBeLessThanOrEqual(1);
});

test('dark protocol cards use a pointer-only spotlight enhancement', async ({ page }, testInfo) => {
  if (testInfo.project.name === 'mobile-chromium') {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    const mobileCards = page.locator('[data-spotlight-card]');
    await expect(mobileCards).toHaveCount(4);
    const mobile = await mobileCards.first().evaluate((card) => ({
      overlayDisplay: getComputedStyle(card, '::before').display,
      active: card.dataset.spotlightActive || null,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(mobile.overlayDisplay).toBe('none');
    expect(mobile.active).toBeNull();
    expect(mobile.overflow).toBeLessThanOrEqual(1);
    return;
  }

  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  const cards = page.locator('[data-spotlight-card]');
  await expect(cards).toHaveCount(4);

  const resting = await cards.first().evaluate((card) => {
    const before = getComputedStyle(card, '::before');
    return {
      border: getComputedStyle(card).borderTopColor,
      pointerEvents: before.pointerEvents,
      opacity: Number(before.opacity),
    };
  });
  expect(resting.border).toBe('rgba(255, 255, 255, 0.1)');
  expect(resting.pointerEvents).toBe('none');
  expect(resting.opacity).toBe(0);

  await cards.first().hover({ position: { x: 20, y: 20 } });
  await page.waitForTimeout(300);
  const active = await cards.first().evaluate((card) => {
    const before = getComputedStyle(card, '::before');
    return {
      active: card.dataset.spotlightActive,
      x: card.style.getPropertyValue('--spotlight-x'),
      y: card.style.getPropertyValue('--spotlight-y'),
      opacity: Number(before.opacity),
    };
  });
  expect(active.active).toBe('true');
  expect(active.x).toMatch(/%$/);
  expect(active.y).toMatch(/%$/);
  expect(active.opacity).toBeGreaterThan(0);

  await page.mouse.move(1, 1);
  await expect.poll(() => cards.first().getAttribute('data-spotlight-active')).toBe('false');
});

test('active primary navigation uses one selected treatment', async ({ page }) => {
  const routes = ['/', '/pages/stack.html', '/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html', '/pages/finance.html'];
  await page.setViewportSize({ width: 1440, height: 900 });
  for (const route of routes) {
    await page.goto(route);
    const state = await page.locator('.nav-link.active').evaluate((active) => {
      const navStyle = getComputedStyle(active.closest('.nav'));
      const linkStyle = getComputedStyle(active);
      const afterStyle = getComputedStyle(active, '::after');
      return {
        navBorderBottomColor: navStyle.borderBottomColor,
        activeBackground: linkStyle.backgroundColor,
        activeShadow: linkStyle.boxShadow,
        afterContent: afterStyle.content,
      };
    });
    expect(state.navBorderBottomColor).toBe('rgba(0, 0, 0, 0.1)');
    expect(state.activeBackground).toBe('rgb(242, 249, 255)');
    expect(state.activeShadow).toBe('none');
    expect(state.afterContent).toBe('none');
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto(route);
    const state = await page.locator('.bottom-nav-item.active').evaluate((active) => {
      const style = getComputedStyle(active);
      return { background: style.backgroundColor, shadow: style.boxShadow };
    });
    expect(state.background).toBe('rgb(242, 249, 255)');
    expect(state.shadow).toBe('none');
  }
});

test('long routes expose one sticky section rail with stable targets', async ({ page }) => {
  const routes = [
    ['/pages/stack.html', 3],
    ['/pages/avoid.html', 3],
    ['/pages/blood.html', 7],
    ['/pages/protocol.html', 6],
    ['/pages/workout.html', 4],
    ['/pages/finance.html', 3],
  ];

  await page.setViewportSize({ width: 1440, height: 900 });
  for (const [route, count] of routes) {
    await page.goto(route);
    const rail = page.locator('[data-sticky-pin-rail]');
    await expect(rail).toHaveCount(1);
    await expect(rail.locator('.sticky-pin-link')).toHaveCount(count);
    const state = await rail.evaluate((node) => {
      const style = getComputedStyle(node);
      const links = [...node.querySelectorAll('a[href]')];
      return {
        position: style.position,
        top: style.top,
        links: links.map((link) => ({ href: link.getAttribute('href'), found: Boolean(document.querySelector(link.getAttribute('href'))) })),
        overflow: style.overflow,
      };
    });
    expect(state.position).toBe('sticky');
    expect(state.top).toBe('80px');
    expect(state.overflow).toBe('visible');
    state.links.forEach((link) => expect(link.found).toBe(true));

    await page.evaluate(() => window.scrollTo(0, 700));
    await expect.poll(() => rail.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBe(80);
  }
});

test('sticky rail tracks section anchors and preserves keyboard navigation', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/protocol.html');
  await page.locator('#protocol-screening').scrollIntoViewIfNeeded();
  await expect(page.getByRole('link', { name: 'Screening' })).toHaveAttribute('aria-current', 'location');
  await page.getByRole('link', { name: 'Biology' }).click();
  await expect(page).toHaveURL(/#biology$/);
  await expect(page.getByRole('link', { name: 'Biology' })).toHaveAttribute('aria-current', 'location');
});

test('sticky rail controls mirror Training and Finance views', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/workout.html');
  await page.locator('.sticky-pin-link', { hasText: 'Strength' }).click();
  await expect(page.locator('[data-pillar-tab="strength"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#section-strength')).toBeVisible();
  await expect(page.locator('.sticky-pin-link', { hasText: 'Strength' })).toHaveAttribute('aria-pressed', 'true');

  await page.goto('/pages/finance.html');
  await page.locator('.sticky-pin-link', { hasText: 'FIRE calculator' }).click();
  await expect(page.locator('[data-finance-tab="fire"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#financeFire')).toBeVisible();
  await expect(page).toHaveURL(/#fire$/);
  await expect(page.locator('.sticky-pin-link', { hasText: 'FIRE calculator' })).toHaveAttribute('aria-pressed', 'true');
});

test('sticky rail becomes a wrapped static list on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/pages/stack.html', '/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html', '/pages/finance.html']) {
    await page.goto(route);
    const state = await page.locator('.sticky-pin-rail').evaluate((node) => ({
      position: getComputedStyle(node).position,
      overflow: getComputedStyle(node).overflow,
      widths: [...node.querySelectorAll('.sticky-pin-link')].map((link) => link.getBoundingClientRect().width),
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    expect(state.position).toBe('static');
    expect(state.overflow).toBe('visible');
    state.widths.forEach((width) => expect(width).toBeGreaterThanOrEqual(140));
    expect(state.pageOverflow).toBeLessThanOrEqual(1);
  }
});

test('workout tabs are centered and use one index prefix', async ({ page }) => {
  await page.goto('/pages/workout.html');
  const tabs = await page.locator('.workout-tab').evaluateAll((nodes) => nodes.map((node) => ({
    text: node.textContent.trim().replace(/\s+/g, ' '),
    align: getComputedStyle(node).textAlign,
    copyAlign: getComputedStyle(node.querySelector('.workout-tab-copy')).textAlign,
  })));

  expect(tabs).toHaveLength(4);
  expect(await page.locator('.workout-tab-number').count()).toBe(0);
  tabs.forEach((tab, index) => {
    expect(tab.align).toBe('center');
    expect(tab.copyAlign).toBe('center');
    expect(tab.text).toContain(`0${index + 1} /`);
    expect(tab.text.match(/\b0[1-4]\b/g)).toHaveLength(1);
  });
});

test('active workout tabs render one visible indicator bar', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/workout.html');
    const active = page.locator('.workout-tab').nth(1);
    await active.click();
    const state = await active.evaluate((node) => {
      const tabs = node.parentElement;
      const next = node.nextElementSibling;
      const tabStyle = getComputedStyle(node);
      const tabsStyle = getComputedStyle(tabs);
      const nextStyle = next ? getComputedStyle(next) : null;
      return {
        parentBorderBottomStyle: tabsStyle.borderBottomStyle,
        activeShadow: tabStyle.boxShadow,
        nextBorderTopColor: nextStyle?.borderTopColor,
      };
    });
    expect(state.parentBorderBottomStyle).toBe('none');
    expect(state.activeShadow).toContain('inset');
    if (width === 390) expect(state.nextBorderTopColor).toMatch(/rgba\(0, 0, 0, 0\)/);
  }
});

test('blood cards use intrinsic columns and responsive flow', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/blood.html');
  const desktop = await page.evaluate(() => {
    const grid = document.querySelector('.blood-grid');
    const card = [...grid.querySelectorAll('.blood-card')].find((node) => node.textContent.includes('Ferritin'));
    const other = [...grid.querySelectorAll('.blood-card')].find((node) => node.textContent.includes('Uric Acid'));
    const summary = card.querySelector('summary');
    const summaryContentWidth = summary.clientWidth - parseFloat(getComputedStyle(summary).paddingLeft) - parseFloat(getComputedStyle(summary).paddingRight);
    return {
      columns: getComputedStyle(grid).columnCount,
      ferritinHeight: card.getBoundingClientRect().height,
      uricHeight: other.getBoundingClientRect().height,
      rangeDisplay: getComputedStyle(card.querySelector('.blood-card-range')).display,
      rangeWidth: card.querySelector('.blood-card-range').getBoundingClientRect().width,
      summaryContentWidth,
    };
  });
  expect(desktop.columns).toBe('2');
  expect(desktop.uricHeight).toBeLessThan(desktop.ferritinHeight);
  expect(desktop.rangeDisplay).toBe('grid');
  expect(desktop.rangeWidth).toBeGreaterThanOrEqual(desktop.summaryContentWidth - 1);

  await page.setViewportSize({ width: 390, height: 844 });
  const mobileColumns = await page.locator('.blood-grid').first().evaluate((node) => getComputedStyle(node).columnCount);
  expect(mobileColumns).toBe('1');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('ApoB follow-up keeps the comparison table without numbered steps', async ({ page }) => {
  await page.goto('/pages/blood.html');
  const section = page.locator('.progressive-section').filter({ hasText: 'ApoB elevated? Options' });
  await section.locator('summary').click();
  await expect(section.locator('.apob-steps')).toHaveCount(0);
  await expect(section.locator('.apob-table')).toBeVisible();
});

test('Quick-add quantity controls and hover tips stay inside their bounds', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pages/stack.html');
    await page.getByRole('button', { name: /Quick add/ }).click();
    const card = page.locator('.quick-item-grid .builder-item').first();
    const toggle = card.locator('[data-quick-item]');
    if (await toggle.getAttribute('aria-pressed') !== 'true') await toggle.click();
    await expect(card.locator('[data-quick-serving-toggle]')).toHaveText('Adjust servings');
    await card.locator('[data-quick-serving-toggle]').click();
    await toggle.hover();
    const canHover = await page.evaluate(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    if (canHover) await page.waitForTimeout(350);
    const bounds = await page.evaluate(() => {
      const grid = document.querySelector('.quick-item-grid');
      const card = grid.querySelector('.builder-item');
      const control = card.querySelector('.portion-control');
      const minus = card.querySelector('[data-portion-action="decrease"]');
      const plus = card.querySelector('[data-portion-action="increase"]');
      const tooltip = card.querySelector('.ui-tooltip');
      const rect = (node) => node.getBoundingClientRect();
      const gridRect = rect(grid);
      const cardRect = rect(card);
      const controlRect = rect(control);
      const minusRect = rect(minus);
      const plusRect = rect(plus);
      const tooltipRect = rect(tooltip);
      return {
        controlsInsideCard: controlRect.left >= cardRect.left && controlRect.right <= cardRect.right
          && minusRect.left >= cardRect.left && plusRect.right <= cardRect.right,
        tooltipOpen: tooltip.dataset.tooltipOpen === 'true',
        tooltipInsideGrid: tooltipRect.top >= gridRect.top && tooltipRect.right <= gridRect.right,
        transform: getComputedStyle(card).transform,
      };
    });
    expect(bounds.controlsInsideCard).toBe(true);
    if (canHover) {
      expect(bounds.tooltipOpen).toBe(true);
      expect(bounds.tooltipInsideGrid).toBe(true);
    } else {
      expect(bounds.tooltipOpen).toBe(false);
    }
    expect(bounds.transform).toBe('none');
  }
});

test('icon-control tooltips delay pointer reveals and expose focus descriptions', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/stack.html');
  const trigger = page.locator('.meal-library-grid .meal-card').first().locator('[data-meal-toggle]');
  const tooltip = trigger.locator('.ui-tooltip');
  const canHover = await page.evaluate(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);

  if (canHover) {
    await trigger.hover();
    await page.waitForTimeout(150);
    await expect(tooltip).not.toHaveAttribute('data-tooltip-open', 'true');
    await page.waitForTimeout(220);
    await expect(tooltip).toHaveAttribute('data-tooltip-open', 'true');
    await page.mouse.move(2, 2);
    await expect(tooltip).not.toHaveAttribute('data-tooltip-open', 'true');
  }

  await trigger.evaluate((node) => node.setAttribute('aria-describedby', 'existing-description'));
  await trigger.focus();
  await expect(tooltip).toHaveAttribute('role', 'tooltip');
  await expect(tooltip).toHaveAttribute('data-tooltip-open', 'true');
  const describedBy = await trigger.getAttribute('aria-describedby');
  expect(describedBy?.split(/\s+/)).toContain(await tooltip.getAttribute('id'));
  await page.keyboard.press('Escape');
  await expect(tooltip).not.toHaveAttribute('data-tooltip-open', 'true');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-describedby', 'existing-description');
});

test('planner food selection is compact and fuzzy-searchable', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/stack.html');
  const search = page.locator('[data-planner-search]');
  await expect(search).toBeVisible();
  await expect(page.getByText('Fast find', { exact: true })).toBeVisible();

  await page.getByRole('button', { name: /Quick add/ }).click();
  await search.fill('sardn');
  const quickResults = page.locator('.quick-item-grid .builder-item');
  await expect(quickResults).toHaveCount(1);
  await expect(quickResults.first()).toContainText('Sardines with bones');
  const quickGrid = await page.locator('.quick-item-grid').evaluate((node) => ({
    maxHeight: parseFloat(getComputedStyle(node).maxHeight),
    cardPadding: parseFloat(getComputedStyle(node.querySelector('.builder-item')).paddingTop),
  }));
  expect(quickGrid.maxHeight).toBeGreaterThanOrEqual(560);
  expect(quickGrid.cardPadding).toBeLessThanOrEqual(12);

  await page.getByRole('button', { name: /Meals/ }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(6);
  await search.fill('salmon');
  await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(1);
  await expect(page.locator('.meal-library-grid .meal-card').first()).toContainText('Salmon, greens & potato');
});

test('meal titles keep a readable row above fixed-size actions', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/stack.html');

    const layouts = await page.locator('.meal-library-grid .meal-card').evaluateAll((cards) => cards.map((card) => {
      const header = card.querySelector('.meal-card-head');
      const title = header.querySelector('h3');
      const titleGroup = title.parentElement;
      const actions = header.querySelector('.meal-card-actions');
      const headerRect = header.getBoundingClientRect();
      const titleRect = titleGroup.getBoundingClientRect();
      const actionsRect = actions.getBoundingClientRect();
      const range = document.createRange();
      range.selectNodeContents(title);
      return {
        titleWidthDelta: Math.abs(headerRect.width - titleRect.width),
        titleLines: range.getClientRects().length,
        actionsBelowTitle: actionsRect.top >= titleRect.bottom,
        controlSizes: [...actions.querySelectorAll('button')].map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }),
        overflow: card.scrollWidth - card.clientWidth,
      };
    }));

    expect(layouts).toHaveLength(6);
    layouts.forEach((layout) => {
      expect(layout.titleWidthDelta).toBeLessThanOrEqual(2);
      expect(layout.titleLines).toBeLessThanOrEqual(2);
      expect(layout.actionsBelowTitle).toBe(true);
      expect(layout.overflow).toBeLessThanOrEqual(1);
      layout.controlSizes.forEach((control) => {
        expect(control.width).toBeGreaterThanOrEqual(44);
        expect(control.height).toBeGreaterThanOrEqual(44);
      });
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }

  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  await page.evaluate(() => localStorage.setItem('ml-daily-meals', JSON.stringify([{
    id: 'long-name-layout-test',
    name: 'ABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZABCDEFGHIJKLMNOPQRSTUVWXYZAB',
    items: ['eggs'],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    tags: ['saved'],
  }])));
  await page.reload();

  const longNameLayout = await page.locator('[data-meal-card="long-name-layout-test"]').evaluate((card) => {
    const header = card.querySelector('.meal-card-head');
    const titleGroup = header.querySelector('h3').parentElement;
    const actions = header.querySelector('.meal-card-actions');
    return {
      titleWidthDelta: Math.abs(header.getBoundingClientRect().width - titleGroup.getBoundingClientRect().width),
      actionsBelowTitle: actions.getBoundingClientRect().top >= titleGroup.getBoundingClientRect().bottom,
      cardOverflow: card.scrollWidth - card.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(longNameLayout.titleWidthDelta).toBeLessThanOrEqual(2);
  expect(longNameLayout.actionsBelowTitle).toBe(true);
  expect(longNameLayout.cardOverflow).toBeLessThanOrEqual(1);
  expect(longNameLayout.pageOverflow).toBeLessThanOrEqual(1);
});

test('mobile evidence badges do not squeeze protocol card titles', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/protocol.html');
  await page.evaluate(() => document.querySelectorAll('details').forEach((details) => { details.open = true; }));

  const layouts = await page.locator('.stack-card-head').evaluateAll((headers) => headers
    .filter((header) => header.querySelector('.evidence-badge'))
    .map((header) => {
      const title = header.querySelector('.stack-card-title-group');
      const badge = header.querySelector('.evidence-badge');
      const headerRect = header.getBoundingClientRect();
      const titleRect = title.getBoundingClientRect();
      const badgeRect = badge.getBoundingClientRect();
      return {
        titleWidthDelta: Math.abs(headerRect.width - titleRect.width),
        badgeBelowTitle: badgeRect.top >= titleRect.bottom,
        overflow: header.scrollWidth - header.clientWidth,
      };
    }));

  expect(layouts.length).toBeGreaterThan(0);
  layouts.forEach((layout) => {
    expect(layout.titleWidthDelta).toBeLessThanOrEqual(2);
    expect(layout.badgeBelowTitle).toBe(true);
    expect(layout.overflow).toBeLessThanOrEqual(1);
  });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
});

test('planner mode uses one equal-width segmented selection', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/stack.html');
    const control = page.locator('[data-segmented-control]');
    const initial = await control.evaluate((node) => {
      const options = [...node.querySelectorAll('[data-planner-mode]')];
      const pseudo = getComputedStyle(node, '::before');
      return {
        active: node.dataset.segmentedActive,
        role: node.getAttribute('role'),
        pressed: node.querySelectorAll('[aria-pressed="true"]').length,
        widths: options.map((option) => option.getBoundingClientRect().width),
        transform: pseudo.transform,
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(initial.role).toBe('group');
    expect(initial.active).toBe('meals');
    expect(initial.pressed).toBe(1);
    expect(initial.widths[0]).toBeCloseTo(initial.widths[1], 1);
    expect(initial.overflow).toBeLessThanOrEqual(1);

    await control.getByRole('button', { name: /Quick add/ }).click();
    await expect(control).toHaveAttribute('data-segmented-active', 'quick-add');
    await expect(control.getByRole('button', { name: /Quick add/ })).toHaveAttribute('aria-pressed', 'true');
    await expect(control.locator('[aria-pressed="true"]')).toHaveCount(1);
    const moved = await control.evaluate((node) => getComputedStyle(node, '::before').transform);
    expect(moved).not.toBe(initial.transform);

    await control.getByRole('button', { name: /Quick add/ }).press('Home');
    await expect(control).toHaveAttribute('data-segmented-active', 'meals');
    await expect(control.getByRole('button', { name: /Meals/ })).toHaveAttribute('aria-pressed', 'true');
    await control.getByRole('button', { name: /Meals/ }).press('End');
    await expect(control).toHaveAttribute('data-segmented-active', 'quick-add');
  }
});

test('meal and Quick Add cards toggle from their content', async ({ page }) => {
  await page.goto('/pages/stack.html');

  const mealCard = page.locator('.meal-library-grid .meal-card').nth(1);
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'false');
  await mealCard.locator('h3').click();
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('button', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  await expect(quickCard.locator('[data-quick-item]')).toHaveAttribute('aria-pressed', 'false');
  await quickCard.locator('strong').click();
  await expect(quickCard.locator('[data-quick-item]')).toHaveAttribute('aria-pressed', 'true');
});

test('serving actions progressively appear after an item is selected', async ({ page }) => {
  await page.goto('/pages/stack.html');

  const mealCard = page.locator('.meal-library-grid .meal-card').nth(1);
  const mealServingToggle = mealCard.locator('[data-meal-serving-toggle]');
  await expect(mealServingToggle).toBeHidden();
  await mealCard.locator('h3').click();
  await expect(mealServingToggle).toBeVisible();
  await expect(mealServingToggle).toHaveText('Adjust servings');

  await page.getByRole('button', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  const quickServingToggle = quickCard.locator('[data-quick-serving-toggle]');
  await expect(quickServingToggle).toBeHidden();
  await quickCard.locator('strong').click();
  await expect(quickServingToggle).toBeVisible();
  await expect(quickServingToggle).toHaveText('Adjust servings');
});

test('meal ingredients have independent serving controls', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const mealCard = page.locator('.meal-library-grid .meal-card').first();
  const ingredientControls = mealCard.locator('[data-portion-scope="meal-item"]');
  const mealControl = mealCard.locator('[data-portion-scope="meal"]');
  await expect(ingredientControls).toHaveCount(4);
  await expect(mealControl).toBeHidden();
  await expect(mealCard.locator('[data-meal-serving-toggle]')).toHaveText('Adjust servings');
  await mealCard.locator('[data-meal-serving-toggle]').click();
  await expect(ingredientControls.first()).toBeVisible();
  await expect(mealControl.locator('[data-portion-input]')).toHaveValue('1');

  await mealControl.locator('[data-portion-action="increase"]').click();
  await expect(mealControl.locator('[data-portion-input]')).toHaveValue('1.25');

  const firstInput = ingredientControls.nth(0).locator('[data-portion-input]');
  const secondInput = ingredientControls.nth(1).locator('[data-portion-input]');
  await firstInput.fill('2');
  await firstInput.blur();
  await expect(firstInput).toHaveValue('2');
  await expect(secondInput).toHaveValue('1');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-current')));
  expect(saved.mealItemQuantities['chia-protein-oatmeal'].whey).toBe(2);
});

test('Quick Add includes Natural Smooth Peanut Butter', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('button', { name: /Quick add/ }).click();
  await page.locator('[data-planner-search]').fill('peanut');
  await expect(page.locator('.quick-item-grid .builder-item')).toHaveCount(1);
  await expect(page.locator('.quick-item-grid .builder-item').first()).toContainText('Natural Smooth Peanut Butter');
});

test('coverage omits removed nutrient requirements', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const coverage = page.locator('[data-coverage]');
  for (const nutrient of ['Linoleic acid', 'Copper', 'Phosphorus', 'Manganese', 'Molybdenum', 'Chloride', 'Sodium', 'Vitamin B6', 'Vitamin E', 'Vitamin K', 'Riboflavin (B2)', 'Niacin (B3)', 'Pantothenic acid (B5)', 'Biotin (B7)']) {
    await expect(coverage).not.toContainText(nutrient);
  }
});

test('Daily Plan progressively presents nutrient gaps', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const mobile = page.viewportSize().width <= 767;
  const coverage = mobile ? page.locator('[data-mobile-coverage-panel]') : page.locator('.plan-readout');
  if (mobile) await coverage.locator('> summary').click();
  await expect(coverage.locator('.coverage-priority')).toBeVisible();
  await expect(coverage.locator('.coverage-priority-item')).toHaveCount(3);
  await expect(coverage.locator('.coverage-all')).not.toHaveAttribute('open', '');
  await expect(coverage.locator('.coverage-all > summary')).toContainText('All nutrient coverage');
  await expect(coverage.locator('.coverage-priority-item').first()).toContainText('Food-first:');
});

test('Clear plan uses centered confirmation and a layout-independent toast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  await page.locator('.meal-library-grid .meal-card').nth(1).locator('h3').click();
  const clear = page.locator('[data-clear-stack]');
  await clear.scrollIntoViewIfNeeded();
  const before = await clear.boundingBox();

  await clear.click();
  const dialog = page.locator('.ui-confirm-dialog');
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  expect(Math.abs(dialogBox.x - (390 - dialogBox.width) / 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(dialogBox.y - (844 - dialogBox.height) / 2)).toBeLessThanOrEqual(1);

  await dialog.locator('[data-confirm-submit]').click();
  const toast = page.locator('[data-ui-toast]');
  await expect(toast).toHaveText('Today’s plan cleared');
  await expect(toast).toHaveClass(/is-visible/);
  expect(await toast.evaluate((node) => !node.closest('.planner-controls'))).toBe(true);
  const after = await clear.boundingBox();
  expect(after).not.toBeNull();
  expect(after.x).toBe(before.x);
  expect(after.width).toBe(before.width);
  expect(after.height).toBe(before.height);
  expect(after.y).toBeGreaterThanOrEqual(0);
  expect(after.y + after.height).toBeLessThanOrEqual(844);
});

test('global toast stack keeps typed messages accessible and promotes queued items', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const { showToast } = await import('/js/components/ui.js');
    await showToast('Saved', { type: 'success', duration: 30_000 });
    await showToast('Review this', { type: 'warning', duration: 30_000 });
    await showToast('Could not sync', { type: 'error', persistent: true });
    await showToast('Queued update', { type: 'info', duration: 30_000 });
  });

  const region = page.locator('[data-ui-toast]');
  await expect(region).toHaveClass(/is-visible/);
  await expect(region.locator('[data-ui-toast-item]')).toHaveCount(3);
  await expect(region.locator('[data-ui-toast-item]').first()).toHaveAttribute('data-ui-toast-type', 'info');
  await expect(region.locator('[data-ui-toast-item][data-ui-toast-type="error"]')).toHaveAttribute('role', 'alert');
  await expect(region.locator('[data-ui-toast-item] [data-ui-toast-dismiss]')).toHaveCount(3);

  await region.locator('[data-ui-toast-item]').first().locator('[data-ui-toast-dismiss]').click();
  await expect(region.locator('[data-ui-toast-item]')).toHaveCount(3);
  await expect(region).toContainText('Could not sync');
  await expect(region).toContainText('Queued update');
});

test('toast timers pause for interaction and actions dismiss the toast', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(async () => {
    const { showToast } = await import('/js/components/ui.js');
    await showToast('Short-lived', { type: 'success', duration: 600 });
    await showToast('Needs attention', { type: 'info', duration: 30_000, action: {
      label: 'Retry',
      onClick: () => { window.__toastActionCalled = true; },
    } });
    await showToast('Persistent failure', { type: 'error', persistent: true, duration: 160 });
  });

  const region = page.locator('[data-ui-toast]');
  const shortLived = region.locator('[data-ui-toast-item]', { hasText: 'Short-lived' });
  await shortLived.hover();
  await page.waitForTimeout(240);
  await expect(shortLived).toHaveClass(/is-visible/);
  await page.mouse.move(2, 2);
  await expect(shortLived).not.toHaveClass(/is-visible/, { timeout: 1_000 });

  const actionToast = region.locator('[data-ui-toast-item]', { hasText: 'Needs attention' });
  await actionToast.locator('[data-ui-toast-action]').click();
  await expect.poll(() => page.evaluate(() => window.__toastActionCalled)).toBe(true);
  await expect(actionToast).not.toHaveClass(/is-visible/);

  const persistent = region.locator('[data-ui-toast-item]', { hasText: 'Persistent failure' });
  await expect(persistent).toHaveClass(/is-visible/);
  await persistent.locator('[data-ui-toast-dismiss]').click();
  await expect(persistent).not.toBeVisible();
});

test('destructive confirmation keeps focus and requires an explicit dismissal', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  const clear = page.locator('[data-clear-stack]');
  await clear.scrollIntoViewIfNeeded();
  await clear.click();

  const dialog = page.locator('.ui-confirm-dialog');
  await expect(dialog).toHaveAttribute('closedby', 'closerequest');
  await expect(dialog.locator('h2')).toHaveAttribute('id', 'confirm-dialog-title');
  await expect(dialog.locator('[data-confirm-cancel]')).toBeFocused();
  const box = await dialog.boundingBox();
  expect(box.width).toBeLessThanOrEqual(520);
  expect(Math.abs(box.x - (390 - box.width) / 2)).toBeLessThanOrEqual(1);

  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(clear).toBeFocused();
});

test('save-meal modal supports light dismiss and returns focus to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  await page.getByRole('button', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  await quickCard.locator('strong').click();
  const trigger = page.locator('[data-meal-compose-open]');
  await expect(trigger).toBeEnabled();
  await trigger.click();

  const dialog = page.locator('.meal-save-dialog');
  await expect(dialog).toHaveAttribute('closedby', 'any');
  await expect(dialog.locator('[data-meal-dialog-name]')).toBeFocused();
  const box = await dialog.boundingBox();
  expect(box.width).toBeLessThanOrEqual(520);
  expect(Math.abs(box.x - (390 - box.width) / 2)).toBeLessThanOrEqual(1);

  await page.mouse.click(2, 2);
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
});

test('first-time Nutrition state identifies the example and can start blank', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-starter-example]')).toContainText('Starter example loaded');
  await page.locator('[data-start-blank]').click();
  await expect(page.locator('[data-starter-example]')).toHaveCount(0);
  await expect(page.locator('[data-planner-meal-count]')).toHaveText('0');
});

test('mobile homepage progressively reveals Longevity 101', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  await expect(page.locator('#longevity101-app li:visible')).toHaveCount(3);
  await page.locator('[data-longevity-toggle]').click();
  await expect(page.locator('#longevity101-app li:visible')).toHaveCount(10);
});

test('mobile Health prep is scan-first and expandable', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/blood.html');
  const prep = page.locator('[data-blood-prep]');
  await expect(prep).not.toHaveAttribute('open', '');
  await prep.locator('> summary').click();
  await expect(prep).toHaveAttribute('open', '');
});

test('mobile Finance keeps visible tabs and one expanded combo', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/finance.html');
  await expect(page.locator('[data-finance-tab]:visible')).toHaveCount(3);
  await expect(page.locator('[data-finance-select]')).toHaveCount(0);
  await expect(page.locator('[data-invest-combo][open]')).toHaveCount(1);
  await page.getByRole('tab', { name: 'FIRE calculator' }).click();
  await expect(page.locator('#financeFire')).toBeVisible();
});

test('running workout exposes a mobile timer dock', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/workout.html');
  await page.getByRole('button', { name: 'Start session' }).first().click();
  const dock = page.locator('[data-mobile-timer-dock]');
  await expect(dock).toBeVisible();
  await expect(dock.locator('[data-mobile-timer-time]')).toContainText(':');
  await dock.getByRole('button', { name: 'Pause' }).click();
  await expect(dock.locator('[data-mobile-timer-phase]')).toContainText('Paused');
});
