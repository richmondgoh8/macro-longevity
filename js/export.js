import { BIOMARKERS, VACCINES, SUPPLEMENTS } from './data/health.js';
import { FASTING_PROTOCOLS, SUGAR_OFFSET_TIPS } from './data/common.js';
import { MEALS, MARINADES, PANTRY, FOOD_LISTS } from './data/food.js';
import { INVESTMENTS } from './data/finance.js';

// Nav toggle handler
document.addEventListener('click', function(e) {
    var btn = e.target.closest('[data-nav-toggle]');
    if (btn) {
        document.querySelector('.nav').classList.toggle('nav-open');
        document.body.classList.toggle('nav-open');
        return;
    }
    if (!e.target.closest('.nav') && document.querySelector('.nav') && document.querySelector('.nav').classList.contains('nav-open')) {
        document.querySelector('.nav').classList.remove('nav-open');
        document.body.classList.remove('nav-open');
    }
});

// Export button handler
document.addEventListener('click', function(e) {
    if (e.target.closest('[data-export]')) {
        exportData();
    }
});

function exportData() {
    const data = {
        exportedAt: new Date().toISOString(),
        source: "macro-longevity.com",
        biomarkers: BIOMARKERS,
        meals: MEALS,
        marinades: MARINADES,
        pantry: PANTRY,
        foodLists: FOOD_LISTS,
        fastingProtocols: FASTING_PROTOCOLS,
        vaccines: VACCINES,
        investments: INVESTMENTS,
        supplements: SUPPLEMENTS,
        sugarOffsetTips: SUGAR_OFFSET_TIPS,
    };

    let md = `# Macro Longevity Knowledge Base\n\n`;
    md += `Exported: ${data.exportedAt}\nSource: ${data.source}\n\n`;
    md += `---\n\n`;

    md += `## Biomarkers (${data.biomarkers.length})\n\n`;
    data.biomarkers.forEach(b => {
        md += `### ${b.icon} ${b.name}\n`;
        md += `- **Category:** ${b.category}\n`;
        md += `- **Risk Level:** ${b.riskLevel}\n`;
        md += `- **Optimal Range:** ${b.optimalRange}\n`;
        md += `- **Optimal Level:** ${b.optimalLevel}\n`;
        md += `- **Importance:** ${b.importance}\n`;
        md += `- **How to Improve:**\n`;
        b.howToImprove.forEach(t => md += `  - ${t}\n`);
        if (b.budgetTips && b.budgetTips.length) {
            md += `- **Budget Tips:**\n`;
            b.budgetTips.forEach(t => md += `  - ${t}\n`);
        }
        md += `\n`;
    });

    md += `## Meals (${data.meals.length})\n\n`;
    data.meals.forEach(m => {
        md += `### ${m.name}\n`;
        md += `- **Category:** ${m.category} | **Group:** ${m.group || 'Other'}\n`;
        md += `- **Prep:** ${m.prepTime} | **Cook:** ${m.cookTime}\n`;
        md += `- **Cost:** ${m.costPerServing} | **Protein:** ${m.protein} | **Calories:** ${m.calories}\n`;
        md += `- **Description:** ${m.description}\n`;
        md += `- **Ingredients:**\n`;
        m.ingredients.forEach(i => md += `  - ${i}\n`);
        if (m.methods && m.methods.length) {
            md += `- **Methods:**\n`;
            m.methods.forEach(mt => {
                md += `  - **${mt.name}** (${mt.cookTime}):\n`;
                mt.instructions.forEach(s => md += `    - ${s}\n`);
            });
        } else {
            md += `- **Instructions:**\n`;
            m.instructions.forEach(s => md += `  - ${s}\n`);
        }
        if (m.variations && m.variations.length) {
            md += `- **Variations:**\n`;
            m.variations.forEach(v => md += `  - ${v}\n`);
        }
        if (m.biomarkers && m.biomarkers.length) {
            md += `- **Biomarkers:** ${m.biomarkers.join(', ')}\n`;
        }
        md += `\n`;
    });

    md += `## Marinades (${data.marinades.length})\n\n`;
    data.marinades.forEach(m => {
        md += `### ${m.name}\n`;
        md += `- **Pairs with:** ${m.pairsWith}\n`;
        md += `- **Ingredients:** ${m.ingredients.join(', ')}\n`;
        md += `- **Instructions:** ${m.instructions}\n`;
        md += `- **Storage:** ${m.storageTip}\n\n`;
    });

    md += `## Pantry Staples (${data.pantry.length})\n\n`;
    data.pantry.forEach(p => {
        md += `### ${p.name}\n`;
        md += `- **FairPrice:** ${p.fairPrice}\n`;
        md += `- **Benefit:** ${p.benefit}\n`;
        md += `- **Use:** ${p.servingTip}\n\n`;
    });

    md += `## Food Lists\n\n`;
    data.foodLists.forEach(fl => {
        md += `### ${fl.name}\n`;
        md += `- **Description:** ${fl.description}\n`;
        md += `- **Daily Target:** ${fl.dailyTarget}\n`;
        md += `- **Foods:**\n`;
        fl.foods.forEach(f => {
            md += `  - **${f.name}** — ${f.why} (targets: ${f.biomarkers.join(', ')})\n`;
        });
        md += `\n`;
    });

    md += `## Fasting Protocols (${data.fastingProtocols.length})\n\n`;
    data.fastingProtocols.forEach(p => {
        md += `### ${p.icon} ${p.name}\n`;
        md += `- **Duration:** ${p.duration} | **Difficulty:** ${p.difficulty}\n`;
        md += `- **Description:** ${p.description}\n`;
        md += `- **What Happens:** ${p.whatHappens.join('; ')}\n`;
        md += `- **How to Enter:** ${p.howToEnter.join('; ')}\n`;
        md += `- **During Fast:** ${p.duringFast.join('; ')}\n`;
        md += `- **How to Break:** ${p.howToBreak.join('; ')}\n`;
        md += `- **Tips:** ${p.tips.join('; ')}\n`;
        if (p.biomarkers && p.biomarkers.length) {
            md += `- **Biomarkers:** ${p.biomarkers.join(', ')}\n`;
        }
        md += `\n`;
    });

    md += `## Vaccines (${data.vaccines.length})\n\n`;
    data.vaccines.forEach(v => {
        md += `### ${v.name}\n`;
        md += `- **Schedule Type:** ${v.scheduleType}\n`;
        md += `- **Description:** ${v.description}\n`;
        md += `- **Who Needs It:** ${v.whoNeedsIt}\n`;
        md += `- **Schedule:** ${v.schedule}\n`;
        md += `- **Efficacy:** ${v.efficacy}\n`;
        md += `- **Cost (SGD):** ${v.costSGD}\n`;
        md += `- **Longevity Benefit:** ${v.longevityBenefit}\n`;
        md += `- **Side Effects:** ${v.sideEffects}\n\n`;
    });

    md += `## Supplements (${data.supplements.length})\n\n`;
    data.supplements.forEach(s => {
        md += `### ${s.name}\n`;
        md += `- **Tier:** ${s.tier} | **Timing:** ${s.timing}\n`;
        md += `- **Dosage:** ${s.dosage}\n`;
        md += `- **Cost:** ${s.costPerMonth} (${s.costPerServing})\n`;
        md += `- **Description:** ${s.description}\n`;
        md += `- **Why General:** ${s.whyGeneral}\n`;
        md += `- **Benefits:** ${s.benefits.join('; ')}\n`;
        md += `- **Conflicts:** ${s.conflicts}\n`;
        if (s.biomarkers && s.biomarkers.length) {
            md += `- **Biomarkers:** ${s.biomarkers.join(', ')}\n`;
        }
        md += `\n`;
    });

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

    md += `## Sugar Offset Tips (${data.sugarOffsetTips.length})\n\n`;
    data.sugarOffsetTips.forEach(t => {
        md += `### ${t.action}\n`;
        md += `- **Why:** ${t.why}\n`;
        md += `- **Timing:** ${t.timing}\n\n`;
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
