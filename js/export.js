import { icon } from './icons.js';
import './theme.js';

const bottomNavIcons = {
    Home: 'home',
    Stack: 'pill',
    Blood: 'droplet',
    Workout: 'activity',
    Finance: 'chart',
    Avoid: 'shield',
    Blueprint: 'flask',
};

document.querySelectorAll('.bottom-nav-item').forEach((item) => {
    const label = item.querySelector('.bottom-nav-label')?.textContent.trim();
    const iconName = bottomNavIcons[label];
    const target = item.querySelector('.bottom-nav-icon');
    if (iconName && target) target.innerHTML = icon(iconName, { size: 18 });
});
document.querySelectorAll('.bottom-nav').forEach((nav) => nav.setAttribute('aria-label', 'Mobile primary navigation'));
document.querySelectorAll('.bottom-nav-item.active').forEach((item) => item.setAttribute('aria-current', 'page'));

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

async function exportData() {
    const [
        { DAILY_SUPPLEMENTS, FOOD_SPICES, EXTRAS, AVOID_INGREDIENTS, AVOID_LABEL_GUIDE, UPF_GUIDE, TIMING_GUIDE, SKIP_LIST, CONDITIONAL_LIST },
        { CORE_OUTCOMES },
        { ANNUAL_PANEL, LOW_VALUE_TESTS, BEYOND_PANEL, APOB_PLAN, APOB_EFFECTS },
        { INVESTMENTS },
        { PILLARS, EXERCISES },
        { PILLARS: MASTER_PILLARS, LONGEVITY_101, DECISION_RULE, EVIDENCE_TIERS },
        { EIGHTY_TWENTY, SOCIAL_MENTAL, FRONTIER, SCREENING_TIERS, BIOLOGY },
        { HAWKER, HEALTHIER_SG, SODIUM, ENVIRONMENT },
        { NUTRIENT_GROUPS, NUTRIENT_REFERENCES, NUTRIENT_TARGETS, COMPOUND_TARGETS, BUILDER_ITEMS, FOUNDATION_STACK, MEAL_PLANS, MEAL_BOWLS, HIGH_ROI_FOODS, MITOCHONDRIAL_SUPPORT, BREATHING_PROTOCOLS, EFFICIENCY_PRACTICES, FOOD_TRAPS, SUPPLEMENT_GUIDANCE, NUTRITION_SOURCES },
    ] = await Promise.all([
        import('./data/stack.js'),
        import('./data/core.js'),
        import('./data/blood.js'),
        import('./data/finance.js'),
        import('./data/workout.js'),
        import('./data/pillars.js'),
        import('./data/protocol.js'),
        import('./data/singapore.js'),
        import('./data/nutrition.js'),
    ]);

    let passiveIncome = [];
    try {
        const stored = JSON.parse(localStorage.getItem('passiveIncome') || '[]');
        if (Array.isArray(stored)) {
            passiveIncome = stored.filter((row) => row && typeof row === 'object').map((row) => ({
                name: typeof row.name === 'string' ? row.name.slice(0, 120) : '',
                principal: Number.isFinite(Number(row.principal)) ? Math.max(0, Number(row.principal)) : 0,
                rate: Number.isFinite(Number(row.rate)) ? Math.min(100, Math.max(0, Number(row.rate))) : 0,
            }));
        }
    } catch {}

    let savedMeals = [];
    let currentDay = {};
    try { savedMeals = JSON.parse(localStorage.getItem('ml-daily-meals') || '[]'); } catch {}
    try { currentDay = JSON.parse(localStorage.getItem('ml-daily-current') || '{}') || {}; } catch {}

    const data = {
        exportedAt: new Date().toISOString(),
        source: "macro-longevity.com",
        supplements: DAILY_SUPPLEMENTS,
        foodSpices: FOOD_SPICES,
        extras: EXTRAS,
        avoidIngredients: AVOID_INGREDIENTS,
        avoidLabelGuide: AVOID_LABEL_GUIDE,
        upfGuide: UPF_GUIDE,
        timingGuide: TIMING_GUIDE,
        coreOutcomes: CORE_OUTCOMES,
        conditionalList: CONDITIONAL_LIST,
        skipList: SKIP_LIST,
        bloodPanel: ANNUAL_PANEL,
        lowValueTests: LOW_VALUE_TESTS,
        beyondPanel: BEYOND_PANEL,
        apobPlan: APOB_PLAN,
        apobEffects: APOB_EFFECTS,
        investments: INVESTMENTS,
        passiveIncome,
        pillars: PILLARS,
        exercises: EXERCISES,
        masterPillars: MASTER_PILLARS,
        longevity101: LONGEVITY_101,
        decisionRule: DECISION_RULE,
        evidenceTiers: EVIDENCE_TIERS,
        eightyTwenty: EIGHTY_TWENTY,
        socialMental: SOCIAL_MENTAL,
        frontier: FRONTIER,
        screeningTiers: SCREENING_TIERS,
        biology: BIOLOGY,
        hawker: HAWKER,
        healthierSG: HEALTHIER_SG,
        sodium: SODIUM,
        environment: ENVIRONMENT,
        nutrientTargets: NUTRIENT_TARGETS,
        nutrientGroups: NUTRIENT_GROUPS,
        nutrientReferences: NUTRIENT_REFERENCES,
        compoundTargets: COMPOUND_TARGETS,
        builderItems: BUILDER_ITEMS,
        foundationStack: FOUNDATION_STACK,
        mealPlans: MEAL_PLANS,
        mealBowls: MEAL_BOWLS,
        savedMeals,
        savedDailyPlans: [],
        selectedMealIds: Array.isArray(currentDay.mealIds) ? currentDay.mealIds : [],
        quickAddedItems: Array.isArray(currentDay.quickItemIds) ? currentDay.quickItemIds : [],
        mealPortions: currentDay.mealQuantities && typeof currentDay.mealQuantities === 'object' ? currentDay.mealQuantities : {},
        quickItemPortions: currentDay.quickItemQuantities && typeof currentDay.quickItemQuantities === 'object' ? currentDay.quickItemQuantities : {},
        currentBodyWeightKg: currentDay.bodyWeightKg,
        highRoiFoods: HIGH_ROI_FOODS,
        mitochondrialSupport: MITOCHONDRIAL_SUPPORT,
        breathingProtocols: BREATHING_PROTOCOLS,
        efficiencyPractices: EFFICIENCY_PRACTICES,
        foodTraps: FOOD_TRAPS,
        supplementGuidance: SUPPLEMENT_GUIDANCE,
        nutritionSources: NUTRITION_SOURCES,
        savedStacks: (() => { try { return JSON.parse(localStorage.getItem('ml-daily-stacks') || '[]'); } catch { return []; } })(),
    };

    let md = `# Macro Longevity Knowledge Base\n\n`;
    md += `Exported: ${data.exportedAt}\nSource: ${data.source}\n\n`;
    md += `> Food-first, evidence-graded and outcome-focused. Not medical advice.\n\n`;
    md += `---\n\n`;

    md += `## Food-first Daily Stack Builder\n\n`;
    data.nutrientTargets.forEach((target) => { md += `- **${target.name}:** ${target.target} — ${target.why}\n`; });
    md += `\nReference profile: adult male 19–50. Sources: NIH ODS, USDA FoodData Central and National Academies DRIs.\n`;
    md += `\n### Minimal evidence-first stack\n\n`;
    data.compoundTargets.forEach((target) => { md += `- **${target.name} (${target.evidence}):** ${target.target} — Food first: ${target.food}\n`; });
    md += `\nFoundation preset: ${data.foundationStack.items.join(', ')}\n`;
    md += `\n### Meal library\n\n`;
    data.mealPlans.forEach((meal) => { md += `- **${meal.name}:** ${meal.items.join(', ')}${meal.tags?.length ? ` — ${meal.tags.join(', ')}` : ''}\n`; });
    md += `\n### Saved meals\n\n`;
    if (data.savedMeals.length) data.savedMeals.forEach((meal) => { md += `- **${meal.name}:** ${meal.items.join(', ')}\n`; });
    else md += `No saved meals on this device.\n`;
    md += `\n### Current plan\n\n`;
    md += `- **Meals:** ${data.selectedMealIds.join(', ') || 'None'}\n- **Quick additions:** ${data.quickAddedItems.join(', ') || 'None'}\n- **Meal portions:** ${JSON.stringify(data.mealPortions)}\n- **Quick-item portions:** ${JSON.stringify(data.quickItemPortions)}\n- **Body weight:** ${data.currentBodyWeightKg || 'Not set'} kg\n`;
    md += `\n### Saved legacy stacks\n\n`;
    if (data.savedStacks.length) data.savedStacks.forEach((stack) => { md += `- **${stack.name}:** ${stack.items.join(', ')}\n`; });
    else md += `No saved stacks on this device.\n`;
    md += `\n### High-ROI foods\n\n`;
    data.highRoiFoods.forEach((food) => { md += `- **${food.name} (${food.amount}):** ${food.benefit}\n`; });
    md += `\n### Recovery protocols\n\n`;
    data.breathingProtocols.forEach((protocol) => { md += `- **${protocol.name} — ${protocol.dose}:** ${protocol.how}\n`; });
    md += `\n`;

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
        if (f.pairing) md += `- **Pairing:** ${f.pairing}\n`;
        if (f.synergy && f.synergy.length) md += `- **Synergy:** ${f.synergy.join(', ')}\n`;
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

    md += `## Exact Avoid-Label Guide\n\n`;
    data.avoidLabelGuide.forEach(group => {
        md += `### ${group.name} (${group.priority})\n`;
        md += `- **Markers:** ${group.markers.join('; ')}\n`;
        md += `- **Rule:** ${group.rule}\n`;
        md += `- **Context:** ${group.context}\n\n`;
    });

    md += `## Timing & Pairing Map\n\n`;
    data.timingGuide.forEach(slot => {
        md += `### ${slot.label}\n`;
        slot.items.forEach(item => { md += `- ${item}\n`; });
        md += `- **Note:** ${slot.note}\n\n`;
    });

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
        if (s.timing) md += `- **Timing:** ${s.timing}\n`;
        if (s.pairing) md += `- **Pairing:** ${s.pairing}\n`;
        if (s.synergy && s.synergy.length) md += `- **Synergy:** ${s.synergy.join(', ')}\n`;
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

    md += `## Passive Income Tracker (${data.passiveIncome.length})\n\n`;
    if (data.passiveIncome.length) {
        data.passiveIncome.forEach((asset) => {
            md += `- **${asset.name || 'Unnamed asset'}:** SGD ${asset.principal.toLocaleString()} at ${asset.rate}% annual rate\n`;
        });
    } else {
        md += `No assets recorded.\n`;
    }
    md += `\n`;

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

    md += `## 4-Pillar Master Model (Longevity OS)\n\n`;
    data.masterPillars.forEach(p => {
        md += `### ${p.kicker}: ${p.name}\n- **Scope:** ${p.desc}\n- **Includes:** ${p.tags.join(', ')}\n- **Explore:** ${p.href}\n\n`;
    });

    md += `## Evidence Taxonomy & Decision Rule\n\n`;
    data.evidenceTiers.forEach(t => { md += `- **${t.label}** — ${t.def}\n`; });
    md += `\n**Decision rule:** ${data.decisionRule}\n\n`;

    md += `## The Longevity 101\n\n`;
    data.longevity101.forEach((item, i) => { md += `${i + 1}. ${item.replace(/<[^>]+>/g, '')}\n`; });
    md += `\n`;

    md += `## 80/20 Protocol\n\n`;
    md += `**Today:**\n` + data.eightyTwenty.today.map(t => `- ${t}`).join('\n') + `\n\n`;
    md += `**This week:**\n` + data.eightyTwenty.week.map(t => `- ${t}`).join('\n') + `\n\n`;
    md += `**This year:**\n` + data.eightyTwenty.year.map(t => `- ${t}`).join('\n') + `\n\n`;
    md += `**Do this instead:**\n`;
    data.eightyTwenty.instead.forEach(r => { md += `- Instead of ${r.skip} → ${r.do} (${r.why})\n`; });
    md += `\n**Minimal Singapore protocol:** ${data.eightyTwenty.minimal}\n\n`;

    md += `## Screening Tiers (actionability)\n\n`;
    data.screeningTiers.forEach(t => { md += `- **Tier ${t.tier} — ${t.label}:** ${t.examples}\n`; });
    md += `\n`;

    md += `## Biology & the 12 Hallmarks\n\n${data.biology.intro}\n\n`;
    md += `Hallmarks: ${data.biology.hallmarks.join('; ')}\n\n`;
    md += `**Mitochondrial supplement reality check:**\n`;
    data.biology.mitochondrial.reality.forEach(r => { md += `- ${r.name} (${r.verdict}): ${r.text}\n`; });
    md += `\n`;

    md += `## Social, Mental Health & Recovery\n\n${data.socialMental.intro}\n\n`;
    data.socialMental.actions.forEach(a => { md += `- ${a}\n`; });
    md += `\n*${data.socialMental.principle}*\n\n`;

    md += `## Frontier Geroscience\n\n${data.frontier.intro}\n\n`;
    md += `**Therapies:**\n`;
    data.frontier.therapies.forEach(t => { md += `- ${t.name} (${t.status}): ${t.text}\n`; });
    md += `\n**Optional tools:**\n`;
    data.frontier.optional.forEach(t => { md += `- ${t.name} (${t.verdict}): ${t.text}\n`; });
    md += `\n`;

    md += `## Singapore Localization\n\n`;
    md += `### Hawker strategy\n${data.hawker.intro}\n`;
    data.hawker.steps.forEach(s => { md += `- ${s.step}: ${s.text}\n`; });
    md += `\nTemplates:\n` + data.hawker.templates.map(t => `- ${t.meal}: ${t.tip}`).join('\n') + `\n`;
    md += `\nBudget pantry: ${data.hawker.pantry.join(' • ')}\n\n`;
    md += `### Healthier SG Screening\n${data.healthierSG.intro}\n`;
    data.healthierSG.fees.forEach(f => { md += `- ${f.group}: ${f.fee}\n`; });
    md += `${data.healthierSG.note}\n\n`;
    md += `### Sodium bottleneck\n${data.sodium.note}\n\n`;
    md += `### Environment (heat / UV / haze)\n${data.environment.intro}\n`;
    md += `WBGT: ` + data.environment.heat.map(h => `${h.wbgt} (${h.level}): ${h.action}`).join('; ') + `\n`;
    md += `UV: ${data.environment.uv}\n`;
    md += `Haze (PSI): ` + data.environment.haze.map(h => `${h.psi} (${h.level}): ${h.action}`).join('; ') + `\n`;
    md += `10-second decision: ${data.environment.decision}\n\n`;

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
