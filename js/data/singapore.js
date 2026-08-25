// singapore.js — Singapore-specific localization from the Longevity OS report
// (hawker strategy, Healthier SG screening, sodium bottleneck, environment)

export const HAWKER = {
  intro: "Use ordinary food, not 'longevity food'. Make the default meal good enough to repeat for decades. Singapore's My Healthy Plate uses the same Quarter–Quarter–Half logic: ¼ wholegrains, ¼ protein, ½ fruit/vegetables.",
  steps: [
    { step: "Protein", text: "Fish, chicken, eggs, tofu, lean meat; fewer processed/fried defaults." },
    { step: "Vegetables", text: "Ask for extra vegetables or pair the meal with greens/fruit." },
    { step: "Carbohydrate", text: "Wholegrain when easy; otherwise a sensible portion of normal rice/noodles." },
    { step: "Sauce / soup", text: "Less gravy and sauce; do not automatically finish salty broth." },
    { step: "Drink", text: "Water or low/no-sugar drink as default." },
  ],
  templates: [
    { meal: "Mixed vegetable rice / cai fan", tip: "2 vegetables + 1 lean protein + rice; minimal gravy" },
    { meal: "Sliced fish soup", tip: "Extra vegetables; do not finish all broth" },
    { meal: "Yong tau foo", tip: "Mostly vegetables/tofu/egg/non-fried items; limit soup" },
    { meal: "Chicken rice", tip: "Extra greens; moderate rice; less sauce; skin optional" },
    { meal: "Chapati-based meal", tip: "Whole-wheat chapati + vegetables + lean protein" },
  ],
  pantry: ["Oats", "eggs", "tofu/soy", "frozen vegetables", "whole fruit", "rice/whole grains", "canned fish", "chicken", "plain dairy", "nuts/seeds"],
};

export const HEALTHIER_SG = {
  intro: "For eligible Singapore Citizens, Healthier SG Screening is $5 or less per visit at CHAS GP clinics — far cheaper than private executive checks, and it covers the tests that actually change decisions.",
  fees: [
    { group: "Pioneer Generation", fee: "$0" },
    { group: "Merdeka Gen / CHAS Blue or Orange", fee: "$2" },
    { group: "CHAS Green (other eligible citizens)", fee: "$5" },
    { group: "Enrolled Healthier SG citizens (at enrolled clinic)", fee: "$0" },
  ],
  note: "Covers cardiovascular risk, cervical and colorectal cancer screening in one visit + one follow-up consultation. Breast cancer screening at selected polyclinics at separate rates. Source: HealthHub, dated Aug 2026.",
};

export const SODIUM = {
  averageMg: 3620,
  recommendationMg: 2000,
  pctExceed: "≈90%",
  note: "The 2022 National Nutrition Survey found average intake ~3,620 mg/day sodium and about 90% of residents exceeding the 2,000 mg/day recommendation. Major sources: salt, sauces, seasonings, soups, gravy-based dishes, flavoured rice and noodles. WHO recommends <2,000 mg/day (<5 g salt).",
};

export const ENVIRONMENT = {
  intro: "The environment changes when and where you exercise, not whether movement matters. Check before a long/hard outdoor session.",
  heat: [
    { wbgt: "<31°C", level: "Low", action: "Normal activity." },
    { wbgt: "31–<33°C", level: "Moderate", action: "Reduce prolonged outdoor activity; regular shade/indoor breaks." },
    { wbgt: "≥33°C", level: "High", action: "Minimize prolonged outdoor activity; more frequent/longer cooling breaks." },
  ],
  uv: "UV is commonly very high to extreme ~11am–3pm on clear days. NEA advises shade/umbrella, eyewear/hat and at least SPF 30 for significant exposure.",
  haze: [
    { psi: "0–100", level: "Normal", action: "No restriction." },
    { psi: "101–200", level: "Unhealthy", action: "Healthy people: reduce prolonged/strenuous outdoor exertion." },
    { psi: "201–300", level: "Very unhealthy", action: "Avoid prolonged/strenuous outdoor exertion." },
    { psi: ">300", level: "Hazardous", action: "Minimize outdoor activity." },
  ],
  decision: "Before a long/hard outdoor session: check WBGT + UV + 1-hour PM2.5/PSI + rain/lightning. If poor, move it indoors — the training adaptation still counts.",
};
