// common.js — auto-split from data.js

export const MEAL_CATEGORIES = ["breakfast", "lunch"];

export const MEAL_LABELS = {
  breakfast: "🌅 Breakfast",
  lunch: "☀️ Lunch & Dinner",
};

export const FASTING_PROTOCOLS = [
  {
    id: "16-8",
    name: "16:8 Time-Restricted Eating",
    description: "The most popular and beginner-friendly fasting protocol. Fast for 16 hours, eat within an 8-hour window. Easy to sustain long-term.",
    duration: "16 hr fast / 8 hr eating window",
    difficulty: "beginner",
    icon: "⏰",
    group: "daily-trf",
    whatHappens: [
      "Hours 0–4: Body digests and absorbs last meal. Insulin rises, then falls.",
      "Hours 4–12: Glycogen (stored carbs) becomes primary fuel. Insulin stays low.",
      "Hours 12–16: Glycogen depletes. Body shifts to fat-burning (lipolysis). Autophagy (cellular cleanup) begins at ~14h.",
      "Daily practice retrains insulin sensitivity and reduces average glucose by 3–6% over weeks.",
    ],
    howToEnter: [
      "Skip breakfast. Eat first meal at noon (12pm). Last meal by 8pm.",
      "Ease in: start with 12:12 for 1 week, then 14:10 for 1 week, then 16:8.",
      "Last meal should be balanced: protein + fat + fiber-rich carbs (e.g., salmon + sweet potato + greens). Avoid sugar-heavy dinners — they spike insulin and make fasting harder.",
    ],
    duringFast: [
      "💧 Water: unlimited. Add a pinch of salt per litre for electrolytes.",
      "☕ Black coffee or unsweetened tea: allowed and helpful (caffeine suppresses appetite).",
      "🧂 Himalayan salt: 1–2 pinches under tongue if you feel headache or fatigue.",
      "❌ Avoid: cream, milk, sugar, artificial sweeteners (trigger insulin response in some people).",
      "❌ Avoid: intense exercise during fast. Light walking or yoga is fine. Save lifting for eating window.",
    ],
    howToBreak: [
      "Start with a moderate meal — not a feast. Protein + vegetables first, carbs last.",
      "Good break-fast: 3 eggs + spinach + avocado or a protein smoothie.",
      "Avoid large carb loads first (rice, bread, sugar) — they spike glucose after a fast.",
      "Eat slowly. Your digestive system needs a few minutes to ramp up.",
    ],
    tips: [
      "Black coffee + a pinch of salt kills hunger pangs within 15 minutes.",
      "Hunger comes in waves (20 min). Ride it out — it passes.",
      "Stay busy during the fasted window. Mornings are easiest if you keep moving.",
      "If you can't sleep hungry, move eating window earlier (e.g., 10am–6pm).",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp"],
  },
  {
    id: "18-6",
    name: "18:6 (Lean Gains Protocol)",
    description: "A tighter eating window that pushes deeper into fat-burning and autophagy than 16:8. Good balance of results vs difficulty.",
    duration: "18 hr fast / 6 hr eating window",
    difficulty: "intermediate",
    icon: "🔥",
    group: "daily-trf",
    whatHappens: [
      "Hours 0–12: Same as 16:8 — digestion, glycogen use, insulin drop.",
      "Hours 12–16: Fat-burning ramps up. Autophagy begins clearing damaged proteins.",
      "Hours 16–18: Ketone levels rise measurably. Mental clarity often peaks here. GH (growth hormone) increases 2–3× above baseline.",
      "The extra 2 hours vs 16:8 doubles the time spent in autophagy — a significant longevity benefit.",
    ],
    howToEnter: [
      "Progress from 16:8. Push breakfast back 1 hour every 2 days until you reach 18:6.",
      "Typical window: 1pm–7pm (fast 7pm to 1pm next day).",
      "Last meal should be protein + fat heavy (slower digestion = easier fast). Avoid sugary desserts.",
    ],
    duringFast: [
      "Same as 16:8 — water, black coffee, tea, salt.",
      "💊 Electrolytes matter more at 18h+: add 1/4 tsp (1.25ml) salt + 1/4 tsp (1.25ml) potassium chloride to 1L water.",
      "🧘 Light activity (walking) enhances fat oxidation. Keep it low-intensity.",
    ],
    howToBreak: [
      "Your first meal should be protein-first (30g+) to blunt glucose spike.",
      "Good: chicken breast + vegetables + olive oil. Avoid: rice/noodles as first food.",
      "If doing resistance training, break fast with 30g protein within 1 hour post-workout.",
    ],
    tips: [
      "The 16h–18h mark is hardest. Prepare for this window with distraction (work, walk, shower).",
      "Carbonated water helps with hunger pangs.",
      "If you feel faint, break early. Listen to your body — this should enhance health, not harm it.",
      "Not recommended for pregnant women, underweight individuals, or those with eating disorder history.",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp"],
  },
  {
    id: "20-4",
    name: "20:4 (Warrior Diet)",
    description: "A single large meal in a 4-hour window. Aggressive fat-burning and deep autophagy. Requires discipline and adaptation.",
    duration: "20 hr fast / 4 hr eating window",
    difficulty: "advanced",
    icon: "⚔️",
    group: "daily-trf",
    whatHappens: [
      "Hours 0–12: Standard glycogen depletion, insulin normalisation.",
      "Hours 12–16: Fat-burning primary. Autophagy active. Ketones rising.",
      "Hours 16–20: Deep ketosis. Growth hormone spikes 3–5×. BDNF (brain-derived neurotrophic factor) increases — neuroprotective.",
      "Hour 20+: Cellular repair maximised. Norepinephrine rises, increasing alertness and fat mobilisation.",
    ],
    howToEnter: [
      "Do NOT start here. Build up from 16:8 → 18:6 over 2–4 weeks.",
      "Window: 6pm–10pm (or 4pm–8pm). You eat one large meal + a small snack.",
      "Transition: compress eating window by 30 min every 2–3 days.",
      "Last meal before entering fast: high in healthy fats (70%) + protein (25%) + minimal carbs (5%). E.g., salmon + avocado + olive oil drizzle.",
    ],
    duringFast: [
      "💧 Electrolytes are essential: 1/2 tsp (2.5ml) salt + 1/4 tsp (1.25ml) potassium + 1/4 tsp (1.25ml) magnesium in 2L water.",
      "☕ Black coffee is fine but limit to 2 cups (excess caffeine + empty stomach = cortisol spike).",
      "🚶 Light walks, reading, work. Avoid social eating situations.",
      "❌ No intense cardio — your body is already stressed. Walking, stretching, or yoga only.",
      "❌ No alcohol — breaks autophagy and depletes electrolytes.",
    ],
    howToBreak: [
      "Start with a small raw vegetable salad or bone broth 15 min before main meal (prepares digestion).",
      "Main meal: large portion of protein (30–50g) + vegetables + healthy fats. Minimise carbs.",
      "Eat slowly over 30–45 min. Your stomach has been empty for 20 hours.",
      "Small snack (optional): nuts, berries, or dark chocolate within the window.",
    ],
    tips: [
      "Social dinners are easier — your eating window can align with evening events.",
      "If you struggle with energy, add 1 tbsp MCT oil or coconut oil to your coffee (breaks strict fast but provides ketones).",
      "Consider this as a 2–3× per week practice, not daily, to reduce stress.",
      "⚠️ Not for anyone with a history of disordered eating, adrenal issues, or weight under BMI 20.",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp", "triglycerides"],
  },
  {
    id: "omad",
    name: "OMAD (One Meal A Day)",
    description: "Eat one meal, fast 23 hours. The most extreme daily fasting protocol. Maximum autophagy time, minimum meal prep. Not for beginners.",
    duration: "23 hr fast / 1 hr eating",
    difficulty: "advanced",
    icon: "🎯",
    group: "daily-trf",
    whatHappens: [
      "Hours 0–12: Standard glycogen depletion.",
      "Hours 12–18: Active fat-burning. Autophagy fully engaged.",
      "Hours 18–23: Deep ketosis. Cellular repair peaks. Growth hormone up 5–10×. BDNF surges — mood and focus often improve.",
      "By hour 23: Body is fully fat-adapted. Insulin at its lowest daily point. Brain running on ketones efficiently.",
    ],
    howToEnter: [
      "ONLY after 2–4 weeks of 16:8 and 18:6. Jumping straight in causes electrolyte crashes and binge-breaking.",
      "Eat dinner at 7pm. Next meal: 6pm the following day. That's 23 hours.",
      "One meal should contain: your full daily calories (1500–2000+), 40–50g protein, healthy fats, vegetables.",
      "Pre-fast meal: emphasise protein + fat. Avoid high-carb meals — they cause intense hunger the next day as blood sugar crashes.",
    ],
    duringFast: [
      "💧 Electrolytes are non-negotiable: 1/2 tsp (2.5ml) salt + 1/4 tsp (1.25ml) potassium + 1/4 tsp (1.25ml) magnesium in 2L+ water.",
      "☕ Black coffee, tea — keep hydrated throughout the day.",
      "🛌 Prioritise sleep — OMAD + sleep deprivation is a recipe for cortisol dysregulation.",
      "❌ No exercise beyond walking. Save strength training for just before or after your meal.",
    ],
    howToBreak: [
      "Your ONE meal matters. Don't waste it on junk.",
      "Start with protein + vegetables. Eat carbs last (if at all).",
      "Eat over 30–60 minutes. Your stomach has shrunk — overeating causes nausea and bloating.",
      "Include fermented food (sauerkraut, kimchi, yogurt) to replenish gut bacteria after the long fast.",
    ],
    tips: [
      "Schedule your meal at a socially convenient time (dinner works best for most).",
      "Keep a 'distraction list' ready for the 2–3 hours before your meal when hunger peaks.",
      "OMAD is not a daily requirement — doing it 3–4×/week with 16:8 on other days is sustainable for most.",
      "⚠️ Contraindicated: pregnancy, breastfeeding, underweight, diabetes (without MD supervision), eating disorder history.",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp", "triglycerides", "apob"],
  },
  {
    id: "extended",
    name: "Extended Fasting (24–72h)",
    description: "Multi-day fasts. The deepest level of autophagy, ketosis, and cellular repair. Rarely needed but potent when used strategically.",
    duration: "24–72 hour water fast",
    difficulty: "expert",
    icon: "🧬",
    group: "extended-weekly",
    whatHappens: [
      "24h: Glycogen depleted. Autophagy active. Ketones ~0.5–1.0 mM. Deep (N3) sleep may increase up to 30% but sleep latency rises — cortisol and norepinephrine are elevated.",
      "24–48h: Deep autophagy. Ketones 1–2 mM. Immune regeneration. Cortisol rises ~1.7× — the 2–4 AM gluconeogenesis spike often causes waking. REM drops 15–20% as brain adapts to ketones.",
      "48–72h: Peak autophagy. Ketones 2–3+ mM. GH up ~5×. Deep sleep enhancement often reported at hour 60–70. REM begins rebound after ~3 weeks of fat adaptation.",
      "Beyond 48h: Cells recycle damaged components en masse. Old immune cells cleared and replaced. Sleep disruption attenuates with adaptation — worst in first 24–48h, improves by day 3.",
    ],
    howToEnter: [
      "⚠️ DO NOT attempt without prior fasting experience (minimum 4–8 weeks of daily 16:8).",
      "Prepare: 2–3 days before, eat whole foods (low carb, high fat). Avoid alcohol, processed food, and sugar.",
      "Last meal: large, nutritious dinner with protein + fat + vegetables. Minimise carbs.",
      "Have an exit plan before you start. Know when you'll break the fast.",
      "Inform someone you're fasting (safety buddy).",
    ],
    duringFast: [
      "💧 Water with electrolytes: 1/2 tsp (2.5ml) salt + 1/4 tsp (1.25ml) potassium + 1/4 tsp (1.25ml) magnesium per 2L water. Drink 3–4L daily = ~1 tsp (5ml) salt total (~2,400mg sodium). Sip throughout the day.",
      "☕ Black coffee or tea (1–2 cups max). No caffeine after 2pm — half-life extends during fasting and compounds sleep disruption.",
      "🛌 Rest as needed. Extended fasting lowers energy. Listen to your body. During 72h+ fasts, aim for 9–10h sleep + afternoon nap (1–4 PM aligns with natural cortisol dip).",
      "🛏️ 60–90 min before bed: 200–400mg elemental magnesium glycinate (glycine component lowers core temp, promotes deep sleep). Start at 200mg, increase if needed.",
      "🛏️ If 3 AM waking persists: add 3g glycine + 200mg L-theanine before bed. Optional: 1 tsp (5ml) MCT oil provides ketones for brain fuel without breaking the fast.",
      "🌅 Morning: 15–30 min sunlight within 30 min of waking — 40% more effective for circadian resetting during fasted state.",
      "🚶 Light walking only. No exercise beyond gentle movement.",
      "❌ No: alcohol, any calories, intense exercise, sauna/hot baths (risk of electrolyte imbalance).",
      "⚠️ Stop immediately if: severe dizziness, confusion, chest pain, heart palpitations, or inability to keep water down.",
    ],
    howToBreak: [
      "Refeeding is more important than the fast itself. Break gently.",
      "Start with: bone broth or 1–2 tbsp coconut oil. Wait 30 min.",
      "Then: small portion of soft, easily digestible food (soup, steamed vegetables, or 1 boiled egg).",
      "Wait 1–2 hours before a normal meal. No heavy meat, no large carb loads, no sugar.",
      "Avoid: raw vegetables, nuts, seeds, fatty meat, and dairy in the first meal — they're hard on a dormant digestive system.",
      "First 24h after: eat small, frequent, simple meals. Gradually reintroduce normal foods.",
    ],
    tips: [
      "Extended fasting is a quarterly or monthly practice, not weekly. 1–2× per month max for 24h, or 1× per quarter for 72h.",
      "Day 2 morning is the hardest — electrolytes + distraction get you through.",
      "🛌 Primary sleep stack: 200–400mg elemental magnesium glycinate (60–90 min pre-bed). Stack with 3g glycine if needed. Add 200–400mg phosphatidylserine 1–2h before bed if 3 AM cortisol-driven waking persists — effects build over 2–4 weeks.",
      "🧂 Sip sodium water 10am–6pm, stop by 7PM to prevent nocturia. Move magnesium closer to bed (post-7PM is fine and helps sleep).",
      "💡 3 AM wake-up rescue: 1 tsp (5ml) MCT oil + pinch of salt — provides ketones for brain, stabilises glucose without breaking fast.",
      "🌡️ Cool bedroom (18–20°C) — fasting lowers core temperature; align with it. Morning sunlight 15–30 min within 30 min of waking.",
      "⚠️ ABSOLUTE contraindications: underweight (BMI <19), eating disorder history, Type 1 diabetes, pregnancy/breastfeeding, kidney disease, heart conditions, medications requiring food. Always consult a doctor before extended fasting.",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp", "triglycerides", "apob", "bp", "alt"],
  },
  {
    id: "alternate-day",
    name: "Alternate Day Fasting",
    description: "Alternate between normal eating days and full fast days. One of the most effective protocols for insulin sensitivity and fat loss.",
    duration: "36 hr fast / 12 hr eating (alternating)",
    difficulty: "advanced",
    icon: "🔄",
    group: "extended-weekly",
    whatHappens: [
      "Fast day (0–36h): Deeper autophagy than daily TRF. Ketones climb higher. Cell repair pathways (AMPK, sirtuins) strongly activated.",
      "Feast day: Normal insulin, refeed, recovery. Body adapts over cycles.",
      "Over weeks: Significant improvement in fasting insulin and HbA1c. Studies show 3–5% reduction in HbA1c over 8–12 weeks.",
      "The extended fast period (24h+) produces more pronounced mitochondrial biogenesis than shorter daily fasts.",
    ],
    howToEnter: [
      "ONLY after 4+ weeks of daily TRF (16:8 or 18:6). This is a serious protocol.",
      "Pattern: Dinner at 7pm → Fast all next day → Breakfast (36h later) at 7am. Repeat.",
      "Fast days: zero calories. Water, black coffee, and unsweetened tea only.",
      "Feast days: eat normally but don't binge. Your body needs adequate nutrition on refeed days.",
    ],
    duringFast: [
      "💧 Electrolytes are critical: 1/2 tsp (2.5ml) salt + 1/4 tsp (1.25ml) potassium in each litre of water.",
      "💊 Magnesium glycinate at bedtime (helps sleep quality during fast).",
      "🛌 Sleep quality may drop on fast days — magnesium and glycine help.",
      "🚶 Walking is fine. No intense exercise on fast days — schedule workouts on feast days.",
      "❌ No alcohol, no broth with calories, no gum (chewing triggers hunger signals), no diet sodas.",
    ],
    howToBreak: [
      "After 36 hours, your digestive system has slowed down. Ease back in.",
      "Start with bone broth or a small handful of almonds. Wait 20 min.",
      "Next: a normal-sized meal with protein + vegetables. Avoid large carb loads.",
      "Do NOT break a 36h fast with a feast. Refeeding syndrome is rare but real — start small.",
    ],
    tips: [
      "Schedule fast days on your busiest days (workdays are easier than weekends).",
      "Your body adapts after 2–3 cycles. The first fast day is hardest.",
      "If you can't manage a full 36h, try 24h (dinner→dinner) every other day.",
      "⚠️ Not for: underweight, pregnant, breastfeeding, Type 1 diabetes, eating disorder history, or anyone on medication that requires food timing.",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp", "triglycerides", "apob", "bp"],
  },
  {
    id: "5-2",
    name: "5:2 Diet",
    description: "Eat normally 5 days, restrict calories (500–600) on 2 non-consecutive days. More flexible than daily time-restricted eating.",
    duration: "5 normal days / 2 low-calorie days",
    difficulty: "intermediate",
    icon: "📅",
    group: "extended-weekly",
    whatHappens: [
      "Normal days: Regular metabolic function.",
      "Low-calorie days: After 12–14 hours on 500 calories, body shifts to fat-burning and autophagy, similar to a 24h fast.",
      "Over weeks: Average weekly calorie reduction of ~2000–3000 leads to steady fat loss. Insulin sensitivity improves on low days and carries over.",
      "The 2 non-consecutive days allow recovery between low-cal periods, reducing stress compared to daily restriction.",
    ],
    howToEnter: [
      "Pick 2 non-consecutive days (e.g., Monday + Thursday).",
      "On those days: consume 500 kcal (women) / 600 kcal (men). Best as one meal or two small meals.",
      "Good low-day foods: 3 eggs (~250 kcal), large salad with chicken (~300 kcal), or bone broth + protein shake.",
      "Normal days: eat intuitively. Don't binge to 'make up' for low days — that defeats the purpose.",
    ],
    duringFast: [
      "💧 Hydrate well — low-cal days can be dehydrating.",
      "☕ Coffee and tea are free (no milk/sugar). Calorie-free drinks help.",
      "🥗 Use your 500–600 calories on protein and vegetables. Don't waste them on carbs.",
      "🛌 Expect lower energy on low days. Schedule rest, light work, and avoid intense exercise.",
    ],
    howToBreak: [
      "The low day naturally ends at midnight. Next day: eat normally but don't overcompensate.",
      "Break the low day with a protein-rich breakfast: eggs, Greek yogurt, or a smoothie.",
    ],
    tips: [
      "Start low days on busy weekdays (distraction helps). Avoid weekends.",
      "Don't do low days back-to-back — you need recovery days between.",
      "Adjust as needed: if 500 kcal is too hard, start at 800 kcal and taper down.",
      "Some days may need to be rescheduled (social events, illness). That's fine — aim for consistency, not perfection.",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "hscrp", "triglycerides"],
  },
];

export const FASTING_GROUPS = {
  "daily-trf": "⏰ Daily Time-Restricted Feeding",
  "extended-weekly": "🧬 Extended & Weekly Protocols",
};

export const FASTING_GROUP_ORDER = ["daily-trf", "extended-weekly"];

export const TIER_ORDER = ["minimal", "critical", "essential", "optimized"];

export const TIER_LABELS = {
  minimal: "Minimal Stack",
  critical: "Critical Stack",
  essential: "Essential Stack",
  optimized: "Optimized Stack",
};

export const TIER_DESCRIPTIONS = {
  minimal: "The absolute survival kit. Pick this if budget is tight or you want to start slow.",
  critical: "Non-negotiable foundations. Every longevity-focused person should be on these.",
  essential: "Critical + robust coverage for metabolic health, strength, and methylation.",
  optimized: "Everything. Level up with antioxidants, mitochondrial support, and sleep optimisation.",
};

export const DIET_LABELS = {
  carnivore: "🥩 Carnivore",
  omnivore: "🍽️ Omnivore",
  vegetarian: "🥬 Vegetarian/Vegan",
};

export const DIET_LABELS_PLAIN = {
  carnivore: "Carnivore",
  omnivore: "Omnivore",
  vegetarian: "Vegetarian/Vegan",
};

export const PRICE_DISCLAIMER = "Prices in SGD as of June 2026, sourced from iHerb. Actual prices may vary.";

export const RECIPE_CATEGORIES = ["breakfast", "dinner", "snack"];

export const RECIPE_LABELS = {
  breakfast: "🍳 Breakfast",
  dinner: "🥘 Lunch & Dinner",
  snack: "🍪 Snacks",
};

export const SUGAR_OFFSET_TIPS = [
  { action: "🚶 Walk 10–15 minutes", why: "Exercise immediately after eating makes muscles take up glucose without insulin, lowering blood sugar by up to 18 mg/dL. Even a 10-min walk significantly reduces peak glucose.", timing: "Within 30 min of eating" },
  { action: "🍗 Eat protein next", why: "Protein slows gastric emptying, blunting the glucose spike from carbs that are still digesting. Any protein works — eggs, chicken, tofu.", timing: "Next 1-2 hours" },
  { action: "🌿 Cinnamon (1 tsp)", why: "Cinnamon modestly reduces postprandial glucose by ~11 mg/dL by slowing carb breakdown and improving insulin sensitivity.", timing: "With the meal" },
  { action: "💧 Hydrate with water", why: "Water helps kidneys excrete excess glucose. Dehydration concentrates blood sugar, making the spike worse.", timing: "Immediately + throughout day" },
  { action: "🫐 Berberine (if supplement)", why: "Berberine activates AMPK, improving glucose uptake and reducing liver glucose production. Similar potency to metformin. ⚠️ Do NOT combine with statins or warfarin — inhibits CYP450 enzymes.", timing: "With the meal" },
  { action: "🍵 Green tea (unsweetened)", why: "EGCG in green tea increases glucose uptake in muscle tissue and reduces carb absorption in the gut.", timing: "With or after the meal" },
  { action: "⏸️ No more carbs for 4-6 hours", why: "Your body needs time to clear the glucose load. Adding more carbs resets the spike window. Let insulin do its job.", timing: "Next 4-6 hours" },
];

