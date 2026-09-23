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

test('protocol destination cards retain links without decorative pointer effects', async ({ page }) => {
  await page.goto('/');
  const cards = page.locator('.hero-pillar-card');
  await expect(cards).toHaveCount(4);
  for (const card of await cards.all()) await expect(card).toHaveAttribute('href', /^\/pages\//);
  expect(await cards.first().evaluate(n => getComputedStyle(n, '::before').display)).toBe('none');
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
    expect(state.navBorderBottomColor).toBe('rgb(212, 221, 211)');
    expect(state.activeBackground).toBe('rgba(0, 0, 0, 0)');
    expect(state.activeShadow).toContain('0px -2px');
    expect(state.afterContent).toBe('none');
  }

  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of routes) {
    await page.goto(route);
    const state = await page.locator('.bottom-nav-item.active').evaluate((active) => {
      const style = getComputedStyle(active);
      return { background: style.backgroundColor, shadow: style.boxShadow };
    });
    expect(state.background).toBe('rgb(237, 243, 236)');
    expect(state.shadow).toBe('none');
  }
});

test('long routes expose one sticky section rail with stable targets', async ({ page }) => {
  const routes = [
    ['/pages/avoid.html', 3],
    ['/pages/blood.html', 7],
    ['/pages/protocol.html', 6],
    ['/pages/workout.html', 4],
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
  await page.locator('#protocol-screening').evaluate(node => node.scrollIntoView({ block: 'start' }));
  await expect(page.getByRole('link', { name: 'Screening' })).toHaveAttribute('aria-current', 'location');
  await page.getByRole('link', { name: 'Biology' }).click();
  await expect(page).toHaveURL(/#biology$/);
  await expect(page.getByRole('link', { name: 'Biology' })).toHaveAttribute('aria-current', 'location');
});

test('sticky rail controls mirror Training views', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/workout.html');
  await page.locator('.sticky-pin-link', { hasText: 'Strength' }).click();
  await expect(page.locator('[data-pillar-tab="strength"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('#section-strength')).toBeVisible();
  await expect(page.locator('.sticky-pin-link', { hasText: 'Strength' })).toHaveAttribute('aria-pressed', 'true');

});

test('sticky rail becomes a wrapped static list on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const route of ['/pages/avoid.html', '/pages/blood.html', '/pages/protocol.html', '/pages/workout.html']) {
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

test('Finance uses one padded tab system and a contained empty state', async ({ page }) => {
  for (const width of [390, 907, 1440]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/finance.html');
    await page.evaluate(() => localStorage.removeItem('passiveIncome'));
    await page.getByRole('tab', { name: 'Income tracker' }).click();
    await expect(page.locator('[data-sticky-pin-rail]')).toHaveCount(0);
    const layout = await page.evaluate(() => {
      const panel = document.querySelector('#piSection');
      const empty = panel.querySelector('.ui-empty-state');
      const tabs = document.querySelector('.ui-tabs');
      const button = empty.querySelector('[data-pi-action="add"]');
      const panelRect = panel.getBoundingClientRect();
      const emptyRect = empty.getBoundingClientRect();
      const buttonRect = button.getBoundingClientRect();
      const panelStyle = getComputedStyle(panel);
      return {
        panelPadding: parseFloat(panelStyle.paddingLeft),
        tabGap: parseFloat(getComputedStyle(tabs).gap),
        emptyInside: emptyRect.left >= panelRect.left && emptyRect.right <= panelRect.right,
        buttonInside: buttonRect.left >= emptyRect.left && buttonRect.right <= emptyRect.right,
        buttonAboveBottomNav: innerWidth >= 1100 || buttonRect.bottom + 8 <= document.querySelector('.bottom-nav').getBoundingClientRect().top,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(layout.panelPadding).toBeGreaterThanOrEqual(24);
    expect(layout.tabGap).toBeGreaterThanOrEqual(8);
    expect(layout.emptyInside).toBe(true);
    expect(layout.buttonInside).toBe(true);
    expect(layout.buttonAboveBottomNav).toBe(true);
    expect(layout.pageOverflow).toBeLessThanOrEqual(1);

    await page.getByRole('button', { name: 'Add asset' }).click();
    await expect(page.locator('.pi-table tbody tr')).toHaveCount(2);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
    for (const input of await page.locator('.pi-table input').all()) {
      expect(await input.evaluate((node) => {
        const rect = node.getBoundingClientRect();
        return rect.left >= 0 && rect.right <= innerWidth;
      })).toBe(true);
    }
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

test('training metrics keep Zone 2 range and labels inside their cells', async ({ page }) => {
  for (const viewport of [{ width: 390, height: 844 }, { width: 768, height: 900 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/pages/workout.html');
    const metrics = page.locator('.workout-metrics');
    await expect(metrics).toContainText('150–300');
    await expect(metrics).toContainText('Zone 2 min / week');
    const layout = await metrics.evaluate((node) => {
      const parent = node.getBoundingClientRect();
      return {
        overflow: node.scrollWidth - node.clientWidth,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        cells: [...node.children].map((cell) => {
          const cellRect = cell.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(cell);
          const textRect = range.getBoundingClientRect();
          return {
            inside: textRect.left >= cellRect.left - 1 && textRect.right <= cellRect.right + 1
              && textRect.top >= cellRect.top - 1 && textRect.bottom <= cellRect.bottom + 1,
            alignment: getComputedStyle(cell).alignItems,
            valueAlignment: getComputedStyle(cell.querySelector('strong')).textAlign,
            labelAlignment: getComputedStyle(cell.querySelector('span')).textAlign,
            width: cellRect.width,
            height: cellRect.height,
          };
        }),
        parentHeight: parent.height,
      };
    });
    expect(layout.overflow).toBeLessThanOrEqual(1);
    expect(layout.pageOverflow).toBeLessThanOrEqual(1);
    layout.cells.forEach((cell) => {
      expect(cell.inside).toBe(true);
      expect(cell.alignment).toBe('center');
      expect(cell.valueAlignment).toBe(cell.labelAlignment);
      expect(cell.width).toBeGreaterThanOrEqual(64);
      expect(cell.height).toBeGreaterThanOrEqual(44);
    });
    expect(layout.parentHeight).toBeGreaterThanOrEqual(64);
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
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pages/blood.html');
    const section = page.locator('.progressive-section').filter({ hasText: 'ApoB elevated? Options' });
    await section.locator('summary').click();
    await expect(section.locator('.apob-steps')).toHaveCount(0);
    await expect(section.locator('table.apob-table')).toBeVisible();
    await expect(section.locator('thead th')).toHaveCount(3);
    await expect(section.locator('tbody tr')).toHaveCount(8);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(1);
  }
});

test('Quick-add quantity controls and hover tips stay inside their bounds', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pages/stack.html');
    await page.evaluate(() => localStorage.removeItem('ml-daily-current'));
    await page.reload();
    await page.getByRole('tab', { name: /Quick add/ }).click();
    const card = page.locator('.quick-item-grid .builder-item').first();
    const toggle = card.locator('[data-quick-item]');
    if (await toggle.getAttribute('aria-pressed') !== 'true') await toggle.click();
    await toggle.hover();
    const canHover = await page.evaluate(() => window.matchMedia('(hover: hover) and (pointer: fine)').matches);
    if (canHover) await expect(card.locator('.ui-tooltip')).toHaveAttribute('data-tooltip-open', 'true');
    await card.locator('[data-nutrition-detail-open]').click();
    const dialog = page.locator('[data-nutrition-detail-dialog]');
    await expect(dialog).toBeVisible();
    const bounds = await page.evaluate(() => {
      const dialog = document.querySelector('[data-nutrition-detail-dialog]');
      const control = dialog.querySelector('.gram-control, .portion-control');
      const gram = Boolean(control?.matches('.gram-control'));
      const minus = control.querySelector(gram ? '[data-gram-action="decrease"]' : '[data-portion-action="decrease"]');
      const plus = control.querySelector(gram ? '[data-gram-action="increase"]' : '[data-portion-action="increase"]');
      const rect = (node) => node.getBoundingClientRect();
      const dialogRect = rect(dialog);
      const controlRect = rect(control);
      const minusRect = rect(minus);
      const plusRect = rect(plus);
      return {
        controlsInsideDialog: controlRect.left >= dialogRect.left && controlRect.right <= dialogRect.right
          && minusRect.left >= dialogRect.left && plusRect.right <= dialogRect.right,
        dialogInsideViewport: dialogRect.left >= 0 && dialogRect.right <= window.innerWidth,
        gram,
        cardHeights: [...document.querySelectorAll('.quick-item-grid .builder-item')].slice(0, 12).map((node) => Math.round(node.getBoundingClientRect().height)),
      };
    });
    expect(bounds.controlsInsideDialog).toBe(true);
    expect(bounds.dialogInsideViewport).toBe(true);
    expect(new Set(bounds.cardHeights).size).toBe(1);
    if (bounds.gram) {
      const beforeGrams = Number(await dialog.locator('[data-gram-input]').inputValue());
      await dialog.locator('[data-gram-action="increase"]').click();
      await expect(dialog.locator('[data-gram-input]')).toHaveValue(String(beforeGrams + 5));
    } else {
      const beforePortion = Number(await dialog.locator('[data-portion-input]').inputValue());
      await dialog.locator('[data-portion-action="increase"]').click();
      await expect(dialog.locator('[data-portion-input]')).toHaveValue(String(beforePortion + 0.25));
    }
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

  await page.getByRole('tab', { name: /Quick add/ }).click();
  await search.fill('sardn');
  const quickResults = page.locator('.quick-item-grid .builder-item');
  await expect(quickResults).toHaveCount(1);
  await expect(quickResults.first()).toContainText('Sardines with bones');
  const quickGrid = await page.locator('.quick-item-grid').evaluate((node) => ({
    maxHeight: getComputedStyle(node).maxHeight,
    height: node.getBoundingClientRect().height,
    scrollHeight: node.scrollHeight,
    cardPadding: parseFloat(getComputedStyle(node.querySelector('.builder-item')).paddingTop),
  }));
  expect(quickGrid.maxHeight).toBe('none');
  expect(quickGrid.scrollHeight).toBeLessThanOrEqual(quickGrid.height + 1);
  expect(quickGrid.cardPadding).toBeLessThanOrEqual(24);

  await page.getByRole('tab', { name: /Meals/ }).click();
  await expect(search).toHaveValue('');
  await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(6);
  await search.fill('salmon');
  await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(1);
  await expect(page.locator('.meal-library-grid .meal-card').first()).toContainText('Salmon, greens & potato');
});

test('meal management actions stay in the detail dialog', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/stack.html');
    await page.evaluate(() => {
      localStorage.removeItem('ml-daily-meal-library');
      localStorage.setItem('ml-daily-meals', JSON.stringify([{
        id: 'weekday-bowl',
        name: 'Weekday bowl',
        items: ['eggs'],
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        tags: ['saved'],
      }]));
    });
    await page.reload();

    await expect(page.locator('.meal-library-grid .meal-card')).toHaveCount(7);
    await expect(page.locator('.meal-library-grid [data-meal-pin]')).toHaveCount(0);
    const preset = page.locator('[data-meal-card="chia-protein-oatmeal"]');
    await expect(preset.locator('.meal-card-actions [data-meal-toggle]')).toHaveCount(1);
    await expect(preset.locator('.meal-card-body-detail')).toHaveAttribute('role', 'button');

    await preset.locator('.meal-card-body-detail').click();
    const dialog = page.locator('[data-nutrition-detail-dialog]');
    await expect(dialog).toBeVisible();
    const presetPin = dialog.locator('[data-meal-pin]');
    await expect(presetPin).toHaveText('Pin meal');
    await presetPin.click();
    await expect(dialog.locator('[data-meal-pin]')).toHaveText('Unpin meal');
    await expect(dialog.locator('[data-meal-pin]')).toBeFocused();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-meal-library')).pinned.includes('chia-protein-oatmeal'))).toBe(true);
    await dialog.locator('[data-nutrition-detail-close]').click();
    await expect(dialog).not.toBeVisible();

    const madeMeal = page.locator('[data-meal-card="weekday-bowl"]');
    await madeMeal.locator('.meal-card-body-detail').click();
    await expect(dialog).toBeVisible();
    await dialog.locator('[data-meal-pin]').click();
    await expect.poll(() => page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-meals'))[0].pinned)).toBe(true);
    await dialog.locator('[data-nutrition-detail-close]').click();
    await expect(dialog).not.toBeVisible();

    await page.reload();
    await page.locator('[data-meal-card="chia-protein-oatmeal"] .meal-card-body-detail').click();
    await expect(page.locator('[data-nutrition-detail-dialog] [data-meal-pin]')).toHaveText('Unpin meal');
    await page.locator('[data-nutrition-detail-close]').click();
    await expect(dialog).not.toBeVisible();
    await page.locator('[data-meal-card="weekday-bowl"] .meal-card-body-detail').click();
    await expect(page.locator('[data-nutrition-detail-dialog] [data-meal-pin]')).toHaveText('Unpin meal');
  }
});

test('nutrition planner cards keep equal-height readable summaries', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/stack.html');

    const layouts = await page.locator('.meal-library-grid .meal-card').evaluateAll((cards) => cards.map((card) => {
      const title = card.querySelector('h3');
      const actions = card.querySelector('.meal-card-actions');
      const range = document.createRange();
      range.selectNodeContents(title);
      return {
        titleLines: range.getClientRects().length,
        controlSizes: [...actions.querySelectorAll('button')].map((button) => {
          const rect = button.getBoundingClientRect();
          return { width: rect.width, height: rect.height };
        }),
        bodyRole: card.querySelector('.meal-card-body-detail')?.getAttribute('role'),
        overflow: card.scrollWidth - card.clientWidth,
        height: Math.round(card.getBoundingClientRect().height),
      };
    }));

    expect(layouts).toHaveLength(6);
    // Equal height is a per-row requirement; mobile rows remain intrinsic.
    if (width === 1440) {
      expect(new Set(layouts.slice(0, 3).map(layout => layout.height)).size).toBe(1);
      expect(new Set(layouts.slice(3, 6).map(layout => layout.height)).size).toBe(1);
    }
    layouts.forEach((layout) => {
      expect(layout.titleLines).toBeLessThanOrEqual(2);
      expect(layout.bodyRole).toBe('button');
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
    return {
      titleWidthDelta: Math.abs(header.getBoundingClientRect().width - titleGroup.getBoundingClientRect().width),
      bodyRole: card.querySelector('.meal-card-body-detail')?.getAttribute('role'),
      cardOverflow: card.scrollWidth - card.clientWidth,
      pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  expect(longNameLayout.titleWidthDelta).toBeLessThanOrEqual(2);
  expect(longNameLayout.bodyRole).toBe('button');
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

test('planner mode uses equal-width underlined tabs', async ({ page }) => {
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width === 390 ? 844 : 900 });
    await page.goto('/pages/stack.html');
    const control = page.locator('[data-segmented-control]');
    const initial = await control.evaluate((node) => {
      const options = [...node.querySelectorAll('[data-planner-mode]')];
      const active = options.find((option) => option.getAttribute('aria-selected') === 'true');
      const pseudo = getComputedStyle(active, '::after');
      return {
        active: node.dataset.segmentedActive,
        role: node.getAttribute('role'),
        selected: node.querySelectorAll('[aria-selected="true"]').length,
        widths: options.map((option) => option.getBoundingClientRect().width),
        indicator: { background: pseudo.backgroundColor, height: pseudo.height },
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(initial.role).toBe('tablist');
    expect(initial.active).toBe('meals');
    expect(initial.selected).toBe(1);
    expect(initial.indicator.background).toBe('rgb(36, 107, 75)');
    expect(initial.indicator.height).toBe('3px');
    expect(initial.widths).toHaveLength(2);
    initial.widths.forEach((width) => expect(width).toBeCloseTo(initial.widths[0], 1));
    expect(initial.overflow).toBeLessThanOrEqual(1);

    await control.getByRole('tab', { name: /Quick add/ }).click();
    await expect(control).toHaveAttribute('data-segmented-active', 'quick-add');
    await expect(control.getByRole('tab', { name: /Quick add/ })).toHaveAttribute('aria-selected', 'true');
    await expect(control.locator('[aria-selected="true"]')).toHaveCount(1);

    await control.getByRole('tab', { name: /Quick add/ }).press('Home');
    await expect(control).toHaveAttribute('data-segmented-active', 'meals');
    await expect(control.getByRole('tab', { name: /Meals/ })).toHaveAttribute('aria-selected', 'true');
    await control.getByRole('tab', { name: /Meals/ }).press('End');
    await expect(control).toHaveAttribute('data-segmented-active', 'quick-add');
    await expect(control.getByRole('tab', { name: /Quick add/ })).toHaveAttribute('aria-selected', 'true');
  }
});

test('Deep library is a separate context destination', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/stack.html');
  await page.getByRole('navigation', { name: 'Nutrition' }).getByRole('link', { name: 'Deep library' }).click();
  await expect(page.locator('.deep-library-panel')).toBeVisible();
  await expect(page.locator('.stack-library')).toHaveCount(0);
  await expect(page.locator('[data-planner-mode]')).toHaveCount(0);
  await expect(page.getByRole('navigation', { name: 'Nutrition' }).getByRole('link', { name: 'Deep library' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('[data-coverage-bar]')).toHaveCount(0);
  await page.locator('.deep-library-panel').getByRole('tab', { name: 'Food & spices' }).click();
  await expect(page.locator('.deep-library-panel [data-library-tab="food-spices"]')).toHaveAttribute('aria-selected', 'true');
  await expect(page.locator('[data-library-content]')).toContainText('Beef Liver');
  await page.locator('.context-nav').getByRole('link', { name: 'Daily plan' }).click();
  await expect(page.locator('[data-planner-mode]')).toHaveCount(2);
  await expect(page.locator('.deep-library-panel')).toHaveCount(0);
  await expect(page.locator('[data-coverage-bar]')).toBeVisible();
});

test('compact coverage shows numeric macros at every width', async ({ page }) => {
  for (const width of [1440, 1024, 390]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/pages/stack.html');
    const strip = page.locator('[data-coverage-bar] .macro-progress-strip');
    await expect(strip.locator('[data-macro]')).toHaveCount(3);
    for (const macro of await strip.locator('[data-macro] strong').all()) await expect(macro).toContainText(/\d+ g/);
    await expect(strip).not.toContainText('Source ready');
    const before = await strip.textContent();
    await page.getByRole('tab', { name: /Quick add/ }).click();
    await page.locator('[data-quick-card="chicken"] [data-quick-item]').click();
    await expect(strip).not.toHaveText(before);
  }
});

test('coverage rail stays visible through the middle of planner scrolling', async ({ page }) => {
  for (const height of [900, 768, 700]) {
    await page.setViewportSize({ width: 1440, height });
    await page.goto('/pages/stack.html');
    const dock = page.locator('.coverage-gap-dock');

    await page.evaluate(() => window.scrollTo(0, 1000));
    await expect.poll(() => dock.evaluate((node) => Math.round(node.getBoundingClientRect().top))).toBeGreaterThanOrEqual(64);
    await expect.poll(() => dock.evaluate((node) => Math.round(node.getBoundingClientRect().bottom))).toBeLessThanOrEqual(height);
  }
});

test('coverage rail remains available at the footer boundary', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 842 });
  await page.goto('/pages/stack.html');
  const dock = page.locator('.coverage-gap-dock');

  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await expect.poll(() => dock.evaluate((node) => getComputedStyle(node).visibility)).toBe('visible');
  await expect.poll(() => dock.evaluate((node) => node.hasAttribute('inert'))).toBe(false);
  await expect(dock.getByRole('button', { name: /^Gaps/ })).toBeVisible();

  await page.evaluate(() => window.scrollTo(0, 1000));
  await expect.poll(() => dock.evaluate((node) => getComputedStyle(node).visibility)).toBe('visible');
  await expect.poll(() => dock.evaluate((node) => node.hasAttribute('inert'))).toBe(false);
});

test('Carbs and Fats remain numeric after clearing the plan', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/pages/stack.html');
  await page.locator('[data-clear-stack]').click();
  await page.locator('.ui-confirm-dialog [data-confirm-submit]').click();
  const strip = page.locator('.coverage-gap-dock .macro-progress-strip');
  await expect(strip.locator('[data-macro="carbs"] strong')).toContainText('0 g');
  await expect(strip.locator('[data-macro="fat"] strong')).toContainText('0 g');
  await expect(strip.locator('[data-macro="carbs"]')).toHaveAttribute('data-macro-state', 'empty');
  await expect(strip.locator('[data-macro="fat"]')).toHaveAttribute('data-macro-state', 'empty');
});

test('every builder item has numeric core macro data', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const result = await page.evaluate(async () => {
    const { BUILDER_ITEMS } = await import('/js/data/nutrition.js');
    return {
      count: BUILDER_ITEMS.length,
      missing: BUILDER_ITEMS.filter((item) => ['protein', 'carbs', 'fat'].some((macro) => !Number.isFinite(item.nutrients?.[macro]))).map((item) => item.id),
    };
  });
  expect(result.count).toBeGreaterThan(40);
  expect(result.missing).toEqual([]);

  await page.getByRole('tab', { name: /Quick add/ }).click();
  await page.locator('[data-quick-card="avocado"] [data-nutrition-detail-open]').click();
  const detail = page.locator('[data-nutrition-detail-dialog]');
  await expect(detail).toContainText('Total carbohydrate');
  await expect(detail).toContainText('Total fat');
  await detail.locator('[data-nutrition-detail-close]').click();
});

test('coverage dialog stays inside the viewport and its close control is actionable', async ({ page }) => {
  for (const viewport of [{ width: 1440, height: 842 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    await page.goto('/pages/stack.html');
    const coverage = viewport.width <= 767 ? page.locator('.plan-readout') : page.locator('.coverage-gap-dock');
    await coverage.getByRole('button', { name: 'All nutrients' }).click();
    const dialog = page.locator('[data-coverage-dialog]');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(viewport.width);
    expect(box.y + box.height).toBeLessThanOrEqual(viewport.height);
    await expect(dialog.locator('.ui-tooltip')).toHaveCount(0);
    await expect(dialog.locator('[data-coverage-dialog-close]')).toBeVisible();
    await dialog.locator('[data-coverage-dialog-close]').click();
    await expect(dialog).not.toBeVisible();
  }
});

test('meal and Quick Add cards open details with separate selection controls', async ({ page }) => {
  await page.goto('/pages/stack.html');

  const mealCard = page.locator('.meal-library-grid .meal-card').nth(1);
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'false');
  await mealCard.locator('.meal-card-body-detail').click();
  const dialog = page.locator('[data-nutrition-detail-dialog]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h2')).toContainText('Eggs, broccoli & potato');
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'false');
  await dialog.locator('[data-nutrition-detail-close]').click();
  await expect(dialog).not.toBeVisible();
  await mealCard.locator('[data-meal-toggle]').click();
  await expect(mealCard.locator('[data-meal-toggle]')).toHaveAttribute('aria-pressed', 'true');

  await page.getByRole('tab', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  await expect(quickCard.locator('[data-quick-item]')).toHaveAttribute('aria-pressed', 'false');
  await quickCard.locator('[data-nutrition-detail-open]').click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-detail-toggle="quick"]')).toHaveText('Add to plan');
  await dialog.locator('[data-nutrition-detail-close]').click();
  await expect(dialog).not.toBeVisible();
  await quickCard.locator('[data-quick-item]').click();
  await expect(quickCard.locator('[data-quick-item]')).toHaveAttribute('aria-pressed', 'true');
});

test('gram controls progressively appear inside the detail dialog', async ({ page }) => {
  await page.goto('/pages/stack.html');

  const mealCard = page.locator('.meal-library-grid .meal-card').nth(1);
  await mealCard.locator('.meal-card-body-detail').click();
  const dialog = page.locator('[data-nutrition-detail-dialog]');
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-gram-control]')).toHaveCount(0);
  await dialog.locator('[data-detail-toggle="meal"]').click();
  await expect(dialog.locator('[data-gram-control]')).toHaveCount(3);
  await expect(dialog.locator('[data-gram-input]').first()).toHaveValue('100');
  await expect(dialog.locator('[data-detail-toggle="meal"]')).toHaveText('Remove from plan');
  await dialog.locator('[data-nutrition-detail-close]').click();
  await expect(dialog).not.toBeVisible();

  await page.getByRole('tab', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  await quickCard.locator('[data-nutrition-detail-open]').click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('[data-gram-control]')).toHaveCount(0);
  await dialog.locator('[data-detail-toggle="quick"]').click();
  await expect(dialog.locator('[data-gram-control]')).toBeVisible();
});

test('meal ingredients have independent gram controls', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const mealCard = page.locator('.meal-library-grid .meal-card').first();
  await mealCard.locator('.meal-card-body-detail').click();
  const dialog = page.locator('[data-nutrition-detail-dialog]');
  await expect(dialog).toBeVisible();
  const ingredientControls = dialog.locator('[data-gram-control]');
  await expect(ingredientControls).toHaveCount(4);
  const firstInput = ingredientControls.nth(0).locator('[data-gram-input]');
  const secondInput = ingredientControls.nth(1).locator('[data-gram-input]');
  await expect(firstInput).toHaveValue('30');
  await expect(secondInput).toHaveValue('60');
  await firstInput.fill('60');
  await firstInput.press('Tab');
  await expect(firstInput).toHaveValue('60');
  await expect(secondInput).toHaveValue('60');
  const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('ml-daily-current')));
  expect(saved.mealItemGrams['chia-protein-oatmeal'].whey).toBe(60);
});

test('Quick Add includes Natural Smooth Peanut Butter', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.getByRole('tab', { name: /Quick add/ }).click();
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

test('nutrition coverage identifies Singapore references separately from planning targets', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const mobile = page.viewportSize().width <= 767;
  const coverage = mobile ? page.locator('.plan-readout') : page.locator('.plan-readout');
  await coverage.getByRole('button', { name: 'All nutrients' }).click();
  const dialog = page.locator('[data-coverage-dialog]');
  await expect(dialog.locator('.coverage-summary-note')).toContainText('HealthHub RDA');
  await expect(dialog.locator('.coverage-summary-note')).toContainText('DRI/AI or planning targets');
  await expect(dialog.locator('.coverage-summary-note a')).toHaveAttribute('href', 'https://www.healthhub.sg/well-being-and-lifestyle/food-diet-and-nutrition/recommended_dietary_allowances');
  await expect(dialog.locator('.coverage-row').filter({ hasText: 'Vitamin D' }).locator('.coverage-label')).toContainText('/ 2.5 mcg');
  await expect(dialog.locator('.coverage-row').filter({ hasText: 'Calcium' }).locator('.coverage-label')).toContainText('/ 800 mg');
  await dialog.locator('[data-coverage-dialog-close]').click();
});

test('nutrition coverage treats a rounded 80% as covered', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await page.evaluate(() => localStorage.setItem('ml-daily-current', JSON.stringify({
    mealIds: [],
    quickItemIds: ['eggs', 'milk'],
    mealQuantities: {},
    mealItemQuantities: {},
    quickItemQuantities: { eggs: 1.25, milk: 1.75 },
    bodyWeightKg: 75,
  })));
  await page.reload();
  const mobile = page.viewportSize().width <= 767;
  const coverage = mobile ? page.locator('.plan-readout') : page.locator('.plan-readout');
  await coverage.getByRole('button', { name: 'All nutrients' }).click();
  const choline = page.locator('[data-coverage-dialog] .coverage-row').filter({ hasText: 'Choline' });
  await expect(choline.locator('.coverage-fill')).toHaveAttribute('style', /width:80%/);
  await expect(choline).toHaveClass(/coverage-row-covered/);
  await page.locator('[data-coverage-dialog]').locator('[data-coverage-dialog-close]').click();
  await expect(coverage.locator('.coverage-priority-item').filter({ hasText: 'Choline' })).toHaveCount(0);
});

test('Daily Plan progressively presents nutrient gaps in a dialog', async ({ page }) => {
  await page.goto('/pages/stack.html');
  await expect(page.locator('[data-coverage-bar] .coverage-priority')).toHaveCount(0);
  await page.getByRole('button', { name: /^Gaps/ }).click();
  const dialog = page.locator('[data-coverage-dialog]');
  await expect(dialog.locator('.coverage-priority-item').first()).toContainText('Food-first:');
  expect(await dialog.locator('.coverage-priority-item').count()).toBeGreaterThan(0);
});

test('coverage settings, unresolved gaps and all nutrients open in modals', async ({ page }) => {
  await page.goto('/pages/stack.html');
  const dock = page.viewportSize().width <= 767 ? page.locator('.plan-readout') : page.locator('.coverage-gap-dock');
  const dialog = page.locator('[data-coverage-dialog]');

  await dock.getByRole('button', { name: 'Settings' }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h2')).toHaveText('Coverage settings');
  await expect(dialog.locator('[data-body-weight]')).toHaveValue('75');
  await dialog.locator('[data-coverage-dialog-close]').click();
  await expect(dialog).not.toBeVisible();

  await dock.getByRole("button", { name: /^Gaps/ }).click();
  const gap = dialog.locator('[data-coverage-open="gap"]').first();
  const gapName = await gap.locator('strong').innerText();
  await gap.click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h2')).toHaveText(gapName);
  await expect(dialog.locator('.coverage-priority-item .coverage-fill')).toBeVisible();
  await dialog.locator('[data-coverage-dialog-close]').click();
  await expect(dialog).not.toBeVisible();

  await dock.getByRole('button', { name: 'All nutrients' }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.locator('h2')).toHaveText('All nutrients');
  await expect(dialog.locator('.coverage-legend-item')).toHaveCount(4);
  await expect(dialog.locator('.coverage-all-modal .coverage-row')).toHaveCount(18);
  await dialog.locator('[data-coverage-dialog-close]').click();
  await expect(dialog).not.toBeVisible();
});

test('Clear plan uses centered confirmation and a layout-independent toast', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  const clear = page.locator('[data-clear-stack]');
  await clear.scrollIntoViewIfNeeded();
  const before = await clear.boundingBox();

  await clear.click();
  const dialog = page.locator('.ui-confirm-dialog');
  await expect(dialog).toBeVisible();
  const dialogBox = await dialog.boundingBox();
  const viewport = await page.evaluate(() => ({ width: document.documentElement.clientWidth, height: document.documentElement.clientHeight }));
  expect(Math.abs(dialogBox.x - (viewport.width - dialogBox.width) / 2)).toBeLessThanOrEqual(1);
  expect(Math.abs(dialogBox.y - (viewport.height - dialogBox.height) / 2)).toBeLessThanOrEqual(1);

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
  const viewport = await page.evaluate(() => ({ width: document.documentElement.clientWidth }));
  expect(box.width).toBeLessThanOrEqual(520);
  expect(Math.abs(box.x - (viewport.width - box.width) / 2)).toBeLessThanOrEqual(1);

  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).not.toBeVisible();
  await expect(clear).toBeFocused();
});

test('save-meal modal prevents accidental dismissal and returns focus to its trigger', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/pages/stack.html');
  await page.getByRole('tab', { name: /Quick add/ }).click();
  const quickCard = page.locator('.quick-item-grid .builder-item').first();
  await quickCard.locator('[data-quick-item]').click();
  const trigger = page.locator('[data-meal-compose-open]');
  await expect(trigger).toBeEnabled();
  await trigger.click();

  const dialog = page.locator('.meal-save-dialog');
  await expect(dialog).toHaveAttribute('closedby', 'closerequest');
  await expect(dialog.locator('[data-meal-dialog-name]')).toBeFocused();
  const box = await dialog.boundingBox();
  const viewport = await page.evaluate(() => ({ width: document.documentElement.clientWidth }));
  expect(box.width).toBeLessThanOrEqual(520);
  expect(Math.abs(box.x - (viewport.width - box.width) / 2)).toBeLessThanOrEqual(1);

  await page.mouse.click(2, 2);
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
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
