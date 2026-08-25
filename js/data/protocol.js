// protocol.js — Blueprint content from the Longevity OS report
// 80/20 protocol, social & mental health, frontier geroscience, screening tiers, biology.

export const EIGHTY_TWENTY = {
  today: [
    "Move: accumulate walking; take stairs; break up long sitting.",
    "Eat: protein + vegetables/fruit + sensible carbohydrate + healthy fat; at hawker centres, use less gravy/soup and choose water.",
    "Sleep: protect enough time for ~7–9 hours and a consistent wake time.",
    "Avoid: tobacco; excess alcohol; unnecessary midday UV.",
    "If training outdoors: check WBGT, UV and air quality first.",
  ],
  week: [
    "2 full-body strength sessions.",
    "150+ minutes of moderate aerobic activity or equivalent progression toward it.",
    "Several days near or above ~7,000 steps if practical.",
    "Buy simple repeatable foods rather than specialty longevity products.",
    "Schedule missing preventive care rather than another supplement order.",
  ],
  year: [
    "Know your blood pressure, lipid profile and glucose status.",
    "Measure/monitor waist and body-weight trajectory.",
    "Consider a once-in-adulthood Lp(a) test as part of cardiovascular risk assessment.",
    "Stay current on appropriate vaccination and cancer screening.",
    "Reassess fitness, strength, sleep quality and adherence — not only laboratory numbers.",
  ],
  instead: [
    { skip: "$100/month NAD stack", do: "Walking + structured aerobic training", why: "Better human-outcome evidence; also improves function." },
    { skip: "Repeated expensive 'biological age' testing", do: "BP + waist + fitness + strength + lipids + glucose", why: "More actionable today." },
    { skip: "'Mitochondrial detox' product", do: "Aerobic + resistance training", why: "Direct, broad physiological adaptation." },
    { skip: "Large antioxidant stack", do: "Fruit/vegetables + nuts + whole foods", why: "Better nutritional value and evidence base." },
    { skip: "Longevity retreat", do: "Sustainable weekly routine", why: "Adherence over decades beats short bursts." },
  ],
  minimal:
    "Move daily • 2× strength/week • 150+ min aerobic/week • mostly Quarter–Quarter–Half meals • less gravy/salty soup • healthy waist + muscle • 7–9 h sleep • know BP/lipids/glucose • no smoking.",
};

export const SOCIAL_MENTAL = {
  intro: "Loneliness, isolation, depression and chronic stress are associated with worse health outcomes, although much of the mortality evidence is observational. Treat connection, purpose and mental-health care as part of healthspan — without pretending they have an exact 'years added' dose.",
  actions: [
    "Protect enough sleep opportunity — schedule it like a non-negotiable input.",
    "Keep wake time reasonably consistent; use morning light and daytime activity.",
    "Make the room cool, dark and quiet — especially useful in Singapore's heat/humidity.",
    "Avoid using alcohol as a sleep tool; manage caffeine timing if it delays sleep.",
    "If persistent loud snoring, gasping, witnessed apneas or daytime sleepiness occur, assess for sleep apnea rather than buying more supplements.",
    "Treat connection, purpose and mental-health care as part of healthspan.",
  ],
  principle: "A longevity routine that chronically worsens sleep, stress or social life is not automatically a better longevity routine.",
};

export const FRONTIER = {
  intro: "Interesting science belongs in the report — but behind the fundamentals, with uncertainty clearly labeled. The defensible strategy is not to assume immortality is available today.",
  therapies: [
    { name: "Rapamycin / rapalogs", status: "EXPERIMENTAL", text: "Human studies show some physiological effects, but healthy-human lifespan/disease-delay benefit is not established; risks and optimal long-term dosing remain uncertain." },
    { name: "Metformin in healthy non-diabetics", status: "EXPERIMENTAL", text: "Excellent diabetes drug; insufficient evidence to prescribe broadly for longevity." },
    { name: "Senolytics", status: "EXPERIMENTAL", text: "Strong animal rationale; human translation still early." },
    { name: "NAD manipulation (NR/NMN)", status: "EXPERIMENTAL", text: "Biochemical target engagement ≠ proven healthspan extension." },
    { name: "Partial cellular reprogramming (OSK)", status: "FRONTIER", text: "First participant dosed in a Phase 1 OSK-based optic-neuropathy trial in June 2026. Safety/efficacy unknown — a historic translational milestone, not a consumer therapy." },
    { name: "Gene / regenerative rejuvenation", status: "FRONTIER", text: "Potentially transformative but currently research-stage." },
  ],
  optional: [
    { name: "Time-restricted eating / fasting", verdict: "OPTIONAL", text: "Can help some people control calories and metabolic health; not required for longevity." },
    { name: "Moderate caloric restriction", verdict: "OPTIONAL / CONTEXTUAL", text: "CALERIE improved cardiometabolic measures and modestly altered DunedinPACE, but long-term lifespan extension in humans is unproven." },
    { name: "Sauna", verdict: "OPTIONAL", text: "Promising observational cardiovascular associations; hard randomized outcome evidence weaker than exercise/BP treatment." },
    { name: "Cold exposure", verdict: "LOW PRIORITY", text: "Small heterogeneous trials; no compelling longevity-outcome evidence." },
    { name: "Wearables / CGM", verdict: "OPTIONAL", text: "Useful when they change behavior; data collection alone does not improve health." },
  ],
};

// Biomarker / screening actionability tiers (report Section 13)
export const SCREENING_TIERS = [
  { tier: "A", label: "High actionability", examples: "Blood pressure; standard lipid panel; glucose/HbA1c; weight + waist; activity/fitness; smoking status" },
  { tier: "B", label: "Situational", examples: "ApoB; kidney/urine albumin; liver tests; ferritin/iron; B12; vitamin D; thyroid — based on context" },
  { tier: "C", label: "Research / optimization", examples: "Lab VO₂max; DEXA; CGM in healthy people; epigenetic aging clocks" },
  { tier: "D", label: "Low value as routine", examples: "Repeated tumor markers in healthy people; giant micronutrient panels; 'mitochondrial age'; indiscriminate whole-body scans" },
];

export const BIOLOGY = {
  intro: "Use the Hallmarks of Aging as a map of biology — not as twelve separate consumer protocols. 'Reverse aging' should mean: reduce disease risk, become functionally rejuvenated (fitter/leaner/stronger), and move some biomarkers — not claim whole-organism age reversal, which is not established in humans.",
  hallmarks: [
    "Genomic instability", "Telomere attrition", "Epigenetic alterations", "Loss of proteostasis",
    "Disabled macroautophagy", "Deregulated nutrient sensing", "Mitochondrial dysfunction",
    "Cellular senescence", "Stem-cell exhaustion", "Altered intercellular communication",
    "Chronic inflammation", "Dysbiosis",
  ],
  mitochondrial: {
    intro: "Mitochondria matter — but the best 'mitochondrial stack' is still mostly exercise and metabolic health.",
    functions: ["Biogenesis — creating new mitochondria", "Efficient ATP production and metabolic flexibility", "Fusion/fission, redox signaling and quality control", "Mitophagy — clearing dysfunctional mitochondria"],
    interventions: [
      "Aerobic training — the clearest practical intervention for mitochondrial content and oxidative capacity.",
      "Intervals / vigorous work — useful for improving cardiorespiratory ceiling when tolerated.",
      "Resistance training — supports muscle, glucose disposal and mitochondrial adaptations.",
      "Healthy energy balance and insulin sensitivity — avoid chronic metabolic overload.",
      "Adequate sleep and nutrition — support recovery; neither requires a special mitochondrial product.",
    ],
    reality: [
      { name: "Creatine", verdict: "CONDITIONAL", text: "Strong performance/lean-mass adjunct with resistance training; not proven to extend lifespan." },
      { name: "CoQ10", verdict: "CONDITIONAL", text: "Useful in selected clinical contexts; weak case as universal longevity supplement." },
      { name: "Magnesium", verdict: "CONDITIONAL", text: "Correct deficiency / selected indications; not a mitochondrial anti-aging drug." },
      { name: "Urolithin A", verdict: "OPTIONAL / EXPERIMENTAL", text: "Interesting mitophagy/function signals; hard longevity outcomes absent." },
      { name: "NR / NMN", verdict: "EXPERIMENTAL", text: "Can raise NAD; anti-aging clinical effectiveness remains unproven." },
      { name: "PQQ / antioxidant stacks", verdict: "SKIP / LOW PRIORITY", text: "Mechanistic appeal without comparable human outcome evidence." },
    ],
  },
};
