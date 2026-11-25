// Install @antv/infographic@0.2.20 outside the project, then pass its dist/infographic.min.js here.
// Run with the repository's Playwright development dependency.
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';

const bundle = process.argv[2];
if (!bundle) {
  throw new Error('Pass the path to the AntV Infographic 0.2.20 browser bundle.');
}

const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  await page.setContent('<div id="canvas"></div>');
  await page.addScriptTag({ path: bundle });
  const artwork = await page.evaluate(async () => {
    const { Infographic, jsx, renderSVG, Group, Ellipse, Rect, Path } = AntVInfographic;
    const green = '#32664d';
    const lightGreen = '#91af9b';
    const gold = '#b87d3e';
    const canvas = '#fffdf7';
    const quiet = '#e8eee3';

    async function drawChart(syntax) {
      const chart = new Infographic({ container: '#canvas', width: 800, height: 420, padding: 8 });
      chart.render(syntax);
      const url = await chart.toDataURL({ type: 'svg' });
      chart.destroy();
      const svg = decodeURIComponent(url.slice(url.indexOf(',') + 1));
      return new DOMParser().parseFromString(svg, 'image/svg+xml');
    }

    // The page carries the labels and numbers as HTML. Export only the chart geometry.
    const pie = await drawChart(`infographic chart-pie-donut-plain-text
data
  values
    - label Greens
      value 50
    - label Lentils
      value 25
    - label Fish
      value 25
theme
  palette ${green} ${gold} ${lightGreen}`);
    const sectors = [...pie.querySelectorAll('path[width][fill]')];
    if (sectors.length !== 3) throw new Error('Expected three plate sectors.');
    const plate = renderSVG(jsx(Group, { children: [
      jsx(Ellipse, { x: -149, y: -149, width: 298, height: 298, fill: canvas, stroke: lightGreen, strokeWidth: 1 }),
      ...sectors.map((sector) => jsx(Path, {
        d: sector.getAttribute('d'), fill: sector.getAttribute('fill'), stroke: canvas, strokeWidth: 4,
      })),
    ] }), { viewBox: '-150 -150 300 300' });

    const barChart = await drawChart(`infographic chart-bar-plain-text
data
  values
    - label Per 100 mL
      value 8
    - label Whole 500 mL bottle
      value 40
theme
  palette ${green} ${gold}`);
    const bars = [...barChart.querySelectorAll(`rect[fill="${green}"], rect[fill="${gold}"]`)];
    if (bars.length !== 2) throw new Error('Expected two sugar bars.');
    const widths = bars.map((bar) => Number(bar.getAttribute('width')));
    const sugar = renderSVG(jsx(Group, {
      children: bars.flatMap((bar, index) => {
        const y = 9 + index * 36;
        return [
          jsx(Rect, { x: 0, y, width: 200, height: 18, rx: 4, fill: quiet }),
          jsx(Rect, { x: 0, y, width: 200 * widths[index] / Math.max(...widths), height: 18, rx: 4, fill: bar.getAttribute('fill') }),
        ];
      }),
    }), { viewBox: '0 0 200 72', preserveAspectRatio: 'none' });

    const report = renderSVG(jsx(Group, { children: [
      jsx(Rect, { x: 1, y: 1, width: 62, height: 62, rx: 15, fill: quiet, stroke: lightGreen }),
      jsx(Rect, { x: 16, y: 11, width: 31, height: 42, rx: 4, fill: canvas, stroke: green, strokeWidth: 2 }),
      jsx(Path, { d: 'M22 21h19m-19 7h19', stroke: green, strokeWidth: 2, strokeLinecap: 'round' }),
      jsx(Rect, { x: 22, y: 35, width: 8, height: 9, rx: 2, fill: green }),
      jsx(Rect, { x: 33, y: 35, width: 8, height: 9, rx: 2, fill: gold }),
    ] }), { viewBox: '0 0 64 64' });

    const walkingWeek = renderSVG(jsx(Group, { children:
      Array.from({ length: 5 }, (_, day) => {
        const x = day * 80 + 4;
        return jsx(Group, { children: [
          jsx(Rect, { x, y: 1, width: 72, height: 52, rx: 9, fill: canvas, stroke: lightGreen }),
          ...Array.from({ length: 3 }, (_, walk) => jsx(Rect, {
            x: x + 10, y: 10 + walk * 13, width: 52, height: 8, rx: 4, fill: green,
          })),
        ] });
      }),
    }), { viewBox: '0 0 400 54' });

    return { 'meal-plate': plate, 'sugar-scale': sugar, 'report-pair': report, 'walking-week': walkingWeek };
  });

  const destination = new URL('../images/infographics/', import.meta.url);
  await mkdir(destination, { recursive: true });
  await Promise.all(Object.entries(artwork).map(([name, svg]) =>
    writeFile(new URL(`${name}.svg`, destination), `${svg}\n`)));
} finally {
  await browser.close();
}
