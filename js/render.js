import { PILLARS, EXERCISES } from './data/workout.js';
import { INVESTMENTS } from './data/finance.js';

function safeRender(fn, container, fallback) {
  try { fn(); }
  catch (err) {
    console.error('Render error:', err);
    if (container) {
      container.innerHTML = `<div class="render-error">
        <p class="render-error-title">Something went wrong.</p>
        <p class="render-error-copy">${fallback || 'Please refresh the page.'}</p>
      </div>`;
    }
  }
}
let budgetInvestments = 0;

function renderInvestments() {
  return `<div class="page-header">
    <div class="section-inner">
     <h2 class="page-title">Investment Combos (Singapore Edition)</h2>
      <p class="page-desc">Pre-built portfolio combos based on r/singaporefi wisdom. Each combo shows how different instruments work together, why they synergize, and exactly how to execute. Pick the one that matches your goal and risk tolerance.</p>
    </div>
  </div>
  <div class="section">
    <div class="section-inner invest-combo-grid">
      <p class="invest-disclaimer">Not financial advice. Information sourced from MAS, CPF Board, r/singaporefi, and HardwareZone for educational purposes. Consult a licensed adviser.</p>

      <div class="budget-tool" id="budgetTool">
        <h3 class="budget-title">Your Budget at a Glance</h3>
        <p class="budget-desc">Enter your monthly take-home salary. The 50/30/20 rule splits it into Expenses, Investments, and Savings. Drag the sliders to adjust.</p>
        <div class="budget-input-row">
          <div class="budget-field">
             <label for="budgetSalary">Monthly take-home salary</label>
            <input type="number" id="budgetSalary" value="" min="0" step="500" placeholder="e.g. 5000" data-budget-input>
          </div>
        </div>
        <div id="budgetResults"></div>
        <div class="budget-sliders" id="budgetSliders" style="display:none">
          <div class="budget-slider-row">
            <div class="budget-slider-label">
              <span class="budget-slider-name" style="color:var(--budget-expense);font-weight:700">Expenses</span>
              <span class="budget-slider-name" style="color:var(--budget-invest);font-weight:700">Investments</span>
              <span class="budget-slider-name" style="color:var(--budget-savings)">Savings</span>
            </div>
          </div>
          <div class="budget-slider-row">
             <label for="sliderExpenses">Expenses <span id="budgetPctExpenses">50</span>%</label>
            <input type="range" id="sliderExpenses" min="0" max="100" value="50" data-budget-input>
            <span class="budget-slider-val" id="budgetValExpenses">SGD 0</span>
          </div>
          <div class="budget-slider-row">
             <label for="sliderInvestments">Investments <span id="budgetPctInvestments">30</span>%</label>
            <input type="range" id="sliderInvestments" min="0" max="100" value="30" data-budget-input>
            <span class="budget-slider-val" id="budgetValInvestments">SGD 0</span>
          </div>
          <p class="budget-slider-hint">Savings auto-calculates as the remainder. Total always sums to 100%.</p>
        </div>
      </div>

      ${INVESTMENTS.map(c => `
        <details class="invest-card invest-combo" id="inv-${c.id}" data-invest-combo open>
          <summary class="invest-combo-summary">
          <div class="invest-card-top">
            <div>
              <h2 class="invest-name">${c.name}</h2>
              <span class="invest-goal">${c.goal}</span>
            </div>
          </div>
          <div class="invest-meta-bar">
            <span>${c.totalReturn}</span>
            <span>${c.riskLevel}</span>
          </div>
          </summary>
          <div class="invest-combo-body">
          <div class="invest-table ${budgetInvestments > 0 ? '' : 'invest-table-hide-mo'}">
            <div class="invest-table-header"><span>Asset</span><span>Allocation</span><span>Monthly</span><span>Why</span></div>
            ${c.portfolio.map(a => {
              const pct = parseFloat(a.pct);
              const monthly = budgetInvestments > 0 && pct ? 'SGD ' + Math.round(budgetInvestments * pct / 100).toLocaleString() + '/mo' : '';
              return `
              <div class="invest-table-row">
                <span class="invest-asset">${a.asset}</span>
                <span class="invest-pct">${a.pct}</span>
                <span class="invest-monthly">${monthly}</span>
                <span class="invest-why">${a.why}</span>
              </div>`;
            }).join("")}
          </div>
          <details class="meal-details">
            <summary>Why These Work Together</summary>
            <p class="invest-body-text">${c.synergy}</p>
          </details>
          <details class="meal-details">
            <summary>Step-by-Step Execution</summary>
            <p class="invest-body-text">${c.howToExecute}</p>
          </details>
          <details class="meal-details">
            <summary>Tips from r/singaporefi</summary>
            <ul class="checklist">
              ${c.tips.map(t => `<li>${t}</li>`).join("")}
            </ul>
          </details>
          </div>
        </details>
      `).join("")}
    </div>
  </div>`;
}
document.addEventListener('input', function(e) {
    if (e.target.closest('[data-budget-input]')) updateBudget();
});
function updateBudget() {
  const salary = parseFloat(document.getElementById('budgetSalary').value) || 0;
  const results = document.getElementById('budgetResults');
  const sliders = document.getElementById('budgetSliders');

  if (salary <= 0) {
    results.innerHTML = '';
    sliders.style.display = 'none';
    if (budgetInvestments > 0) {
      budgetInvestments = 0;
      document.querySelectorAll('.invest-table').forEach(t => t.classList.add('invest-table-hide-mo'));
    }
    return;
  }
  sliders.style.display = 'block';

  let vE = parseFloat(document.getElementById('sliderExpenses').value);
  let vI = parseFloat(document.getElementById('sliderInvestments').value);
  let vS = Math.max(0, 100 - vE - vI);

  if (vE + vI > 100) {
    const active = document.activeElement;
    if (active && active.id === 'sliderExpenses') {
      vE = 100 - vI;
    } else {
      vI = 100 - vE;
    }
    vS = 0;
    document.getElementById('sliderExpenses').value = vE;
    document.getElementById('sliderInvestments').value = vI;
  }

  const prevInvestments = budgetInvestments;
  budgetInvestments = Math.round(salary * vI / 100);

  document.getElementById('budgetPctExpenses').textContent = vE;
  document.getElementById('budgetPctInvestments').textContent = vI;

  document.getElementById('budgetValExpenses').textContent = 'SGD ' + Math.round(salary * vE / 100).toLocaleString();
  document.getElementById('budgetValInvestments').textContent = 'SGD ' + budgetInvestments.toLocaleString();

  results.innerHTML = `
    <div class="budget-breakdown">
      <div class="budget-card" style="background:var(--budget-expense-bg)">
        <div class="budget-card-label" style="color:var(--budget-expense)">Expenses</div>
        <div class="budget-card-amt" style="color:var(--budget-expense)">SGD ${Math.round(salary * vE / 100).toLocaleString()}</div>
        <div class="budget-card-pct" style="color:var(--budget-expense)">${vE}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">Housing, food, transport, bills, insurance</div>
      </div>
      <div class="budget-card" style="background:var(--budget-invest-bg)">
        <div class="budget-card-label" style="color:var(--budget-invest)">Investments</div>
        <div class="budget-card-amt" style="color:var(--budget-invest)">SGD ${budgetInvestments.toLocaleString()}</div>
        <div class="budget-card-pct" style="color:var(--budget-invest)">${vI}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">Stocks, ETFs, CPF top-ups, robos</div>
      </div>
      <div class="budget-card" style="background:var(--budget-savings-bg)">
        <div class="budget-card-label" style="color:var(--budget-savings)">Savings</div>
        <div class="budget-card-amt" style="color:var(--budget-savings)">SGD ${Math.round(salary * vS / 100).toLocaleString()}</div>
        <div class="budget-card-pct" style="color:var(--budget-savings)">${vS}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">High-yield savings account (UOB One / OCBC 360)</div>
      </div>
    </div>
  `;

  document.querySelectorAll('.invest-table').forEach(t => {
    if (budgetInvestments > 0) {
      t.classList.remove('invest-table-hide-mo');
    } else if (prevInvestments > 0) {
      t.classList.add('invest-table-hide-mo');
    }
  });

  document.querySelectorAll('.invest-table-row').forEach(row => {
    const cells = row.querySelectorAll('span');
    if (cells.length >= 3) {
      const pctText = cells[1].textContent;
      const pct = parseFloat(pctText);
      cells[2].textContent = budgetInvestments > 0 && pct ? 'SGD ' + Math.round(budgetInvestments * pct / 100).toLocaleString() + '/mo' : '';
    }
  });
}

let audioCtx = null;
function getAudioCtx() {
  if (audioCtx) return audioCtx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  try { audioCtx = new Ctx(); } catch(e) { return null; }
  return audioCtx;
}
document.addEventListener("click", () => {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}, { once: true });

function playTone(freq, duration, type, startTime, gainVal) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, startTime || ctx.currentTime);
    const g = gainVal || 0.25;
    gain.gain.setValueAtTime(g, startTime || ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, (startTime || ctx.currentTime) + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(startTime || ctx.currentTime);
    osc.stop((startTime || ctx.currentTime) + duration);
  } catch(e) {}
}

function playWhistle(startFreq, endFreq, duration) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.linearRampToValueAtTime(endFreq, t + duration);
    gain.gain.setValueAtTime(0.25, t);
    gain.gain.setValueAtTime(0.15, t + duration * 0.7);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + duration);
  } catch(e) {}
}

function playChime(freq, duration) {
  playTone(freq, duration, "sine", undefined, 0.15);
}

function duckMusic(duration) {
  if (!musicGain) return;
  musicGain.gain.value = 0.001;
  clearTimeout(musicGain._restoreTimer);
  musicGain._restoreTimer = setTimeout(() => { if (musicGain) musicGain.gain.value = 0.2; }, duration * 1000);
}

function playTick() {
  duckMusic(0.15);
  playTone(1500, 0.1, "sine", undefined, 0.9);
}

function playStartWhistle() {
  duckMusic(0.35);
  if (!playSound("start")) playWhistle(500, 1000, 0.25);
}
function playMidpoint() {
  duckMusic(0.4);
  const t = (getAudioCtx() || {}).currentTime || 0;
  playTone(1200, 0.2, "triangle", t, 0.9);
  playTone(1600, 0.2, "triangle", t + 0.12, 0.7);
}
function playCountdownTick() {
  duckMusic(0.15);
  if (!playSound("tick")) playTick();
}
function playWorkEnd() {
  duckMusic(0.45);
  if (!playSound("workend")) playWhistle(800, 400, 0.3);
}
function playRestOver() {
  duckMusic(0.35);
  if (!playSound("restover")) setTimeout(() => playWhistle(400, 660, 0.25), 50);
}
function playAllDone() {
  duckMusic(0.7);
  if (!playSound("alldone")) {
    const t = (getAudioCtx() || {}).currentTime || 0;
    playTone(440, 0.25, "sine", t, 0.3);
    playTone(554, 0.25, "sine", t + 0.2, 0.3);
    playTone(660, 0.35, "sine", t + 0.4, 0.3);
  }
}

/* ============================
   Background Music (CC0 Freesound)
   ============================ */
let musicBuffer = null;
let musicSource = null;
let musicGain = null;
const MUSIC_URL = "https://cdn.freesound.org/previews/569/569920_4819210-lq.mp3";
let musicLoading = null;

let restMusicBuffer = null;
let restMusicLoading = null;
const REST_MUSIC_URL = "https://cdn.freesound.org/previews/858/858311_462105-lq.mp3";
const MUSIC_START_OFFSET = 5;

function loadMusic() {
  if (musicBuffer) return Promise.resolve(musicBuffer);
  if (musicLoading) return musicLoading;
  const ctx = getAudioCtx();
  if (!ctx) return Promise.resolve(null);
  musicLoading = (async () => {
    try {
      const resp = await fetch(MUSIC_URL);
      if (!resp.ok) throw new Error(`music fetch ${resp.status}`);
      const buf = await resp.arrayBuffer();
      musicBuffer = await ctx.decodeAudioData(buf);
      return musicBuffer;
    } catch(e) { console.warn("Music load failed (work):", e.message || e); musicBuffer = null; musicLoading = null; return null; }
  })();
  return musicLoading;
}

function loadRestMusic() {
  if (restMusicBuffer) return Promise.resolve(restMusicBuffer);
  if (restMusicLoading) return restMusicLoading;
  const ctx = getAudioCtx();
  if (!ctx) return Promise.resolve(null);
  restMusicLoading = (async () => {
    try {
      const resp = await fetch(REST_MUSIC_URL);
      if (!resp.ok) throw new Error(`rest music fetch ${resp.status}`);
      const buf = await resp.arrayBuffer();
      restMusicBuffer = await ctx.decodeAudioData(buf);
      return restMusicBuffer;
    } catch(e) { console.warn("Music load failed (rest):", e.message || e); restMusicBuffer = null; restMusicLoading = null; return null; }
  })();
  return restMusicLoading;
}

async function startMusic(isWork) {
  stopMusic();
  const ctx = getAudioCtx();
  if (!ctx) return;
  if (ctx.state === "suspended") { try { await ctx.resume(); } catch(e) {} }
  let activeBuf = isWork ? musicBuffer : restMusicBuffer;
  if (!activeBuf) {
    await (isWork ? loadMusic() : loadRestMusic());
    activeBuf = isWork ? musicBuffer : restMusicBuffer;
  }
  if (!activeBuf) return;

  musicSource = ctx.createBufferSource();
  musicSource.buffer = activeBuf;
  musicSource.loop = true;
  musicGain = ctx.createGain();
  musicGain.gain.value = isWork ? 0.28 : 0.4;
  musicSource.connect(musicGain).connect(ctx.destination);
  try { musicSource.start(0, isWork ? MUSIC_START_OFFSET : 0); } catch(e) { console.warn("Music start failed:", e.message || e); }
}

function stopMusic() {
  if (musicSource) {
    try { musicSource.stop(); } catch(e) {}
    try { musicSource.disconnect(); } catch(e) {}
    musicSource = null;
  }
  if (musicGain) {
    clearTimeout(musicGain._restoreTimer);
    try { musicGain.disconnect(); } catch(e) {}
    musicGain = null;
  }
}

/* ============================
   FreeSound CC0 Sound Loading
   ============================ */
const SOUND_URLS = {
  start: "https://cdn.freesound.org/previews/538/538422_11966684-lq.mp3",
  restover: "https://cdn.freesound.org/previews/582/582701_5965684-lq.mp3",
  alldone: "https://cdn.freesound.org/previews/607/607207_7724198-lq.mp3",
};

const soundBuffers = {};

async function loadSound(name, url) {
  try {
    const ctx = getAudioCtx();
    if (!ctx) return;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`sound ${name} fetch ${resp.status}`);
    const buf = await resp.arrayBuffer();
    soundBuffers[name] = await ctx.decodeAudioData(buf);
  } catch(e) {
    console.warn(`Sound load failed (${name}):`, e.message || e);
    // don't cache null — leave undefined so next playSound can retry
    delete soundBuffers[name];
  }
}

async function playSound(name) {
  let buf = soundBuffers[name];
  if (!buf) {
    // retry once if we have a context now (user has interacted)
    const ctx = getAudioCtx();
    if (ctx && SOUND_URLS[name]) {
      await loadSound(name, SOUND_URLS[name]);
      buf = soundBuffers[name];
    }
  }
  if (!buf) return false;
  try {
    const ctx = getAudioCtx();
    if (!ctx) return false;
    if (ctx.state === "suspended") { try { await ctx.resume(); } catch(e) {} }
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    gain.gain.value = 0.5;
    src.connect(gain).connect(ctx.destination);
    src.start();
    return true;
  } catch(e) { return false; }
}

function initExerciseSounds() {
  // Lazy-load sounds on first user gesture — retryable, don't cache early null ctx
  for (const [name, url] of Object.entries(SOUND_URLS)) {
    // fire-and-forget but retryable; if ctx null first time, playSound will retry on demand
    loadSound(name, url);
  }
  // Music is lazy-loaded on first Start so resume() can succeed; no eager fetch here
}

/* ============================
   Exercise Timer State — Unified
   ============================ */
const timerState = {};

function updateMobileTimerDock(id, state) {
  const dock = document.querySelector('[data-mobile-timer-dock]');
  const timer = timerState[id];
  if (!dock || !timer) return;
  const visible = state === 'running' || state === 'paused';
  dock.hidden = !visible;
  if (!visible) return;
  dock.dataset.activeTimer = id;
  const phase = dock.querySelector('[data-mobile-timer-phase]');
  const time = dock.querySelector('[data-mobile-timer-time]');
  const sourcePhase = timer._el?.phase?.textContent || timer._el?.label?.textContent || 'Active session';
  const sourceTime = timer._el?.time?.textContent || '00:00';
  if (phase) phase.textContent = state === 'paused' ? `Paused · ${sourcePhase}` : sourcePhase;
  if (time) time.textContent = sourceTime;
  dock.querySelectorAll('[data-exercise]').forEach((button) => { button.dataset.exercise = id; });
}

function timerTick(id, config) {
  const s = timerState[id];
  if (!s || s.status === "idle" || s.status === "paused") return;

  const now = Date.now();
  const elapsed = (now - s.lastTick) / 1000;
  s.timeRemaining = Math.max(0, s.timeRemaining - elapsed);
  s.lastTick = now;

  const total = s.phaseTotal || 1;
  const pct = total > 0 ? (s.timeRemaining / total) * 100 : 0;

  const mins = Math.floor(s.timeRemaining / 60);
  const secs = Math.floor(s.timeRemaining % 60);
  const timeText = `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;

  let el = s._el;
  if (el.time && el.time.offsetParent === null) { s._el = timerEls(id); el = s._el; }
  if (el.time) el.time.textContent = timeText;
  if (el.bar) el.bar.style.transform = `scaleX(${pct / 100})`;
  const dock = document.querySelector('[data-mobile-timer-dock]');
  if (dock?.dataset.activeTimer === id) {
    const dockTime = dock.querySelector('[data-mobile-timer-time]');
    const dockPhase = dock.querySelector('[data-mobile-timer-phase]');
    if (dockTime) dockTime.textContent = timeText;
    if (dockPhase && s._el?.phase) dockPhase.textContent = s._el.phase.textContent;
  }

  // Sound milestones
  const timeLeft = s.timeRemaining;
  if (timeLeft <= 6 && timeLeft > 0) {
    const sec = Math.ceil(timeLeft);
    if (sec !== s._lastCountdownSec) {
      s._lastCountdownSec = sec;
      playCountdownTick();
      if (!s._musicStoppedForCountdown) {
        s._musicStoppedForCountdown = true;
        stopMusic();
      }
    }
  }

  if (s.timeRemaining <= 0) {
    advanceTimerPhase(id);
  }

  s._raf = requestAnimationFrame(() => timerTick(id, config));
}

function advanceTimerPhase(id) {
  const s = timerState[id];
  if (!s) return;

  if (s.type === "countdown") {
    s.status = "done";
    const el = s._el;
    if (el.label) el.label.textContent = "COMPLETE";
    playAllDone();
    updateTimerControls(id, "done");
    if (el.bar) el.bar.style.transform = "scaleX(0)";
    return;
  }

  if (s.type === "intervals") {
    if (s.phase === "warmup") {
      s.phase = "work";
      s.timeRemaining = s.config.work;
      s.phaseTotal = s.config.work;
      s._resetFlags();
      playStartWhistle();
      startMusic(true);
      if (s._el.label) s._el.label.textContent = "WORK";
      if (s._el.phase) s._el.phase.textContent = `Interval ${s.currentRound}/${s.config.rounds}`;
    } else if (s.phase === "work") {
      playWorkEnd();
      s.phase = "recovery";
      s.timeRemaining = s.config.recovery;
      s.phaseTotal = s.config.recovery;
      s._resetFlags();
      startMusic(false);
      if (s._el.label) s._el.label.textContent = "RECOVER";
    } else if (s.phase === "recovery") {
      s.currentRound++;
      if (s.currentRound > s.config.rounds) {
        s.phase = "cooldown";
        s.timeRemaining = s.config.cooldown;
        s.phaseTotal = s.config.cooldown;
        s._resetFlags();
        startMusic(false);
        if (s._el.label) s._el.label.textContent = "COOLDOWN";
        if (s._el.phase) s._el.phase.textContent = "Final cooldown";
      } else {
        s.phase = "work";
        s.timeRemaining = s.config.work;
        s.phaseTotal = s.config.work;
        s._resetFlags();
        playRestOver();
        startMusic(true);
        if (s._el.label) s._el.label.textContent = "WORK";
        if (s._el.phase) s._el.phase.textContent = `Interval ${s.currentRound}/${s.config.rounds}`;
      }
    } else if (s.phase === "cooldown") {
      s.status = "done";
      if (s._el.label) s._el.label.textContent = "COMPLETE";
      playAllDone();
      updateTimerControls(id, "done");
      if (s._el.bar) s._el.bar.style.transform = "scaleX(0)";
      return;
    }
    updateIntervalDisplay(id);
  }

  if (s.type === "reps") {
    if (s.isWork) {
      playWorkEnd();
      if (s.currentSet >= s.totalSets) {
        s.status = "done";
        if (s._el.label) s._el.label.textContent = "COMPLETE";
        playAllDone();
        updateTimerControls(id, "done");
        if (s._el.bar) s._el.bar.style.transform = "scaleX(0)";
        return;
      }
      s.isWork = false;
      s.timeRemaining = s.restSeconds;
      s.phaseTotal = s.restSeconds;
      s._resetFlags();
      startMusic(false);
      if (s._el.label) s._el.label.textContent = "REST";
      if (s._el.sets) s._el.sets.textContent = `${s.currentSet}/${s.totalSets}`;
    } else {
      playRestOver();
      s.currentSet++;
      if (s.currentSet > s.totalSets) {
        s.status = "done";
        if (s._el.label) s._el.label.textContent = "COMPLETE";
        playAllDone();
        updateTimerControls(id, "done");
        if (s._el.bar) s._el.bar.style.transform = "scaleX(0)";
        return;
      }
      s.isWork = true;
      s.timeRemaining = s.workSeconds;
      s.phaseTotal = s.workSeconds;
      s._resetFlags();
      playStartWhistle();
      startMusic(true);
      if (s._el.label) s._el.label.textContent = "WORK";
      if (s._el.sets) s._el.sets.textContent = `${s.currentSet}/${s.totalSets}`;
    }
    updateSetIndicators(id, s.currentSet, s.totalSets);
  }
}

function timerStateReset(id) {
  if (!timerState[id]) timerState[id] = {};
  const s = timerState[id];
  s.status = "idle";
  s.lastTick = Date.now();
  s._raf = null;
  s._el = timerEls(id);
  s._resetFlags = function() { this._lastCountdownSec = null; this._musicStoppedForCountdown = false; };
  s._resetFlags();
}

function timerEls(id) {
  const resolve = (name) => {
    let visible = null;
    document.querySelectorAll(`#${name}-${id}`).forEach(el => {
      if (!visible && el.offsetParent !== null) visible = el;
    });
    return visible || document.getElementById(`${name}-${id}`) || null;
  };
  return {
    time: resolve("time"),
    bar: resolve("bar"),
    label: resolve("label"),
    sets: resolve("sets"),
    phase: resolve("phase"),
  };
}

function updateTimerControls(id, state) {
  document.querySelectorAll(`.timer-start[data-exercise="${id}"]`).forEach(start => {
    const pause = start.closest('.timer-controls').querySelector('.timer-pause');
    const stop = start.closest('.timer-controls').querySelector('.timer-stop');
    if (state === "idle") { start.style.display = ""; start.textContent = "Start"; pause.style.display = "none"; stop.style.display = "none"; }
    else if (state === "running") { start.style.display = "none"; pause.style.display = ""; pause.textContent = "Pause"; stop.style.display = ""; }
    else if (state === "paused") { start.style.display = ""; start.textContent = "Resume"; pause.style.display = "none"; stop.style.display = ""; }
    else if (state === "done") { start.style.display = ""; start.textContent = "Restart"; pause.style.display = "none"; stop.style.display = "none"; }
  });
  updateMobileTimerDock(id, state);
}

function updateSetIndicators(id, current, total) {
  const dots = document.querySelectorAll(`.set-dot[data-exercise="${id}"]`);
  dots.forEach((d, i) => {
    d.className = "set-dot" + (i < current - 1 ? " done" : i === current - 1 ? " active" : "");
  });
}

function updateIntervalDisplay(id) {
  const s = timerState[id];
  if (!s || !s._el) return;
  const el = s._el;
  if (el.phase) el.phase.textContent = s.phase === "warmup" ? "Warm-up" :
    s.phase === "work" ? `Interval ${s.currentRound}/${s.config.rounds}` :
    s.phase === "recovery" ? `Recovery ${s.currentRound}/${s.config.rounds}` :
    "Cooldown";
}

function handleTimerAction(id, action) {
  if (!timerState[id]) return;
  let s = timerState[id];

  if (action === "start") {
    for (const [tid, ts] of Object.entries(timerState)) {
      if (tid !== id && (ts.status === "running" || ts.status === "paused")) {
        handleTimerAction(tid, "stop");
      }
    }
    if (s.status === "done") { initTimerState(id); s = timerState[id]; }
    s.status = "running";
    s.lastTick = Date.now();
    updateMobileTimerDock(id, "running");
    updateTimerControls(id, "running");
    if (s._el.label) s._el.label.textContent = s.type === "countdown" ? "ACTIVE · CONVERSATIONAL PACE" : s.type === "intervals" ? "WARM-UP" : `WORK · SET ${s.currentSet}/${s.totalSets}`;
    playStartWhistle();
    if (s.type !== "countdown") startMusic(true);
    timerTick(id);
  } else if (action === "pause") {
    s.status = "paused";
    if (s._raf) { cancelAnimationFrame(s._raf); s._raf = null; }
    stopMusic();
    updateMobileTimerDock(id, "paused");
    updateTimerControls(id, "paused");
    if (s._el.label) s._el.label.textContent = "PAUSED";
  } else if (action === "stop") {
    s.status = "idle";
    if (s._raf) { cancelAnimationFrame(s._raf); s._raf = null; }
    stopMusic();
    updateMobileTimerDock(id, "idle");
    initTimerState(id);
    const el2 = timerState[id]._el;
    updateTimerControls(id, "idle");
    const st = timerState[id];
    if (st.type === "countdown") {
      const m = Math.floor(st.totalSeconds / 60);
      const sec = st.totalSeconds % 60;
      if (el2.time) el2.time.textContent = `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
      if (el2.label) el2.label.textContent = "Ready";
    } else if (st.type === "intervals") {
      if (el2.time) el2.time.textContent = "00:00";
      if (el2.label) el2.label.textContent = "Ready";
      if (el2.phase) el2.phase.textContent = "Norwegian 4×4";
      if (el2.bar) el2.bar.style.transform = "scaleX(1)";
    } else {
      const m = Math.floor(st.workSeconds / 60);
      const sec = st.workSeconds % 60;
      if (el2.time) el2.time.textContent = `${String(m).padStart(2,"0")}:${String(sec).padStart(2,"0")}`;
      if (el2.bar) el2.bar.style.transform = "scaleX(1)";
      if (el2.label) el2.label.textContent = "Ready";
      if (el2.sets) el2.sets.textContent = `1/${st.totalSets}`;
      updateSetIndicators(id, 1, st.totalSets);
    }
  }
}

function initTimerState(id) {
  const s = timerState[id];
  if (!s) return;
  if (s.type === "countdown") {
    s.timeRemaining = s.totalSeconds;
    s.phaseTotal = s.totalSeconds;
  } else if (s.type === "intervals") {
    s.phase = "warmup";
    s.currentRound = 1;
    s.timeRemaining = s.config.warmup;
    s.phaseTotal = s.config.warmup;
  } else {
    s.currentSet = 1;
    s.isWork = true;
    s.timeRemaining = s.workSeconds;
    s.phaseTotal = s.workSeconds;
  }
}

function createTimerState(id, config) {
  timerState[id] = { ...config, status: "idle", _raf: null, _el: timerEls(id) };
  timerState[id]._resetFlags = function() { this._lastCountdownSec = null; this._musicStoppedForCountdown = false; };
  initTimerState(id);
}

function initExerciseTimers() {
  const container = document.querySelector("#workout-app");
  if (!container) return;
  container.addEventListener("click", (e) => {
    const tab = e.target.closest("[data-pillar-tab]");
    if (tab) {
      const selected = tab.dataset.pillarTab;
      container.querySelectorAll("[data-pillar-tab]").forEach(button => {
        const active = button === tab;
        button.classList.toggle("is-active", active);
        button.setAttribute("aria-selected", String(active));
        button.tabIndex = active ? 0 : -1;
      });
      container.querySelectorAll(".pillar-section").forEach(section => {
        section.hidden = section.dataset.pillar !== selected;
      });
      const current = container.querySelector("[data-current-pillar]");
      const pillar = PILLARS.find(item => item.id === selected);
      if (current && pillar) current.textContent = pillar.shortName || pillar.name;
      return;
    }
    const start = e.target.closest(".timer-start");
    const pause = e.target.closest(".timer-pause");
    const stop = e.target.closest(".timer-stop");
    const exId = (start || pause || stop)?.dataset?.exercise;
    if (!exId) return;
    if (start) handleTimerAction(exId, "start");
    else if (pause) handleTimerAction(exId, "pause");
    else if (stop) handleTimerAction(exId, "stop");
  });
  container.addEventListener("keydown", (e) => {
    const tab = e.target.closest("[data-pillar-tab]");
    if (!tab || !["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp"].includes(e.key)) return;
    const tabs = [...container.querySelectorAll("[data-pillar-tab]")];
    const current = tabs.indexOf(tab);
    const direction = e.key === "ArrowRight" || e.key === "ArrowDown" ? 1 : -1;
    const next = tabs[(current + direction + tabs.length) % tabs.length];
    e.preventDefault();
    next.focus();
    next.click();
  });
}

/* ============================
   4-Pillar Exercise Rendering
   ============================ */
function pillarOverviewCard(p) {
  const benefits = Array.isArray(p.benefits) ? p.benefits : [];
  return `
    <article class="workout-pillar-summary" id="pillar-${p.id}">
      <div class="pillar-card-head">
        <div class="workout-pillar-lockup">
          <span class="workout-pillar-kicker">${p.kicker || "TRAINING DOMAIN"}</span>
          <h2 class="pillar-name">${p.shortName || p.name}</h2>
        </div>
      </div>
      <p class="pillar-desc">${p.description}</p>
      <div class="workout-meta-grid">
        <div><span>Weekly dose</span><strong>${p.frequency}</strong></div>
        <div><span>Target</span><strong>${p.target}</strong></div>
      </div>
      <div class="workout-benefits">
        ${benefits.slice(0, 3).map(b => `<span>${b}</span>`).join("")}
      </div>
    </article>`;
}

function zone2TimerHTML(pillar) {
  const id = "zone2";
  const totalSec = pillar.timer.defaultMinutes * 60;
  const m = pillar.timer.defaultMinutes;
  return `
    <div class="pillar-timer zone2-timer" id="timer-${id}">
      <div class="timer-config">
        <span class="timer-phase-label" id="phase-${id}">Zone 2 Steady State</span>
      </div>
       <div class="timer-display">
         <span class="timer-time" id="time-${id}" role="timer" aria-label="Time remaining" aria-live="off">${String(m).padStart(2,"0")}:00</span>
        <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${id}" style="width:100%"></div></div>
      </div>
      <div class="timer-controls">
         <button class="timer-btn timer-start" data-exercise="${id}">Start session</button>
         <button class="timer-btn timer-pause" data-exercise="${id}" style="display:none">Pause</button>
         <button class="timer-btn timer-stop" data-exercise="${id}" style="display:none">Reset</button>
      </div>
        <div class="timer-label" id="label-${id}" role="status" aria-live="polite">Ready — ${m} min at conversational pace · No music, whistle cues only</div>
    </div>`;
}

function vo2TimerHTML(pillar) {
  const id = "vo2max";
  const t = pillar.timer;
  return `
    <div class="pillar-timer interval-timer" id="timer-${id}">
      <div class="timer-config">
        <span class="timer-phase-label" id="phase-${id}">${pillar.protocol.name}</span>
      </div>
       <div class="timer-display">
         <span class="timer-time" id="time-${id}" role="timer" aria-label="Time remaining" aria-live="off">00:00</span>
        <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${id}" style="width:100%"></div></div>
      </div>
      <div class="timer-controls">
         <button class="timer-btn timer-start" data-exercise="${id}">Start session</button>
         <button class="timer-btn timer-pause" data-exercise="${id}" style="display:none">Pause</button>
         <button class="timer-btn timer-stop" data-exercise="${id}" style="display:none">Reset</button>
      </div>
        <div class="timer-label" id="label-${id}" role="status" aria-live="polite">Ready — ${t.warmup/60}min warmup → ${t.rounds}×(${t.work/60}min work + ${t.recovery/60}min recovery) → ${t.cooldown/60}min cooldown</div>
    </div>`;
}

function strengthExerciseCard(ex) {
  const id = ex.id;
  const index = PILLARS.flatMap(p => p.exercises || []).findIndex(item => item.id === id) + 1;
  return `
    <div class="pillar-exercise-card" id="ex-${id}">
      <div class="exercise-index">${String(index).padStart(2, "0")}</div>
      <div class="exercise-main">
        <div class="exercise-header">
          <span class="exercise-pattern">${ex.pattern || "COMPOUND MOVEMENT"}</span>
          <h3 class="exercise-name">${ex.name}</h3>
        </div>
        <p class="exercise-desc">${ex.description}</p>
        <div class="exercise-dose"><span>${ex.sets} sets</span><span>${ex.reps || `${ex.workSeconds}s work`}</span><span>${ex.equipment || "Adaptable load"}</span></div>
        <details class="exercise-details">
          <summary>Show form cues</summary>
          <div class="exercise-detail-content">
            <div class="exercise-detail-section">
              <h5>Why it belongs</h5>
              <p class="exercise-detail-text">${ex.whyLongevity}</p>
            </div>
            <div class="exercise-detail-section">
              <h5>How to perform</h5>
              <ol class="checklist">${ex.instructions.map(i => `<li>${i}</li>`).join("")}</ol>
            </div>
          </div>
        </details>
      </div>
      <div class="exercise-timer-column">
        <div class="exercise-timer" id="timer-${id}">
          <div class="timer-config">
            <span id="config-${id}">${ex.sets} × ${ex.workSeconds}s work · ${ex.restSeconds}s rest</span>
            <span class="set-indicators">
              ${Array.from({length: ex.sets}, (_, i) => `<span class="set-dot${i === 0 ? " active" : ""}" data-exercise="${id}"></span>`).join("")}
            </span>
          </div>
           <div class="timer-display">
             <span class="timer-time" id="time-${id}" role="timer" aria-label="Time remaining" aria-live="off">${String(Math.floor(ex.workSeconds/60)).padStart(2,"0")}:${String(ex.workSeconds%60).padStart(2,"0")}</span>
            <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${id}" style="width:100%"></div></div>
          </div>
          <div class="timer-controls">
            <button class="timer-btn timer-start" data-exercise="${id}">Start</button>
            <button class="timer-btn timer-pause" data-exercise="${id}" style="display:none">Pause</button>
            <button class="timer-btn timer-stop" data-exercise="${id}" style="display:none">Reset</button>
          </div>
           <div class="timer-label" id="label-${id}" role="status" aria-live="polite">Ready</div>
        </div>
        <div class="exercise-set-counter">Set <span id="sets-${id}">1/${ex.sets}</span></div>
      </div>
    </div>`;
}

function renderPillars(targetId) {
  const container = document.getElementById(targetId || "workout-app");
  if (!container) return;

  const intro = `
    <section class="workout-console-intro">
      <div class="workout-console-copy">
        <span class="section-eyebrow">The minimum effective week</span>
        <h2>Four inputs. One durable body.</h2>
        <p>Use the pillars as a menu, not a punishment. Build the aerobic base first, add intensity when ready, train strength progressively, and keep joints moving daily.</p>
      </div>
      <div class="workout-metrics" aria-label="Weekly training framework">
        <div><strong>4</strong><span>training domains</span></div>
        <div><strong>150–300</strong><span>Zone 2 min / week</span></div>
        <div><strong>2–3</strong><span>strength sessions</span></div>
      </div>
    </section>
    <section class="workout-index" aria-label="Choose a training domain">
      <div class="workout-index-heading"><span>Choose a session</span><span data-current-pillar>${PILLARS[0].shortName || PILLARS[0].name}</span></div>
      <div class="workout-tabs" role="tablist">
        ${PILLARS.map((p, i) => {
          const kicker = p.kicker || `0${i + 1} / TRAINING`;
          return `
           <button class="workout-tab${i === 0 ? " is-active" : ""}" id="pillar-tab-${p.id}" type="button" role="tab" aria-selected="${i === 0}" aria-controls="section-${p.id}" tabindex="${i === 0 ? 0 : -1}" data-pillar-tab="${p.id}">
            <span class="workout-tab-copy"><span>${kicker}</span><strong>${p.shortName || p.name}</strong></span>
            <span class="workout-tab-dose">${p.frequency}</span>
          </button>`;
        }).join("")}
      </div>
    </section>`;

  const pillarHTML = PILLARS.map(p => {
    let timerHTML = "";
    let exercisesHTML = "";

    if (p.id === "zone2") {
      timerHTML = zone2TimerHTML(p);
    } else if (p.id === "vo2max") {
      timerHTML = vo2TimerHTML(p);
    } else if (p.exercises) {
      exercisesHTML = `<div class="pillar-exercises">${p.exercises.map(strengthExerciseCard).join("")}</div>`;
    }

    const whyHTML = p.whyLongevity ? `
      <details class="exercise-details">
        <summary>Why this matters</summary>
        <div class="exercise-detail-content">
          <div class="exercise-detail-section">
            <p class="exercise-detail-text">${p.whyLongevity}</p>
          </div>
        </div>
      </details>` : "";

    return `
       <section class="pillar-section" data-pillar="${p.id}" id="section-${p.id}" role="tabpanel" aria-labelledby="pillar-tab-${p.id}"${p.id !== PILLARS[0].id ? " hidden" : ""}>
        ${pillarOverviewCard(p)}
        <div class="workout-protocol-heading"><span>Session protocol</span><span>${p.dose || p.frequency}</span></div>
        ${timerHTML}
        ${exercisesHTML}
        <div class="workout-notes">${whyHTML}</div>
      </section>`;
  }).join("");

  container.innerHTML = intro + `<div class="pillars-container">${pillarHTML}</div><div class="mobile-timer-dock" data-mobile-timer-dock hidden><div><span data-mobile-timer-phase>Active session</span><strong data-mobile-timer-time>00:00</strong></div><div class="timer-controls"><button class="timer-btn timer-start" data-exercise="">Resume</button><button class="timer-btn timer-pause" data-exercise="">Pause</button><button class="timer-btn timer-stop" data-exercise="">Reset</button></div></div>`;

  // Create timer states for each pillar
  const zone2 = PILLARS.find(p => p.id === "zone2");
  const vo2 = PILLARS.find(p => p.id === "vo2max");

  createTimerState("zone2", {
    type: "countdown",
    totalSeconds: zone2.timer.defaultMinutes * 60,
  });

  createTimerState("vo2max", {
    type: "intervals",
    config: vo2.timer,
  });

  // Create timer states for strength/mobility exercises
  PILLARS.forEach(p => {
    if (p.exercises) {
      p.exercises.forEach(ex => {
        createTimerState(ex.id, {
          type: "reps",
          workSeconds: ex.workSeconds,
          restSeconds: ex.restSeconds,
          totalSets: ex.sets,
          currentSet: 1,
          isWork: true,
        });
      });
    }
  });

  initExerciseTimers();
}

/* ============================
   Legacy exercise rendering (backward compat)
   ============================ */
function exerciseCardFace(e) {
  const def = e.variations[1] || e.variations[0];
  return `
    <div class="exercise-header">
      <div class="exercise-name">${e.name}</div>
    </div>
    <div class="exercise-target" id="target-${e.id}">${def.target}</div>
    <p class="exercise-desc">${e.description}</p>
    <div class="exercise-timer" id="timer-${e.id}">
      <div class="timer-config">
        <span id="config-${e.id}">${def.sets} × ${def.workSeconds}s work · ${def.restSeconds}s rest</span>
        <span class="set-indicators">
          ${Array.from({length: def.sets}, (_, i) => `<span class="set-dot${i === 0 ? " active" : ""}" data-exercise="${e.id}"></span>`).join("")}
        </span>
      </div>
      <div class="timer-display">
        <span class="timer-time" id="time-${e.id}">${String(Math.floor(def.workSeconds/60)).padStart(2,"0")}:${String(def.workSeconds%60).padStart(2,"0")}</span>
        <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${e.id}" style="width:100%"></div></div>
      </div>
      <div class="timer-controls">
        <button class="timer-btn timer-start" data-exercise="${e.id}">Start</button>
        <button class="timer-btn timer-pause" data-exercise="${e.id}" style="display:none">Pause</button>
        <button class="timer-btn timer-stop" data-exercise="${e.id}" style="display:none">Stop</button>
      </div>
      <div class="timer-label" id="label-${e.id}">Ready</div>
    </div>
    <div class="exercise-set-counter">Set <span id="sets-${e.id}">1/${def.sets}</span></div>`;
}

function exerciseCardDetail(e) {
  return `
    <div class="exercise-detail-section">
      <h5>Why This Exercise</h5>
      <p class="exercise-detail-text">${e.whyLongevity}</p>
    </div>
    <div class="exercise-detail-section">
      <h5>Step-by-Step</h5>
      <ol class="checklist">${e.instructions.map(i => `<li>${i}</li>`).join("")}</ol>
    </div>`;
}

function renderExercises(targetId) {
  renderPillars(targetId);
}

// Auto-initialize based on which page we're on
document.addEventListener('DOMContentLoaded', () => {
  const workoutApp = document.getElementById('workout-app');
  const investmentsApp = document.getElementById('investments-app');
  if (workoutApp) safeRender(() => renderExercises('workout-app'), workoutApp);
  if (investmentsApp) safeRender(() => {
    investmentsApp.innerHTML = renderInvestments();
    const combos = [...investmentsApp.querySelectorAll('[data-invest-combo]')];
    if (window.matchMedia('(max-width: 767px)').matches) combos.forEach((combo, index) => { combo.open = index === 0; });
    combos.forEach((combo) => combo.addEventListener('toggle', () => {
      if (!combo.open || !window.matchMedia('(max-width: 767px)').matches) return;
      combos.forEach((other) => { if (other !== combo) other.open = false; });
    }));
  }, investmentsApp);
});
