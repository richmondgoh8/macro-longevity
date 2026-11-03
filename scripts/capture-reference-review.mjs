import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import assert from 'node:assert/strict';

// Reproducible screenshots, not a claim of clinical approval or automatic visual review.
const base = process.argv[2] || 'http://127.0.0.1:4173/';
const output = resolve(process.argv[3] || 'test-results/reference-review');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const manifest = { base, captured: new Date().toISOString(), captureStyle: 'Hide unrelated navigation only while capturing tall section elements; regular viewport/layout checks retain it.', sections: [], rangeSheets: [], cards: [], errors: [] };
try {
  for (const width of [1440, 390]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block', reducedMotion: 'reduce' });
    const page = await context.newPage();
    page.on('pageerror', error => manifest.errors.push(error.message));
    await page.goto(base);
    await page.evaluate(() => document.fonts.ready);
    const groups = await page.locator('[data-reference-group]').evaluateAll(nodes => nodes.map(node => node.dataset.referenceGroup));
    assert.equal(groups.length, 7);
    for (const units of ['local', 'alternate']) {
      await page.locator(`[data-reference-units="${units}"]`).click();
      for (const group of groups) {
        const file = `${width}-${units}-${group}.png`;
        await page.locator(`#reference-${group}`).screenshot({ path: join(output, file), style: '.nav,.bottom-nav,.sg-reference-rail{visibility:hidden!important}' });
        manifest.sections.push({ width, units, group, file });
      }
    }
    if (process.argv.includes('--sections-only')) { await context.close(); continue; }
    await page.locator('[data-reference-units="local"]').click();
    const picker = page.locator('.sg-reference-picker');
    if (await picker.getAttribute('open') === null) await picker.locator('summary').click();
    await page.locator('[data-reference-show-all]').click();
    await page.locator('[data-complete-references="true"]').waitFor();
    const cards = page.locator('[data-reference-card]');
    assert.equal(await cards.count(), 358);
    const sheet = await context.newPage();
    await sheet.setViewportSize({ width: 1800, height: 900 });
    let items = [];
    for (let i = 0; i < await cards.count(); i++) {
      const card = cards.nth(i);
      const id = await card.getAttribute('data-reference-card');
      const label = await card.locator('header').innerText();
      const range = card.locator('[data-reference-scale]');
      const audit = await range.evaluate(node => ({ text: node.innerText, width: node.clientWidth, overflow: node.scrollWidth > node.clientWidth + 1, label: node.querySelector('dt')?.textContent, value: node.querySelector('dd')?.textContent }));
      assert.ok(audit.label?.trim() && audit.value?.trim(), `${id}: missing reference`);
      assert.equal(audit.overflow, false, `${id}: range overflow`);
      const image = await range.screenshot();
      const file = `${width}-range-${id}.png`;
      await writeFile(join(output, file), image);
      manifest.cards.push({ width, id, file, ...audit });
      items.push(`<figure><figcaption>${label.replace(/[&<>]/g, value => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[value]))} · ${id}</figcaption><img src="data:image/png;base64,${image.toString('base64')}" alt=""></figure>`);
      if (items.length === 18 || i === await cards.count() - 1) {
        const file = `${width}-ranges-${String(Math.floor(i / 18) + 1).padStart(2, '0')}.png`;
        await sheet.setContent(`<style>body{margin:16px;background:#eef4ee;font:15px sans-serif}main{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}figure{margin:0;padding:12px;background:white;border:1px solid #cbd9ce;border-radius:12px;align-self:start}figcaption{font-weight:700;margin-bottom:12px}img{display:block;max-width:100%;height:auto}</style><main>${items.join('')}</main>`);
        await sheet.screenshot({ path: join(output, file), fullPage: true });
        manifest.rangeSheets.push({ width, file });
        items = [];
      }
      if ((i + 1) % 50 === 0) console.log(`${width}px: captured ${i + 1}/358 reference displays`);
    }
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${width}: page overflow`);
    await context.close();
  }
  assert.deepEqual(manifest.errors, []);
} finally {
  await browser.close();
  await writeFile(join(output, process.argv.includes('--sections-only') ? 'sections-manifest.json' : 'manifest.json'), JSON.stringify(manifest, null, 2));
}
console.log(JSON.stringify({ output, sections: manifest.sections.length, rangeSheets: manifest.rangeSheets.length, rangeDisplays: manifest.cards.length, errors: manifest.errors }));
