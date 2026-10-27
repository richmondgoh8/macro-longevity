export const SG_MARKER_CONTEXT = {
  bp: 'Use the correct cuff, rest five minutes and average two readings. Persistent readings at or above 140/90 need clinical review; very high readings or symptoms can need urgent care.',
  waist: 'Measure at the same level after a normal exhale. These cut-offs are risk guideposts, not a requirement for everyone to lose weight.',
  bmi: 'Pregnancy, muscularity and recent illness can make BMI less useful. Unintentional weight loss or being underweight needs assessment, not more restriction.',
  glucose: 'Follow your clinic’s fasting instructions. A single abnormal screening result is not a diagnosis. If taking glucose-lowering medicines, avoid abrupt meal or exercise changes that cause low glucose.',
  ldl: 'Your personal goal depends on cardiovascular risk and can be lower than the displayed value. Lifestyle is not a replacement for indicated medicine.',
  tg: 'Record fasting status: recent meals, alcohol and illness affect results. Very high triglycerides need prompt clinical advice, not a lifestyle-only trial.',
  nonhdl: 'Calculate total cholesterol minus HDL-C from the same report in the same units. The goal is risk-based; it is not a universal cut-off.',
  hba1c: 'Anaemia, haemoglobin variants, pregnancy and kidney disease affect interpretation. In Singapore, HbA1c alone is not used to diagnose prediabetes; use your clinician’s screening pathway.',
  apob: 'Match the report units: 1.00 g/L = 100 mg/dL. The listed moderate/high/very-high-risk goals are ESC/EAS treatment guideposts; do not assign yourself a risk category.',
  lpa: 'Lifestyle usually has little effect on Lp(a). The displayed value is a risk threshold, not a lifestyle target. Do not use a fixed conversion between mg/dL and nmol/L. Discuss risk-based treatment and family testing when elevated.',
  egfr: 'Interpret with urine ACR, previous results, age, muscle mass and medicines. A higher number is not always better; one abnormal result does not establish chronic kidney disease.',
  uacr: 'ACR is not the same as a routine urine dipstick. Exercise, infection and menstruation can temporarily raise it; confirm persistent elevation using your clinic’s collection and repeat-testing instructions.',
};

export const SG_MARKER_ACTIONS = {
  "bp": [
    [
      "Keep sodium below 2,000 mg/day",
      "Choose lower-sodium products, request sauce on the side and leave soup broth behind. Count sodium from all food, not just added salt."
    ],
    [
      "Walk daily and train weekly",
      "Build gradually toward 7,000 steps/day and 150 minutes of moderate activity/week, plus strength training on two days. Adapt to your ability."
    ],
    [
      "Make evenings consistent",
      "Keep a regular sleep schedule with 7–9 hours available; replace alcoholic drinks with alcohol-free options."
    ]
  ],
  "waist": [
    [
      "Build a repeatable plate",
      "At main meals fill half the plate with vegetables and fruit, one quarter with wholegrains and one quarter with lean protein."
    ],
    [
      "Accumulate daily movement",
      "Build toward 7,000 steps/day; add a short walk after meals and break up long sitting periods."
    ],
    [
      "Preserve muscle while losing excess fat",
      "Do strength training twice weekly. If excess weight is present, reduce portions of energy-dense extras; do not pursue weight loss if underweight."
    ]
  ],
  "bmi": [
    [
      "Match food intake to your starting point",
      "If above your appropriate range, replace sugary drinks and reduce oversized portions. If underweight, add regular meals and nourishing snacks instead of restricting."
    ],
    [
      "Train strength twice a week",
      "Use squats or sit-to-stands, rows, presses and hip hinges at a manageable resistance; increase gradually."
    ],
    [
      "Move consistently",
      "Build toward 7,000 steps/day and 150 minutes of moderate activity/week. A muscular build does not need weight loss just to fit a BMI range."
    ]
  ],
  "glucose": [
    [
      "Walk after meals",
      "Take a 10-minute walk after one or more main meals; build toward 150 minutes of moderate activity each week."
    ],
    [
      "Replace liquid sugar",
      "Choose water or unsweetened tea instead of soft drinks, sweetened coffee and juice; choose whole fruit rather than juice."
    ],
    [
      "Upgrade carbohydrate portions",
      "Use a quarter-plate portion of wholegrains, add vegetables and protein, and do strength training on two days each week."
    ]
  ],
  "ldl": [
    [
      "Eat fibre-rich foods every day",
      "Build toward 25–30 g fibre/day with oats or barley, beans or lentils, vegetables and whole fruit. Increase gradually."
    ],
    [
      "Replace saturated fats",
      "Use olive or other unsaturated oils instead of butter or ghee; replace fatty or processed meats with beans, tofu or fish."
    ],
    [
      "Make activity routine",
      "Build toward 7,000 steps/day and 150 minutes of moderate activity/week, plus two strength sessions. These habits support care but may not achieve your LDL target alone."
    ]
  ],
  "tg": [
    [
      "Remove sugary drinks",
      "Drink water or unsweetened tea; swap refined-grain snacks and sweets for whole fruit, plain yoghurt or unsalted nuts."
    ],
    [
      "Skip alcohol",
      "Choose alcohol-free drinks, especially if triglycerides are high. Alcohol can substantially raise triglycerides in susceptible people."
    ],
    [
      "Move and reduce excess energy",
      "Walk for 10 minutes after meals and build toward 150 minutes of weekly activity. If overweight, reduce oversized portions while keeping protein and vegetables."
    ]
  ],
  "nonhdl": [
    [
      "Add soluble-fibre foods daily",
      "Eat oats or barley and a serving of beans or lentils regularly; build toward 25–30 g total fibre/day."
    ],
    [
      "Swap the fat source",
      "Replace butter, ghee and fatty meats with unsaturated oils, tofu, beans or fish; choose unsalted nuts in place of pastries."
    ],
    [
      "Cut sugar and keep moving",
      "Replace sugary drinks with water and build toward 150 minutes of moderate activity/week plus strength training twice weekly."
    ]
  ],
  "hba1c": [
    [
      "Take a post-meal walk",
      "Walk for about 10 minutes after one or more meals and break up prolonged sitting."
    ],
    [
      "Make meals predictable",
      "Choose water over sweet drinks; use a quarter-plate portion of wholegrains with vegetables and a protein source rather than large refined-carbohydrate meals."
    ],
    [
      "Train every week",
      "Build toward 150 minutes of moderate activity and two strength sessions weekly. If using insulin or medicines that cause low glucose, follow your agreed exercise and meal plan."
    ]
  ],
  "apob": [
    [
      "Replace saturated-fat staples",
      "Swap butter or ghee for unsaturated oils and fatty or processed meats for tofu, beans or fish."
    ],
    [
      "Reach a daily fibre routine",
      "Build toward 25–30 g fibre/day; include oats or barley plus beans or lentils regularly. Increase gradually."
    ],
    [
      "Keep movement and treatment consistent",
      "Build toward 150 minutes of moderate activity/week and two strength sessions. Take lipid medicine exactly as prescribed if you have it; lifestyle alone may not reach your ApoB goal."
    ]
  ],
  "lpa": [
    [
      "Lower the risks you can change",
      "Replace saturated fats with unsaturated fats and eat fibre-rich foods daily to support LDL/ApoB control; these changes do not reliably lower Lp(a) itself."
    ],
    [
      "Stay smoke-free",
      "Do not smoke or vape; avoid second-hand smoke. If quitting, use an evidence-based cessation programme and agreed treatment."
    ],
    [
      "Protect overall cardiovascular health",
      "Build toward 150 minutes of moderate activity/week, keep sodium below 2,000 mg/day and take prescribed cholesterol or blood-pressure medicines consistently."
    ]
  ],
  "egfr": [
    [
      "Reduce sodium each day",
      "Keep sodium below 2,000 mg/day unless your care team gives a different plan; request less sauce and leave broth behind."
    ],
    [
      "Keep prescribed treatment consistent",
      "Take blood-pressure or diabetes medicines as prescribed. Do not stop them or change doses to chase an eGFR number."
    ],
    [
      "Avoid avoidable kidney stress",
      "Avoid routine non-prescribed ibuprofen or naproxen and unverified “kidney detox” supplements; do not force extra water or add high-dose protein supplements to raise eGFR."
    ]
  ],
  "uacr": [
    [
      "Make low-sodium choices",
      "Choose lower-sodium foods and sauces; aim below 2,000 mg sodium/day unless your kidney team sets another limit."
    ],
    [
      "Move regularly",
      "Build toward 150 minutes of moderate activity/week at a comfortable intensity, with strength work twice weekly when appropriate."
    ],
    [
      "Follow your kidney-protection plan",
      "Take prescribed blood-pressure and diabetes medicines consistently and stay smoke-free. Lifestyle supports kidney protection but does not guarantee albumin leakage will normalise."
    ]
  ]
};
