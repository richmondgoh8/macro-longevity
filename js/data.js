const BIOMARKERS = [
  {
    id: "hba1c",
    name: "HbA1c",
    description: "Glycated hemoglobin — reflects average blood sugar over the past 2–3 months. The gold standard for glycemic control.",
    optimalRange: "4.0–5.6%",
    optimalLevel: "5.0–5.2%",
    unit: "%",
    importance: "Every 1-point reduction in HbA1c lowers risk of diabetic complications by 37%. HbA1c >5.7% indicates prediabetes; >6.5% indicates diabetes. Longevity studies show those with HbA1c in the 5.0–5.2% range have the lowest all-cause mortality.",
    howToImprove: [
      "Reduce added sugar and refined carbs (soda, white bread, pastries)",
      "Eat protein and fiber before carbs to blunt glucose spikes",
      "Walk 10–15 min after meals to improve glucose disposal",
      "Incorporate strength training — muscle is a glucose sink",
      "Consider time-restricted eating (14–16 hr daily fast)",
      "Add vinegar (1 tbsp before meals) to reduce post-meal glucose",
    ],
    budgetTips: [
      "Frozen vegetables are just as nutritious and cost 40–60% less",
      "Buy chicken thighs instead of breasts — cheaper, more flavourful",
      "Eggs are the cheapest high-quality protein source",
      "Batch-cook grains (brown rice, oats) to save time and money",
    ],
    category: "Blood Sugar & Metabolic",
    icon: "🩸",
    riskLevel: "high",
  },
  {
    id: "hscrp",
    name: "hs-CRP",
    description: "High-sensitivity C-reactive protein — a marker of systemic inflammation produced by the liver in response to cytokines.",
    optimalRange: "<1.0 mg/L",
    optimalLevel: "<0.5 mg/L",
    unit: "mg/L",
    importance: "Chronic low-grade inflammation is a root cause of aging (inflammaging). hs-CRP >3 mg/L triples cardiovascular risk. It's also linked to cognitive decline, insulin resistance, and muscle loss. Optimal levels <0.5 mg/L are associated with exceptional longevity.",
    howToImprove: [
      "Eliminate seed oils (soybean, corn, canola) — use olive oil instead",
      "Reduce omega-6:omega-3 ratio by eating fatty fish 2–3×/week",
      "Add turmeric + black pepper to meals — curcumin reduces NF-κB activation",
      "Prioritize 7–9 hr quality sleep — sleep deprivation raises CRP by 25%",
      "Manage stress — meditation lowers IL-6 and CRP",
      "Consider intermittent fasting — reduces inflammatory markers",
    ],
    budgetTips: [
      "Canned sardines are cheap, sustainable, and rich in omega-3s",
      "Frozen wild blueberries cost less than fresh and have more antioxidants",
      "Turmeric powder is inexpensive — use generously with black pepper",
    ],
    category: "Inflammation",
    icon: "🔥",
    riskLevel: "high",
  },
  {
    id: "apob",
    name: "Apolipoprotein B",
    description: "ApoB is the primary structural protein on LDL, VLDL, and IDL particles. It's the number of atherogenic particles, not just cholesterol content.",
    optimalRange: "<90 mg/dL",
    optimalLevel: "<70 mg/dL",
    unit: "mg/dL",
    importance: "ApoB outperforms LDL-C as a cardiovascular risk predictor. Each 10 mg/dL reduction in ApoB lowers CVD risk by ~20%. Small, dense LDL particles are more atherogenic than large ones — ApoB captures this, standard LDL doesn't. Optimal <70 mg/dL for longevity.",
    howToImprove: [
      "Reduce saturated fat from processed foods, keep whole-food sources (eggs, yoghurt)",
      "Eat soluble fiber (oats, beans, chia, psyllium) — binds bile acids",
      "Add plant sterols/stanols — 2g/day reduces LDL by 8–10%",
      "Increase EPA/DHA from fish or algae oil — reduces particle number",
      "Exercise — both aerobic and resistance training lower ApoB",
      "Maintain low body fat — visceral fat increases ApoB production",
    ],
    budgetTips: [
      "Psyllium husk is cheap and effective — 1 tbsp before meals",
      "Canned beans and lentils cost pennies per serving",
      "Frozen fish is cheaper than fresh and equally nutritious",
    ],
    category: "Lipids & Cardiovascular",
    icon: "❤️",
    riskLevel: "high",
  },
  {
    id: "grip",
    name: "Grip Strength",
    description: "Maximum force when squeezing a dynamometer. A proxy for overall muscle strength and biological age.",
    optimalRange: "≥35 kg (M), ≥20 kg (F)",
    optimalLevel: "≥45 kg (M), ≥28 kg (F)",
    unit: "kg",
    importance: "Grip strength is one of the strongest predictors of all-cause mortality — stronger than blood pressure or cholesterol. Each 5 kg decline increases all-cause mortality by 16%. It reflects neurological health, muscle mass, and functional capacity.",
    howToImprove: [
      "Compound lifts — deadlifts, pull-ups, farmer's carries",
      "Progressive overload — add weight or reps each week",
      "Eat 1.6–2.2 g protein per kg body weight daily",
      "Prioritize sleep — growth hormone release peaks during deep sleep",
      "Creatine monohydrate — 5g daily increases strength gains by 15–20%",
      "Train grip specifically — dead hangs, grip crushers, fat bar work",
    ],
    budgetTips: [
      "Bodyweight exercises cost nothing — push-ups, pull-ups, rows",
      "Resistance bands are $10–20 and highly effective",
      "Second-hand gym equipment is widely available on FB Marketplace",
      "Grip trainers cost under $10",
    ],
    category: "Physical Function",
    icon: "💪",
    riskLevel: "moderate",
  },
  {
    id: "fasting-glucose",
    name: "Fasting Glucose",
    description: "Blood sugar after 8+ hours without food. Reflects basal metabolic control and insulin sensitivity.",
    optimalRange: "70–99 mg/dL",
    optimalLevel: "75–85 mg/dL",
    unit: "mg/dL",
    importance: "Fasting glucose >100 mg/dL indicates impaired fasting glucose. Elevated glucose drives glycation (AGE formation), damaging proteins and accelerating aging. Levels in the 75–85 range are associated with optimal longevity.",
    howToImprove: [
      "Same strategies as HbA1c — they're closely related",
      "Berberine 500 mg before meals mimics metformin effects",
      "Cinnamon (1 tsp/day) modestly reduces fasting glucose",
      "Evening protein + fat before bed prevents dawn phenomenon",
    ],
    budgetTips: [
      "Cinnamon is cheap — add to oatmeal, coffee, smoothies",
      "Apple cider vinegar in water before meals — pennies per dose",
    ],
    category: "Blood Sugar & Metabolic",
    icon: "🩸",
    riskLevel: "high",
  },
  {
    id: "fasting-insulin",
    name: "Fasting Insulin",
    description: "Insulin level after 8+ hours fasting. Indicates how much insulin your pancreas needs to maintain glucose homeostasis.",
    optimalRange: "<10 μIU/mL",
    optimalLevel: "<5 μIU/mL",
    unit: "μIU/mL",
    importance: "High fasting insulin = insulin resistance, the driver of metabolic syndrome. Chronically high insulin activates mTOR and PI3K pathways that accelerate aging. Optimal fasting insulin <5 μIU/mL is a hallmark of metabolically healthy individuals.",
    howToImprove: [
      "Low-carb or ketogenic diet reduces insulin demand",
      "Intermittent fasting — every hour fasted lowers insulin",
      "Exercise — insulin sensitivity improves for 24–48 hrs post-workout",
      "Sleep — even one night of poor sleep worsens insulin sensitivity by 25%",
      "Berberine — activates AMPK, improves insulin sensitivity",
    ],
    budgetTips: [
      "Fasting costs nothing — skip breakfast, eat in an 8-hr window",
      "Walking after meals is free and highly effective",
    ],
    category: "Blood Sugar & Metabolic",
    icon: "🩸",
    riskLevel: "high",
  },
  {
    id: "triglycerides",
    name: "Triglycerides",
    description: "The storage form of fat in the blood. Elevated levels indicate excess caloric intake, especially from carbs and alcohol.",
    optimalRange: "<150 mg/dL",
    optimalLevel: "<100 mg/dL",
    unit: "mg/dL",
    importance: "Triglycerides >150 mg/dL are a marker of metabolic syndrome. High trigs + low HDL is the most common lipid pattern in insulin resistance. Each 88 mg/dL increase raises CVD risk by 14%. Optimal <100 mg/dL.",
    howToImprove: [
      "Reduce sugar and refined carbs — the #1 driver",
      "Limit alcohol — even moderate intake raises trigs",
      "Omega-3 (EPA/DHA) — 2–4g daily reduces trigs by 20–30%",
      "Exercise — aerobic exercise lowers trigs within days",
      "Lose visceral fat — it's metabolically active and raises trigs",
    ],
    budgetTips: [
      "Cutting soda and juice saves money AND lowers trigs",
      "Canned fish is cheap omega-3 source",
    ],
    category: "Lipids & Cardiovascular",
    icon: "❤️",
    riskLevel: "moderate",
  },
  {
    id: "ldl-c",
    name: "LDL-C",
    description: "Low-density lipoprotein cholesterol — often called 'bad' cholesterol. Better assessed via ApoB, but still clinically useful.",
    optimalRange: "<100 mg/dL",
    optimalLevel: "<70 mg/dL",
    unit: "mg/dL",
    importance: "LDL-C carries cholesterol to tissues. When oxidized, it drives atherosclerosis. Monogenic studies show lifelong low LDL-C (<50 mg/dL) dramatically reduces CVD risk. For longevity, <70 mg/dL is optimal.",
    howToImprove: [
      "Reduce saturated fat and trans fat intake",
      "Soluble fiber — psyllium, oats, beans, chia seeds",
      "Policosanol 20 mg — plant compound that inhibits cholesterol synthesis",
      "Red yeast rice — natural statin (consult doctor)",
    ],
    budgetTips: [
      "Psyllium husk — bulk buy, extremely cheap per serving",
      "Oats are one of the cheapest foods per gram of soluble fiber",
    ],
    category: "Lipids & Cardiovascular",
    icon: "❤️",
    riskLevel: "moderate",
  },
  {
    id: "hdl-c",
    name: "HDL-C",
    description: "High-density lipoprotein cholesterol — 'good' cholesterol. Removes cholesterol from arteries and transports it to the liver.",
    optimalRange: ">40 (M), >50 (F) mg/dL",
    optimalLevel: ">60 mg/dL",
    unit: "mg/dL",
    importance: "HDL is anti-inflammatory, antioxidant, and anti-thrombotic. Each 1 mg/dL increase lowers CVD risk by 2–3% in women and 1–2% in men. HDL functionality matters more than level — but optimal is >60 mg/dL.",
    howToImprove: [
      "Aerobic exercise — 30 min daily raises HDL by 3–5 mg/dL",
      "Monounsaturated fats — olive oil, avocado, almonds",
      "Niacin (B3) — but only flush form, and modern guidelines discourage high-dose niacin for HDL",
      "Avoid trans fats — they lower HDL",
      "Moderate alcohol may raise HDL, but risks outweigh benefits for most",
    ],
    budgetTips: [
      "Olive oil is worth the investment — 2 tbsp daily",
      "Sunflower seeds and peanuts are cheap unsaturated fat sources",
    ],
    category: "Lipids & Cardiovascular",
    icon: "❤️",
    riskLevel: "low",
  },
  {
    id: "vitamin-d",
    name: "Vitamin D (25-OH)",
    description: "Fat-soluble vitamin that functions as a steroid hormone. Critical for bone health, immunity, mood, and gene expression.",
    optimalRange: "30–100 ng/mL",
    optimalLevel: "50–80 ng/mL",
    unit: "ng/mL",
    importance: "Vitamin D deficiency affects ~40% of the population. Low levels are linked to all-cause mortality, autoimmune disease, depression, and cancer. Levels >50 ng/mL are associated with optimal immune function and longevity.",
    howToImprove: [
      "Sun exposure — 15–30 min midday on large skin surface",
      "Supplement with D3 (not D2) — 2000–5000 IU daily based on levels",
      "Take with K2 (MK-7) to direct calcium to bones, not arteries",
      "Pair with fat-containing meal for absorption",
    ],
    budgetTips: [
      "Vitamin D3 is extremely cheap — $5 for 6-month supply",
      "Sunlight is free — check UV index before planning exposure",
    ],
    category: "Micronutrients",
    icon: "☀️",
    riskLevel: "moderate",
  },
  {
    id: "homocysteine",
    name: "Homocysteine",
    description: "Amino acid produced when methionine is metabolized. Elevated levels damage blood vessels and neurons.",
    optimalRange: "<12 μmol/L",
    optimalLevel: "<7 μmol/L",
    unit: "μmol/L",
    importance: "Each 5 μmol/L increase raises CVD risk by 20–30%. Elevated homocysteine is also linked to Alzheimer's, cognitive decline, and osteoporosis. Optimal <7 μmol/L is associated with minimal vascular risk.",
    howToImprove: [
      "B-complex vitamins — folate (methylfolate), B6 (P5P), B12 (methylcobalamin)",
      "Betaine (TMG) — 500–1000 mg helps re-methylation",
      "Eat leafy greens for natural folate",
      "Limit methionine-rich foods if levels are very high (rare)",
      "Creatine — reduces homocysteine by lowering methionine usage",
    ],
    budgetTips: [
      "B-complex is cheap — $8–12 for 3 months",
      "Lentils and spinach are inexpensive folate sources",
    ],
    category: "Cardiovascular & Cognitive",
    icon: "🧠",
    riskLevel: "moderate",
  },
  {
    id: "uric-acid",
    name: "Uric Acid",
    description: "End-product of purine metabolism. Acts as an antioxidant in blood but pro-oxidant inside cells.",
    optimalRange: "3.5–7.2 mg/dL",
    optimalLevel: "4.0–5.5 mg/dL",
    unit: "mg/dL",
    importance: "Uric acid >7 mg/dL crystallizes in joints (gout) and correlates with hypertension, kidney disease, and metabolic syndrome. Uric acid is also a potent antioxidant — levels <4 may increase oxidative stress. Sweet spot: 4.0–5.5 mg/dL.",
    howToImprove: [
      "Reduce fructose — it directly raises uric acid via purine breakdown",
      "Limit purine-rich foods (organ meats, shellfish) if levels are high",
      "Stay hydrated — kidney excretion is the primary elimination route",
      "Vitamin C — 500 mg/day increases urate excretion",
      "Coffee — reduces uric acid via xanthine oxidase inhibition",
    ],
    budgetTips: [
      "Cutting soda alone often drops uric acid by 1+ mg/dL",
      "Water is free — 2–3L daily optimizes excretion",
    ],
    category: "Metabolic Health",
    icon: "🧬",
    riskLevel: "moderate",
  },
  {
    id: "alt",
    name: "ALT / AST",
    description: "Liver enzymes — ALT (alanine transaminase) and AST (aspartate transaminase). Elevated levels indicate liver cell damage.",
    optimalRange: "ALT 7–55 U/L, AST 8–48 U/L",
    optimalLevel: "ALT <25 U/L, AST <25 U/L",
    unit: "U/L",
    importance: "ALT is specific to the liver; AST is also found in heart and muscle. NAFLD (fatty liver) affects ~25% globally and is the #1 cause of elevated ALT. Optimal ALT <25 U/L is associated with healthy liver and metabolic health.",
    howToImprove: [
      "Lose visceral fat — NAFLD is driven by calorie excess",
      "Reduce fructose and alcohol — both directly toxify the liver",
      "Milk thistle (silymarin) — 140–280 mg supports liver function",
      "NAC — 600–1200 mg replenishes glutathione, protects liver",
      "Coffee — 2–3 cups daily is strongly protective against liver disease",
    ],
    budgetTips: [
      "Coffee is the cheapest liver protective agent — ~$0.20/cup",
      "Milk thistle supplements are widely available and affordable",
    ],
    category: "Organ Health",
    icon: "🫁",
    riskLevel: "moderate",
  },
  {
    id: "testosterone",
    name: "Total Testosterone",
    description: "Primary male sex hormone, also important for women. Drives muscle protein synthesis, bone density, libido, and energy.",
    optimalRange: "300–1000 ng/dL (M), 15–70 ng/dL (F)",
    optimalLevel: "600–900 ng/dL (M), 25–50 ng/dL (F)",
    unit: "ng/dL",
    importance: "Testosterone declines ~1% per year after 30. Low T (<300 ng/dL in men) is linked to sarcopenia, osteoporosis, depression, and cardiovascular mortality. Optimal levels (600–900) are associated with vitality and longevity in men.",
    howToImprove: [
      "Strength training — especially compound legs (squats, deadlifts)",
      "Adequate sleep — 7–9 hrs, T levels peak during REM",
      "Healthy fats — dietary fat is needed for hormone synthesis",
      "Zinc — 15–30 mg daily, essential for T production",
      "Vitamin D — 3000–5000 IU if deficient",
      "Reduce excess body fat — adipose tissue converts T to estrogen",
    ],
    budgetTips: [
      "Zinc picolinate is cheap — $6 for 3-month supply",
      "Sunlight and sleep are free",
      "Bodyweight squats and lunges cost nothing",
    ],
    category: "Hormones",
    icon: "⚡",
    riskLevel: "moderate",
  },
  {
    id: "ferritin",
    name: "Ferritin",
    description: "Iron storage protein. Reflects total body iron stores. Too low = anemia; too high = oxidative stress.",
    optimalRange: "30–300 ng/mL (M), 15–150 ng/mL (F)",
    optimalLevel: "50–100 ng/mL",
    unit: "ng/mL",
    importance: "Iron is essential for oxygen transport and energy production, but is also a potent pro-oxidant. Elevated ferritin (>200) is linked to metabolic syndrome, NAFLD, and accelerated aging. Regular blood donation reduces iron stores.",
    howToImprove: [
      "If low: eat heme iron (red meat) with vitamin C for absorption",
      "If high: donate blood — 1 donation lowers ferritin by ~30 ng/mL",
      "If high: avoid vitamin C with iron-rich meals",
      "If high: green tea (tannins) with meals reduces iron absorption",
    ],
    budgetTips: [
      "Blood donation is free and saves lives",
      "Green tea is cheap — drink with meals to modulate iron absorption",
    ],
    category: "Micronutrients",
    icon: "🩸",
    riskLevel: "moderate",
  },
  {
    id: "tsh",
    name: "TSH",
    description: "Thyroid-stimulating hormone — produced by the pituitary to regulate T4/T3 production by the thyroid gland.",
    optimalRange: "0.5–4.5 mIU/L",
    optimalLevel: "1.0–2.0 mIU/L",
    unit: "mIU/L",
    importance: "Both high (hypothyroid) and low (hyperthyroid) TSH carry longevity risks. Subclinical hypothyroidism (TSH 4.5–10) increases CVD risk by 20%. Optimal TSH 1–2 is associated with highest longevity in centenarian studies.",
    howToImprove: [
      "Selenium — 200 mcg (brazil nuts, sardines, or supplement)",
      "Zinc — required for thyroid hormone synthesis",
      "Iodine — not too much, not too little (seaweed, iodized salt)",
      "Reduce stress — cortisol suppresses TSH",
      "Sleep — circadian disruption dysregulates HPT axis",
    ],
    budgetTips: [
      "Brazil nuts — 2 nuts/day provides optimal selenium",
      "Iodized salt costs pennies",
    ],
    category: "Hormones",
    icon: "🦋",
    riskLevel: "low",
  },
  {
    id: "vo2max",
    name: "VO₂ Max",
    description: "Maximum rate of oxygen consumption during exercise. The gold-standard measure of cardiovascular fitness.",
    optimalRange: ">35 (M), >30 (F) mL/kg/min (varies by age)",
    optimalLevel: ">45 (M), >38 (F) mL/kg/min",
    unit: "mL/kg/min",
    importance: "VO₂ max is one of the strongest longevity predictors. Each 3.5 mL/kg/min increase ~ 1 MET improvement lowers mortality risk by 12–15%. Low VO₂ max has a similar mortality impact as smoking or diabetes.",
    howToImprove: [
      "Zone 2 cardio — 150 min/week at conversational pace (60–70% max HR)",
      "HIIT — 1–2 sessions/week pushes VO₂ max ceiling",
      "Lactate threshold training — tempo runs/rides",
      "Zone 2 builds mitochondrial density; HIIT improves pumping capacity",
    ],
    budgetTips: [
      "Running costs only good shoes",
      "Bodyweight circuits build cardiovascular fitness at home",
    ],
    category: "Physical Function",
    icon: "🏃",
    riskLevel: "low",
  },
  {
    id: "waist-hip",
    name: "Waist-to-Hip Ratio",
    description: "Waist circumference divided by hip circumference. Measures central obesity — the most dangerous fat distribution.",
    optimalRange: "<0.90 (M), <0.85 (F)",
    optimalLevel: "<0.85 (M), <0.80 (F)",
    unit: "ratio",
    importance: "Waist-to-hip ratio outperforms BMI as a mortality predictor. Visceral fat secretes inflammatory cytokines and drives insulin resistance. Each 0.1 increase in WHR raises mortality risk by ~20%.",
    howToImprove: [
      "Calorie deficit with adequate protein to lose fat without losing muscle",
      "Walking — 10,000 steps/day preferentially reduces visceral fat",
      "Zone 2 cardio — specifically mobilizes visceral adipose tissue",
      "Avoid fructose — directly promotes visceral fat deposition",
      "Sleep 7–9 hrs — sleep deprivation increases visceral fat",
    ],
    budgetTips: [
      "Walking costs nothing and reduces visceral fat",
      "A $10 tape measure is all you need to track progress",
    ],
    category: "Body Composition",
    icon: "📏",
    riskLevel: "moderate",
  },
  {
    id: "resting-hr",
    name: "Resting Heart Rate",
    description: "Heart rate when fully at rest (after waking or sitting quietly for 5+ min). A proxy for cardiovascular efficiency.",
    optimalRange: "60–100 bpm",
    optimalLevel: "45–65 bpm",
    unit: "bpm",
    importance: "Each 10 bpm increase above 65 raises all-cause mortality risk by 10–15%. RHR >80 bpm = hazard ratio of 1.33 vs <65 bpm. In athletes, RHR 40–50 is common and reflects high vagal tone and cardiac efficiency.",
    howToImprove: [
      "Aerobic exercise — 150+ min/week lowers RHR by 5–15 bpm",
      "Zone 2 training specifically improves stroke volume",
      "Reduce stress — meditation, deep breathing, cold exposure",
      "Optimize sleep — poor sleep elevates resting HR",
      "Limit alcohol and caffeine — both increase RHR",
    ],
    budgetTips: [
      "Free apps measure RHR via phone camera",
      "Deep breathing costs zero and activates parasympathetic system",
    ],
    category: "Cardiovascular Health",
    icon: "💓",
    riskLevel: "low",
  },
  {
    id: "bp",
    name: "Blood Pressure",
    description: "Systolic/diastolic pressure — the force of blood against artery walls during and between heartbeats.",
    optimalRange: "<120/<80 mmHg",
    optimalLevel: "<115/<75 mmHg",
    unit: "mmHg",
    importance: "High BP is the #1 attributable risk factor for global mortality. Each 20 mmHg systolic increase doubles CVD risk. Optimal BP <115/75 is associated with minimal vascular aging and the highest longevity.",
    howToImprove: [
      "Reduce sodium — keep <2000 mg/day, ideally <1500 mg",
      "Increase potassium — 3500–4700 mg/day from vegetables, fruits",
      "DASH diet — rich in vegetables, fruit, whole grains, lean protein",
      "Exercise — 30 min daily reduces BP by 5–8 mmHg",
      "Limit alcohol — reduces BP by 2–4 mmHg",
      "Magnesium glycinate — 200–400 mg lowers BP modestly",
    ],
    budgetTips: [
      "Cutting processed food reduces sodium and saves money",
      "Bananas and potatoes are cheap potassium sources",
      "Home BP monitor — $25 one-time investment for self-monitoring",
    ],
    category: "Cardiovascular Health",
    icon: "❤️",
    riskLevel: "high",
  },
];

const FOODS = [
  {
    id: "chicken-breast",
    name: "Chicken Breast",
    category: "Protein",
    description: "Lean, high-protein meat — the budget-friendly staple for muscle maintenance and metabolic health. 31g protein per 100g with minimal fat.",
    benefits: [
      "31g protein per 100g for muscle protein synthesis",
      "Low saturated fat — heart-friendly protein source",
      "Rich in B3 (niacin), B6, and selenium",
      "High satiety — helps with calorie control",
    ],
    biomarkers: ["grip", "alt", "hba1c"],
    howToCook: [
      "Air fryer: 190°C for 10–12 min (flip halfway) — perfect every time",
      "Marinate 30+ min in olive oil, lemon, garlic, salt, pepper, paprika",
      "Pan-sear: 4 min each side on medium-high, rest 5 min before slicing",
      "Bake: 200°C for 20–25 min (thicker breasts need more time)",
      "Internal temp must reach 74°C — use a $10 meat thermometer",
    ],
    budgetTips: [
      "Buy whole breasts in bulk (2–3kg) — save 30–40% vs pre-packed",
      "Freeze individual portions in ziplock bags",
      "Frozen chicken breast is just as nutritious as fresh",
    ],
    recipe: `Air Fryer Lemon Garlic Chicken Breast

Marinade (for 500g):
- 3 tbsp olive oil
- Juice of 1 lemon
- 4 cloves garlic, minced
- 1 tsp paprika
- 1 tsp dried oregano
- Salt & pepper to taste

Instructions:
1. Mix all marinade ingredients in a bowl
2. Add chicken breasts, coat well, marinate 30 min (or overnight)
3. Preheat air fryer to 190°C for 3 min
4. Place chicken in single layer in basket
5. Cook 10–12 min, flip at 6 min
6. Rest 5 min before slicing
7. Internal temp should read 74°C

Cost: ~$2.50 per serving`,
    cookMethod: "Air Fryer / Pan-sear / Bake",
    prepTime: "30 min marinade + 12 min cook",
    servingSize: "150–200g per serving",
  },
  {
    id: "salmon",
    name: "Wild Salmon",
    category: "Protein",
    description: "Omega-3 powerhouse — reduces inflammation, supports brain health, and improves lipid profile. The single best anti-inflammatory food.",
    benefits: [
      "Rich in EPA/DHA — 2–3g per serving reduces trigs by 20–30%",
      "Astaxanthin — powerful antioxidant, protects skin and eyes",
      "Vitamin D — 600 IU per serving",
      "Selenium — 200% RDA per serving",
      "High-quality protein — 22g per 100g",
    ],
    biomarkers: ["hscrp", "triglycerides", "apob", "vitamin-d"],
    howToCook: [
      "Air fryer: 180°C for 8–10 min (skin side up for crispy skin)",
      "Pan-sear: 4 min skin side down, 3 min flip, medium heat",
      "Bake: 180°C for 12–15 min with lemon and herbs",
      "Never overcook — salmon should flake easily but stay moist",
    ],
    budgetTips: [
      "Canned wild salmon (with bones) is 50% cheaper than fresh",
      "Frozen wild salmon is cheaper and equally nutritious",
      "Look for sales — stock up and freeze",
      "Sockeye has more omega-3 per gram than Atlantic",
    ],
    recipe: `Simple Air Fryer Salmon

Per serving:
- 150g salmon fillet
- 1 tbsp olive oil
- Salt, pepper, garlic powder
- Lemon wedges for serving

Instructions:
1. Pat salmon dry, rub with oil and seasonings
2. Preheat air fryer to 180°C
3. Cook skin-side up for 8 min (or 10 min for thicker fillets)
4. Squeeze fresh lemon before serving

Cost: ~$3.50 per serving (wild); ~$1.50 (canned)`,
    cookMethod: "Air Fryer / Pan-sear / Bake",
    prepTime: "5 min prep + 10 min cook",
    servingSize: "150g per serving",
  },
  {
    id: "sardines",
    name: "Sardines",
    category: "Protein",
    description: "The ultimate budget longevity food — packed with omega-3s, calcium, vitamin D, and coenzyme Q10. Eat 2–3 cans weekly.",
    benefits: [
      "Highest omega-3 per dollar of any food",
      "Calcium from soft bones — 350mg per can",
      "Vitamin D — 400 IU per can",
      "CoQ10 — supports mitochondrial health",
      "Low mercury — small fish, short lifespan, minimal toxins",
    ],
    biomarkers: ["hscrp", "triglycerides", "vitamin-d", "homocysteine"],
    howToCook: [
      "Eat straight from the can — no cooking needed",
      "Mash with avocado on whole-grain toast",
      "Add to salad with olive oil and lemon",
      "For warm meal: pan-fry 2 min each side in olive oil",
    ],
    budgetTips: [
      "$2 per can — one of the cheapest protein + omega-3 sources",
      "Buy canned in water or olive oil (not soy oil)",
      "Store brands are just as good as premium brands",
    ],
    recipe: `Sardine Avocado Toast

Per serving:
- 1 can sardines in olive oil
- 1/2 avocado
- 2 slices whole-grain bread
- Lemon juice, salt, pepper
- Optional: red pepper flakes

Instructions:
1. Toast bread
2. Mash avocado on toast
3. Top with sardines
4. Drizzle lemon, season to taste

Cost: ~$2.50 per serving`,
    cookMethod: "No-cook / Quick pan-fry",
    prepTime: "5 min",
    servingSize: "1 can per serving",
  },
  {
    id: "eggs",
    name: "Eggs",
    category: "Protein",
    description: "The most bioavailable protein source — complete amino acid profile. Yolk contains choline, lutein, vitamin D, and B-vitamins.",
    benefits: [
      "Highest leucine content — triggers muscle protein synthesis best",
      "Choline — critical for brain health and methylation",
      "Lutein/zeaxanthin — eye health, reduces macular degeneration",
      "Vitamin D — 40 IU per yolk",
      "Affordable complete protein — can eat daily",
    ],
    biomarkers: ["grip", "homocysteine", "hdl-c"],
    howToCook: [
      "Boiled: 7 min for jammy, 10 min for hard — batch cook 6–12",
      "Scrambled: low heat, constant stirring, finish off heat",
      "Poached: simmer water + vinegar, swirl, drop egg 3 min",
      "Air fryer boiled: 130°C for 13 min, ice bath",
    ],
    budgetTips: [
      "Eggs are the cheapest complete protein — ~$0.25 per serving",
      "Pasture-raised for better omega-3 content if budget allows",
      "Buy in flats of 30 for best value",
    ],
    recipe: `Perfect Hard-Boiled Eggs (Batch)

Per batch:
- 6–12 eggs

Instructions:
1. Place eggs in pot, cover with cold water by 1 inch
2. Bring to rolling boil
3. Cover, remove from heat, let sit 10 min
4. Transfer to ice bath for 5 min
5. Peel under running water

Cost: ~$0.25 per egg`,
    cookMethod: "Boiled / Scrambled / Poached",
    prepTime: "15 min",
    servingSize: "2–3 eggs per serving",
  },
  {
    id: "greek-yogurt",
    name: "Greek Yogurt",
    category: "Protein",
    description: "High-protein fermented dairy — probiotics for gut health, calcium for bones. Double the protein of regular yogurt.",
    benefits: [
      "15–20g protein per 150g serving",
      "Probiotics — supports gut microbiome diversity",
      "Calcium — 15% RDA per serving",
      "B12 and riboflavin",
    ],
    biomarkers: ["hscrp", "hdl-c", "vitamin-d"],
    howToCook: [
      "No cooking — eat as is or use in smoothies",
      "Top with berries, nuts, seeds for a complete meal",
      "Use as sour cream substitute in recipes",
      "Freeze into yogurt bark with fruit for healthy dessert",
    ],
    budgetTips: [
      "Buy plain full-fat in large tubs (saves 50% vs individual cups)",
      "Flavour yourself with frozen berries — cheaper than pre-flavoured",
      "Store brand is identical to branded nutritionally",
    ],
    recipe: `Protein Yogurt Bowl

Per serving:
- 200g plain Greek yogurt
- 1/2 cup frozen berries
- 1 tbsp chia seeds
- 1 tbsp almond butter
- Optional: 1 scoop vanilla protein powder

Instructions:
1. Layer yogurt in bowl
2. Top with berries, chia, almond butter
3. Stir and enjoy

Cost: ~$2.00 per serving`,
    cookMethod: "No-cook",
    prepTime: "3 min",
    servingSize: "150–200g per serving",
  },
  {
    id: "broccoli",
    name: "Broccoli",
    category: "Vegetables",
    description: "Cruciferous powerhouse — sulforaphane activates Nrf2, the master antioxidant pathway. Eat 3–5 servings of cruciferous vegetables weekly.",
    benefits: [
      "Sulforaphane — upregulates detox enzymes, reduces oxidative stress",
      "Vitamin C — 135% RDA per 100g",
      "Vitamin K — bone health and calcium regulation",
      "Fiber — 2.6g per 100g, feeds beneficial gut bacteria",
      "Glucosinolates — cancer-protective compounds",
    ],
    biomarkers: ["hscrp", "homocysteine", "alt", "uric-acid"],
    howToCook: [
      "Steam 4–5 min — preserves sulforaphane best",
      "Air fry: 180°C for 8 min with oil and garlic — crispy edges",
      "Roast: 200°C for 15 min with olive oil, salt, pepper",
      "Add to stir-fry in the last 3 min of cooking",
      "Avoid boiling — leaches nutrients and sulforaphane",
    ],
    budgetTips: [
      "Frozen broccoli is cheaper and sometimes more nutritious (flash-frozen at peak)",
      "Stems are just as nutritious as florets — chop and use both",
    ],
    recipe: `Air Fryer Garlic Broccoli

Per serving:
- 200g broccoli florets
- 2 tbsp olive oil
- 3 cloves garlic, minced
- Salt & pepper

Instructions:
1. Toss broccoli with oil, garlic, seasonings
2. Air fry at 180°C for 8 min
3. Squeeze lemon juice before serving

Cost: ~$0.80 per serving`,
    cookMethod: "Steam / Air Fry / Roast",
    prepTime: "5 min prep + 8 min cook",
    servingSize: "150–200g per serving",
  },
  {
    id: "spinach",
    name: "Spinach & Kale",
    category: "Vegetables",
    description: "Leafy greens — highest nutrient-per-calorie foods on the planet. Magnesium, iron, vitamin K, and nitrates for vascular health.",
    benefits: [
      "Nitrates — convert to NO (nitric oxide), lower BP by 4–5 mmHg",
      "Magnesium — 87mg per 100g (spinach), critical for 300+ enzymes",
      "Vitamin K — 500% RDA, directs calcium to bones not arteries",
      "Lutein — eye health, cognitive function",
      "Kaempferol & quercetin — anti-inflammatory flavonoids",
    ],
    biomarkers: ["bp", "hscrp", "homocysteine", "ferritin"],
    howToCook: [
      "Wilt into eggs, soups, or stir-fries — shrinks dramatically",
      "Sauté 2–3 min with garlic and olive oil",
      "Massage kale with olive oil and lemon for raw salads",
      "Add to smoothies — you won't taste it",
    ],
    budgetTips: [
      "Frozen spinach is $1.50/bag and more concentrated than fresh",
      "Buy fresh kale — it lasts 5–7 days in the fridge",
    ],
    recipe: `Garlic Wilted Spinach

Per serving:
- 200g fresh spinach (or 100g frozen)
- 2 tbsp olive oil
- 3 cloves garlic, sliced
- Salt & pepper
- Lemon juice

Instructions:
1. Heat oil in pan, add garlic 30 sec
2. Add spinach in batches, toss until wilted (2–3 min)
3. Season, squeeze lemon

Cost: ~$1.00 per serving`,
    cookMethod: "Sauté / Raw / Steamed",
    prepTime: "5 min",
    servingSize: "100–200g per serving",
  },
  {
    id: "blueberries",
    name: "Blueberries",
    category: "Fruits",
    description: "The longevity fruit — highest antioxidant capacity among common fruits. Anthocyanins protect against cognitive decline and oxidative stress.",
    benefits: [
      "Anthocyanins — cross the blood-brain barrier, protect neurons",
      "Flavonoids — improve endothelial function, lower BP",
      "Vitamin C & vitamin K",
      "Low glycemic load — minimal impact on blood sugar",
    ],
    biomarkers: ["hscrp", "bp", "hba1c", "fasting-glucose"],
    howToCook: [
      "No cooking — eat fresh or frozen",
      "Add to yogurt, oatmeal, smoothies",
      "Bake into healthy muffins (use almond flour, minimal sweetener)",
      "Frozen berries work perfectly in overnight oats",
    ],
    budgetTips: [
      "Frozen wild blueberries are 50% cheaper and MORE nutritious than fresh",
      "Buy in bulk bags from warehouse stores",
      "Pick-your-own in season and freeze yourself",
    ],
    recipe: `3-Minute Berry Bowl

Per serving:
- 100g frozen wild blueberries
- 1 tbsp chia seeds
- 1 tbsp flax seeds
- 200g Greek yogurt

Instructions:
1. Layer yogurt, berries, seeds
2. Stir and eat

Cost: ~$1.50 per serving`,
    cookMethod: "No-cook",
    prepTime: "3 min",
    servingSize: "100–150g per serving",
  },
  {
    id: "avocado",
    name: "Avocado",
    category: "Fruits",
    description: "Monounsaturated fat powerhouse — supports hormone production, nutrient absorption, and cardiovascular health. Rich in potassium and fiber.",
    benefits: [
      "Monounsaturated fat — improves HDL, reduces LDL oxidation",
      "Potassium — 485mg per half avocado (more than a banana)",
      "Fiber — 7g per half, promotes satiety and gut health",
      "Lutein + zeaxanthin — eye health",
      "Improves absorption of fat-soluble vitamins from other foods",
    ],
    biomarkers: ["hdl-c", "bp", "hscrp", "testosterone"],
    howToCook: [
      "Sliced on toast, salads, or tacos",
      "Guacamole: mash with lime, onion, cilantro, salt",
      "Add to smoothies for creamy texture",
      "Half with a splash of olive oil and salt = perfect snack",
    ],
    budgetTips: [
      "Buy at local markets or discount grocery stores",
      "Wait for sales and buy in bulk — ripen at home",
      "Store ripe avocados in the fridge for 3–5 extra days",
    ],
    recipe: `Simple Guacamole

Per serving:
- 1 ripe avocado
- 1 tbsp lime juice
- 1/4 red onion, diced
- Handful cilantro, chopped
- Salt & pepper
- Optional: 1/2 tomato, diced

Instructions:
1. Mash avocado to desired consistency
2. Mix in all ingredients
3. Adjust salt and lime to taste

Cost: ~$1.50 per serving`,
    cookMethod: "No-cook",
    prepTime: "5 min",
    servingSize: "1/2–1 avocado per serving",
  },
  {
    id: "olive-oil",
    name: "Extra Virgin Olive Oil",
    category: "Healthy Fats",
    description: "The cornerstone of the Mediterranean diet — polyphenols reduce inflammation, protect LDL from oxidation, and support brain health.",
    benefits: [
      "Oleic acid — monounsaturated fat, reduces inflammation",
      "Polyphenols (oleocanthal) — natural anti-inflammatory, similar to ibuprofen",
      "Hydroxytyrosol — protects LDL from oxidation",
      "Vitamin E — fat-soluble antioxidant",
      "Improves HDL function and endothelial health",
    ],
    biomarkers: ["hscrp", "hdl-c", "apob", "bp"],
    howToCook: [
      "Use raw for salads and finishing dishes",
      "Medium-heat cooking OK — don't smoke it (keep below 180°C)",
      "Drizzle on vegetables before roasting",
      "Mix with lemon as simple salad dressing",
    ],
    budgetTips: [
      "Buy in 3L tins — 50% cheaper than small bottles per ml",
      "Store in cool, dark place to preserve polyphenols",
      "Look for 'early harvest' olive oil — highest polyphenol content",
      "Kalamata or Greek brands offer best value for quality",
    ],
    recipe: `Simple Vinaigrette

Makes 1 cup:
- 3/4 cup extra virgin olive oil
- 1/4 cup red wine or balsamic vinegar
- 1 tsp Dijon mustard
- 1 clove garlic, minced
- Salt & pepper
- Optional: dried oregano

Instructions:
1. Whisk everything together
2. Store in jar for up to 2 weeks

Cost: ~$0.30 per serving`,
    cookMethod: "Raw / Light cooking",
    prepTime: "2 min",
    servingSize: "1–2 tbsp per serving",
  },
  {
    id: "sweet-potato",
    name: "Sweet Potatoes",
    category: "Complex Carbs",
    description: "Nutrient-dense carbohydrate source — rich in beta-carotene, fiber, and potassium. Lower glycemic impact than white potatoes.",
    benefits: [
      "Beta-carotene — converted to vitamin A, antioxidant",
      "Fiber — 4g per medium potato with skin",
      "Vitamin C — 35% RDA",
      "Potassium — 540mg per medium potato",
      "Slow-digesting carb — sustained energy without glucose spike",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "bp"],
    howToCook: [
      "Air fryer: 200°C for 15–20 min (cubed), flip halfway",
      "Bake whole: 200°C for 45–60 min until soft",
      "Boil: 15–20 min, then mash with olive oil and garlic",
      "Cut into wedges, season, and roast for healthy 'fries'",
    ],
    budgetTips: [
      "Buy in bulk bags (3–5kg) — significantly cheaper",
      "Store in cool, dark place — lasts 3–5 weeks",
      "Skins are edible and contain extra fiber and nutrients",
    ],
    recipe: `Air Fryer Sweet Potato Wedges

Per serving:
- 1 large sweet potato
- 2 tbsp olive oil
- 1 tsp paprika
- 1 tsp garlic powder
- Salt & pepper

Instructions:
1. Cut sweet potato into wedges
2. Toss with oil and seasonings
3. Air fry at 200°C for 15–18 min, flip at 8 min
4. Sprinkle with salt while hot

Cost: ~$0.50 per serving`,
    cookMethod: "Air Fry / Bake / Boil",
    prepTime: "10 min prep + 15–20 min cook",
    servingSize: "1 medium potato per serving",
  },
  {
    id: "oats",
    name: "Rolled Oats",
    category: "Complex Carbs",
    description: "Whole grain with beta-glucan — soluble fiber that lowers cholesterol and feeds gut bacteria. The perfect breakfast base.",
    benefits: [
      "Beta-glucan — reduces LDL-C by 5–10% with 3g daily",
      "Fiber — 4g per 40g serving",
      "Magnesium, zinc, and B-vitamins",
      "Slow-release energy — keeps blood sugar stable",
    ],
    biomarkers: ["apob", "ldl-c", "hba1c", "fasting-glucose"],
    howToCook: [
      "Overnight oats: 1:1 oats to milk/yogurt, refrigerate overnight",
      "Stovetop: 5 min with water or milk, stir occasionally",
      "Microwave: 2 min with liquid, stir halfway",
      "Add protein powder, berries, nuts, seeds for complete meal",
    ],
    budgetTips: [
      "Buy in large canisters — cheapest form ($0.10/serving)",
      "Store brand = exactly the same as name brand (it's all oats)",
      "Flavour with cinnamon and frozen berries instead of buying packets",
    ],
    recipe: `High-Protein Overnight Oats

Per serving:
- 40g rolled oats
- 1 scoop vanilla protein powder (or collagen)
- 200ml milk (or unsweetened almond milk)
- 1 tbsp chia seeds
- 50g frozen berries
- 1 tbsp almond butter

Instructions:
1. Mix oats, protein, chia, milk in jar
2. Top with berries
3. Refrigerate overnight
4. Top with almond butter before eating

Cost: ~$1.50 per serving`,
    cookMethod: "No-cook (overnight) / Stovetop / Microwave",
    prepTime: "5 min prep (overnight) or 5 min cook",
    servingSize: "40–60g dry oats per serving",
  },
  {
    id: "quinoa",
    name: "Quinoa",
    category: "Complex Carbs",
    description: "Complete plant protein with all 9 essential amino acids. High in fiber, magnesium, and iron — a perfect rice alternative.",
    benefits: [
      "Complete protein — 8g per cup cooked",
      "Fiber — 5g per cup",
      "Magnesium — 30% RDA per cup",
      "Quercetin + kaempferol — anti-inflammatory flavonoids",
      "Low glycemic index — doesn't spike blood sugar",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "hscrp"],
    howToCook: [
      "Rinse before cooking to remove bitter saponins",
      "2:1 water to quinoa ratio, boil then simmer 15 min",
      "Fluff with fork and let sit 5 min",
      "Use as base for bowls, salads, or side dish",
    ],
    budgetTips: [
      "Buy in bulk bins — 50% cheaper than pre-packaged",
      "Millet is a cheaper alternative with similar nutrition profile",
      "Cooking in large batches saves time",
    ],
    recipe: `Simple Lemon Herb Quinoa

Per serving:
- 1 cup quinoa
- 2 cups water or bone broth
- 2 tbsp olive oil
- Juice of 1 lemon
- 2 tbsp fresh herbs (parsley, mint)
- Salt & pepper

Instructions:
1. Rinse quinoa
2. Bring water to boil, add quinoa, reduce to simmer 15 min
3. Fluff, add oil, lemon, herbs
4. Season to taste

Cost: ~$0.60 per serving`,
    cookMethod: "Boil / Simmer",
    prepTime: "5 min prep + 15 min cook",
    servingSize: "1/2 cup dry per serving",
  },
];

const SUPPLEMENTS = [
  {
    id: "vitamin-d3-k2",
    name: "Vitamin D3 + K2 (MK-7)",
    description: "The foundational longevity supplement. D3 regulates immune function, bone health, mood, and gene expression. K2 directs calcium to bones and away from arteries.",
    dosage: "3000–5000 IU D3 + 100–200 mcg K2 (MK-7) daily",
    timing: "With largest meal containing fat (lunch or dinner)",
    benefits: [
      "Supports immune function and reduces autoimmunity risk",
      "Improves bone mineral density",
      "Reduces cardiovascular calcification (with K2)",
      "Enhances mood and cognitive function",
      "Supports testosterone production",
    ],
    biomarkers: ["vitamin-d", "testosterone", "hscrp"],
    budgetOptions: [
      "Sports Research D3+K2 ($15/3 months) — best value with coconut oil",
      "NOW Foods D3 5000 IU ($6/6 months) + NOW K2 MK-7 ($12/3 months)",
      "Kirkland Signature D3 ($8/year for 2000 IU)",
    ],
    notes: "Test your levels first! Dose based on baseline. Take with fat for absorption. K2 MK-7 (from natto) is superior to MK-4.",
  },
  {
    id: "omega-3",
    name: "Omega-3 (EPA/DHA)",
    description: "Long-chain marine omega-3s. EPA is anti-inflammatory; DHA is structural for brain and eyes. Most people are deficient due to low fish intake.",
    dosage: "2–4g total (EPA+DHA) daily. Look for at least 60% EPA+DHA concentration",
    timing: "With meals containing fat for absorption. Split dose AM/PM if high dose.",
    benefits: [
      "Reduces triglycerides by 20–30%",
      "Lowers inflammation (CRP, IL-6)",
      "Supports brain health and cognitive function",
      "Improves HDL function",
      "Reduces platelet aggregation (blood thinning)",
    ],
    biomarkers: ["hscrp", "triglycerides", "hdl-c", "apob"],
    budgetOptions: [
      "NOW Foods Ultra Omega-3 ($18/2 months) — 500mg EPA + 250mg DHA per softgel",
      "Viva Naturals Omega-3 ($25/3 months) — high concentration",
      "Costco Kirkland Fish Oil ($12/6 months) — solid base option",
      "Look for 'IFOS' or 'Nordic Naturals' quality seal",
    ],
    notes: "Algae oil for vegans. Triglyceride form is better absorbed than ethyl ester. Store in fridge after opening. Avoid if on blood thinners without MD consult.",
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    description: "The most absorbable form of magnesium — chelated to glycine for dual benefit. Involved in 300+ enzymatic reactions including ATP production, muscle function, and sleep.",
    dosage: "200–400 mg elemental magnesium daily (as glycinate)",
    timing: "30–60 min before bed — improves sleep quality and relaxation",
    benefits: [
      "Improves sleep quality and reduces time to fall asleep",
      "Supports muscle recovery and reduces cramps",
      "Lowers blood pressure modestly",
      "Reduces anxiety and stress response",
      "Essential for vitamin D activation",
    ],
    biomarkers: ["bp", "testosterone", "hscrp", "hba1c"],
    budgetOptions: [
      "Doctor's Best High Absorption Magnesium ($12/2 months)",
      "NOW Foods Magnesium Glycinate ($10/2 months)",
      "KAL Magnesium Glycinate ($8/month)",
      "AVOID magnesium oxide — poor absorption (~4%)",
    ],
    notes: "Glycinate is best for sleep and relaxation. Threonate for brain/cognition. Citrate for constipation. Start at 200mg to assess tolerance, then increase.",
  },
  {
    id: "creatine",
    name: "Creatine Monohydrate",
    description: "The most researched supplement in the world. Enhances ATP regeneration, muscle strength, brain function, and may reduce homocysteine.",
    dosage: "5g daily (no cycling needed). Loading optional: 20g/day for 5–7 days.",
    timing: "Consistent daily timing doesn't matter. In practice: post-workout or with meals.",
    benefits: [
      "Increases strength and lean mass by 15–20% over training alone",
      "Improves high-intensity exercise performance",
      "Enhances cognitive function, especially under sleep deprivation",
      "Reduces homocysteine levels",
      "Neuroprotective — potential benefits in neurodegenerative diseases",
    ],
    biomarkers: ["grip", "homocysteine", "hdl-c"],
    budgetOptions: [
      "Creapure brand is the gold standard (sourced from Germany)",
      "NOW Sports Creatine Mono ($15/6 months) — Creapure",
      "Kaged Muscle Creatine ($18/4 months) — Creapure",
      "BulkSupplements ($12/8 months) — micronized, works just as well",
    ],
    notes: "No loading required for benefits. Micronized dissolves better in water. Safe for long-term use (studies up to 5+ years). No 'loading' phase needed — 5g daily reaches saturation in 3–4 weeks.",
  },
  {
    id: "nac",
    name: "N-Acetylcysteine (NAC)",
    description: "Precursor to glutathione — the body's master antioxidant. Replenishes cellular antioxidant capacity and supports liver detoxification.",
    dosage: "600–1200 mg daily",
    timing: "On empty stomach (food reduces absorption). Split dose if 1200mg.",
    benefits: [
      "Replenishes glutathione — critical for antioxidant defence",
      "Reduces oxidative stress and inflammation",
      "Supports liver detoxification pathways",
      "Mucolytic — thins mucus, supports respiratory health",
      "May reduce oxidative damage to LDL particles",
    ],
    biomarkers: ["alt", "hscrp", "homocysteine"],
    budgetOptions: [
      "NOW Foods NAC ($10/3 months at 600mg)",
      "Doctor's Best NAC ($12/3 months)",
      "Jarrow Formulas NAC ($10/2 months)",
    ],
    notes: "Take with glycine for synergistic glutathione synthesis. Liposomal glutathione is an alternative but more expensive. Some people get anhedonia at high doses — start low.",
  },
  {
    id: "glycine",
    name: "Glycine",
    description: "The simplest amino acid with powerful longevity effects. Essential for collagen synthesis, glutathione production, and sleep quality.",
    dosage: "3–5g before bed",
    timing: "30–60 min before bedtime — improves sleep quality via NMDA receptor modulation",
    benefits: [
      "Improves sleep quality — reduces time to fall asleep, less daytime fatigue",
      "Collagen synthesis — precursors for skin, joint, and bone health",
      "Glutathione production — combines with NAC for maximal effect",
      "Reduces oxidative stress and inflammation",
      "Lowers blood sugar via improved insulin sensitivity",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "hscrp", "hdl-c"],
    budgetOptions: [
      "NOW Foods Glycine ($12/6 months) — cheapest per gram",
      "BulkSupplements Glycine ($10/8 months) — great value",
      "Doctor's Best Glycine ($10/4 months)",
    ],
    notes: "The glycine + NAC combo is a potent glutathione-boosting stack. Can also be taken as collagen powder (but collagen is ~15% glycine, so you need more). Tastes mildly sweet — can be mixed in tea.",
  },
  {
    id: "zinc",
    name: "Zinc Picolinate",
    description: "The best-absorbed form of zinc — critical for immune function, testosterone synthesis, DNA repair, and antioxidant defence.",
    dosage: "15–30 mg elemental zinc daily (as picolinate)",
    timing: "With food to avoid nausea. Avoid taking with calcium or iron.",
    benefits: [
      "Essential for testosterone synthesis — deficiency drops T levels",
      "Supports immune function and reduces infection severity",
      "Cofactor for superoxide dismutase (antioxidant enzyme)",
      "Wound healing and skin health",
      "Supports thyroid hormone metabolism",
    ],
    biomarkers: ["testosterone", "tsh", "hscrp"],
    budgetOptions: [
      "NOW Foods Zinc Picolinate ($8/4 months)",
      "Solgar Zinc Picolinate ($10/3 months)",
      "Thorne Zinc Picolinate ($10/2 months)",
      "Other forms: gluconate (cheapest), citrate (good), oxide (avoid)",
    ],
    notes: "Take with copper if supplementing 30mg+ daily long-term (15:1 zinc:copper ratio). Zinc lozenges for acute cold symptoms. Picolinate has best absorption profile.",
  },
  {
    id: "coq10",
    name: "CoQ10 (Ubiquinone)",
    description: "Essential electron carrier in the mitochondrial electron transport chain. Critical for cellular energy production and antioxidant protection.",
    dosage: "100–200 mg daily (ubiquinone) or 100 mg (ubiquinol — for age 50+)",
    timing: "With a meal containing fat for absorption",
    benefits: [
      "Mitochondrial health — supports cellular energy production",
      "Antioxidant — protects cell membranes from lipid peroxidation",
      "Cardiovascular health — improves endothelial function",
      "Statin-induced depletion — statins reduce CoQ10 by 40%",
      "May improve sperm quality and heart function",
    ],
    biomarkers: ["ldl-c", "apob", "bp"],
    budgetOptions: [
      "Doctor's Best CoQ10 ($18/3 months)",
      "NOW Foods CoQ10 ($16/3 months)",
      "Costco Kirkland CoQ10 ($15/4 months) — excellent value",
      "Ubiquinol is 3–5× more expensive — only needed for 50+ or statin users",
    ],
    notes: "Statin users ABSOLUTELY need CoQ10. Ubiquinol is the reduced, more bioavailable form but expensive. Ubiquinone works fine for most under 50. Take with a fatty meal.",
  },
  {
    id: "berberine",
    name: "Berberine",
    description: "Plant alkaloid that activates AMPK — the 'master metabolic regulator'. Mimics the effects of metformin and exercise at the cellular level.",
    dosage: "500 mg, 2–3× daily before meals",
    timing: "15–30 min before meals (especially before highest-carb meal)",
    benefits: [
      "Improves insulin sensitivity — comparable to metformin",
      "Lowers fasting glucose and HbA1c",
      "Reduces LDL-C and triglycerides",
      "Activates AMPK — promotes mitochondrial biogenesis",
      "Anti-inflammatory and antimicrobial effects",
    ],
    biomarkers: ["hba1c", "fasting-glucose", "fasting-insulin", "ldl-c", "triglycerides"],
    budgetOptions: [
      "NOW Foods Berberine Glucose Support ($15/2 months)",
      "Thorne Berberine ($24/2 months) — premium quality",
      "Doctor's Best Berberine ($18/2 months)",
      "Look for 500mg capsules, avoid time-release (worse absorption)",
    ],
    notes: "Cycling: 8 weeks on, 4 weeks off to maintain effectiveness. Can cause GI upset — start with 500mg once daily and increase. Do NOT take with cyclosporine. May enhance metformin effects — monitor glucose.",
  },
  {
    id: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    description: "Adaptogenic herb that reduces cortisol, improves stress resilience, and supports testosterone production. KSM-66 is the most researched extract.",
    dosage: "300–600 mg KSM-66 extract daily",
    timing: "With meals. Can be taken AM (energy/performance) or PM (relaxation).",
    benefits: [
      "Reduces cortisol by 15–30% — stress resilience",
      "Increases testosterone modestly in men (+10–20%)",
      "Improves sleep quality and reduces anxiety",
      "Increases muscle strength and VO₂ max",
      "Anti-inflammatory — reduces CRP",
    ],
    biomarkers: ["testosterone", "hscrp", "tsh"],
    budgetOptions: [
      "NOW Foods Ashwagandha KSM-66 ($12/2 months)",
      "Doctor's Best Ashwagandha ($10/2 months)",
      "Jarrow Formulas Ashwagandha ($14/2 months)",
      "KSM-66 is the gold-standard extract — stick to it",
    ],
    notes: "KSM-66 standardized to 5% withanolides. Cycled: 3 months on, 1 month off. Not recommended for hyperthyroidism or bipolar disorder. Start with 300mg for 2 weeks then increase if needed.",
  },
  {
    id: "taurine",
    name: "Taurine",
    description: "Conditionally essential amino acid with diverse longevity benefits — supports heart function, insulin sensitivity, and mitochondrial health.",
    dosage: "2–6g daily",
    timing: "Can be taken any time. 30 min before workout for performance benefits.",
    benefits: [
      "Improves insulin sensitivity — reduces metabolic syndrome risk",
      "Cardioprotective — reduces blood pressure, improves heart contractility",
      "Mitochondrial health — supports electron transport chain",
      "Anti-inflammatory and antioxidant",
      "May improve exercise performance and recovery",
    ],
    biomarkers: ["hba1c", "bp", "hscrp", "fasting-glucose"],
    budgetOptions: [
      "NOW Foods Taurine ($10/6 months at 2g daily) — cheapest option",
      "BulkSupplements Taurine ($8/8 months) — excellent value",
      "Doctor's Best Taurine ($8/4 months)",
    ],
    notes: "Powder form is cheapest. Tastes slightly sour — mix in water or juice. Works synergistically with magnesium. Taurine depletion occurs with age — supplementation becomes more important after 40.",
  },
  {
    id: "b-complex",
    name: "B-Complex (Methylated)",
    description: "All eight B vitamins in their active (methylated/co-enzymated) forms. Critical for energy metabolism, homocysteine regulation, and methylation.",
    dosage: "1 capsule daily (look for methylfolate, methylcobalamin, P5P)",
    timing: "With breakfast or lunch (can be energizing — avoid PM)",
    benefits: [
      "Reduces homocysteine — directly lowers cardiovascular risk",
      "Supports methylation cycle — DNA repair and gene expression",
      "Energy production — B-vitamins are cofactors in the Krebs cycle",
      "Neurotransmitter synthesis — mood and cognitive function",
      "Red blood cell production",
    ],
    biomarkers: ["homocysteine", "alt", "tsh"],
    budgetOptions: [
      "Pure Encapsulations B-Complex ($20/2 months) — premium methylated",
      "NOW Foods B-50 ($10/3 months) — solid, partially methylated",
      "Jarrow Formulas B-Right ($16/3 months) — fully methylated",
      "Life Extension BioActive B ($18/2 months)",
    ],
    notes: "Methylated forms (methylfolate NOT folic acid, methylcobalamin NOT cyanocobalamin, P5P NOT pyridoxine HCl) are important for people with MTHFR mutations (~40% of population).",
  },
];

const FOOD_CATEGORIES = ["Protein", "Vegetables", "Fruits", "Healthy Fats", "Complex Carbs"];
