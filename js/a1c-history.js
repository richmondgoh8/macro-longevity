import { A1C_HISTORY_KEY } from './data/screening.js?v=3';

const panel = document.querySelector('[data-history]');
const form = panel.querySelector('form');
const status = panel.querySelector('[role="status"]');
const results = panel.querySelector('[data-history-results]');
const charts = panel.querySelector('[data-history-charts]');
const chartGrid = charts.querySelector('.history-chart-grid');
const dateField = form.elements.date;
const valueField = form.elements.value;
const unitField = form.elements.unit;

function readHistory() {
  return JSON.parse(localStorage.getItem(A1C_HISTORY_KEY) ?? '[]');
}

function svgElement(name, attributes = {}) {
  const element = document.createElementNS('http://www.w3.org/2000/svg', name);
  for (const [key, value] of Object.entries(attributes)) element.setAttribute(key, value);
  return element;
}

function chartFor(unit, entries) {
  const points = entries.filter((entry) => entry.unit === unit)
    .map(({ date, value }) => ({
      date, time: Date.parse(date), reading: value, value: Number(String(value).replace(',', '.')),
    }))
    .filter(({ time, value }) => Number.isFinite(time) && Number.isFinite(value) && value > 0)
    .sort((first, second) => first.time - second.time);
  if (points.length < 2 || points[0].time === points.at(-1).time) return null;

  const first = points[0];
  const last = points.at(-1);
  const { min, max } = points.reduce(({ min, max }, { value }) => ({
    min: Math.min(min, value), max: Math.max(max, value),
  }), { min: first.value, max: first.value });
  const chart = document.createElement('figure');
  chart.className = 'history-chart';
  const caption = document.createElement('figcaption');
  caption.textContent = `HbA1c (${unit})`;
  // The list below the chart contains every exact date, value, and original unit.
  const scales = document.createElement('div');
  scales.className = 'history-scales';
  scales.setAttribute('aria-hidden', 'true');
  const values = document.createElement('div');
  values.className = 'history-values';
  const dates = document.createElement('div');
  dates.className = 'history-dates';
  for (const [container, labels] of [[values, min === max ? [min] : [max, min]], [dates, [first.date, last.date]]]) {
    for (const label of labels) {
      const text = document.createElement('span');
      text.textContent = label;
      container.append(text);
    }
  }

  const plot = svgElement('svg', { viewBox: '0 0 320 112', class: 'history-plot', focusable: 'false' });
  plot.append(svgElement('path', { d: 'M 8 8 H 312 M 8 56 H 312 M 8 104 H 312' }));
  for (const point of points) {
    const x = 8 + 304 * (point.time - first.time) / (last.time - first.time);
    const y = min === max ? 56 : 104 - 96 * (point.value - min) / (max - min);
    const dot = svgElement('circle', { cx: x, cy: y, r: 4 });
    const title = svgElement('title');
    title.textContent = `${point.date} · ${point.reading} ${unit}`;
    dot.append(title);
    plot.append(dot);
  }
  scales.append(values, plot, dates);
  chart.append(caption, scales);
  return chart;
}

function render(entries) {
  const items = [...entries].sort((first, second) => second.date.localeCompare(first.date)).map(({ date, value, unit }) => {
    const item = document.createElement('li');
    item.textContent = `${date} · ${value} ${unit}`;
    return item;
  });
  results.replaceChildren(...items);
  const figures = ['mmol/mol', '%'].map((unit) => chartFor(unit, entries)).filter(Boolean);
  chartGrid.replaceChildren(...figures);
  charts.hidden = figures.length === 0;
}

function warn(event) {
  event.preventDefault();
  event.returnValue = true;
}

form.addEventListener('input', () => {
  if (dateField.value || valueField.value || unitField.value) window.addEventListener('beforeunload', warn);
  else window.removeEventListener('beforeunload', warn);
});

form.addEventListener('submit', (event) => {
  event.preventDefault();
  const entry = { date: dateField.value, value: valueField.value.trim(), unit: unitField.value };
  const number = Number(entry.value.replace(',', '.'));
  if (!Number.isFinite(number) || number <= 0) {
    status.textContent = 'Enter a positive result as shown on the report.';
    valueField.focus();
    return;
  }
  function save() {
    try {
      const entries = readHistory();
      if (entries.some(({ date, value, unit }) => date === entry.date && value === entry.value && unit === entry.unit)) {
        status.textContent = 'That exact result and date are already saved.';
        return;
      }
      entries.push(entry);
      localStorage.setItem(A1C_HISTORY_KEY, JSON.stringify(entries));
      render(entries);
      form.reset();
      window.removeEventListener('beforeunload', warn);
      status.textContent = 'Dated HbA1c result saved.';
    } catch {
      status.textContent = 'Could not save the result. Your draft is still here.';
    }
  }
  if (navigator.locks) navigator.locks.request(A1C_HISTORY_KEY, save);
  else save();
});

try {
  const entries = readHistory();
  render(entries);
  status.textContent = entries.length ? '' : 'No dated results yet.';
} catch {
  status.textContent = 'Could not read dated results from this browser.';
}
form.hidden = false;
