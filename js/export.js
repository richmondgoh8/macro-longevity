import { DAILY_SUPPLEMENTS, FOOD_SPICES, EXTRAS, AVOID_INGREDIENTS, UPF_GUIDE, SKIP_LIST, CONDITIONAL_LIST } from './data/stack.js';
import { CORE_OUTCOMES } from './data/core.js';
import { ANNUAL_PANEL, LOW_VALUE_TESTS, BEYOND_PANEL, APOB_PLAN, APOB_EFFECTS } from './data/blood.js';
import { INVESTMENTS } from './data/finance.js';
import { PILLARS, EXERCISES } from './data/workout.js';

document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-nav-toggle]');
    if (btn) {
        var isOpen = document.querySelector('.nav').classList.toggle('nav-open');
        document.body.classList.toggle('nav-open', isOpen);
        btn.setAttribute('aria-expanded', String(isOpen));
        return;
    }
    if (!e.target.closest('.nav') && document.querySelector('.nav') && document.querySelector('.nav').classList.contains('nav-open')) {
        document.querySelector('.nav').classList.remove('nav-open');
        document.body.classList.remove('nav-open');
        var menuButton = document.querySelector('[data-nav-toggle]');
        if (menuButton) menuButton.setAttribute('aria-expanded', 'false');
    }
});

document.addEventListener('click', function(e) {
    if (e.target.closest('[data-export]')) {
        exportData();
    }
});

function exportData() {
    const data = {
        exportedAt: new Date().toISOString(),
        source: "macro-longevity.com",
        supplements: DAILY_SUPPLEMENTS,
        foodSpices: FOOD_SPICES,
        extras: EXTRAS,
        avoidIngredients: AVOID_INGREDIENTS,
        upfGuide: UPF_GUIDE,
        coreOutcomes: CORE_OUTCOMES,
        conditionalList: CONDITIONAL_LIST,
        skipList: SKIP_LIST,
        bloodPanel: ANNUAL_PANEL,
        lowValueTests: LOW_VALUE_TESTS,
        beyondPanel: BEYOND_PANEL,
        apobPlan: APOB_PLAN,
        apobEffects: APOB_EFFECTS,
        investments: INVESTMENTS,
        pillars: PILLARS,
        exercises: EXERCISES,
    };

    let md = `# Macro Longevity Knowledge Base\n\n`;
    md += `Exported: ${data.exportedAt}\nSource: ${data.source}\n\n`;
    md += `> Carnivore-first, evidence-graded and outcome-focused. Not medical advice.\n\n`;
    md += `---\n\n`;

    md += `## Supplements (${data.supplements.length})\n\n`;
    data.supplements.forEach(s => {
        md += `### ${s.icon} ${s.name}\n`;
        if (s.evidence) md += `- **Evidence:** ${s.evidence}\n`;
        md += `- **Dose:** ${s.dose}\n`;
        md += `- **Timing:** ${s.timing}\n`;
        md += `- **Pairing:** ${s.pairing}\n`;
        if (s.synergy && s.synergy.length) md += `- **Synergy:** ${s.synergy.join(', ')}\n`;
        md += `- **Why:** ${s.why}\n`;
        if (s.carnivoreNote) md += `- **Carnivore note:** ${s.carnivoreNote}\n`;
        md += `\n`;
    });

    md += `## Food & Spices (${data.foodSpices.length})\n\n`;
    data.foodSpices.forEach(f => {
        md += `### ${f.icon} ${f.name}\n`;
        if (f.evidence) md += `- **Evidence:** ${f.evidence}\n`;
        md += `- **Serving:** ${f.serving}\n`;
        md += `- **When:** ${f.timing}\n`;
        md += `- **Why:** ${f.why}\n`;
        if (f.risk) md += `- **Risk:** ${f.risk}\n`;
        md += `\n`;
    });

    md += `## Extras (${data.extras.length})\n\n`;
    data.extras.forEach(f => {
        md += `### ${f.icon} ${f.name}\n`;
        if (f.evidence) md += `- **Evidence:** ${f.evidence}\n`;
        md += `- **Serving:** ${f.serving}\n`;
        md += `- **When:** ${f.timing}\n`;
        md += `- **Why:** ${f.why}\n`;
        if (f.risk) md += `- **Risk:** ${f.risk}\n`;
        md += `\n`;
    });

    md += `## Ingredients to Avoid (${data.avoidIngredients.length})\n\n`;
    data.avoidIngredients.forEach(a => {
        md += `### ${a.name}\n`;
        if (a.evidence) md += `- **Evidence:** ${a.evidence}\n`;
        md += `- **Where it hides:** ${a.where}\n`;
        md += `- **Why:** ${a.why}\n`;
        md += `- **Replace with:** ${a.replace}\n\n`;
    });

    md += `## How to Identify Ultra-Processed Food\n\n${data.upfGuide.intro}\n\n`;
    data.upfGuide.steps.forEach((step, i) => { md += `${i + 1}. ${step}\n`; });
    md += `\n**Red-flag markers:** ${data.upfGuide.redFlags.join('; ')}\n\n`;
    md += `**Not automatically UPF:** ${data.upfGuide.notAutomatic.join('; ')}\n\n`;

    md += `## Core Outcome Coverage\n\n`;
    data.coreOutcomes.forEach(o => {
        md += `### ${o.icon} ${o.name}\n- **Core:** ${o.core}\n- **Targeted:** ${o.targeted}\n- **Track:** ${o.measure}\n\n`;
    });

    md += `## Skip List — Do Not Buy (${data.skipList.length})\n\n`;
    data.skipList.forEach(s => {
        md += `### ${s.icon} ${s.name}\n`;
        md += `- **Why skip:** ${s.why}\n`;
        md += `\n`;
    });

    md += `## Conditional — Context-Dependent (${data.conditionalList.length})\n\n`;
    data.conditionalList.forEach(s => {
        md += `### ${s.icon} ${s.name}\n`;
        if (s.evidence) md += `- **Evidence:** ${s.evidence}\n`;
        md += `- **Who:** ${s.who}\n`;
        md += `- **Dose:** ${s.dose}\n`;
        md += `- **Why:** ${s.why}\n`;
        md += `- **Caution:** ${s.caution}\n`;
        md += `\n`;
    });

    md += `## Annual Blood Panel (${data.bloodPanel.length})\n\n`;
    data.bloodPanel.forEach(t => {
        md += `### ${t.name}\n`;
        if (t.evidence) md += `- **Evidence:** ${t.evidence}\n`;
        md += `- **Frequency:** ${t.frequency}\n`;
        md += `- **Target:** ${t.optimalRange}\n`;
        md += `- **Why:** ${t.why}\n`;
        if (t.carnivoreNote) md += `- **Carnivore note:** ${t.carnivoreNote}\n`;
        md += `\n`;
    });

    md += `## Low-Value Tests — Skip (${data.lowValueTests.length})\n\n`;
    data.lowValueTests.forEach(t => {
        md += `### ${t.name}\n`;
        md += `- **Why it's a trap:** ${t.why}\n\n`;
    });

    md += `## Beyond the Blood Panel (${data.beyondPanel.length})\n\n`;
    data.beyondPanel.forEach(t => {
        md += `### ${t.icon} ${t.name}\n`;
        md += `- **Do:** ${t.action}\n`;
        md += `- **Why:** ${t.why}\n\n`;
    });

    md += `## ApoB Elevated? Next Steps (${data.apobPlan.length})\n\n`;
    data.apobPlan.forEach((s, i) => {
        md += `${i + 1}. **${s.step}:** ${s.action}\n`;
    });
    md += `\n**What helps what:**\n\n`;
    md += `| Intervention | Also helps | Lowers ApoB? |\n|---|---|---|\n`;
    data.apobEffects.forEach(r => { md += `| ${r[0]} | ${r[1]} | ${r[2]} |\n`; });
    md += `\n`;

    md += `## Investment Combos (${data.investments.length})\n\n`;
    data.investments.forEach(inv => {
        md += `### ${inv.name}\n`;
        md += `- **Goal:** ${inv.goal}\n`;
        md += `- **Return:** ${inv.totalReturn} | **Risk:** ${inv.riskLevel}\n`;
        md += `- **Portfolio:**\n`;
        inv.portfolio.forEach(a => {
            md += `  - ${a.asset} (${a.pct}) — ${a.why}\n`;
        });
        md += `- **Synergy:** ${inv.synergy}\n`;
        if (inv.tips && inv.tips.length) {
            md += `- **Tips:**\n`;
            inv.tips.forEach(t => md += `  - ${t}\n`);
        }
        md += `\n`;
    });

    md += `## 4 Pillars of Longevity Training\n\n`;
    data.pillars.forEach(p => {
        md += `### ${p.icon} ${p.name}\n`;
        md += `- **Frequency:** ${p.frequency}\n`;
        md += `- **Target:** ${p.target}\n`;
        md += `- **Benefits:**\n`;
        p.benefits.forEach(b => md += `  - ${b}\n`);
        if (p.whyLongevity) md += `- **Why:** ${p.whyLongevity}\n`;
        if (p.protocol) {
            md += `- **Protocol:** ${p.protocol.name} — ${p.protocol.warmup}min warmup → ${p.protocol.rounds}×(${p.protocol.workMinutes}min work + ${p.protocol.recoveryMinutes}min recovery) → ${p.protocol.cooldown}min cooldown\n`;
        }
        if (p.exercises) {
            md += `- **Exercises:**\n`;
            p.exercises.forEach(ex => {
                md += `  - ${ex.name}: ${ex.sets}×${ex.workSeconds}s work/${ex.restSeconds}s rest\n`;
            });
        }
        md += `\n`;
    });

    const blob = new Blob([md], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'macro-longevity-data.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

window.exportData = exportData;
