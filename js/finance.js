// finance.js — FIRE calculator and passive-income tracker.

const PI_KEY = 'passiveIncome';

function readNumber(id, fallback = 0) {
  const value = Number.parseFloat(document.getElementById(id)?.value);
  return Number.isFinite(value) ? value : fallback;
}

function futureValue(principal, monthlyContribution, monthlyRate, months) {
  if (monthlyRate === 0) return principal + monthlyContribution * months;
  const factor = Math.pow(1 + monthlyRate, months);
  return principal * factor + monthlyContribution * ((factor - 1) / monthlyRate);
}

function fmt(n) {
  if (n >= 1000000) return 'SGD ' + (n / 1000000).toFixed(1) + 'M';
  return 'SGD ' + Math.round(n).toLocaleString();
}

function fmtMonth(n) {
  return 'SGD ' + Math.round(n).toLocaleString() + '/month';
}

function calcFireDebounced() {
  requestAnimationFrame(calcFire);
}

function calcFire() {
  const age = readNumber('age', 30);
  const retireAge = readNumber('retireAge', 55);
  const livingExp = Math.max(0, readNumber('livingExpenses'));
  const hdbBal = Math.max(0, readNumber('hdbBalance'));
  const hdbPay = Math.max(0, readNumber('hdbMonthly'));
  const hdbYearsLeft = Math.max(0, readNumber('hdbYears'));
  const otherLoans = Math.max(0, readNumber('otherLoans'));
  const portfolio = Math.max(0, readNumber('portfolio'));
  const monthly = Math.max(0, readNumber('monthly'));
  const annReturn = Math.max(0, Math.min(15, readNumber('return', 6))) / 100;
  const cpfOa = Math.max(0, readNumber('cpfOa'));
  const cpfSa = Math.max(0, readNumber('cpfSa'));

  const years = retireAge - age;
  const results = document.getElementById('fireResults');
  const assumptions = document.getElementById('fireAssumptions');

  if (years <= 0) {
    results.innerHTML = '<p class="fire-validation" role="alert">Target retirement age must be greater than your current age.</p>';
    assumptions.innerHTML = '';
    drawFireChart([]);
    return;
  }

  const months = years * 12;
  const monthlyReturn = annReturn / 12;
  const totalMonthlyExp = livingExp + hdbPay + otherLoans;
  const loanPaidByRetire = Math.min(1, hdbYearsLeft > 0 ? years / hdbYearsLeft : 1);
  const hdbRemainingAtRetire = hdbBal * (1 - loanPaidByRetire);
  const loanPaidOffCompletely = years >= hdbYearsLeft;
  const monthlyExpAtRetire = loanPaidOffCompletely
    ? livingExp + otherLoans
    : livingExp + hdbPay * Math.max(0, 1 - years / hdbYearsLeft) + otherLoans;
  const annualExpAtRetire = monthlyExpAtRetire * 12;
  const fireNumber = annualExpAtRetire * 25;
  const fvPortfolio = futureValue(portfolio, monthly, monthlyReturn, months);
  const fvOa = cpfOa * Math.pow(1 + 0.025 / 12, months);
  const fvSa = cpfSa * Math.pow(1 + 0.04 / 12, months);
  const projectedTotal = fvPortfolio + fvOa + fvSa;
  const monthlyFromPortfolio = (projectedTotal * 0.04) / 12;
  const cpfLifeMonthly = Math.min(2000, Math.max(300, (fvOa + fvSa) * 0.003));
  const totalMonthlyIncome = monthlyFromPortfolio + cpfLifeMonthly;
  const monthlyShortfall = monthlyExpAtRetire - totalMonthlyIncome;
  const onTrack = monthlyShortfall <= 0;

  let neededMonthly = 0;
  if (!onTrack && months > 0) {
    const neededFV = fireNumber - (fvOa + fvSa);
    const remainingFV = neededFV - portfolio * Math.pow(1 + monthlyReturn, months);
    if (remainingFV > 0) {
      neededMonthly = monthlyReturn === 0
        ? remainingFV / months
        : remainingFV * monthlyReturn / (Math.pow(1 + monthlyReturn, months) - 1);
    }
  }

  const data = [];
  for (let y = 0; y <= Math.max(years, 30); y += 1) {
    if (y <= years) {
      const invested = annReturn === 0
        ? portfolio + monthly * 12 * y
        : futureValue(portfolio, monthly * 12, annReturn, y);
      const cpv = (cpfOa + cpfSa) * Math.pow(1 + 0.03, y);
      data.push(Math.round(invested + cpv));
    } else {
      const previous = data[data.length - 1] || 0;
      const value = previous * (1 + annReturn) - annualExpAtRetire;
      data.push(Math.round(Math.max(0, value)));
    }
  }

  results.innerHTML = `
    <div style="grid-column:1/-1;text-align:center;margin-bottom:4px">
      <h3 style="font-size:22px;font-weight:800;color:var(--color-text)">Your Retirement Picture at Age ${retireAge}</h3>
    </div>

    <div class="fire-result-card ${onTrack ? 'primary' : 'warn'}">
      <div class="label">Monthly Income in Retirement</div>
      <div class="value" style="font-size:22px">${fmtMonth(totalMonthlyIncome)}</div>
      <div class="sub">${cpfLifeMonthly > 0 ? 'SGD ' + Math.round(cpfLifeMonthly) + '/mo from CPF LIFE + ' : ''}portfolio withdrawals</div>
    </div>
    <div class="fire-result-card ${onTrack ? 'primary' : 'danger'}">
      <div class="label">Monthly Expenses at ${retireAge}</div>
      <div class="value" style="font-size:22px">${fmtMonth(monthlyExpAtRetire)}</div>
      <div class="sub">${loanPaidOffCompletely ? 'HDB loan fully paid off.' : hdbRemainingAtRetire > 0 ? 'HDB loan balance: ' + fmt(hdbRemainingAtRetire) : ''}</div>
    </div>
    <div class="fire-result-card ${onTrack ? 'primary' : 'danger'}">
      <div class="label">Monthly ${onTrack ? 'Surplus' : 'Shortfall'}</div>
      <div class="value" style="font-size:22px">${fmtMonth(Math.abs(monthlyShortfall))}</div>
      <div class="sub">${onTrack ? 'Projected surplus each month' : 'Gap to close before retirement'}</div>
    </div>

    <div class="fire-result-card" style="grid-column:1/-1;display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:12px;padding:20px">
      <div><div class="label">Total Savings Needed</div><div class="value" style="font-size:20px">${fmt(fireNumber)}</div></div>
      <div><div class="label">Projected Portfolio</div><div class="value" style="font-size:20px">${fmt(projectedTotal)}</div></div>
      <div><div class="label">Monthly from Portfolio</div><div class="value" style="font-size:20px">${fmtMonth(monthlyFromPortfolio)}</div></div>
      <div><div class="label">CPF LIFE Estimate</div><div class="value" style="font-size:20px">${fmtMonth(cpfLifeMonthly)}</div></div>
      <div><div class="label">HDB Loan at Retirement</div><div class="value" style="font-size:20px">${loanPaidOffCompletely ? 'Paid' : fmt(hdbRemainingAtRetire)}</div></div>
    </div>

    ${!onTrack ? `
    <div class="fire-result-card warn" style="grid-column:1/-1">
      <div class="label">To Close the Gap, Save This Much Per Month Instead</div>
      <div class="value" style="font-size:24px">${fmtMonth(neededMonthly > 0 ? neededMonthly : monthly)}</div>
      <div class="sub">Currently saving ${fmtMonth(monthly)} · ${neededMonthly > monthly ? 'Need to increase by ' + fmtMonth(neededMonthly - monthly) : 'The projection needs more time or a different target.'}</div>
    </div>` : ''}

    <div class="fire-result-card" style="grid-column:1/-1;padding:16px;text-align:left">
      <div style="font-size:14px;line-height:1.7;color:var(--color-text-secondary)">
        <strong>HDB Loan Summary:</strong> You have ${fmt(hdbBal)} remaining over ${hdbYearsLeft} years (${fmtMonth(hdbPay)}).
        ${years >= hdbYearsLeft ? 'Your loan will be fully paid off by retirement.' : 'At retirement, approximately ' + Math.round((1 - years / hdbYearsLeft) * 100) + '% of the loan will remain (' + fmt(hdbRemainingAtRetire) + ').'}
        ${!loanPaidOffCompletely ? ' Consider paying down the loan faster or refinancing to reduce retirement expenses.' : ''}
      </div>
    </div>
  `;

  assumptions.innerHTML = `<p class="fire-assumption-note">Projection uses a ${annReturn * 100}% annual investment return, a 4% withdrawal estimate, and simplified CPF LIFE assumptions. It is a planning illustration, not a forecast.</p>`;
  drawFireChart(data, fireNumber);
}

function drawFireChart(data, fireLine = 0) {
  const svg = document.getElementById('fireChart');
  if (!svg) return;
  svg.innerHTML = '<title id="fireChartTitle">Portfolio growth projection</title><desc id="fireChartDesc">Projected portfolio value over time compared with the FIRE target.</desc>';

  if (!data.length) return;

  const rect = svg.parentElement.getBoundingClientRect();
  const w = Math.max(300, Math.min(800, rect.width - 4));
  const aspect = 2.2;
  const h = Math.round(w / aspect);
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  svg.setAttribute('height', h);

  const pad = { top: 20, right: 24, bottom: 30, left: 72 };
  const cw = w - pad.left - pad.right;
  const ch = h - pad.top - pad.bottom;
  const maxVal = Math.max(1, ...data) * 1.15;
  const years = data.length - 1;
  let paths = '';
  let firePath = '';

  data.forEach((value, i) => {
    const x = pad.left + (i / years) * cw;
    const y = pad.top + ch - (value / maxVal) * ch;
    paths += (i === 0 ? 'M' : 'L') + x.toFixed(1) + ',' + y.toFixed(1);
  });

  let gridHtml = '';
  const yLabelSize = Math.max(9, Math.min(11, w / 60));
  for (let i = 0; i <= 4; i += 1) {
    const y = pad.top + (i / 4) * ch;
    const value = maxVal - (i / 4) * maxVal;
    gridHtml += `<line x1="${pad.left}" y1="${y}" x2="${w - pad.right}" y2="${y}" class="chart-grid-line"/>`;
    gridHtml += `<text x="${pad.left - 6}" y="${y + 4}" text-anchor="end" class="chart-axis-label" font-size="${yLabelSize}">${fmt(value)}</text>`;
  }

  const xLabelSize = Math.max(9, Math.min(11, w / 60));
  const xStep = Math.max(1, Math.ceil(5 / (w / 300)));
  for (let i = 0; i <= years; i += xStep) {
    const x = pad.left + (i / years) * cw;
    gridHtml += `<text x="${x}" y="${h - 8}" text-anchor="middle" class="chart-axis-label" font-size="${xLabelSize}">${i}y</text>`;
  }

  if (fireLine > 0) {
    const fireY = pad.top + ch - Math.min(1, fireLine / maxVal) * ch;
    firePath = `<line x1="${pad.left}" y1="${fireY}" x2="${w - pad.right}" y2="${fireY}" class="chart-fire-line"/>`;
    firePath += `<text x="${w - pad.right - 4}" y="${fireY - 6}" text-anchor="end" class="chart-fire-label" font-size="11">FIRE target</text>`;
  }

  const fillId = 'fillGrad_' + w;
  const defs = `<defs><linearGradient id="${fillId}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" class="chart-fill-start"/><stop offset="100%" class="chart-fill-end"/></linearGradient></defs>`;
  svg.innerHTML += defs + gridHtml +
    `<path d="${paths}" fill="none" class="chart-value-line"/>` +
    `<path d="${paths}L${pad.left + cw},${pad.top + ch}L${pad.left},${pad.top + ch}Z" fill="url(#${fillId})" class="chart-value-area"/>` +
    firePath +
    `<text x="${pad.left}" y="${pad.top - 4}" class="chart-title-label" font-size="12">Portfolio value</text>` +
    `<text x="${w / 2}" y="${h - 8}" text-anchor="middle" class="chart-title-label" font-size="12">Years from now</text>`;
}

function clamp(value, min, max) {
  const number = Number.parseFloat(value);
  if (!Number.isFinite(number)) return min;
  return Math.min(max, Math.max(min, number));
}

function normalizePiRow(row) {
  if (!row || typeof row !== 'object') return null;
  return {
    name: typeof row.name === 'string' ? row.name.slice(0, 120) : '',
    principal: clamp(row.principal, 0, Number.MAX_SAFE_INTEGER),
    rate: clamp(row.rate, 0, 100),
  };
}

function loadPiData() {
  try {
    const parsed = JSON.parse(localStorage.getItem(PI_KEY) || '[]');
    return Array.isArray(parsed) ? parsed.map(normalizePiRow).filter(Boolean) : [];
  } catch {
    return [];
  }
}

function showPiStatus(message) {
  const status = document.getElementById('piStatus');
  if (status) status.textContent = message;
}

function savePiData(data) {
  try {
    localStorage.setItem(PI_KEY, JSON.stringify(data.map(normalizePiRow).filter(Boolean)));
    return true;
  } catch {
    showPiStatus('This browser could not save the tracker. Your current change may be lost when you leave the page.');
    return false;
  }
}

function escapeHTML(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function addPiRow() {
  const data = loadPiData();
  data.push({ name: '', principal: 0, rate: 0 });
  savePiData(data);
  renderPiTable();
  showPiStatus('Asset added.');
}

function delPiRow(index) {
  const data = loadPiData();
  data.splice(index, 1);
  savePiData(data);
  renderPiTable();
  showPiStatus('Asset removed.');
}

function updatePiField(index, field, value) {
  const data = loadPiData();
  if (!data[index]) return;
  if (field === 'name') data[index].name = String(value).slice(0, 120);
  if (field === 'principal') data[index].principal = clamp(value, 0, Number.MAX_SAFE_INTEGER);
  if (field === 'rate') data[index].rate = clamp(value, 0, 100);
  savePiData(data);
  renderPiTable();
  showPiStatus('Asset updated.');
}

function renderPiTable() {
  const data = loadPiData();
  const container = document.getElementById('piContent');
  if (!container) return;

  let totalPrincipal = 0;
  let totalMonthly = 0;

  if (data.length === 0) {
    container.innerHTML = `<div class="pi-empty">No assets yet. Add your first dividend stock, bond, or CPF account to see your monthly passive income.</div>
      <button type="button" class="pi-btn pi-btn-primary" data-pi-action="add">Add asset</button>`;
    return;
  }

  const rows = data.map((row, index) => {
    const monthly = row.principal * row.rate / 100 / 12;
    totalPrincipal += row.principal;
    totalMonthly += monthly;
    return `<tr>
      <td><label class="sr-only" for="pi-name-${index}">Asset name, row ${index + 1}</label><input id="pi-name-${index}" type="text" value="${escapeHTML(row.name)}" placeholder="e.g. DBS Stock" data-pi-field="name" data-index="${index}"></td>
      <td><label class="sr-only" for="pi-principal-${index}">Principal in SGD, row ${index + 1}</label><input id="pi-principal-${index}" type="number" value="${row.principal || ''}" min="0" placeholder="0" data-pi-field="principal" data-index="${index}"></td>
      <td><label class="sr-only" for="pi-rate-${index}">Annual rate in percent, row ${index + 1}</label><input id="pi-rate-${index}" type="number" value="${row.rate || ''}" min="0" max="100" step="0.1" placeholder="0" data-pi-field="rate" data-index="${index}"></td>
      <td class="pi-monthly">SGD ${Math.round(monthly).toLocaleString()}/mo</td>
      <td><button type="button" class="pi-btn pi-btn-danger" data-pi-action="delete" data-index="${index}" aria-label="Delete ${escapeHTML(row.name || 'asset ' + (index + 1))}">Delete</button></td>
    </tr>`;
  }).join('');

  const annualTotal = totalMonthly * 12;
  container.innerHTML = `
    <div class="pi-table-wrap">
      <table class="pi-table">
        <caption class="sr-only">Passive income assets and projected monthly income</caption>
        <thead><tr>
          <th scope="col">Asset</th>
          <th scope="col">Principal (SGD)</th>
          <th scope="col">Rate (%)</th>
          <th scope="col">Monthly income</th>
          <th scope="col"><span class="sr-only">Actions</span></th>
        </tr></thead>
        <tbody>${rows}
          <tr class="pi-total-row">
            <td><strong>Total</strong></td>
            <td><strong>SGD ${Math.round(totalPrincipal).toLocaleString()}</strong></td>
            <td><strong>${totalPrincipal > 0 ? (annualTotal / totalPrincipal * 100).toFixed(1) : 0}%</strong></td>
            <td class="pi-monthly"><strong>SGD ${Math.round(totalMonthly).toLocaleString()}/mo</strong></td>
            <td></td>
          </tr>
        </tbody>
      </table>
    </div>
    <div class="pi-total-bar">
      <div class="pi-stat"><div class="pi-stat-label">Total principal</div><div class="pi-stat-value">SGD ${Math.round(totalPrincipal).toLocaleString()}</div></div>
      <div class="pi-stat"><div class="pi-stat-label">Monthly passive income</div><div class="pi-stat-value">SGD ${Math.round(totalMonthly).toLocaleString()}</div></div>
      <div class="pi-stat"><div class="pi-stat-label">Annual passive income</div><div class="pi-stat-value">SGD ${Math.round(annualTotal).toLocaleString()}</div></div>
      <div class="pi-stat"><div class="pi-stat-label">Blended yield</div><div class="pi-stat-value">${totalPrincipal > 0 ? (annualTotal / totalPrincipal * 100).toFixed(1) : 0}%</div></div>
    </div>
    <div style="margin-top:12px"><button type="button" class="pi-btn pi-btn-primary" data-pi-action="add">Add asset</button></div>`;
}

function selectFinanceTab(tab) {
  const isFire = tab === 'fire';
  document.querySelectorAll('[data-finance-tab]').forEach((button) => {
    const selected = button.dataset.financeTab === tab;
    button.classList.toggle('active', selected);
    button.setAttribute('aria-selected', String(selected));
  });
  const select = document.querySelector('[data-finance-select]');
  if (select) select.value = tab;

  const investments = document.getElementById('financeInvestments');
  const fire = document.getElementById('financeFire');
  if (investments) investments.hidden = isFire;
  if (fire) fire.hidden = !isFire;
  if (isFire) {
    calcFire();
    renderPiTable();
  }
}

function init() {
  if (!document.getElementById('financeInvestments')) return;

  document.addEventListener('input', (event) => {
    if (event.target.closest('[data-fire-input]')) calcFireDebounced();
  });
  document.addEventListener('click', (event) => {
    const tab = event.target.closest('[data-finance-tab]');
    if (tab) selectFinanceTab(tab.dataset.financeTab);

    const action = event.target.closest('[data-pi-action]');
    if (!action) return;
    if (action.dataset.piAction === 'add') addPiRow();
    if (action.dataset.piAction === 'delete') delPiRow(Number(action.dataset.index));
  });
  document.addEventListener('change', (event) => {
    const select = event.target.closest('[data-finance-select]');
    if (select) selectFinanceTab(select.value);

    const field = event.target.closest('[data-pi-field]');
    if (field) updatePiField(Number(field.dataset.index), field.dataset.piField, field.value);
  });

  selectFinanceTab('investments');
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
