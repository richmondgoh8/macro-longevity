// pillars.js — 4-Pillar master model, Longevity 101, decision rule, evidence taxonomy
// Source: Longevity OS — Evidence-Based Healthspan Blueprint (Singapore Ed., 2026)
// Rendered on the home page and reused by the Markdown export.

export const PILLARS = [
  {
    id: 1,
    kicker: "Pillar 1",
    name: "Prevent Disease",
    icon: "shield",
    desc: "Reduce premature death and disability — the fastest way to improve expected longevity is to cut the risks that actually cause disease.",
    tags: ["CVD", "Cancer", "Diabetes", "Dementia", "CKD", "Infection", "Frailty"],
    href: "/pages/blood.html",
    cta: "Biomarkers & screening",
  },
  {
    id: 2,
    kicker: "Pillar 2",
    name: "Slow Biological Aging",
    icon: "dna",
    desc: "Maintain cellular repair and resilience. Use the Hallmarks of Aging as a map of biology — not twelve separate consumer protocols.",
    tags: ["12 Hallmarks", "Mitochondria", "Autophagy", "Senescence", "Inflammation"],
    href: "/pages/protocol.html#biology",
    cta: "Biology & frontier",
  },
  {
    id: 3,
    kicker: "Pillar 3",
    name: "Build & Preserve Reserve",
    icon: "dumbbell",
    desc: "Keep capacity to survive aging, illness and inactivity. Arrive older with enough to stay independent.",
    tags: ["VO₂max", "Muscle", "Strength", "Power", "Bone", "Balance", "Cognition"],
    href: "/pages/workout.html",
    cta: "Training protocol",
  },
  {
    id: 4,
    kicker: "Pillar 4",
    name: "Optimize Fundamentals",
    icon: "leaf",
    desc: "Control the everyday inputs that drive all three outcome pillars — the practical intervention layer.",
    tags: ["Exercise", "Diet", "Sleep", "Body comp", "BP / lipids / glucose", "Environment"],
    href: "/pages/stack.html",
    cta: "Daily stack",
  },
];

export const LONGEVITY_101 = [
  "Never smoke; if you smoke, quitting outranks almost every optimization.",
  "Move every day — around <strong>7,000 daily steps</strong> is a useful practical target, not a magic threshold.",
  "Accumulate <strong>150–300 min</strong> of moderate aerobic activity per week, or the vigorous equivalent.",
  "Strength-train all major muscle groups <strong>at least twice per week</strong>.",
  "Maintain a healthy waist and body-fat trajectory while <strong>preserving muscle</strong>.",
  "Eat mostly minimally processed, fiber-rich foods with <strong>adequate protein</strong>.",
  "Protect regular, restorative sleep — roughly <strong>7–9 hours</strong> for most adults.",
  "Know and appropriately manage <strong>blood pressure, lipids/ApoB</strong> and glucose.",
  "Minimize alcohol, excess sodium and harmful UV; avoid unnecessary carcinogen exposure.",
  "Use evidence-based <strong>vaccination</strong> and age/risk-appropriate <strong>screening</strong>.",
];

export const DECISION_RULE =
  "A recommendation moves upward only when it combines strong human evidence, meaningful expected benefit, low risk, reasonable cost, low time burden and long-term adherence. Mechanistic excitement alone is never allowed to outrank human outcomes.";

// 5-tier evidence taxonomy (mirrors the report)
export const EVIDENCE_TIERS = [
  { tier: "core", label: "CORE", def: "Strong human evidence + high practical value. Prioritize first." },
  { tier: "conditional", label: "CONDITIONAL", def: "Good value for specific people, deficiencies or risk profiles." },
  { tier: "optional", label: "OPTIONAL", def: "Reasonable incremental benefit, but not foundational." },
  { tier: "experimental", label: "EXPERIMENTAL", def: "Interesting human/preclinical science without proven longevity outcomes." },
  { tier: "skip", label: "SKIP", def: "Weak evidence, poor economics, or unfavorable trade-off." },
];
