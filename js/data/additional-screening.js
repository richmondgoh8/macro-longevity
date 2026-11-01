// Optional tracker expansion. Loaded only when requested or to restore saved results.
import { biomarkerUnits } from './blueprint-markers.js';

const FAMILIES = [
  {
    "id": "lipid-context",
    "title": "Fasting insulin",
    "source": "https://www.healthhub.sg/health-conditions/hyperlipidemia",
    "context": "Fasting insulin has no universal “optimal” target; HOMA-IR is a derived estimate, not a diagnosis. Interpret with fasting glucose, the assay and your clinical context.",
    "actionKey": "ldl",
    "rows": [
      [
        "insulin",
        "Fasting insulin",
        "Insulin",
        "6"
      ]
    ]
  },
  {
    "id": "liver",
    "title": "Liver enzymes and bilirubin",
    "source": "https://www.niddk.nih.gov/health-information/liver-disease/nafld-nash/treatment",
    "context": "Use your lab’s interval and interpret the pattern, symptoms, alcohol, medicines and prior results. These markers do not diagnose fatty liver by themselves; low values are not always better. Jaundice or significant symptoms need clinical assessment.",
    "actions": [
      [
        "Skip alcohol",
        "Choose alcohol-free drinks, particularly when liver tests are abnormal."
      ],
      [
        "Move and replace liquid sugar",
        "Build toward 150 minutes of moderate activity weekly; choose water over sugary drinks. If overweight, use sustainable portion changes rather than crash dieting."
      ],
      [
        "Avoid supplement-related harm",
        "Skip “liver detox” products and high-dose supplements unless prescribed. Take prescribed medicines as directed; do not stop them on your own."
      ]
    ],
    "rows": [
      [
        "alt",
        "ALT",
        "Alanine Transaminase",
        "25"
      ],
      [
        "ast",
        "AST",
        "Aspartate Aminotransferase",
        "24"
      ],
      [
        "ggt",
        "GGT",
        "Gamma Glutamyl Transferase",
        "30"
      ],
      [
        "alp",
        "Alkaline phosphatase (ALP)",
        "Alkaline Phosphatase",
        "75"
      ],
      [
        "bilirubin",
        "Total bilirubin",
        "Bilirubin, Total (Blood)",
        "12"
      ]
    ]
  },
  {
    "id": "kidney-context",
    "title": "Creatinine, urea nitrogen and uric acid",
    "source": "https://www.niddk.nih.gov/health-information/kidney-disease/chronic-kidney-disease-ckd/prevention",
    "context": "Creatinine and urea depend on kidney function, muscle mass, diet, hydration and medicines. Interpret alongside eGFR and urine ACR, not as isolated “lower is better” targets. Uric-acid targets are different for people receiving gout treatment.",
    "actionKey": "egfr",
    "rows": [
      [
        "creatinine",
        "Creatinine",
        "Creatinine",
        "80"
      ],
      [
        "bun",
        "Urea nitrogen (BUN)",
        "Urea Nitrogen (Bun)",
        "5"
      ],
      [
        "urate",
        "Uric acid",
        "Uric Acid (Blood)",
        "300"
      ]
    ]
  },
  {
    "id": "iron",
    "title": "Ferritin and iron studies",
    "source": "https://medlineplus.gov/lab-tests/iron-tests/",
    "context": "Read ferritin, transferrin saturation and the blood count together. Ferritin can rise with inflammation or liver disease, not just excess iron. Do not self-treat high ferritin with blood donation or start iron without a confirmed indication.",
    "actions": [
      [
        "Eat a varied, regular diet",
        "Include protein foods, vegetables and wholegrains rather than restrictive single-food diets."
      ],
      [
        "Use food to support a confirmed deficiency",
        "If iron deficiency is established, include beans, lentils, tofu or lean meat; pair plant iron with vitamin-C-rich vegetables or fruit."
      ],
      [
        "Avoid unnecessary iron",
        "Take iron only when prescribed or recommended for a confirmed need. Do not use high-dose iron supplements or self-directed blood removal to chase ferritin."
      ]
    ],
    "rows": [
      [
        "ferritin",
        "Ferritin",
        "Ferritin",
        "80"
      ],
      [
        "iron",
        "Serum iron",
        "Iron",
        "18"
      ],
      [
        "tibc",
        "Total iron-binding capacity",
        "Iron Binding Capacity",
        "60"
      ],
      [
        "tsat",
        "Transferrin saturation (TSAT)",
        "Iron % Saturation",
        "30"
      ]
    ]
  },
  {
    "id": "thyroid",
    "title": "Thyroid: TSH and free T4",
    "source": "https://www.niddk.nih.gov/health-information/endocrine-diseases/hypothyroidism",
    "context": "Use your lab’s interval, symptoms, pregnancy status and medicines. Both high and low thyroid results can matter; diet or exercise is not a substitute for treating thyroid disease. Biotin supplements can interfere with some assays; follow your laboratory’s instructions.",
    "actions": [
      [
        "Take thyroid medicine consistently if prescribed",
        "Use the agreed dose and timing; do not change the dose to chase a longevity target."
      ],
      [
        "Avoid iodine megadoses",
        "Use ordinary food sources rather than kelp or “thyroid booster” supplements unless specifically prescribed."
      ],
      [
        "Support a regular routine",
        "Keep regular meals, sleep and appropriate activity. These support wellbeing but do not guarantee normal thyroid tests."
      ]
    ],
    "rows": [
      [
        "tsh",
        "Thyroid-stimulating hormone (TSH)",
        "Thyroid Stimulating Hormone (TSH)",
        "2.0"
      ],
      [
        "ft4",
        "Free T4",
        "Thyroxine (T4, Free)",
        "16"
      ]
    ]
  },
  {
    "id": "chemistry",
    "title": "Electrolytes, calcium and proteins",
    "source": "https://medlineplus.gov/lab-tests/comprehensive-metabolic-panel-cmp/",
    "context": "Interpret with the lab range, kidney function, medicines and symptoms. Both high and low electrolytes can be dangerous. Do not correct abnormal sodium, potassium or calcium yourself with food, salt, water or supplements; urgent or symptomatic abnormalities need medical review.",
    "actions": [
      [
        "Keep meals regular and balanced",
        "Avoid extreme restriction and unprescribed salt or electrolyte-loading regimens."
      ],
      [
        "Follow your usual fluid plan",
        "Drink normally unless your care team has set a fluid limit; do not force extra water to change a laboratory value."
      ],
      [
        "Avoid unprescribed electrolyte supplements",
        "Do not start potassium, calcium or high-dose vitamin products to “optimise” a result. Follow prescribed treatment consistently."
      ]
    ],
    "rows": [
      [
        "sodium",
        "Sodium",
        "Sodium",
        "140"
      ],
      [
        "potassium",
        "Potassium",
        "Potassium",
        "4.2"
      ],
      [
        "chloride",
        "Chloride",
        "Chloride",
        "102"
      ],
      [
        "bicarbonate",
        "Bicarbonate / total CO₂",
        "Carbon Dioxide",
        "25"
      ],
      [
        "calcium",
        "Calcium",
        "Calcium",
        "2.3"
      ],
      [
        "albumin",
        "Albumin",
        "Albumin",
        "42"
      ],
      [
        "protein",
        "Total protein",
        "Protein, Total (Blood)",
        "72"
      ]
    ]
  },
  {
    "id": "blood-count",
    "title": "Full blood count: core components",
    "source": "https://medlineplus.gov/lab-tests/complete-blood-count-cbc/",
    "context": "Use age-, sex- and lab-specific intervals, symptoms and the full report. A blood count is not a “higher is better” score. The full differential and remaining indices are in the 144-measurement library. Unexplained abnormalities need assessment, not supplement guessing.",
    "actions": [
      [
        "Eat regular nutrient-containing meals",
        "Include protein foods, leafy vegetables and legumes; use B12-fortified foods or an appropriate B12 supplement if your diet excludes animal foods."
      ],
      [
        "Treat only confirmed deficiencies",
        "Take prescribed iron, B12 or folate as directed when a deficiency is established; do not take iron just because a count is abnormal."
      ],
      [
        "Avoid extreme dietary restriction",
        "Keep a balanced eating pattern and regular sleep. These support general health but cannot correct every cause of abnormal cell counts."
      ]
    ],
    "rows": [
      [
        "hemoglobin",
        "Haemoglobin",
        "Hemoglobin",
        "14"
      ],
      [
        "hematocrit",
        "Haematocrit",
        "Hematocrit",
        "42"
      ],
      [
        "rbc",
        "Red blood cell count",
        "Red Blood Cell Count (Blood)",
        "4.8"
      ],
      [
        "wbc",
        "White blood cell count",
        "White Blood Cell Count (Blood)",
        "6"
      ],
      [
        "platelets",
        "Platelets",
        "Platelet Count",
        "250"
      ],
      [
        "mcv",
        "Mean corpuscular volume (MCV)",
        "Mean Corpuscular Volume",
        "90"
      ],
      [
        "rdw",
        "Red-cell distribution width (RDW)",
        "Red Cell Distribution Width",
        "13"
      ]
    ]
  },
  {
    "id": "vitamins",
    "title": "Vitamin D",
    "source": "https://ods.od.nih.gov/factsheets/VitaminD-Consumer/",
    "context": "Use your clinician’s indication and lab method. Routine vitamin D testing is not needed for every healthy adult, and higher is not always better. Excess supplementation can cause hypercalcaemia and kidney harm.",
    "actions": [
      [
        "Include dietary vitamin D",
        "Choose oily fish or vitamin-D-fortified foods regularly, according to your dietary preferences."
      ],
      [
        "Use the agreed supplement dose if needed",
        "Take only the dose recommended for your circumstances; avoid high-dose or overlapping products."
      ],
      [
        "Support bone health",
        "Do weight-bearing activity and strength work twice weekly when appropriate; do not seek unprotected sun exposure to chase a blood target."
      ]
    ],
    "rows": [
      [
        "vitd",
        "Vitamin D (25-OH)",
        "Vitamin D",
        "60"
      ]
    ]
  }
];
export const ADDITIONAL_MARKER_GROUPS = FAMILIES.map(({ id, title, context }) => ({ id, title, description: context }));
// Test explanations checked against the linked NLM references on 2026-11-01.
// These describe the measurement, not a universal treatment target.
const TEST_CONTEXT = {
  insulin: ['Insulin is a pancreatic hormone that helps glucose enter cells. Interpret a fasting result alongside glucose; this is not a standalone diabetes diagnosis.', 'insulin-in-blood-test'],
  alt: ['ALT is an enzyme measured when assessing liver-cell injury. An abnormal result needs the rest of the liver panel and clinical context, not a detox regimen.', 'liver-function-tests'],
  ast: ['AST is an enzyme included in liver assessment. Read it with ALT and the rest of the panel rather than treating one enzyme result as a diagnosis.', 'liver-function-tests'],
  ggt: ['GGT is an enzyme measured in liver assessment. The pattern across liver tests matters more than treating GGT alone as a health score.', 'liver-function-tests'],
  alp: ['ALP is an enzyme that may rise with liver or bone conditions. Its source needs interpretation; it is not a bone-density measurement.', 'liver-function-tests'],
  bilirubin: ['Bilirubin comes from the breakdown of old red blood cells and is processed by the liver. Interpret a blood result with the liver panel and symptoms.', 'liver-function-tests'],
  creatinine: ['Creatinine is a muscle-related waste product filtered by the kidneys. Muscle mass and diet affect it; interpret alongside eGFR rather than trying to minimise the number.', 'creatinine-test'],
  bun: ['Urea nitrogen is a waste product removed by the kidneys. Interpret with creatinine and the metabolic panel.', 'comprehensive-metabolic-panel-cmp'],
  urate: ['Uric acid is produced when the body breaks down purines. A high blood result does not by itself mean gout, and is different from urine uric-acid crystals.', 'uric-acid-test'],
  ferritin: ['Ferritin helps assess stored iron. Interpret it with other iron tests and the blood count rather than assuming that more stored iron is always better.', 'iron-tests'],
  iron: ['Serum iron measures iron circulating in blood, not total body iron stores. Levels vary through the day; compare it with the rest of the iron studies.', 'iron-tests'],
  tibc: ['Iron-binding capacity assesses how well blood proteins can bind iron. It complements serum iron and ferritin; it is not a measure of dietary iron intake.', 'iron-tests'],
  tsat: ['Iron saturation is part of the iron-study interpretation. Use the percentage on your report alongside serum iron, binding capacity and ferritin, not as an isolated goal.', 'iron-tests'],
  tsh: ['TSH is the pituitary signal telling the thyroid to make hormones. Both high and low results can matter; TSH alone does not identify the cause of a thyroid problem.', 'tsh-thyroid-stimulating-hormone-test'],
  ft4: ['Free T4 measures thyroid hormone not bound to blood proteins. It is different from total T4 and is generally interpreted alongside TSH.', 'thyroxine-t4-test'],
  sodium: ['Sodium helps regulate fluid and acid–base balance. Its blood concentration does not directly measure dietary salt intake.', 'comprehensive-metabolic-panel-cmp'],
  potassium: ['Potassium is an electrolyte interpreted with kidney function and other chemistry results. Do not self-prescribe electrolyte products for abnormal values.', 'comprehensive-metabolic-panel-cmp'],
  chloride: ['Chloride contributes to fluid and acid–base balance. Read it with sodium, bicarbonate and the metabolic panel.', 'comprehensive-metabolic-panel-cmp'],
  bicarbonate: ['Bicarbonate / total CO₂ provides acid–base information. It is not an oxygen-saturation or lung-function measurement.', 'comprehensive-metabolic-panel-cmp'],
  calcium: ['Blood calcium supports nerves, muscles and the heart. This concentration is not a bone-density measurement.', 'comprehensive-metabolic-panel-cmp'],
  albumin: ['Albumin is a major blood protein made in the liver. Read it with the metabolic panel, not as a dietary-protein score.', 'comprehensive-metabolic-panel-cmp'],
  protein: ['Total blood protein includes albumin and globulins. It is distinct from urine protein and does not directly measure protein intake.', 'comprehensive-metabolic-panel-cmp'],
  hemoglobin: ['Haemoglobin is the oxygen-carrying protein in red blood cells. This concentration is different from HbA1c, which assesses glucose-related glycation.', 'complete-blood-count-cbc'],
  hematocrit: ['Haematocrit describes how much of whole blood consists of red blood cells. Interpret it with haemoglobin and the cell count, not as a fitness percentile.', 'complete-blood-count-cbc'],
  rbc: ['The red blood cell count measures oxygen-carrying cells in blood. It is distinct from red cells found in urine and is interpreted with haemoglobin and cell indices.', 'complete-blood-count-cbc'],
  wbc: ['The white blood cell count measures the total number of white cells in blood. A differential measures the separate cell types; a higher total is not inherently better.', 'complete-blood-count-cbc'],
  platelets: ['Platelets help blood clot and stop bleeding. Their count belongs in the full blood-count interpretation, not an immune-strength or longevity score.', 'complete-blood-count-cbc'],
  mcv: ['MCV describes average red blood cell size. It complements haemoglobin and the cell count; it does not measure the number of red cells.', 'complete-blood-count-cbc'],
  rdw: ['RDW describes variation in red blood cell size. A normal RDW does not rule out anaemia; interpret it alongside MCV and the rest of the blood count.', 'rdw-red-cell-distribution-width'],
  vitd: ['The usual vitamin D status test measures 25-hydroxyvitamin D. Active vitamin D is a different test; testing and supplement doses depend on the clinical indication.', 'vitamin-d-test'],
};
export const ADDITIONAL_MARKERS = FAMILIES.flatMap(family => family.rows.map(([id, label, catalogName, example]) => {
  const units = biomarkerUnits(catalogName);
  return {
    id, label, catalogName, eyebrow: family.title, icon: 'drop', inputLabel: 'Latest ' + label,
    placeholder: 'e.g. ' + example, alternatePlaceholder: 'Value from your report', inputMode: 'decimal', suffix: units[0] || '', units: units.length > 1 ? units : undefined,
    target: 'Use the reference interval on your own report and any personalised treatment goal; no universal longevity target.',
    why: TEST_CONTEXT[id][0], meaningSource: 'https://medlineplus.gov/lab-tests/' + TEST_CONTEXT[id][1] + '/', source: family.source, group: family.id,
    actionKey: id === 'insulin' ? 'glucose' : family.actionKey,
    actions: family.actions, context: family.context,
  };
}));

// Each existing core-panel reference must have a usable tracker entry, not just a library name.
// Ratios/HOMA-IR use their component results; no universal ratio targets are inferred.
export const CORE_PANEL_TRACKER_COVERAGE = {
  'apob-lipids': ['apob', 'totalchol', 'hdl', 'ldl', 'tg'],
  'tg-hdl-ratio': ['tg', 'hdl'], hba1c: ['hba1c'],
  'fasting-insulin': ['glucose', 'insulin'], 'ferritin-iron': ['ferritin', 'iron', 'tibc', 'tsat'],
  'uric-acid': ['urate'], cbc: ['hemoglobin', 'hematocrit', 'rbc', 'wbc', 'platelets', 'mcv', 'rdw'],
  'liver-enzymes': ['alt', 'ast', 'ggt'], kidney: ['creatinine', 'egfr'],
  tsh: ['tsh', 'ft4'], 'cmp-electrolytes': ['sodium', 'potassium', 'chloride', 'bicarbonate', 'calcium', 'albumin'],
  hscrp: ['hscrp'], bp: ['bp'],
};
