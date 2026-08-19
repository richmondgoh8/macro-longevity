import { PILLARS, EXERCISES } from './data/workout.js';
import { INVESTMENTS } from './data/finance.js';
import { CardSwipe } from './components/card-swipe.js';

function safeRender(fn, container, fallback) {
  try { fn(); }
  catch (err) {
    console.error('Render error:', err);
    if (container) {
      container.innerHTML = `<div style="padding:24px;text-align:center;color:var(--color-text-secondary)">
        <p style="font-size:18px;margin-bottom:8px">Something went wrong.</p>
        <p style="font-size:14px;color:var(--color-text-muted)">${fallback || 'Please refresh the page.'}</p>
      </div>`;
    }
  }
}
let budgetInvestments = 0;

function renderInvestments() {
  return `<div class="page-header">
    <div class="section-inner">
      <h1 class="page-title">Investment Combos (Singapore Edition)</h1>
      <p class="page-desc">Pre-built portfolio combos based on r/singaporefi wisdom. Each combo shows how different instruments work together, why they synergize, and exactly how to execute. Pick the one that matches your goal and risk tolerance.</p>
    </div>
  </div>
  <div class="section">
    <div class="section-inner invest-combo-grid">
      <p class="invest-disclaimer">Not financial advice. Information sourced from MAS, CPF Board, r/singaporefi, and HardwareZone for educational purposes. Consult a licensed adviser.</p>

      <div class="budget-tool" id="budgetTool">
        <h3 class="budget-title">💵 Your Budget at a Glance</h3>
        <p class="budget-desc">Enter your monthly take-home salary. The 50/30/20 rule splits it into Expenses, Investments, and Savings. Drag the sliders to adjust.</p>
        <div class="budget-input-row">
          <div class="budget-field">
            <label>Monthly Take-Home Salary</label>
            <input type="number" id="budgetSalary" value="" min="0" step="500" placeholder="e.g. 5000" data-budget-input>
          </div>
        </div>
        <div id="budgetResults"></div>
        <div class="budget-sliders" id="budgetSliders" style="display:none">
          <div class="budget-slider-row">
            <div class="budget-slider-label">
              <span class="budget-slider-name" style="color:#2563eb;font-weight:700">Expenses</span>
              <span class="budget-slider-name" style="color:#2563eb;font-weight:700">Investments</span>
              <span class="budget-slider-name" style="color:var(--color-text-muted)">Savings</span>
            </div>
          </div>
          <div class="budget-slider-row">
            <label>Expenses <span id="budgetPctExpenses">50</span>%</label>
            <input type="range" id="sliderExpenses" min="0" max="100" value="50" data-budget-input>
            <span class="budget-slider-val" id="budgetValExpenses">SGD 0</span>
          </div>
          <div class="budget-slider-row">
            <label>Investments <span id="budgetPctInvestments">30</span>%</label>
            <input type="range" id="sliderInvestments" min="0" max="100" value="30" data-budget-input>
            <span class="budget-slider-val" id="budgetValInvestments">SGD 0</span>
          </div>
          <p class="budget-slider-hint">Savings auto-calculates as the remainder. Total always sums to 100%.</p>
        </div>
      </div>

      ${INVESTMENTS.map(c => `
        <article class="invest-card" id="inv-${c.id}">
          <div class="invest-card-top">
            <span class="invest-icon">${c.icon}</span>
            <div>
              <h2 class="invest-name">${c.name}</h2>
              <span class="invest-goal">${c.goal}</span>
            </div>
          </div>
          <div class="invest-meta-bar">
            <span>📈 ${c.totalReturn}</span>
            <span>⚠️ ${c.riskLevel}</span>
          </div>
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
            <summary>🧩 Why These Work Together</summary>
            <p class="invest-body-text">${c.synergy}</p>
          </details>
          <details class="meal-details">
            <summary>📋 Step-by-Step Execution</summary>
            <p class="invest-body-text">${c.howToExecute}</p>
          </details>
          <details class="meal-details">
            <summary>💡 Tips from r/singaporefi</summary>
            <ul class="checklist">
              ${c.tips.map(t => `<li>${t}</li>`).join("")}
            </ul>
          </details>
        </article>
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
      <div class="budget-card" style="background:#f0f6ff">
        <div class="budget-card-label" style="color:#2563eb">Expenses</div>
        <div class="budget-card-amt" style="color:#2563eb">SGD ${Math.round(salary * vE / 100).toLocaleString()}</div>
        <div class="budget-card-pct" style="color:#2563eb">${vE}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">Housing, food, transport, bills, insurance</div>
      </div>
      <div class="budget-card" style="background:#e8f5e9">
        <div class="budget-card-label" style="color:#2e7d32">Investments</div>
        <div class="budget-card-amt" style="color:#2e7d32">SGD ${budgetInvestments.toLocaleString()}</div>
        <div class="budget-card-pct" style="color:#2e7d32">${vI}%</div>
        <div class="budget-card-desc" style="color:var(--color-text-muted)">Stocks, ETFs, CPF top-ups, robos</div>
      </div>
      <div class="budget-card" style="background:#fef3e7">
        <div class="budget-card-label" style="color:#e8993a">Savings</div>
        <div class="budget-card-amt" style="color:#e8993a">SGD ${Math.round(salary * vS / 100).toLocaleString()}</div>
        <div class="budget-card-pct" style="color:#e8993a">${vS}%</div>
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
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  return audioCtx;
}
document.addEventListener("click", () => {
  if (audioCtx && audioCtx.state === "suspended") audioCtx.resume();
}, { once: true });

function playTone(freq, duration, type, startTime, gainVal) {
  try {
    const ctx = getAudioCtx();
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
  if (musicBuffer || musicLoading) return musicLoading;
  musicLoading = (async () => {
    try {
      const ctx = getAudioCtx();
      const resp = await fetch(MUSIC_URL);
      const buf = await resp.arrayBuffer();
      musicBuffer = await ctx.decodeAudioData(buf);
    } catch(e) { musicBuffer = null; }
  })();
  return musicLoading;
}

function loadRestMusic() {
  if (restMusicBuffer || restMusicLoading) return restMusicLoading;
  restMusicLoading = (async () => {
    try {
      const ctx = getAudioCtx();
      const resp = await fetch(REST_MUSIC_URL);
      const buf = await resp.arrayBuffer();
      restMusicBuffer = await ctx.decodeAudioData(buf);
    } catch(e) { restMusicBuffer = null; }
  })();
  return restMusicLoading;
}

async function startMusic(isWork) {
  stopMusic();
  const buf = isWork ? musicBuffer : restMusicBuffer;
  if (!buf) { isWork ? await loadMusic() : await loadRestMusic(); }
  const ctx = getAudioCtx();
  const activeBuf = isWork ? musicBuffer : restMusicBuffer;
  if (!ctx || !activeBuf) return;

  musicSource = ctx.createBufferSource();
  musicSource.buffer = activeBuf;
  musicSource.loop = true;
  musicGain = ctx.createGain();
  musicGain.gain.value = isWork ? 0.2 : 0.4;
  musicSource.connect(musicGain).connect(ctx.destination);
  musicSource.start(0, isWork ? MUSIC_START_OFFSET : 0);
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
    const buf = await resp.arrayBuffer();
    soundBuffers[name] = await ctx.decodeAudioData(buf);
  } catch(e) {
    soundBuffers[name] = null;
  }
}

function playSound(name) {
  const buf = soundBuffers[name];
  if (!buf) return false;
  try {
    const ctx = getAudioCtx();
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
  for (const [name, url] of Object.entries(SOUND_URLS)) {
    loadSound(name, url);
  }
  loadMusic();
  loadRestMusic();
}

/* ============================
   Exercise Timer State — Unified
   ============================ */
const timerState = {};

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
    if (el.label) el.label.textContent = "✅ DONE";
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
      if (s._el.label) s._el.label.textContent = "⚡ WORK";
      if (s._el.phase) s._el.phase.textContent = `Interval ${s.currentRound}/${s.config.rounds}`;
    } else if (s.phase === "work") {
      playWorkEnd();
      s.phase = "recovery";
      s.timeRemaining = s.config.recovery;
      s.phaseTotal = s.config.recovery;
      s._resetFlags();
      startMusic(false);
      if (s._el.label) s._el.label.textContent = "😮‍💨 RECOVER";
    } else if (s.phase === "recovery") {
      s.currentRound++;
      if (s.currentRound > s.config.rounds) {
        s.phase = "cooldown";
        s.timeRemaining = s.config.cooldown;
        s.phaseTotal = s.config.cooldown;
        s._resetFlags();
        startMusic(false);
        if (s._el.label) s._el.label.textContent = "🧘 COOLDOWN";
        if (s._el.phase) s._el.phase.textContent = "Final cooldown";
      } else {
        s.phase = "work";
        s.timeRemaining = s.config.work;
        s.phaseTotal = s.config.work;
        s._resetFlags();
        playRestOver();
        startMusic(true);
        if (s._el.label) s._el.label.textContent = "⚡ WORK";
        if (s._el.phase) s._el.phase.textContent = `Interval ${s.currentRound}/${s.config.rounds}`;
      }
    } else if (s.phase === "cooldown") {
      s.status = "done";
      if (s._el.label) s._el.label.textContent = "✅ DONE";
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
        if (s._el.label) s._el.label.textContent = "✅ DONE";
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
      if (s._el.label) s._el.label.textContent = "💤 REST";
      if (s._el.sets) s._el.sets.textContent = `${s.currentSet}/${s.totalSets}`;
    } else {
      playRestOver();
      s.currentSet++;
      if (s.currentSet > s.totalSets) {
        s.status = "done";
        if (s._el.label) s._el.label.textContent = "✅ DONE";
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
      if (s._el.label) s._el.label.textContent = "⏱️ WORK";
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
    if (state === "idle") { start.style.display = ""; start.textContent = "▶ Start"; pause.style.display = "none"; stop.style.display = "none"; }
    else if (state === "running") { start.style.display = "none"; pause.style.display = ""; pause.textContent = "⏸ Pause"; stop.style.display = ""; }
    else if (state === "paused") { start.style.display = ""; start.textContent = "▶ Resume"; pause.style.display = "none"; stop.style.display = ""; }
    else if (state === "done") { start.style.display = ""; start.textContent = "↻ Restart"; pause.style.display = "none"; stop.style.display = "none"; }
  });
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
    updateTimerControls(id, "running");
    playStartWhistle();
    if (s.type !== "countdown") startMusic(true);
    timerTick(id);
  } else if (action === "pause") {
    s.status = "paused";
    if (s._raf) { cancelAnimationFrame(s._raf); s._raf = null; }
    stopMusic();
    updateTimerControls(id, "paused");
  } else if (action === "stop") {
    s.status = "idle";
    if (s._raf) { cancelAnimationFrame(s._raf); s._raf = null; }
    stopMusic();
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
    const start = e.target.closest(".timer-start");
    const pause = e.target.closest(".timer-pause");
    const stop = e.target.closest(".timer-stop");
    const exId = (start || pause || stop)?.dataset?.exercise;
    if (!exId) return;
    if (start) handleTimerAction(exId, "start");
    else if (pause) handleTimerAction(exId, "pause");
    else if (stop) handleTimerAction(exId, "stop");
  });
}

/* ============================
   4-Pillar Exercise Rendering
   ============================ */
function pillarOverviewCard(p) {
  const freq = p.id === "zone2" ? p.frequency :
    p.id === "vo2max" ? `${p.protocol.name} · ${p.protocol.totalMinutes} min` :
    p.id === "strength" ? p.frequency :
    p.frequency;
  return `
    <article class="pillar-card" id="pillar-${p.id}">
      <div class="pillar-card-head">
        <span class="pillar-icon">${p.icon}</span>
        <div>
          <h2 class="pillar-name">${p.name}</h2>
          <span class="pillar-freq">${freq}</span>
        </div>
      </div>
      <p class="pillar-desc">${p.description}</p>
      <div class="pillar-benefits">
        ${p.benefits.map(b => `<span class="pillar-benefit">✓ ${b}</span>`).join("")}
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
        <span class="timer-time" id="time-${id}">${String(m).padStart(2,"0")}:00</span>
        <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${id}" style="width:100%"></div></div>
      </div>
      <div class="timer-controls">
        <button class="timer-btn timer-start" data-exercise="${id}">▶ Start</button>
        <button class="timer-btn timer-pause" data-exercise="${id}" style="display:none">⏸ Pause</button>
        <button class="timer-btn timer-stop" data-exercise="${id}" style="display:none">⏹ Stop</button>
      </div>
      <div class="timer-label" id="label-${id}">Ready — ${m} min at conversational pace</div>
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
        <span class="timer-time" id="time-${id}">00:00</span>
        <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${id}" style="width:100%"></div></div>
      </div>
      <div class="timer-controls">
        <button class="timer-btn timer-start" data-exercise="${id}">▶ Start</button>
        <button class="timer-btn timer-pause" data-exercise="${id}" style="display:none">⏸ Pause</button>
        <button class="timer-btn timer-stop" data-exercise="${id}" style="display:none">⏹ Stop</button>
      </div>
      <div class="timer-label" id="label-${id}">Ready — ${t.warmup/60}min warmup → ${t.rounds}×(${t.work/60}min work + ${t.recovery/60}min recovery) → ${t.cooldown/60}min cooldown</div>
    </div>`;
}

function strengthExerciseCard(ex) {
  const id = ex.id;
  return `
    <div class="pillar-exercise-card" id="ex-${id}">
      <div class="exercise-header">
        <div class="exercise-name">${ex.icon || "🏋️"} ${ex.name}</div>
      </div>
      <p class="exercise-desc">${ex.description}</p>
      <div class="exercise-timer" id="timer-${id}">
        <div class="timer-config">
          <span id="config-${id}">${ex.sets} × ${ex.workSeconds}s work · ${ex.restSeconds}s rest</span>
          <span class="set-indicators">
            ${Array.from({length: ex.sets}, (_, i) => `<span class="set-dot${i === 0 ? " active" : ""}" data-exercise="${id}"></span>`).join("")}
          </span>
        </div>
        <div class="timer-display">
          <span class="timer-time" id="time-${id}">${String(Math.floor(ex.workSeconds/60)).padStart(2,"0")}:${String(ex.workSeconds%60).padStart(2,"0")}</span>
          <div class="timer-bar-track"><div class="timer-bar-fill" id="bar-${id}" style="width:100%"></div></div>
        </div>
        <div class="timer-controls">
          <button class="timer-btn timer-start" data-exercise="${id}">▶ Start</button>
          <button class="timer-btn timer-pause" data-exercise="${id}" style="display:none">⏸ Pause</button>
          <button class="timer-btn timer-stop" data-exercise="${id}" style="display:none">⏹ Stop</button>
        </div>
        <div class="timer-label" id="label-${id}">Ready</div>
      </div>
      <div class="exercise-set-counter">Set <span id="sets-${id}">1/${ex.sets}</span></div>
      <details class="exercise-details">
        <summary>📖 Guide</summary>
        <div class="exercise-detail-content">
          <div class="exercise-detail-section">
            <h5>🎯 Why</h5>
            <p class="exercise-detail-text">${ex.whyLongevity}</p>
          </div>
          <div class="exercise-detail-section">
            <h5>📋 Steps</h5>
            <ol class="checklist">${ex.instructions.map(i => `<li>${i}</li>`).join("")}</ol>
          </div>
        </div>
      </details>
    </div>`;
}

function renderPillars(targetId) {
  const container = document.getElementById(targetId || "workout-app");
  if (!container) return;

  initExerciseSounds();

  const intro = `
    <div class="exercise-intro">
      <h3>4 Pillars of Longevity Training</h3>
      <p>The four most impactful exercise domains for healthspan and lifespan. Each pillar addresses a distinct physiological system. Together, they cover cardiovascular fitness, mitochondrial health, muscular strength, and movement quality.</p>
    </div>`;

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
        <summary>📖 Why This Matters</summary>
        <div class="exercise-detail-content">
          <div class="exercise-detail-section">
            <p class="exercise-detail-text">${p.whyLongevity}</p>
          </div>
        </div>
      </details>` : "";

    return `
      <section class="pillar-section" id="section-${p.id}">
        ${pillarOverviewCard(p)}
        ${timerHTML}
        ${exercisesHTML}
        ${whyHTML}
      </section>`;
  }).join("");

  container.innerHTML = intro + `<div class="pillars-container">${pillarHTML}</div>`;

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
    <div class="exercise-target" id="target-${e.id}">🎯 ${def.target}</div>
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
        <button class="timer-btn timer-start" data-exercise="${e.id}">▶ Start</button>
        <button class="timer-btn timer-pause" data-exercise="${e.id}" style="display:none">⏸ Pause</button>
        <button class="timer-btn timer-stop" data-exercise="${e.id}" style="display:none">⏹ Stop</button>
      </div>
      <div class="timer-label" id="label-${e.id}">Ready</div>
    </div>
    <div class="exercise-set-counter">Set <span id="sets-${e.id}">1/${def.sets}</span></div>`;
}

function exerciseCardDetail(e) {
  return `
    <div class="exercise-detail-section">
      <h5>🎯 Why This Exercise</h5>
      <p class="exercise-detail-text">${e.whyLongevity}</p>
    </div>
    <div class="exercise-detail-section">
      <h5>📋 Step-by-Step</h5>
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
    if (typeof calcFire === 'function') calcFire();
    if (typeof renderPiTable === 'function') renderPiTable();
  }, investmentsApp);
});
