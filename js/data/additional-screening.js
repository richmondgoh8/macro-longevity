// Optional tracker expansion. Loaded only when requested or to restore saved results.
import { biomarkerUnits } from './blueprint-markers.js';

const FAMILIES = [
  {
    "id": "lipid-context",
    "title": "Full lipids and insulin",
    "source": "https://www.healthhub.sg/health-conditions/hyperlipidemia",
    "context": "HDL and total cholesterol are context, not isolated treatment targets. A higher HDL does not cancel high LDL/ApoB. Fasting insulin has no universal “optimal” target; HOMA-IR is a derived estimate, not a diagnosis.",
    "actionKey": "ldl",
    "rows": [
      [
        "totalchol",
        "Total cholesterol",
        "Cholesterol, Total",
        "4.8"
      ],
      [
        "hdl",
        "HDL cholesterol",
        "Hdl Cholesterol",
        "1.3"
      ],
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
export const ADDITIONAL_MARKERS = FAMILIES.flatMap(family => family.rows.map(([id, label, catalogName, example]) => {
  const units = biomarkerUnits(catalogName);
  return {
    id, label, catalogName, eyebrow: family.title, icon: 'drop', inputLabel: 'Latest ' + label,
    placeholder: 'e.g. ' + example, alternatePlaceholder: 'Value from your report', inputMode: 'decimal', suffix: units[0] || '', units: units.length > 1 ? units : undefined,
    target: 'Use the reference interval on your own report and any personalised treatment goal; no universal longevity target.',
    why: 'Record ' + label + ' with your report’s reference interval. This result needs clinical context; it is not a standalone health score.', source: family.source, group: family.id,
    actionKey: id === 'insulin' ? 'glucose' : family.actionKey,
    actions: family.actions, context: family.context, actionSummary: 'Health-supporting actions and interpretation',
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
