// core.js — user-facing outcome coverage for the core protocol.
// This is deliberately written as actions + targeted options, not as a promise
// that one supplement can treat six complex systems.

export const CORE_OUTCOMES = [
  {
    id: "sleep",
    icon: "😴",
    name: "Deep Sleep",
    core: "Fixed wake time, morning light, a cool dark room and a personal caffeine cut-off.",
    targeted: "Magnesium or glycine only when a defined need remains; loud snoring, gasping or daytime sleepiness warrants sleep-apnoea evaluation.",
    measure: "7-day sleep duration and daytime function",
  },
  {
    id: "stress",
    icon: "🧠",
    name: "Stress",
    core: "Regular aerobic and resistance training, social connection and a repeatable wind-down routine.",
    targeted: "Ashwagandha or L-theanine is a time-limited symptom trial, not a permanent longevity requirement.",
    measure: "Perceived stress, mood and sleep trend",
  },
  {
    id: "glucose",
    icon: "🩸",
    name: "HbA1c / Glucose",
    core: "150–300 minutes of weekly aerobic activity, strength training twice weekly, waist tracking and a post-meal walk when meals contain carbohydrate.",
    targeted: "Berberine belongs with a clinician-defined metabolic indication; do not use it to chase a normal HbA1c.",
    measure: "HbA1c trend, waist and blood pressure",
  },
  {
    id: "apob",
    icon: "❤️",
    name: "ApoB / Cholesterol",
    core: "Measure ApoB, review the full lipid pattern and replace some saturated fat with unsaturated fat or fatty fish when ApoB is high.",
    targeted: "Psyllium is a measured LDL/ApoB experiment, not a universal carnivore supplement; persistent high risk needs clinician-led treatment discussion.",
    measure: "ApoB, LDL-C, non-HDL-C and blood pressure",
  },
  {
    id: "mitochondria",
    icon: "⚡",
    name: "Mitochondrial Function",
    core: "Progressive resistance training plus a consistent aerobic base; these are the reliable mitochondrial inputs.",
    targeted: "Creatine monohydrate earns a core place when paired with resistance training; speculative NAD and mitophagy products do not.",
    measure: "Strength, aerobic fitness and recovery—not a commercial 'mitochondrial' panel",
  },
  {
    id: "gut",
    icon: "🦠",
    name: "Gut Health",
    core: "Avoid ultra-processed food; use tolerated fibre-containing foods or psyllium, and plain fermented dairy if it suits you.",
    targeted: "Psyllium or fermented food is a practical trial; routine probiotic capsules and microbiome panels are not default care.",
    measure: "Stool regularity, symptoms and tolerance—not a single microbiome score",
  },
];
