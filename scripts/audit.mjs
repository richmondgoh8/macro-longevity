import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const pages = ['index.html', 'pages/stack.html', 'pages/blood.html', 'pages/protocol.html', 'pages/workout.html', 'pages/finance.html', 'pages/avoid.html'];
const required = ['css/variables.css', 'css/style.css', 'sw.js', 'manifest.json', 'offline.html', 'robots.txt', 'sitemap.xml', '_headers', 'js/register-sw.js'];
const failures = [];

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function check(condition, message) {
  if (!condition) failures.push(message);
}

required.forEach((file) => check(fs.existsSync(path.join(root, file)), `Missing required file: ${file}`));

pages.forEach((file) => {
  const html = read(file);
  check(!/<(?:button|select|form)[^>]+\bon(?:click|change|submit)\s*=/i.test(html), `${file}: inline event handler found`);
  check(!/<script\s*>/i.test(html), `${file}: inline script block found`);
  check(/script-src 'self'(?:;|')/.test(html), `${file}: strict script CSP missing`);
  check(!/script-src 'self' 'unsafe-inline'/.test(html), `${file}: unsafe inline script CSP remains`);
  check(/rel="canonical"/.test(html), `${file}: canonical URL missing`);
  check(/src="\/js\/register-sw\.js"/.test(html), `${file}: service-worker bootstrap missing`);
});

const finance = read('pages/finance.html');
const financeInputIds = [...finance.matchAll(/<input[^>]+id="([^"]+)"/g)].map((match) => match[1]);
financeInputIds.forEach((id) => check(new RegExp(`<label[^>]+for="${id}"`).test(finance), `pages/finance.html: missing label for #${id}`));
check((finance.match(/<h1\b/g) || []).length === 1, 'pages/finance.html: expected exactly one h1');
check(finance.includes('aria-labelledby="fireChartTitle fireChartDesc"'), 'pages/finance.html: chart accessible naming missing');

const stack = read('js/stack.js');
check(!/onclick=|onchange=/.test(stack), 'js/stack.js: inline event handler found');
check(stack.includes('role="tablist"'), 'js/stack.js: tablist semantics missing');

const sw = read('sw.js');
const assets = [...sw.matchAll(/'([^']+)'/g)].map((match) => match[1]).filter((asset) => asset.startsWith('/'));
assets.forEach((asset) => check(fs.existsSync(path.join(root, asset.slice(1))), `sw.js: precached asset missing: ${asset}`));

const financeData = read('js/data/finance.js');
check(!/Zero chance of loss/i.test(financeData), 'js/data/finance.js: absolute loss claim remains');
check(read('css/variables.css').includes('--tint-secondary-12:'), 'css/variables.css: conditional tint token missing');

const javascriptFiles = [
  'js/data/stack.js', 'js/data/blood.js', 'js/data/workout.js', 'js/data/finance.js',
  'js/data/pillars.js', 'js/data/protocol.js', 'js/data/singapore.js', 'js/stack.js',
  'js/blood.js', 'js/render.js', 'js/export.js', 'js/home.js', 'js/protocol.js',
  'js/icons.js', 'js/theme.js', 'js/finance.js', 'js/register-sw.js', 'sw.js',
  'js/components/card-swipe.js',
];
javascriptFiles.forEach((file) => {
  const result = spawnSync(process.execPath, ['--check', file], { cwd: root, encoding: 'utf8' });
  check(result.status === 0, `${file}: node --check failed${result.stderr ? ` (${result.stderr.trim()})` : ''}`);
});

if (failures.length) {
  console.error(`Audit failed with ${failures.length} issue(s):`);
  failures.forEach((failure) => console.error(`- ${failure}`));
  process.exitCode = 1;
} else {
  console.log(`Audit passed: ${pages.length} pages, ${javascriptFiles.length} JavaScript files, and ${assets.length} precached assets checked.`);
}
