// Reproduce PNG install icons from the existing brand SVG, without a new design dependency.
import { chromium } from 'playwright';
import { mkdir, readFile } from 'node:fs/promises';

const source = await readFile(new URL('../favicon.svg', import.meta.url), 'utf8');
const output = new URL('../icons/', import.meta.url);
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
try {
  const page = await browser.newPage({ deviceScaleFactor: 1 });
  for (const [size, name] of [[192, 'app-192.png'], [512, 'app-512.png'], [180, 'apple-touch-icon.png']]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent('<style>body{margin:0}canvas{display:block}</style><canvas></canvas>');
    await page.evaluate(async ({ source, size }) => {
      const canvas = document.querySelector('canvas');
      canvas.width = canvas.height = size;
      const context = canvas.getContext('2d');
      const image = new Image();
      image.src = `data:image/svg+xml;base64,${btoa(source)}`;
      await image.decode();
      context.fillStyle = '#0F766E';
      context.fillRect(0, 0, size, size);
      context.drawImage(image, 0, 0, size, size);
    }, { source, size });
    await page.locator('canvas').screenshot({ path: new URL(name, output).pathname });
  }
} finally {
  await browser.close();
}
